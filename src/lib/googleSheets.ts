import { google } from "googleapis";

interface SheetRow {
  timestamp: string;
  name: string;
  phone: string;
  email: string;
  product_or_class: string;
  contact_method: string;
  message: string;
  privacy_required_consent: string;
  optional_info_consent: string;
  marketing_consent: string;
  source: string;
}

function getAuthClient() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error("Google Sheets credentials are not configured.");
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function appendLeadToSheet(row: SheetRow): Promise<void> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || "Sheet1";

  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not configured.");
  }

  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const values = [
    [
      row.timestamp,
      row.name,
      row.phone,
      row.email,
      row.product_or_class,
      row.contact_method,
      row.message,
      row.privacy_required_consent,
      row.optional_info_consent,
      row.marketing_consent,
      row.source,
    ],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });
}
