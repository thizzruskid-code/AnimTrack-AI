// backend/routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Directory fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder =
      file.fieldname === "video"
        ? path.join(__dirname, "../uploads/videos")
        : path.join(__dirname, "../uploads/stills");

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Upload stills (multiple)
router.post("/stills", upload.array("stills"), (req, res) => {
  try {
    const filenames = req.files.map((f) => `uploads/stills/${f.filename}`);
    return res.json({ success: true, stills: filenames });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Failed to upload stills",
    });
  }
});

// Upload video (single)
router.post("/video", upload.single("video"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No video file provided",
      });
    }

    return res.json({
      success: true,
      video: `uploads/videos/${req.file.filename}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Failed to upload video",
    });
  }
});

export default router;
