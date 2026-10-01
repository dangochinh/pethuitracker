import { getJournalEntries, addJournalEntry, deleteJournalEntry } from '../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        if (!code) return NextResponse.json({ success: false, error: 'Code required' }, { status: 400 });

        const data = await getJournalEntries(code);
        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error('API Error in /api/journal:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { code, ...entry } = body;
        if (!code) throw new Error('Code is required');

        const result = await addJournalEntry(code, entry);
        return NextResponse.json({ success: true, data: result });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const id = searchParams.get('id');
        if (!code || !id) throw new Error('code and id required');

        await deleteJournalEntry(code, id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
}
