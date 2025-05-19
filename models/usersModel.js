import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { type } from "os";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name cannot be empty"],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, "Email cannot be empty"],
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    validate: {
      validator: function (v) {
        return /^(\+255|0)[67][0-9]{8}$/.test(v); // Ensures exactly 10 digits
      },
      message: (props) =>
        `${props.value} is not a valid 10-digit phone number!`,
    },
  },
  photo: { type: String, default: "default.jpg" },
  password: {
    type: String,
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    minlength: 8,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (field) {
        return this.password === field;
      },
      message: "Passwords must match",
    },
  },
  role: {
    type: String,
    enum: {
      values: ["user", "hardware dealer", "engineer", "admin"],
      message: "Role can either be: mason, handymen, hardware dealer or admin",
    },
    default: "user",
  },
  status: {
    type: String,
    enum: {
      values: ["active", "inactive"],
      message: "Status can either be: active or inactive",
    },
    default: "inactive",
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  deletedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.comparePasswords = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.createVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  this.verificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  this.verificationTokenExpires = Date.now() + 10 * 60 * 1000;

  return verificationToken;
};

userSchema.methods.addUser = async function () {
  this.status = "active";
  return this.save({ validateBeforeSave: false });
};

userSchema.methods.deleteUser = async function () {
  this.deletedAt = Date.now();
  return this.save({ validateBeforeSave: false });
};

export const User = mongoose.model("User", userSchema);
