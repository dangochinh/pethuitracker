import { getGoogleSheets, SHEET_ID } from '../../../lib/google-sheets';
import { NextResponse } from 'next/server';

// POST — Save push subscription for a user
export async function POST(request) {
  try {
    const { code, subscription } = await request.json();
    if (!code || !subscription) {
      return NextResponse.json({ success: false, error: 'Missing code or subscription' }, { status: 400 });
    }

    const sheets = await getGoogleSheets();

    // Ensure header row exists
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${code}!K6:L6`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Push Endpoint', 'Push Keys']]
      }
    });

    // Read existing subscriptions
    let existingRows = [];
    try {
      const resp = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${code}!K7:L`,
      });
      existingRows = resp.data.values || [];
    } catch (e) {
      // No data yet, that's fine
    }

    // Check if this endpoint already exists
    const endpointExists = existingRows.some(row => row[0] === subscription.endpoint);
    if (endpointExists) {
      return NextResponse.json({ success: true, message: 'Already subscribed' });
    }

    // Add new subscription
    const rowNumber = existingRows.length + 7;
    const keysJson = JSON.stringify(subscription.keys || {});
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${code}!K${rowNumber}:L${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[subscription.endpoint, keysJson]]
      }
    });

    return NextResponse.json({ success: true, message: 'Subscribed' });
  } catch (err) {
    console.error('Push subscribe error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE — Remove a push subscription
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const endpoint = searchParams.get('endpoint');
    if (!code || !endpoint) {
      return NextResponse.json({ success: false, error: 'Missing params' }, { status: 400 });
    }

    const sheets = await getGoogleSheets();

    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${code}!K7:L`,
    });

    const rows = resp.data.values || [];
    const remaining = rows.filter(row => row[0] !== endpoint);

    // Clear and rewrite
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: `${code}!K7:L`,
    });

    if (remaining.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${code}!K7:L`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: remaining }
      });
    }

    return NextResponse.json({ success: true, message: 'Unsubscribed' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
