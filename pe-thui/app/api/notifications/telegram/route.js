import { createOrUpdateBaby } from '../../../lib/db';
import { NextResponse } from 'next/server';

// DELETE — Remove Telegram chat ID from profile
export async function DELETE(request) {
    try {
        const { code } = await request.json();
        if (!code) {
            return NextResponse.json({ success: false, error: 'Missing code' }, { status: 400 });
        }

        await createOrUpdateBaby(code, { telegramChatId: '' });
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
