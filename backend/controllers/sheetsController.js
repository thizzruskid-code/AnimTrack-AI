// backend/controllers/sheetsController.js
import {
  readSheetRows,
  writeSheetRows,
} from "../services/googleSheetsService.js";

// Load assets from Google Sheets
export async function getSheetAssets(req, res) {
  try {
    const rows = await readSheetRows();
    return res.json({ success: true, assets: rows });
  } catch (err) {
    console.error("Sheets GET error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch Google Sheet",
    });
  }
}

// Overwrite sheet with new asset rows
export async function overwriteSheetAssets(req, res) {
  try {
    const assets = req.body.assets || [];
    await writeSheetRows(assets);
    return res.json({ success: true });
  } catch (err) {
    console.error("Sheets UPLOAD error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to write to Google Sheet",
    });
  }
}
