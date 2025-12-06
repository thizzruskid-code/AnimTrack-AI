// backend/routes/sheetsRoutes.js
import express from "express";
import {
  getSheetAssets,
  overwriteSheetAssets,
} from "../controllers/sheetsController.js";

const router = express.Router();

// GET → load rows from sheet
router.get("/", getSheetAssets);

// POST → upload rows to sheet
router.post("/upload", overwriteSheetAssets);

export default router;
