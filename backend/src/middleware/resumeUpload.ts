import multer from "multer";
import fs from "fs";
import path from "path";

const resumeUploadDir = path.join(process.cwd(), "uploads", "resumes");

if (!fs.existsSync(resumeUploadDir)) {
  fs.mkdirSync(resumeUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, resumeUploadDir);
  },
  filename: (_req, file, cb) => {
    const safeOriginalName = file.originalname.replace(/\s+/g, "-");
    const uniqueName = `${Date.now()}-${safeOriginalName}`;
    cb(null, uniqueName);
  },
});

const pdfFileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const isPdfMime = file.mimetype === "application/pdf";
  const isPdfExt = file.originalname.toLowerCase().endsWith(".pdf");

  if (!isPdfMime && !isPdfExt) {
    cb(new Error("Only PDF files are allowed"));
    return;
  }

  cb(null, true);
};

export const resumeUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: pdfFileFilter,
});
