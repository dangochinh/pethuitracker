// Telegram Bot helper for Pe Thui Tracker

function getTelegramApi() {
  return `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
}

export async function sendTelegramMessage(chatId, text) {
  const apiUrl = getTelegramApi();
  try {
    const res = await fetch(`${apiUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      })
    });
    const json = await res.json();
    if (!json.ok) {
      console.error('Telegram API error:', json);
    }
    return json.ok;
  } catch (err) {
    console.error('Telegram send error:', err);
    return false;
  }
}

export async function setWebhook(url) {
  const apiUrl = getTelegramApi();
  const res = await fetch(`${apiUrl}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  return res.json();
}
