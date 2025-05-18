import { User } from "../models/usersModel.js";
import { sendEmail } from "../utils/email.js";

export const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    // 2) Send verification email
    const verificationURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/verifyEmail/${user._id}`;
    const message = `Welcome to Ramani, ${user.name}! Please verify your email by clicking on the following link: ${verificationURL}`;
    await sendEmail({
      email: user.email,
      subject: "Verify Your Email!",
      message,
    });

    // 3) Send the response

    res.status(201).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      data: err.message,
    });
  }
};
