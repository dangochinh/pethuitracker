import { getVaccineRecords, saveVaccineRecord, deleteVaccineRecord } from '../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        if (!code) return NextResponse.json({ success: true, data: [] });

        const raw = await getVaccineRecords(code);
        const data = raw.map(d => ({
            id: d.vaccineId,
            vaccineId: d.vaccineId,
            date: d.administeredDate || '',
            scheduledDate: d.scheduledDate || '',
            note: d.notes || '',
        }));

        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error('API Error in /api/vaccines GET:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { code, vaccineId, date, scheduledDate, note } = body;
        if (!code || !vaccineId) throw new Error('Missing code or vaccineId');

        await saveVaccineRecord(code, {
            vaccineId,
            administeredDate: date || '',
            scheduledDate: scheduledDate || '',
            notes: note || '',
        });

        return NextResponse.json({ success: true, data: body });
    } catch (err) {
        console.error('API Error in /api/vaccines POST:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const vaccineId = searchParams.get('vaccineId');
        if (!code || !vaccineId) throw new Error('Missing code or vaccineId');

        await deleteVaccineRecord(code, vaccineId);
        return NextResponse.json({ success: true, deleted: vaccineId });
    } catch (err) {
        console.error('API Error in /api/vaccines DELETE:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
