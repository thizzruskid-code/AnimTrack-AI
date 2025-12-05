import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  handleStillsUpload,
  handleVideoUpload,
} from "../controllers/uploadController.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, "..");
const uploadsDir = path.join(rootDir, "uploads");
const stillsDir = path.join(uploadsDir, "stills");
const videosDir = path.join(uploadsDir, "videos");

// Ensure upload dirs exist
for (const dir of [uploadsDir, stillsDir, videosDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "stills") {
      cb(null, stillsDir);
    } else {
      cb(null, videosDir);
    }
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({ storage });

// POST /upload/stills
router.post("/stills", upload.array("stills"), handleStillsUpload);

// POST /upload/video
router.post("/video", upload.single("video"), handleVideoUpload);

export default router;
