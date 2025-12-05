import fs from "fs";
import path from "path";
import { google } from "googleapis";

const SHEET_ID = "1NYPjf3FtP8M4XiZZl-RdjfzvZ5kEy6xYoOefPDWA";   // <-- your sheet
const SHEET_RANGE = "Sheet1!A2:H";                           // <-- exact sheet range

// Auth using service_account.json in backend root
const auth = new google.auth.GoogleAuth({
  keyFile: path.resolve("service_account.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const sheets = google.sheets({ version: "v4", auth });

// ----------------------------
// LOAD SHEET DATA
// ----------------------------
export async function loadSheetData() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: SHEET_RANGE
  });

  const rows = res.data.values || [];

  return rows.map(r => ({
    project: r[0] || "",
    episode: r[1] || "",
    scene: r[2] || "",
    shot: r[3] || "",
    status: r[4] || "",
    notes: r[5] || "",
    stills: r[6] || "",
    video: r[7] || ""
  }));
}

// ----------------------------
// WRITE SHEET DATA
// ----------------------------
export async function writeSheetData(rows) {
  const values = rows.map(r => [
    r.project,
    r.episode,
    r.scene,
    r.shot,
    r.status,
    r.notes,
    r.stills,
    r.video
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: SHEET_RANGE,
    valueInputOption: "USER_ENTERED",
    requestBody: { values }
  });

  return true;
}
