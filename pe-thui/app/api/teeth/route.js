import { getTeethingRecords, saveTeethingRecord, deleteTeethingRecord } from '../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        if (!code) return NextResponse.json({ success: true, data: [] });

        const raw = await getTeethingRecords(code);
        const data = raw.map(d => ({
            id: d.toothId,
            toothId: d.toothId,
            date: d.eruptedDate || '',
            note: d.notes || '',
        }));

        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error('API Error in /api/teeth GET:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { code, toothId, date, note } = body;
        if (!code || !toothId) throw new Error('Missing code or toothId');

        await saveTeethingRecord(code, {
            toothId,
            eruptedDate: date || '',
            notes: note || '',
        });

        return NextResponse.json({ success: true, data: body });
    } catch (err) {
        console.error('API Error in /api/teeth POST:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const toothId = searchParams.get('toothId');
        if (!code || !toothId) throw new Error('Missing code or toothId');

        await deleteTeethingRecord(code, toothId);
        return NextResponse.json({ success: true, deleted: toothId });
    } catch (err) {
        console.error('API Error in /api/teeth DELETE:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
