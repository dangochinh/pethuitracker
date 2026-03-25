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
            range: `${code}!F7:I`, // Expanded range for ScheduledDate
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        const data = rows
            .map((row, index) => ({
                id: index + 7,
                vaccineId: row[0],
                date: row[1],
                scheduledDate: row[2] || '',
                note: row[3] || ''
            }))
            .filter(d => d.vaccineId);

        return NextResponse.json({ success: true, data });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { code, vaccineId, date, scheduledDate, note } = body;
        if (!code || !vaccineId) throw new Error('Missing code or vaccineId');

        const sheets = await getGoogleSheets();
        
        // Ensure header exists
        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `${code}!F6:I6`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [['VaccineID', 'Ngày tiêm', 'Ngày hẹn', 'Ghi chú']]
            }
        });

        // Check if a record already exists for this vaccineId
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${code}!F7:I`,
        });

        const rows = response.data.values || [];
        const existingRowIndex = rows.findIndex(row => row[0] === vaccineId);

        if (existingRowIndex !== -1) {
            // Update existing row
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: `${code}!F${existingRowIndex + 7}:I${existingRowIndex + 7}`,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [[vaccineId, date || rows[existingRowIndex][1] || '', scheduledDate || rows[existingRowIndex][2] || '', note || rows[existingRowIndex][3] || '']]
                }
            });
        } else {
            // Add as new row at the end
            const rowNumber = rows.length + 7;
            const newRow = [vaccineId, date || '', scheduledDate || '', note || ''];
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: `${code}!F${rowNumber}:I${rowNumber}`,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [newRow]
                }
            });
        }

        return NextResponse.json({ success: true, data: body });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const vaccineId = searchParams.get('vaccineId');
        if (!code || !vaccineId) throw new Error('Missing code or vaccineId');

        const sheets = await getGoogleSheets();
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${code}!F7:I`,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ success: true, message: 'No records to delete' });
        }

        const remainingRows = rows.filter(row => row[0] !== vaccineId);

        await sheets.spreadsheets.values.clear({
            spreadsheetId: SHEET_ID,
            range: `${code}!F7:I`,
        });

        if (remainingRows.length > 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: `${code}!F7:I`,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: remainingRows
                }
            });
        }

        return NextResponse.json({ success: true, deleted: vaccineId });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
