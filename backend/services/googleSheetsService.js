// backend/services/googleSheetsService.js

import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const KEYFILE = path.join(__dirname, "../service_account.json");

// TODO: Use your actual sheet ID — yours looks like this:
// 1NYPjf3FtP8M4XiZZl-RdjqfzvZskEyv6xYoOefPDWA
const SHEET_ID = "1NYPjf3FtP8M4XiZZl-RdjqfzvZskEyv6xYoOefPDWA";
const RANGE = "Sheet1!A2:H";

function getClient() {
  const credentials = JSON.parse(fs.readFileSync(KEYFILE, "utf8"));
  return google.auth.fromJSON({
    type: credentials.type,
    client_email: credentials.client_email,
    private_key: credentials.private_key,
    token_uri: credentials.token_uri
  });
}

// -------------------------------
// LOAD GOOGLE SHEET
// -------------------------------
export async function getSheetData() {
  const auth = getClient();
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE
  });

  const rows = response.data.values || [];

  const assets = rows.map((r) => ({
    project: r[0] || "",
    episode: r[1] || "",
    scene: r[2] || "",
    shot: r[3] || "",
    status: r[4] || "",
    notes: r[5] || "",
    stills: r[6] || "",
    video: r[7] || ""
  }));

  return { success: true, assets };
}

// -------------------------------
// SAVE BACK TO GOOGLE SHEET
// -------------------------------
export async function saveSheetData(assets) {
  const auth = getClient();
  const sheets = google.sheets({ version: "v4", auth });

  const values = assets.map((a) => [
    a.project || "",
    a.episode || "",
    a.scene || "",
    a.shot || "",
    a.status || "",
    a.notes || "",
    a.stills || "",
    a.video || ""
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: RANGE,
    valueInputOption: "USER_ENTERED",
    requestBody: { values }
  });

  return { success: true };
}
