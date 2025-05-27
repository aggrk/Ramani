import express from "express";

import {
  createApplication,
  updateApplication,
  deleteApplication,
  conditionalAccess,
  handleGetApplications,
  handleGetApplicationById,
  getMyApplications,
  getMyApplicationById,
  approveAllApplications,
  approveOneApplication,
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

applicationRouter.patch(
  "/approve/:id",
  protect,
  restrictTo("engineer"),
  approveOneApplication
);

applicationRouter.patch(
  "/approveAll/:siteId",
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
  .get(protect, conditionalAccess(), handleGetApplicationById)
  .patch(protect, restrictTo("user"), updateApplication)
  .delete(protect, restrictTo("admin", "user"), deleteApplication);

export default applicationRouter;
