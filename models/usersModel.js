import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";

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
  photo: String,
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
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

export const User = mongoose.model("User", userSchema);
