import { getBaby, getPushSubscriptions } from '../../../lib/db';
import getWebPush from '../../../lib/web-push';
import { sendTelegramMessage } from '../../../lib/telegram';
import { NextResponse } from 'next/server';

// Test endpoint — Gửi notification test ngay lập tức
// Gọi: GET /api/notifications/test?code=YOUR_CODE
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: 'Missing ?code= parameter' }, { status: 400 });
        }

        const results = { pushSent: 0, pushFailed: 0, telegramSent: false, errors: [] };

        // Read profile
        const profile = await getBaby(code);
        const babyName = profile?.name || 'bé';
        const telegramChatId = profile?.telegramChatId || '';

        // Read push subscriptions
        const pushSubscriptions = await getPushSubscriptions(code);
        const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        // === SEND WEB PUSH ===
        for (const sub of pushSubscriptions) {
            try {
                await getWebPush().sendNotification(sub, JSON.stringify({
                    title: `🧪 Test thông báo — ${now}`,
                    body: `Bé ${babyName} sẽ nhận nhắc lịch tiêm qua App. Thông báo hoạt động tốt! ✅`,
                    tag: `test-${Date.now()}`,
                    url: `/${code}`
                }));
                results.pushSent++;
            } catch (err) {
                results.pushFailed++;
                results.errors.push(`Push failed: ${err.message}`);
            }
        }

        // === SEND TELEGRAM ===
        if (telegramChatId) {
            try {
                await sendTelegramMessage(
                    telegramChatId,
                    `🧪 <b>Test thông báo Telegram</b>\n\n` +
                    `Bé <b>${babyName}</b> đã liên kết Telegram thành công! ✅\n` +
                    `Thời gian: <code>${now}</code>\n\n` +
                    `Bạn sẽ nhận được nhắc nhở tiêm chủng tự động trước 7, 3, 1 ngày và đúng ngày tiêm. 🔔`
                );
                results.telegramSent = true;
            } catch (err) {
                results.errors.push(`Telegram failed: ${err.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            results,
            summary: `Đã gửi ${results.pushSent} push notification(s), Telegram: ${results.telegramSent ? 'OK' : 'Không có hoặc lỗi'}`
        });

    } catch (err) {
        console.error('Test notification error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
