import { getGoogleSheets, SHEET_ID } from '../../../lib/google-sheets';
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

    const sheets = await getGoogleSheets();
    const results = { pushSent: 0, pushFailed: 0, telegramSent: false, errors: [] };

    // Read profile
    const profileResp = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${code}!A1:B5`,
    });
    const profileRows = profileResp.data.values || [];
    const babyName = profileRows[0] ? profileRows[0][1] || 'bé' : 'bé';
    const telegramChatId = profileRows[4] ? profileRows[4][1] || '' : '';

    // Read push subscriptions
    let pushRows = [];
    try {
      const pushResp = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${code}!K7:L`,
      });
      pushRows = pushResp.data.values || [];
    } catch (e) {
      // No subscriptions yet
    }

    const pushSubscriptions = pushRows
      .filter(row => row[0] && row[1])
      .map(row => {
        try {
          const keys = JSON.parse(row[1]);
          return { endpoint: row[0], keys };
        } catch (e) { return null; }
      })
      .filter(Boolean);

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
        results.errors.push(`Push error: ${err.message} (status: ${err.statusCode})`);
      }
    }

    // === SEND TELEGRAM ===
    if (telegramChatId) {
      try {
        await sendTelegramMessage(telegramChatId,
          `🧪 <b>Test thông báo — ${now}</b>\n\n` +
          `Bé <b>${babyName}</b> sẽ nhận nhắc lịch tiêm qua Telegram.\n\n` +
          `✅ Thông báo hoạt động tốt!`
        );
        results.telegramSent = true;
      } catch (err) {
        results.errors.push(`Telegram error: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      code,
      babyName,
      channels: {
        pushSubscriptions: pushSubscriptions.length,
        telegramChatId: telegramChatId ? `${telegramChatId.slice(0, 4)}***` : 'not linked'
      },
      results,
      tip: !pushSubscriptions.length && !telegramChatId
        ? 'Chưa có kênh nào được đăng ký! Hãy bật thông báo App hoặc liên kết Telegram trước.'
        : undefined
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
