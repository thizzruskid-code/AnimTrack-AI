// backend/controllers/uploadController.js
// This file is intentionally minimal because upload logic is handled in routes.

export const noopUploadController = (req, res) => {
  res.json({ success: true });
};
