// backend/routes/sheetsRoutes.js
import express from "express";
import { loadFromSheets, saveToSheets } from "../controllers/sheetsController.js";

const router = express.Router();

router.get("/", loadFromSheets);
router.post("/", saveToSheets);

// backwards compatibility
router.get("/all", loadFromSheets);
router.post("/upload", saveToSheets);

export default router;
