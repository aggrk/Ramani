import catchAsync from "../utils/catchAsync.js";
import path from "node:path";

export const getUploadedFile = catchAsync(async (req, res, next) => {
  const filePath = path.join(
    import.meta.dirname,
    "../uploads",
    req.params.filename
  );
  res.sendFile(filePath);
});
