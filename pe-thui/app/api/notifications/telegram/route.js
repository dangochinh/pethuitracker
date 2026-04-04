import { getGoogleSheets, SHEET_ID } from '../../../lib/google-sheets';
import { NextResponse } from 'next/server';

// DELETE — Remove Telegram chat ID from profile
export async function DELETE(request) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ success: false, error: 'Missing code' }, { status: 400 });
    }

    const sheets = await getGoogleSheets();
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${code}!A5:B5`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Telegram Chat ID', '']]
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
