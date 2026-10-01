import { getFirestore } from '../../../lib/firestore';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { phone, code } = body;
        
        if (!phone || !code) {
            return NextResponse.json({ success: false, error: 'Thiếu thông tin user hoặc mã bé' }, { status: 400 });
        }

        const db = getFirestore();
        const docRef = db.collection('users').doc(phone);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, error: 'User không tồn tại' }, { status: 404 });
        }

        const userData = doc.data();
        let babies = userData.babies || [];
        
        if (!babies.includes(code)) {
            babies.push(code);
            await docRef.update({ babies });
        }

        return NextResponse.json({ success: true, babies });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
