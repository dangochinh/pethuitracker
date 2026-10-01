import { getAllBabies, getVaccineRecords, getPushSubscriptions, deletePushSubscription } from '../../../lib/db';
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
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = { totalProfiles: 0, reminders: 0, pushSent: 0, pushFailed: 0, telegramSent: 0, errors: [] };

  try {
    const allBabies = await getAllBabies();
    results.totalProfiles = allBabies.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const baby of allBabies) {
      try {
        const babyName = baby.name || baby.code;
        const telegramChatId = baby.telegramChatId || '';

        const [vaccines, pushSubscriptions] = await Promise.all([
          getVaccineRecords(baby.code),
          getPushSubscriptions(baby.code)
        ]);

        if (pushSubscriptions.length === 0 && !telegramChatId) {
          continue;
        }

        for (const vac of vaccines) {
          // Skip completed or no scheduled date
          if (vac.administeredDate || !vac.scheduledDate) continue;

          const [year, month, day] = vac.scheduledDate.split('-');
          const target = new Date(year, month - 1, day);
          target.setHours(0, 0, 0, 0);
          const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

          if (!REMINDER_DAYS.includes(diffDays)) continue;

          const vaccineInfo = VACCINES.find(v => v.id === vac.vaccineId);
          const vaccineName = vaccineInfo ? vaccineInfo.name : vac.vaccineId;

          const msg = getMessageTemplate(babyName, vaccineName, diffDays);
          if (!msg) continue;

          results.reminders++;

          // Send Web Push
          for (const sub of pushSubscriptions) {
            try {
              await getWebPush().sendNotification(sub, JSON.stringify({
                title: msg.title,
                body: msg.body,
                tag: `vaccine-${vac.vaccineId}-${diffDays}`,
                url: `/${baby.code}`
              }));
              results.pushSent++;
            } catch (pushErr) {
              results.pushFailed++;
              if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                // Subscription has expired or is invalid — remove it
                await deletePushSubscription(baby.code, sub.endpoint).catch(() => {});
              }
            }
          }

          // Send Telegram
          if (telegramChatId) {
            try {
              await sendTelegramMessage(telegramChatId, msg.telegramText);
              results.telegramSent++;
            } catch (tgErr) {
              results.errors.push(`Telegram to ${baby.code} failed: ${tgErr.message}`);
            }
          }
        }
      } catch (err) {
        results.errors.push(`Error processing ${baby.code}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (err) {
    console.error('Vaccine reminder cron error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
