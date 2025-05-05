import { User } from "../models/usersModel.js";

export const getUsers = (req, res) => {
  res.end("Today am hungry");
};

export const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);

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

export const signin = async (req, res) => {
  const user = await User.find(req.body);
};
