import { savePushSubscription, deletePushSubscription } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { code, subscription } = await request.json();
        if (!code || !subscription) {
            return NextResponse.json({ success: false, error: 'Missing code or subscription' }, { status: 400 });
        }

        await savePushSubscription(code, subscription);
        return NextResponse.json({ success: true, message: 'Subscribed' });
    } catch (err) {
        console.error('Push subscribe error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const endpoint = searchParams.get('endpoint');
        if (!code || !endpoint) {
            return NextResponse.json({ success: false, error: 'Missing params' }, { status: 400 });
        }

        await deletePushSubscription(code, endpoint);
        return NextResponse.json({ success: true, message: 'Unsubscribed' });
    } catch (err) {
        console.error('Push unsubscribe error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
