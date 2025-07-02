import Application from "../models/applicationsModel.js";
import Site from "../models/sitesModel.js";
import { CustomError } from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { restrictTo } from "./authController.js";
import { Email } from "../utils/email.js";

export const getAllApplications = catchAsync(async (req, res, next) => {
  const applications = await Application.find({ deleted: false }).populate(
    "siteId"
  );

  res.status(200).json({
    status: "success",
    results: applications.length,
    data: {
      applications,
    },
  });
});

export const getApplicationById = catchAsync(async (req, res, next) => {
  const application = await Application.findById(req.params.id).populate(
    "siteId"
  );

  if (!application || application.deleted) {
    return next(new CustomError("No application found with this ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      application,
    },
  });
});

export const getMyApplications = catchAsync(async (req, res, next) => {
  const applications = await Application.find({
    userId: req.user._id,
    deleted: false,
  }).populate("siteId");

  if (!applications || applications.length === 0) {
    return next(new CustomError("No applications found for this user", 404));
  }
  res.status(200).json({
    status: "success",
    results: applications.length,
    data: {
      applications,
    },
  });
});

export const getMyApplicationById = catchAsync(async (req, res, next) => {
  const application = await Application.findOne({
    userId: req.user._id,
    _id: req.params.id,
    deleted: false,
  }).populate("siteId");
  if (!application || application.deleted) {
    return next(new CustomError("No application found with this ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      application,
    },
  });
});

export const getApplicationsBySiteId = catchAsync(async (req, res, next) => {
  const applications = await Application.find({
    siteId: req.params.siteId,
    deleted: false,
  }).populate("siteId");

  if (!applications || applications.length === 0) {
    return next(new CustomError("No applications found for this site", 404));
  }
  res.status(200).json({
    status: "success",
    results: applications.length,
    data: {
      applications,
    },
  });
});

export const createApplication = catchAsync(async (req, res, next) => {
  const totalDocuments = await Application.countDocuments({
    siteId: req.params.siteId,
    deleted: false,
  });
  const site = await Site.findById(req.params.siteId);

  if (!site) {
    return next(new CustomError("No site found with this ID", 404));
  }

  if (totalDocuments >= site.requiredHandymen) {
    return next(
      new CustomError(
        "The maximum number of applications for this site has been reached.",
        400
      )
    );
  }

  const existingApplication = await Application.findOne({
    userId: req.user._id,
    siteId: req.params.siteId,
    deleted: false,
  });
  if (existingApplication) {
    return next(
      new CustomError(
        "You have already applied for this site. Please check your applications.",
        400
      )
    );
  }

  const newApplication = await Application.create({
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    siteId: req.params.siteId,
    userId: req.user ? req.user._id : null,
  });

  res.status(201).json({
    status: "success",
    data: {
      application: newApplication,
    },
  });
});

export const updateApplication = catchAsync(async (req, res, next) => {
  const application = await Application.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      siteId: req.body.siteId,
      userId: req.user ? req.user._id : null,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!application || application.deleted) {
    return next(new CustomError("No application found with this ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      application,
    },
  });
});

export const deleteApplication = catchAsync(async (req, res, next) => {
  const application = await Application.findByIdAndUpdate(
    req.params.id,
    {
      deleted: true,
      deletedAt: Date.now(),
      deletedBy: req.user ? req.user._id : null,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!application || application.deleted) {
    return next(new CustomError("No application found with this ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const approveAllApplications = catchAsync(async (req, res, next) => {
  const { siteId } = req.params;

  const site = await Site.findById(siteId);
  if (!site) {
    return next(new CustomError("No site found for this engineer", 404));
  }

  if (site.engineerId.toString() !== req.user._id.toString()) {
    return next(
      new CustomError("You are not authorized to approve applications", 403)
    );
  }

  const applications = await Application.find({
    siteId,
    status: "pending",
  }).populate("userId");

  if (applications.length === 0) {
    return next(new CustomError("No applications pending found", 404));
  }

  try {
    await Promise.all(
      applications.map(async (application) => {
        await new Email(application.userId, site).sendApproved();
        application.status = "accepted";
        await application.save();
      })
    );

    res.status(200).json({
      status: "success",
      data: {
        approvedCount: applications.length,
      },
    });
  } catch (error) {
    return next(new CustomError("Failed to send approval emails", 500));
  }
});

export const approveOneApplication = catchAsync(async (req, res, next) => {
  const application = await Application.findById(req.params.id)
    .populate("userId")
    .populate("siteId");

  if (!application || application.deleted) {
    return next(new CustomError("No application found with this ID", 404));
  }

  if (application.siteId.engineerId.toString() !== req.user._id.toString()) {
    return next(
      new CustomError("You are not authorized to approve applications", 403)
    );
  }

  // Update the status to accepted
  application.status = "accepted";

  try {
    await Email(application.userId, application.siteId).sendApproved();

    await application.save();

    res.status(200).json({
      status: "success",
      data: {
        application,
      },
    });
  } catch (error) {
    return next(new CustomError("Failed to send approval email", 500));
  }
});

export const conditionalAccess = (allowedForApplication = []) => {
  return (req, res, next) => {
    if (req.params.siteId) {
      return restrictTo("admin", "engineer", ...allowedForApplication)(
        req,
        res,
        next
      );
    }
    return restrictTo("admin")(req, res, next);
  };
};

export const handleGetApplications = (req, res, next) => {
  if (req.params.siteId) {
    return getApplicationsBySiteId(req, res, next);
  }
  return getAllApplications(req, res, next);
};
