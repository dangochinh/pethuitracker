import { getGoogleSheets, SHEET_ID } from '../../../lib/google-sheets';
import getWebPush from '../../../lib/web-push';
import { sendTelegramMessage } from '../../../lib/telegram';
import { VACCINES } from '../../../lib/data/vaccines';
import { NextResponse } from 'next/server';

// Reminder milestones (days before scheduled date)
const REMINDER_DAYS = [7, 3, 1, 0];

function getMessageTemplate(babyName, vaccineName, daysLeft) {
  switch (daysLeft) {
    case 7:
      return {
        title: `🔔 Nhắc lịch tiêm cho bé ${babyName}`,
        body: `Bé ${babyName} có lịch tiêm ${vaccineName} vào 7 ngày nữa. Hãy chuẩn bị nhé!`,
        telegramText:
          `🔔 <b>Nhắc lịch tiêm</b>\n\n` +
          `Bé <b>${babyName}</b> có lịch tiêm <b>${vaccineName}</b> vào 7 ngày nữa.\n\n` +
          `Hãy chuẩn bị nhé! 💪`
      };
    case 3:
      return {
        title: `⏰ Sắp đến lịch tiêm!`,
        body: `Bé ${babyName} sắp đến lịch tiêm ${vaccineName}. Còn 3 ngày!`,
        telegramText:
          `⏰ <b>Sắp đến lịch tiêm!</b>\n\n` +
          `Bé <b>${babyName}</b> còn <b>3 ngày</b> nữa là đến lịch tiêm <b>${vaccineName}</b>.\n\n` +
          `Đừng quên đặt lịch hẹn nhé!`
      };
    case 1:
      return {
        title: `🔴 Ngày mai đến lịch tiêm!`,
        body: `Ngày mai bé ${babyName} có lịch tiêm ${vaccineName}! Đừng quên nhé!`,
        telegramText:
          `🔴 <b>Ngày mai đến lịch tiêm!</b>\n\n` +
          `Bé <b>${babyName}</b> có lịch tiêm <b>${vaccineName}</b> vào <b>NGÀY MAI</b>!\n\n` +
          `Hãy chuẩn bị sổ tiêm chủng và các giấy tờ cần thiết nhé! 📋`
      };
    case 0:
      return {
        title: `💉 Hôm nay tiêm chủng!`,
        body: `Hôm nay bé ${babyName} có lịch tiêm ${vaccineName}! Chúc bé khỏe mạnh!`,
        telegramText:
          `💉 <b>Hôm nay tiêm chủng!</b>\n\n` +
          `Bé <b>${babyName}</b> có lịch tiêm <b>${vaccineName}</b> vào <b>HÔM NAY</b>!\n\n` +
          `Chúc bé khỏe mạnh! ❤️`
      };
    default:
      return null;
  }
}

export async function GET(request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = { totalProfiles: 0, reminders: 0, pushSent: 0, pushFailed: 0, telegramSent: 0, errors: [] };

  try {
    const sheets = await getGoogleSheets();

    // 1. List all sheet tabs (each tab = one baby profile)
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID
    });

    const allSheets = spreadsheet.data.sheets.map(s => s.properties.title);
    results.totalProfiles = allSheets.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Process each profile
    for (const sheetName of allSheets) {
      try {
        // Read profile (A1:B5) + vaccine data (F7:I) + push subscriptions (K7:L)
        const [profileResp, vaccineResp, pushResp] = await Promise.all([
          sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${sheetName}!A1:B5`,
          }).catch(() => ({ data: { values: [] } })),
          sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${sheetName}!F7:I`,
          }).catch(() => ({ data: { values: [] } })),
          sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${sheetName}!K7:L`,
          }).catch(() => ({ data: { values: [] } }))
        ]);

        const profileRows = profileResp.data.values || [];
        const vaccineRows = vaccineResp.data.values || [];
        const pushRows = pushResp.data.values || [];

        const babyName = profileRows[0] ? profileRows[0][1] || sheetName : sheetName;
        const telegramChatId = profileRows[4] ? profileRows[4][1] || '' : '';

        // Build push subscriptions list
        const pushSubscriptions = pushRows
          .filter(row => row[0] && row[1])
          .map(row => {
            try {
              const keys = JSON.parse(row[1]);
              return { endpoint: row[0], keys };
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean);

        // No notification channels configured — skip
        if (pushSubscriptions.length === 0 && !telegramChatId) {
          continue;
        }

        // Check each vaccine record for scheduled dates
        for (const row of vaccineRows) {
          const vaccineId = row[0];
          const completedDate = row[1]; // If has date = already vaccinated
          const scheduledDate = row[2];

          // Skip completed or no scheduled date
          if (completedDate || !scheduledDate) continue;

          const target = new Date(scheduledDate);
          target.setHours(0, 0, 0, 0);
          const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

          // Check if this matches a reminder milestone
          if (!REMINDER_DAYS.includes(diffDays)) continue;

          // Find vaccine name
          const vaccineInfo = VACCINES.find(v => v.id === vaccineId);
          const vaccineName = vaccineInfo ? vaccineInfo.name : vaccineId;

          const msg = getMessageTemplate(babyName, vaccineName, diffDays);
          if (!msg) continue;

          results.reminders++;

          // Send Web Push to all subscriptions
          const expiredEndpoints = [];
          for (const sub of pushSubscriptions) {
            try {
              await getWebPush().sendNotification(sub, JSON.stringify({
                title: msg.title,
                body: msg.body,
                tag: `vaccine-${vaccineId}-${diffDays}`,
                url: `/${sheetName}`
              }));
              results.pushSent++;
            } catch (pushErr) {
              results.pushFailed++;
              // 410 Gone or 404 = subscription expired
              if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                expiredEndpoints.push(sub.endpoint);
              }
            }
          }

          // Cleanup expired subscriptions
          if (expiredEndpoints.length > 0) {
            try {
              const remaining = pushRows.filter(row => !expiredEndpoints.includes(row[0]));
              await sheets.spreadsheets.values.clear({
                spreadsheetId: SHEET_ID,
                range: `${sheetName}!K7:L`,
              });
              if (remaining.length > 0) {
                await sheets.spreadsheets.values.update({
                  spreadsheetId: SHEET_ID,
                  range: `${sheetName}!K7:L`,
                  valueInputOption: 'USER_ENTERED',
                  requestBody: { values: remaining }
                });
              }
            } catch (e) {
              // Non-critical, continue
            }
          }

          // Send Telegram
          if (telegramChatId) {
            try {
              await sendTelegramMessage(telegramChatId, msg.telegramText);
              results.telegramSent++;
            } catch (teleErr) {
              results.errors.push(`Telegram error for ${sheetName}: ${teleErr.message}`);
            }
          }
        }
      } catch (sheetErr) {
        results.errors.push(`Error processing ${sheetName}: ${sheetErr.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results
    });
  } catch (err) {
    console.error('Cron job error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
