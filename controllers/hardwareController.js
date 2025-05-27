import catchAsync from "../utils/catchAsync.js";
import HardwareRegistration from "../models/hardwareRegistrationModel.js";
import { CustomError } from "../utils/appError.js";
import multer from "multer";
import { Email } from "../utils/email.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new CustomError("Please upload a PDF file", 400), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB
  },
}).single("licenseUpload");

export const registerHardware = catchAsync(async (req, res, next) => {
  const filledData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    description: req.body.description,
    address: {
      street: req.body.street,
      houseNumber: req.body.houseNumber,
      city: req.body.city,
      region: req.body.region,
      country: req.body.country,
    },
    coordinates: {
      type: "Point",
      coordinates: [req.body.longitude, req.body.latitude],
    },
    dealerId: req.user._id,
  };

  if (req.file) {
    filledData.licenseUpload = req.file.path;
  }
  const hardwareRegistration = await HardwareRegistration.create(filledData);
  res.status(201).json({
    status: "success",
    data: {
      hardwareRegistration,
    },
  });
});

export const getAllHardware = catchAsync(async (req, res, next) => {
  const hardwareRegistrations = await HardwareRegistration.find();
  res.status(200).json({
    status: "success",
    results: hardwareRegistrations.length,
    data: {
      hardwareRegistrations,
    },
  });
});

export const getHardwareById = catchAsync(async (req, res, next) => {
  const hardware = await HardwareRegistration.findById(req.params.id);
  if (!hardware) {
    return next(new CustomError("No hardware found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      hardware,
    },
  });
});

export const getMyHardware = catchAsync(async (req, res, next) => {
  const hardware = await HardwareRegistration.find({ dealerId: req.user._id });
  if (!hardware) {
    return next(new CustomError("No hardware found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    results: hardware.length,
    data: {
      hardware,
    },
  });
});

export const updateHardware = catchAsync(async (req, res, next) => {
  const filledData = { ...req.body };
  if (req.file) {
    filledData.licenseUpload = req.file.path;
  }
  const selectedHardware = await HardwareRegistration.findById(req.params.id);
  if (!selectedHardware) {
    return next(new CustomError("No hardware found with that ID", 404));
  }
  const isHardwareDealer = selectedHardware.dealerId.equals(req.user._id);
  const isAdmin = req.user.role === "admin";
  if (!isHardwareDealer && !isAdmin) {
    return next(
      new CustomError("You are not authorized to update this hardware", 403)
    );
  }

  const hardware = await HardwareRegistration.findByIdAndUpdate(
    req.params.id,
    filledData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!hardware) {
    return next(new CustomError("No hardware found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      hardware,
    },
  });
});

export const deleteHardware = catchAsync(async (req, res, next) => {
  const selectedHardware = await HardwareRegistration.findById(req.params.id);
  if (!selectedHardware) {
    return next(new CustomError("No hardware found with that ID", 404));
  }
  const isHardwareDealer = selectedHardware.dealerId.equals(req.user._id);
  const isAdmin = req.user.role === "admin";
  if (!isHardwareDealer && !isAdmin) {
    return next(
      new CustomError("You are not authorized to delete this hardware", 403)
    );
  }
  await HardwareRegistration.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const approveHardware = catchAsync(async (req, res, next) => {
  const hardware = await HardwareRegistration.findById(
    req.params.hardwareId
  ).populate("dealerId");

  if (!hardware) return next(new CustomError("No hardware with that ID"), 404);

  if (hardware.status !== "pending")
    return next(new CustomError("Hardware already approved!", 400));

  hardware.status = "verified";

  try {
    await new Email(hardware.dealerId, hardware).sendHardwareApproved();
    await hardware.save();
    res.status(200).json({
      status: "success",
      message: "Verification approved. Check your email",
    });
  } catch (err) {
    return next(new CustomError("Unable to send approval email", 500));
  }
});
