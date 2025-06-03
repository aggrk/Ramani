import { User } from "../models/usersModel.js";
import { CustomError } from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import crypto from "crypto";
import { Email } from "../utils/email.js";

const secretToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = secretToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production" || true,
  };

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const userData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
  };
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    return next(new CustomError("A user with this email already exists", 400));
  }

  const newUser = new User(userData);

  // 1) Generate verification token
  const token = newUser.createVerificationToken();

  try {
    // 2) Send verification email
    const verificationURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/verifyEmail/${token}`;

    await new Email(newUser, verificationURL).sendWelcome();
    await newUser.save({ validateBeforeSave: false });

    res.status(201).json({
      status: "success",
      message: "Verification email sent!",
    });
  } catch (err) {
    console.error("Error sending verification email:", err);
    // newUser.verificationToken = undefined;
    // newUser.verificationTokenExpires = undefined;
    // await newUser.save({ validateBeforeSave: false });
    return next(new CustomError("There was an error sending the email", 500));
  }
});

export const verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("The token is invalid or has expired", 400));
  }

  user.status = "active";
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;

  await user.save({ validateBeforeSave: false });

  // 3) Log the user in, send JWT
  createSendToken(user, 200, res);
});

export const resendVerificationEmail = catchAsync(async (req, res, next) => {
  // 1) Get user based on posted email
  const user = await User.findOne({ email: req.body?.email });

  if (!user) {
    return next(
      new CustomError("There is no user with this email address", 404)
    );
  }
  // 2) Generate the random verification token
  const token = user.createVerificationToken();
  await user.save({ validateBeforeSave: false });
  // 3) Send it to user's email
  const verificationURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/verifyEmail/${token}`;
  const message = `Welcome to Ramani, ${user.name}! Please verify your email by clicking on the following link: ${verificationURL}`;
  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: "Verify Your Email!",
    //   message,
    // });
    await new Email(user, verificationURL).sendWelcome();
    res.status(200).json({
      status: "success",
      message: "Verification email sent!",
    });
  } catch (err) {
    // user.verificationToken = undefined;
    // user.verificationTokenExpires = undefined;
    // await user.save({ validateBeforeSave: false });
    return next(new CustomError("There was an error sending the email", 500));
  }
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new CustomError("Please provide email and password", 400));

  // 1) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new CustomError("Incorrect email or password", 401));
  }
  if (user.deletedAt) {
    return next(new CustomError("This account has been deleted", 401));
  }

  if (user.status === "inactive") {
    return next(new CustomError("Please verify your email first", 401));
  }
  if (!user || !(await user.comparePasswords(password, user.password))) {
    return next(new CustomError("Incorrect email or password", 401));
  }
  // 2) If everything ok, send token to client

  createSendToken(user, 200, res);
});

export const logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
};

export const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new CustomError("You are not logged in! Please log in", 401));
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new CustomError(
        "The user belonging to this token does no longer exist",
        401
      )
    );
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new CustomError(
        "User recently changed password! Please log in again",
        401
      )
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new CustomError(
          "You do not have permission to perform this action",
          403
        )
      );
    }
    next();
  };
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on posted email
  const user = await User.findOne({ email: req.body?.email });
  if (!user) {
    return next(
      new CustomError("There is no user with this email address", 404)
    );
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}. If you didn't forget your password, please ignore this email!`;
  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: "Your password reset token (valid for 10 min)",
    //   message,
    // });

    await new Email(user, resetURL).sendReset();
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new CustomError("There was an error sending the email", 500));
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new CustomError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

export const updateMyPassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await user.comparePasswords(req.body.currentPassword, user.password))) {
    return next(new CustomError("Your current password is wrong", 401));
  }

  if (req.body.password === req.body.currentPassword) {
    return next(
      new CustomError(
        "New password must be different from current password",
        401
      )
    );
  }
  // 3) If so, update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
