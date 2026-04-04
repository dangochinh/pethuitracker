import { NextResponse } from 'next/server';

// Debug endpoint: chạy 1 lần rồi xoá
export async function GET(request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const vapidPub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPriv = process.env.VAPID_PRIVATE_KEY;

  // Try sending a test message directly via fetch
  let sendResult = null;
  if (token) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: 140392118,
          text: '✅ Debug: Webhook env vars are working!',
          parse_mode: 'HTML'
        })
      });
      sendResult = await res.json();
    } catch (err) {
      sendResult = { error: err.message };
    }
  }

  return NextResponse.json({
    envCheck: {
      TELEGRAM_BOT_TOKEN: token ? `${token.slice(0, 8)}...` : 'MISSING',
      VAPID_PUBLIC: vapidPub ? `${vapidPub.slice(0, 10)}...` : 'MISSING',
      VAPID_PRIVATE: vapidPriv ? `${vapidPriv.slice(0, 6)}...` : 'MISSING',
    },
    sendResult
  });
}
