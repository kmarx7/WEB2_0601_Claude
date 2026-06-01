import { google } from "googleapis";

export interface SheetRow {
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

function getSheetsClient() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || "Sheet1";

  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is not configured.");
  }

  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  return { sheets, spreadsheetId, sheetName };
}

export async function appendLeadToSheet(row: SheetRow): Promise<void> {
  const { sheets, spreadsheetId, sheetName } = getSheetsClient();

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

// 전화번호 중복 여부 확인 (헤더 행 제외하고 C열 검색)
export async function checkDuplicatePhone(phone: string): Promise<boolean> {
  const { sheets, spreadsheetId, sheetName } = getSheetsClient();

  const normalizedPhone = phone.replace(/-/g, "");

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!C2:C`,
  });

  const rows = res.data.values ?? [];
  return rows.some((row) => row[0]?.replace(/-/g, "") === normalizedPhone);
}

// 전체 제출 내역 조회 (헤더 포함)
export async function getLeads(): Promise<SheetRow[]> {
  const { sheets, spreadsheetId, sheetName } = getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A2:K`,
  });

  const rows = res.data.values ?? [];

  return rows.map((row) => ({
    timestamp: row[0] ?? "",
    name: row[1] ?? "",
    phone: row[2] ?? "",
    email: row[3] ?? "",
    product_or_class: row[4] ?? "",
    contact_method: row[5] ?? "",
    message: row[6] ?? "",
    privacy_required_consent: row[7] ?? "",
    optional_info_consent: row[8] ?? "",
    marketing_consent: row[9] ?? "",
    source: row[10] ?? "",
  }));
}
