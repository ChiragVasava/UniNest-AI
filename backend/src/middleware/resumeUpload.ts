import multer from "multer";
import os from "os";
import path from "path";

const resolveUploadBaseDir = () => {
  const configuredDir = process.env.UPLOAD_DIR;
  if (configuredDir) {
    return path.isAbsolute(configuredDir)
      ? configuredDir
      : path.join(process.cwd(), configuredDir);
  }

  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), "uninest-uploads");
  }

  return path.join(process.cwd(), "uploads");
};

// Export so the controller can write the file to disk after text extraction
export const resumeUploadDir = path.join(resolveUploadBaseDir(), "resumes");

const pdfFileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const isPdfMime = file.mimetype === "application/pdf";
  const isPdfExt = file.originalname.toLowerCase().endsWith(".pdf");

  if (!isPdfMime && !isPdfExt) {
    cb(new Error("Only PDF files are allowed"));
    return;
  }

  cb(null, true);
};

// Use memoryStorage so req.file.buffer is available for PDF text extraction
export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: pdfFileFilter,
});
