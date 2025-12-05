import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, "..");
const uploadsDir = path.join(rootDir, "uploads");
const stillsDir = path.join(uploadsDir, "stills");
const videosDir = path.join(uploadsDir, "videos");

// Make sure upload dirs exist
for (const dir of [uploadsDir, stillsDir, videosDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function handleStillsUpload(req, res) {
  try {
    const files = req.files || [];
    const urls = files.map((file) =>
      `/uploads/stills/${path.basename(file.path)}`
    );

    res.json({
      success: true,
      files: urls,
    });
  } catch (err) {
    console.error("Stills upload error:", err);
    res.status(500).json({ success: false, error: "Stills upload failed" });
  }
}

export function handleVideoUpload(req, res) {
  try {
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, error: "No video file uploaded" });
    }

    const url = `/uploads/videos/${path.basename(file.path)}`;

    res.json({
      success: true,
      file: url,
    });
  } catch (err) {
    console.error("Video upload error:", err);
    res.status(500).json({ success: false, error: "Video upload failed" });
  }
}
