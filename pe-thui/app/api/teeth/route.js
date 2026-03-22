import { getGoogleSheets, SHEET_ID } from '../../lib/google-sheets';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        if (!code) return NextResponse.json({ success: true, data: [] });

        const sheets = await getGoogleSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${code}!J7:L`, // Teething data in J:L
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        const data = rows.map((row, index) => ({
            id: index + 7,
            toothId: row[0],
            date: row[1],
            note: row[2] || ''
        }));

        return NextResponse.json({ success: true, data });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { code, toothId, date, note } = body;
        if (!code || !toothId) throw new Error('Missing code or toothId');

        const sheets = await getGoogleSheets();
        
        // Ensure header exists
        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `${code}!J6:L6`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [['ToothID', 'Ngày mọc', 'Ghi chú']]
            }
        });

        const newRow = [toothId, date, note || ''];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: `${code}!J7:L`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [newRow]
            }
        });

        return NextResponse.json({ success: true, data: body });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const toothId = searchParams.get('toothId');
        if (!code || !toothId) throw new Error('Missing code or toothId');

        const sheets = await getGoogleSheets();
        
        // Get current values
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${code}!J7:L`,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ success: true, message: 'No records to delete' });
        }

        // Filter out the row with the matching toothId
        const remainingRows = rows.filter(row => row[0] !== toothId);

        // Clear the range
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SHEET_ID,
            range: `${code}!J7:L`,
        });

        // Update with remaining rows
        if (remainingRows.length > 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: `${code}!J7:L`,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: remainingRows
                }
            });
        }

        return NextResponse.json({ success: true, deleted: toothId });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
