import { getFirestore } from '../../../lib/firestore';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { phone, pin, name } = body;
        
        if (!phone || !pin || !name) {
            return NextResponse.json({ success: false, error: 'Vui lòng nhập đủ thông tin' }, { status: 400 });
        }

        if (pin.length < 4) {
            return NextResponse.json({ success: false, error: 'Mã PIN phải từ 4 ký tự' }, { status: 400 });
        }

        const db = getFirestore();
        const docRef = db.collection('users').doc(phone);
        const doc = await docRef.get();

        if (doc.exists) {
            return NextResponse.json({ success: false, error: 'Số điện thoại này đã được đăng ký' }, { status: 409 });
        }

        const newUser = {
            name,
            pin, // Plain text for simplicity/MVP
            babies: [],
            createdAt: new Date().toISOString()
        };

        await docRef.set(newUser);

        // Return user without pin
        const { pin: _, ...safeUser } = newUser;
        return NextResponse.json({ success: true, user: { phone, ...safeUser } });

    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
