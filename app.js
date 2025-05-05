import express from "express";
import { userRouter } from "./routes/userRoutes.js";
import { CustomError } from "./utils/appError.js";
import errorHandler from "./controllers/errorHandlerController.js";
import { siteRouter } from "./routes/siteRoutes.js";

export const app = express();

app.use(express.json());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/sites", siteRouter);

// app.all("*", (req, res, next) => {
//   const err = new CustomError(
//     `Can't find ${req.originalUrl} on this server`,
//     404
//   );

//   next(err);
// });

app.use(errorHandler);
