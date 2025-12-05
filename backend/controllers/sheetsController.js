// backend/controllers/sheetsController.js

import { getSheetData, saveSheetData } from "../services/googleSheetsService.js";

export const loadFromSheets = async (req, res) => {
  try {
    const result = await getSheetData();
    return res.json(result);
  } catch (err) {
    console.error("Sheets load error:", err);
    return res.status(500).json({ success: false, error: "Sheets load failed" });
  }
};

export const saveToSheets = async (req, res) => {
  try {
    const assets = req.body.assets;
    if (!assets || !Array.isArray(assets)) {
      return res.status(400).json({ success: false, error: "Invalid asset data" });
    }

    const result = await saveSheetData(assets);
    return res.json(result);
  } catch (err) {
    console.error("Sheets save error:", err);
    return res.status(500).json({ success: false, error: "Sheets save failed" });
  }
};
