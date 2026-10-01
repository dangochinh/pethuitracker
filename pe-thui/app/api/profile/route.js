import { getBaby, createOrUpdateBaby, renameBabyCode } from '../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        if (!code) return NextResponse.json({ success: true, data: null });

        const profile = await getBaby(code);
        return NextResponse.json({ success: true, data: profile });
    } catch (err) {
        console.error('API Error in /api/profile:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const code = body.code;
        const oldCode = body.oldCode;
        if (!code) throw new Error('Code is required');

        if (oldCode && oldCode !== code) {
            await renameBabyCode(oldCode, code);
        }

        let avatar = body.avatar || '';
        // If an external URL is passed, fetch and convert to base64 data URI
        if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
            try {
                const res = await fetch(avatar, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                });
                if (res.ok) {
                    const buf = Buffer.from(await res.arrayBuffer());
                    let mimeType = res.headers.get('content-type') || 'image/jpeg';
                    mimeType = mimeType.split(';')[0].trim();
                    avatar = `data:${mimeType};base64,${buf.toString('base64')}`;
                }
            } catch (fetchErr) {
                console.warn('Could not fetch avatar URL server-side:', fetchErr.message);
            }
        }

        await createOrUpdateBaby(code, {
            name: body.name || '',
            gender: body.gender || '',
            dob: body.dob || null,
            avatar: avatar,
            telegramChatId: body.telegramChatId || '',
            mode: body.mode || 'born',
            estimatedDueDate: body.estimatedDueDate || null,
        });

        return NextResponse.json({ success: true, data: body });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
}
