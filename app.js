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
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import { sanitizeObjects } from "./utils/sanitizeObjects.js";
import hpp from "hpp";
import { fileRouter } from "./routes/fileRoutes.js";

export const app = express();

//Global middlewares
const corsOptions = {
  origin: [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "https://niperamani.netlify.app",
    "https://niperamani.com",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors());
app.use(cookieParser());

app.use(helmet({ crossOriginResourcePolicy: false }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) {
    mongoSanitize.sanitize(req.query);
  }
  next();
});

app.use((req, res, next) => {
  sanitizeObjects(req.body);
  next();
});

app.use(express.static("public"));
const limiter = rateLimit({
  limit: 200,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests, try again after an hour!",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "price",
      "difficulty",
      "ratingsAverage",
    ],
  })
);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/sites", siteRouter);
app.use("/api/v1/applications", applicationRouter);
app.use("/api/v1/hardware", hardwareRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/carts", cartsRouter);
app.use("/api/v1/checkouts", checkoutRouter);
app.use("/api/v1/files", fileRouter);

app.all(/.*/, (req, res, next) => {
  const err = new CustomError(
    `Can't find ${req.originalUrl} on this server`,
    404
  );
  next(err);
});

app.use(errorHandler);
