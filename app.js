import express from "express";
import userRouter from "./routes/userRoutes.js";
import { CustomError } from "./utils/appError.js";
import errorHandler from "./controllers/errorHandlerController.js";
import siteRouter from "./routes/siteRoutes.js";
import applicationRouter from "./routes/applicationRoutes.js";
import hardwareRouter from "./routes/hardwareRoutes.js";
import productsRouter from "./routes/hadwareProductRoutes.js";
import cartsRouter from "./routes/productsCartRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { checkoutRouter } from "./routes/checkoutRoutes.js";

export const app = express();

//Global middlewares
const corsOptions = {
  origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors());
app.use(cookieParser());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/sites", siteRouter);
app.use("/api/v1/applications", applicationRouter);
app.use("/api/v1/hardware", hardwareRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/carts", cartsRouter);
app.use("/api/v1/checkouts", checkoutRouter);

app.all(/.*/, (req, res, next) => {
  const err = new CustomError(
    `Can't find ${req.originalUrl} on this server`,
    404
  );
  next(err);
});

app.use(errorHandler);
