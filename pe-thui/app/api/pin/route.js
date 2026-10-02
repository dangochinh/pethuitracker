import { verifyBabyPin, updateBabyPin, getBaby } from '../../lib/db';
import { NextResponse } from 'next/server';

/**
 * POST /api/pin/verify: Xác thực mã PIN của hồ sơ bé
 * POST /api/pin/update: Đổi hoặc tạo mới mã PIN 4 số
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { action, code, pin, oldPin, newPin } = body;

        if (!code) {
            return NextResponse.json({ success: false, message: 'Thiếu mã hồ sơ bé' }, { status: 400 });
        }

        // Action: verify PIN
        if (action === 'verify') {
            const result = await verifyBabyPin(code, pin);
            if (!result.success) {
                return NextResponse.json({ success: false, message: result.message }, { status: 401 });
            }
            return NextResponse.json({ success: true, verified: true, hasPin: result.hasPin });
        }

        // Action: update or set PIN
        if (action === 'update' || action === 'set') {
            const result = await updateBabyPin(code, newPin, oldPin);
            return NextResponse.json({ success: true, hasPin: result.hasPin });
        }

        return NextResponse.json({ success: false, message: 'Action không hợp lệ' }, { status: 400 });
    } catch (err) {
        console.error('API Error in /api/pin:', err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
