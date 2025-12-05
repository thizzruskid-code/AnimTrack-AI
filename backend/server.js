import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import uploadRoutes from "./routes/uploadRoutes.js";
import sheetsRoutes from "./routes/sheetsRoutes.js";

const app = express();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/upload", uploadRoutes);
app.use("/sheets", sheetsRoutes);

// Simple health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "AnimTrack backend running" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
