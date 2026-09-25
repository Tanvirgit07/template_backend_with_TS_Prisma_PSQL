import { logger } from "../utils/logger.js";
import sendResponse from "../utils/sendResponse.js";
import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { Prisma } from "../generated/prisma/client.js";
import AppError from "../errors/AppError.js";

const errorMiddleware: ErrorRequestHandler = (
  err,
  _req,
  res,
  next,
) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let message = "Something went wrong";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof multer.MulterError) {
    statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;

    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        message = "Image exceeds the allowed file size";
        break;
      case "LIMIT_FILE_COUNT":
        message = "Too many images uploaded";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Unexpected file field or too many images for this field";
        break;
      case "LIMIT_FIELD_VALUE":
        message = "A form field value is too large";
        break;
      case "LIMIT_FIELD_KEY":
        message = "A form field name is too long";
        break;
      case "LIMIT_FIELD_COUNT":
        message = "Too many form fields submitted";
        break;
      case "LIMIT_PART_COUNT":
        message = "Too many files and form fields submitted";
        break;
      default:
        message = "Invalid file upload request";
    }
  } else if (
    err instanceof SyntaxError &&
    "type" in err &&
    err.type === "entity.parse.failed"
  ) {
    statusCode = 400;
    message = "Request body contains invalid JSON";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        statusCode = 409;
        message = "A record with this unique value already exists";
        break;

      case "P2025":
        statusCode = 404;
        message = "Requested record not found";
        break;

      case "P2003":
        statusCode = 409;
        message = "Related record is missing or still in use";
        break;
    }
  }

  if (statusCode >= 500) {
  console.error("🔴 PRISMA REAL ERROR:", err);
    logger.error("Unhandled request error", { errorType: err instanceof Error ? err.name : "UnknownError" });
  }

  sendResponse(res, {
    statusCode,
    message,
  });
};

export default errorMiddleware;
