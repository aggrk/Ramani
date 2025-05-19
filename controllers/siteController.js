import Site from "../models/sitesModel.js";
import APIFeatures from "../utils/apiFeatures.js";
import { CustomError } from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const getSites = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Site.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Execute the query
  const sites = await features.query;

  if (!sites.length) {
    return next(new CustomError("No sites found", 404));
  }

  res.status(200).json({
    status: "success",
    results: sites.length,
    data: {
      sites,
    },
  });
});

export const getSite = catchAsync(async (req, res, next) => {
  const site = await Site.findById(req.params.id);

  if (!site) {
    return next(new CustomError("No site found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      site,
    },
  });
});

export const createSite = catchAsync(async (req, res, next) => {
  const newSite = await Site.create({ ...req.body, engineerId: req.user._id });

  res.status(201).json({
    status: "success",
    data: {
      site: newSite,
    },
  });
});

export const updateSite = catchAsync(async (req, res, next) => {
  const site = await Site.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!site) {
    return next(new CustomError("No site found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      site,
    },
  });
});

export const getSiteByEngineer = catchAsync(async (req, res, next) => {
  const site = await Site.find({ engineerId: req.user._id });

  if (!site) {
    return next(new CustomError("No site found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    results: site.length,
    data: {
      site,
    },
  });
});

export const deleteSite = catchAsync(async (req, res, next) => {
  const site = await Site.findByIdAndDelete(req.params.id);
  if (!site) {
    return next(new CustomError("No site found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
