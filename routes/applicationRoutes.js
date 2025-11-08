import express from "express";

import {
  createApplication,
  updateApplication,
  deleteApplication,
  conditionalAccess,
  handleGetApplications,
  getMyApplications,
  getMyApplicationById,
  approveAllApplications,
  approveOneApplication,
  getApplicationById,
  getApplicationsByEngineerId,
} from "../controllers/applicationController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const applicationRouter = express.Router({ mergeParams: true });

applicationRouter.get(
  "/getMyApplications",
  protect,
  restrictTo("user"),
  getMyApplications
);

applicationRouter.get(
  "/getMyApplication/:id",
  protect,
  restrictTo("user"),
  getMyApplicationById
);

applicationRouter.get(
  "/my",
  protect,
  restrictTo("engineer"),
  getApplicationsByEngineerId
);

applicationRouter.patch(
  "/approve/:id",
  protect,
  restrictTo("engineer"),
  approveOneApplication
);

applicationRouter.patch(
  "/approveAll",
  protect,
  restrictTo("engineer"),
  approveAllApplications
);

applicationRouter
  .route("/")
  .get(protect, conditionalAccess(), handleGetApplications)
  .post(
    protect,
    restrictTo("user"),
    conditionalAccess(["user"]),
    createApplication
  );

applicationRouter
  .route("/:id")
  .get(protect, conditionalAccess(), getApplicationById)
  .patch(protect, restrictTo("user"), updateApplication)
  .delete(protect, restrictTo("admin", "user"), deleteApplication);

export default applicationRouter;
