import fs from "fs";
import path from "path";

export const loadLocalJSON = (req, res) => {
  try {
    const filePath = path.join(process.cwd(), "data.json");
    if (!fs.existsSync(filePath)) {
      return res.json([]); // empty list on first run
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    res.json(data);
  } catch (error) {
    console.error("Local load failed:", error);
    res.status(500).json({ error: "Failed to load local JSON" });
  }
};
