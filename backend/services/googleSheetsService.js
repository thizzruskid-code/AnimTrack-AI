// backend/services/googleSheetsService.js
import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to service account JSON
const KEYFILE = path.join(__dirname, "../service_account.json");

// Sheet configuration
const SPREADSHEET_ID = "1NYPjf3FtP8M4XiZzll-RdjqfzvZskEyv6xYoOefPDWA";
const SHEET_NAME = "Sheet1";

function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

// -----------------------------
// READ ROWS
// -----------------------------

export async function readSheetRows() {
  const sheets = getSheetsClient();

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:H`,
  });

  const values = result.data.values || [];

  return values.map((row) => ({
    project: row[0] || "",
    episode: row[1] || "",
    scene: row[2] || "",
    shot: row[3] || "",
    status: row[4] || "",
    notes: row[5] || "",
    stills: row[6] ? row[6].split("|") : [],
    video: row[7] || null,
  }));
}

// -----------------------------
// WRITE ROWS
// -----------------------------

export async function writeSheetRows(assets) {
  const sheets = getSheetsClient();

  const rows = assets.map((a) => [
    a.project || "",
    a.episode || "",
    a.scene || "",
    a.shot || "",
    a.status || "",
    a.notes || "",
    Array.isArray(a.stills) ? a.stills.join("|") : "",
    a.video || "",
  ]);

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:H`,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2`,
    valueInputOption: "RAW",
    requestBody: {
      values: rows,
    },
  });
}
