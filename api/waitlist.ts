import type { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // Allow requests from your site
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");

  const { email } = req.body;

  // Validate email
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "invalid_email" });
  }

  const normalised = email.toLowerCase().trim();

  try {
    // First check if email already exists in the sheet
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Waitlist!B:B",
    });

    const rows = existing.data.values || [];
    const alreadyExists = rows.some(
      (row) => row[0]?.toLowerCase().trim() === normalised
    );

    if (alreadyExists) {
      return res.status(409).json({ error: "already_registered" });
    }

    // Append new row: [Timestamp, Email]
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Waitlist!A:B",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[new Date().toISOString(), normalised]],
      },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Sheets API error:", err);
    return res.status(500).json({ error: "server_error" });
  }
}
