import { getFirestore } from '../../../lib/firestore';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { phone, pin } = body;
        
        if (!phone || !pin) {
            return NextResponse.json({ success: false, error: 'Vui lòng nhập đủ SĐT và mã PIN' }, { status: 400 });
        }

        const db = getFirestore();
        const docRef = db.collection('users').doc(phone);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, error: 'Số điện thoại chưa được đăng ký' }, { status: 404 });
        }

        const userData = doc.data();
        if (userData.pin !== pin) {
            return NextResponse.json({ success: false, error: 'Mã PIN không chính xác' }, { status: 401 });
        }

        // Return user without pin
        const { pin: _, ...safeUser } = userData;
        return NextResponse.json({ success: true, user: { phone, ...safeUser } });

    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
