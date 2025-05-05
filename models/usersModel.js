import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

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
  photo: { type: String },
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
      values: ["mason", "handymen", "hardware dealer", "admin"],
      message: "Role can either be: mason, handymen, hardware dealer or admin",
    },
  },
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

export const User = mongoose.model("User", userSchema);
