import { getGrowthRecords, addGrowthRecord, updateGrowthRecord, deleteGrowthRecord } from '../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        if (!code) return NextResponse.json({ success: true, data: [] });

        const type = searchParams.get('type');
        let data = await getGrowthRecords(code);
        if (type) {
            data = data.filter(d => d.type === type || (!d.type && type === 'mother_weight'));
        }
        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error('API Error in /api/growth GET:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const code = body.code;
        if (!code) throw new Error('Missing code');

        const record = await addGrowthRecord(code, {
            date: body.date,
            ageMonths: body.ageMonths,
            weight: body.weight,
            height: body.height,
            type: body.type,
            gestationalAge: body.gestationalAge,
            note: body.note,
        });

        return NextResponse.json({ success: true, data: record });
    } catch (err) {
        console.error('API Error in /api/growth POST:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const code = body.code;
        const id = body.id;
        if (!code || !id) throw new Error('Missing code or ID');

        await updateGrowthRecord(code, id, {
            date: body.date,
            ageMonths: body.ageMonths,
            weight: body.weight,
            height: body.height,
            type: body.type,
            gestationalAge: body.gestationalAge,
            note: body.note,
        });

        return NextResponse.json({ success: true, data: body });
    } catch (err) {
        console.error('API Error in /api/growth PUT:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) throw new Error('Invalid or missing ID');
        const code = searchParams.get('code');
        if (!code) throw new Error('Missing code');

        await deleteGrowthRecord(code, id);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('API Error in /api/growth DELETE:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
