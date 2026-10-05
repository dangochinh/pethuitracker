import {
  checkBabyExists,
  getBaby,
  getBabyByTelegramChatId,
  createOrUpdateBaby,
  getVaccineRecords,
  addGrowthRecord
} from '../../../lib/db';
import { sendTelegramMessage } from '../../../lib/telegram';
import { NextResponse } from 'next/server';

const VACCINE_MAP = {
  'bcg': 'Lao (BCG)', 'hepb-0': 'Viêm gan B - Sơ sinh',
  '6in1-1': '6in1 - Mũi 1', '6in1-2': '6in1 - Mũi 2', '6in1-3': '6in1 - Mũi 3', '6in1-4': '6in1 - Nhắc lại',
  'pneumo-1': 'Phế cầu - Mũi 1', 'pneumo-2': 'Phế cầu - Mũi 2', 'pneumo-3': 'Phế cầu - Mũi 3', 'pneumo-4': 'Phế cầu - Mũi 4',
  'rota-1': 'Rota - Mũi 1', 'rota-2': 'Rota - Mũi 2', 'rota-3': 'Rota - Mũi 3',
  'meningo-b-1': 'NMC B - Mũi 1', 'meningo-b-2': 'NMC B - Mũi 2',
  'meningo-bc-1': 'NMC B+C - Mũi 1', 'meningo-bc-2': 'NMC B+C - Mũi 2',
  'meningo-acyw-1': 'NMC ACYW - Liều 1', 'meningo-acyw-2': 'NMC ACYW - Nhắc lại',
  'flu-1': 'Cúm - Mũi 1', 'flu-2': 'Cúm - Mũi 2', 'flu-annual': 'Cúm hàng năm',
  'je-1': 'VN Nhật Bản - Mũi 1', 'je-2': 'VN Nhật Bản - Mũi 2',
  'mmr-1': 'Sởi-QBị-Rubella - Mũi 1', 'mmr-2': 'Sởi-QBị-Rubella - Mũi 2', 'mmr-3': 'Sởi-QBị-Rubella - Nhắc',
  'chickenpox-1': 'Thủy đậu - Mũi 1', 'chickenpox-2': 'Thủy đậu - Mũi 2',
  'hepa-1': 'Viêm gan A - Mũi 1', 'hepa-2': 'Viêm gan A - Mũi 2',
  'dpt-5': 'DPT/Bại liệt - Nhắc', 'typhoid': 'Thương hàn', 'tả': 'Tả (Uống)',
  'dengue-1': 'SXH - Mũi 1', 'dengue-2': 'SXH - Mũi 2',
};

function getVaccineName(id) {
  return VACCINE_MAP[id] || id;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
    if (parts.length === 3) {
      if (dateStr.includes('/')) {
        return `${parts[0]}/${parts[1]}/${parts[2]}`;
      } else {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return dateStr;
  } catch { return dateStr; }
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  try {
    const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
    if (parts.length === 3) {
      if (dateStr.includes('/')) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
      } else {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
    }
    return null;
  } catch { return null; }
}

function daysUntil(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - now) / (1000 * 60 * 60 * 24));
}

export async function POST(request) {
  try {
    const body = await request.json();
    const message = body.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const firstName = message.from?.first_name || 'bạn';

    // ==========================================
    // /start [CODE] — Liên kết tài khoản
    // ==========================================
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      if (parts.length < 2) {
        await sendTelegramMessage(chatId,
          `Xin chào ${firstName}! 👋\n\n` +
          `Để liên kết Babie Tracker, hãy gửi:\n\n` +
          `<b>/start MÃ_CODE_CỦA_BÉ</b>\n\n` +
          `Ví dụ: <code>/start SOC010125.0426</code>\n\n` +
          `Bạn có thể tìm mã code trong app, mục Thông Tin Bé.`
        );
        return NextResponse.json({ ok: true });
      }

      const code = parts[1].toUpperCase();
      const exists = await checkBabyExists(code);
      if (!exists) {
        await sendTelegramMessage(chatId,
          `❌ Không tìm thấy mã <b>${code}</b>.\n\n` +
          `Vui lòng kiểm tra lại mã code trong app.`
        );
        return NextResponse.json({ ok: true });
      }

      const baby = await getBaby(code);
      const babyName = baby?.name || 'bé';

      // Save telegramChatId
      await createOrUpdateBaby(code, { telegramChatId: String(chatId) });

      await sendTelegramMessage(chatId,
        `✅ Liên kết thành công!\n\n` +
        `Bé <b>${babyName}</b> (mã: <code>${code}</code>)\n\n` +
        `🔔 Bạn sẽ nhận nhắc trước 7, 3, 1 ngày và đúng ngày tiêm.\n\n` +
        `📋 <b>Các lệnh có thể dùng:</b>\n` +
        `• /lichtiem — Xem lịch tiêm sắp tới\n` +
        `• /datiem — Xem mũi đã tiêm\n` +
        `• /info — Thông tin bé\n` +
        `• /stop — Ngừng nhận thông báo`
      );
      return NextResponse.json({ ok: true });
    }

    // ==========================================
    // /lichtiêm or /lichtiem — Xem lịch hẹn sắp tới
    // ==========================================
    if (text.startsWith('/lichti') || text.startsWith('/lich') || text === '/lt') {
      const profile = await getBabyByTelegramChatId(chatId);

      if (!profile) {
        await sendTelegramMessage(chatId,
          `❌ Bạn chưa liên kết tài khoản.\n\nGửi <b>/start MÃ_CODE</b> để bắt đầu.`
        );
        return NextResponse.json({ ok: true });
      }

      const { code, name: babyName } = profile;
      const vaccines = await getVaccineRecords(code);

      const upcoming = vaccines
        .filter(v => v.vaccineId && v.scheduledDate && !v.administeredDate)
        .map(v => ({
          name: getVaccineName(v.vaccineId),
          scheduledDate: v.scheduledDate,
          note: v.notes || '',
          days: daysUntil(v.scheduledDate)
        }))
        .filter(v => v.days !== null)
        .sort((a, b) => a.days - b.days);

      if (upcoming.length === 0) {
        await sendTelegramMessage(chatId,
          `📋 <b>Lịch tiêm — ${babyName}</b>\n\n` +
          `Hiện chưa có mũi nào có lịch hẹn.\n\n` +
          `Hãy vào app để thêm lịch hẹn cho các mũi tiêm.`
        );
        return NextResponse.json({ ok: true });
      }

      let msg = `📋 <b>Lịch tiêm sắp tới — ${babyName}</b>\n\n`;
      upcoming.forEach((v) => {
        const icon = v.days <= 0 ? '🔴' : v.days <= 3 ? '🟡' : v.days <= 7 ? '🟢' : '⚪';
        const dayText = v.days === 0 ? '<b>HÔM NAY</b>' : v.days < 0 ? `<b>Quá hạn ${Math.abs(v.days)} ngày</b>` : `còn <b>${v.days}</b> ngày`;
        msg += `${icon} <b>${v.name}</b>\n`;
        msg += `    📅 ${formatDate(v.scheduledDate)} — ${dayText}\n`;
        if (v.note) msg += `    📝 ${v.note}\n`;
        msg += `\n`;
      });

      msg += `Tổng: <b>${upcoming.length}</b> mũi có lịch hẹn`;
      await sendTelegramMessage(chatId, msg);
      return NextResponse.json({ ok: true });
    }

    // ==========================================
    // /datiêm or /datiem — Xem mũi đã tiêm
    // ==========================================
    if (text.startsWith('/dati') || text.startsWith('/da') || text === '/dt') {
      const profile = await getBabyByTelegramChatId(chatId);

      if (!profile) {
        await sendTelegramMessage(chatId,
          `❌ Bạn chưa liên kết tài khoản.\n\nGửi <b>/start MÃ_CODE</b> để bắt đầu.`
        );
        return NextResponse.json({ ok: true });
      }

      const { code, name: babyName } = profile;
      const vaccines = await getVaccineRecords(code);
      const done = vaccines
        .filter(v => v.vaccineId && v.administeredDate)
        .map(v => ({
          name: getVaccineName(v.vaccineId),
          date: v.administeredDate,
          note: v.notes || ''
        }));

      if (done.length === 0) {
        await sendTelegramMessage(chatId,
          `💉 <b>Đã tiêm — ${babyName}</b>\n\nChưa có mũi nào được ghi nhận.`
        );
        return NextResponse.json({ ok: true });
      }

      let msg = `💉 <b>Đã tiêm — ${babyName}</b>\n\n`;
      done.forEach((v) => {
        msg += `✅ <b>${v.name}</b> — ${formatDate(v.date)}\n`;
      });
      msg += `\nTổng: <b>${done.length}</b> mũi đã tiêm 🎉`;

      await sendTelegramMessage(chatId, msg);
      return NextResponse.json({ ok: true });
    }

    // ==========================================
    // /info — Thông tin bé
    // ==========================================
    if (text.startsWith('/info') || text === '/i') {
      const profile = await getBabyByTelegramChatId(chatId);

      if (!profile) {
        await sendTelegramMessage(chatId,
          `❌ Bạn chưa liên kết tài khoản.\n\nGửi <b>/start MÃ_CODE</b> để bắt đầu.`
        );
        return NextResponse.json({ ok: true });
      }

      const { code, name = 'N/A', gender = 'N/A', dob = 'N/A' } = profile;

      // Calculate age
      let ageText = '';
      const dobDate = parseDate(dob);
      if (dobDate) {
        const now = new Date();
        const months = (now.getFullYear() - dobDate.getFullYear()) * 12 + (now.getMonth() - dobDate.getMonth());
        const years = Math.floor(months / 12);
        const remainMonths = months % 12;
        ageText = years > 0 ? `${years} tuổi ${remainMonths} tháng` : `${months} tháng`;
      }

      const vaccines = await getVaccineRecords(code);
      const totalDone = vaccines.filter(v => v.vaccineId && v.administeredDate).length;
      const totalScheduled = vaccines.filter(v => v.vaccineId && v.scheduledDate && !v.administeredDate).length;

      let msg = `👶 <b>Thông tin bé</b>\n\n`;
      msg += `📛 <b>Tên:</b> ${name}\n`;
      msg += `${gender === 'male' ? '♂️' : '♀️'} <b>Giới tính:</b> ${gender === 'male' ? 'Trai' : 'Gái'}\n`;
      msg += `🎂 <b>Ngày sinh:</b> ${formatDate(dob)}\n`;
      if (ageText) msg += `📅 <b>Tuổi:</b> ${ageText}\n`;
      msg += `🔑 <b>Mã:</b> <code>${code}</code>\n\n`;
      msg += `💉 <b>Tiêm chủng:</b>\n`;
      msg += `• Đã tiêm: <b>${totalDone}</b> mũi\n`;
      msg += `• Có lịch hẹn: <b>${totalScheduled}</b> mũi\n`;

      await sendTelegramMessage(chatId, msg);
      return NextResponse.json({ ok: true });
    }

    // ==========================================
    // /phattrien or /pt - Cập nhật chiều cao, cân nặng
    // ==========================================
    if (text.startsWith('/phattri') || text.startsWith('/pt')) {
      const parts = text.split(/\s+/);
      if (parts.length < 3) {
        await sendTelegramMessage(chatId,
          `❌ Cú pháp không hợp lệ.\n\n` +
          `Vui lòng nhập theo định dạng:\n` +
          `<b>/phattrien {cân_nặng} {chiều_cao} [ngày_đo]</b>\n\n` +
          `Ví dụ: <code>/phattrien 10.8 77 04/04/2026</code>`
        );
        return NextResponse.json({ ok: true });
      }

      const weight = parseFloat(parts[1].replace(',', '.'));
      const height = parseFloat(parts[2].replace(',', '.'));
      const dateStrInput = parts[3];

      if (isNaN(weight) || isNaN(height)) {
        await sendTelegramMessage(chatId, `❌ Cân nặng và chiều cao phải là số hợp lệ.`);
        return NextResponse.json({ ok: true });
      }

      const profile = await getBabyByTelegramChatId(chatId);
      if (!profile) {
        await sendTelegramMessage(chatId,
          `❌ Bạn chưa liên kết tài khoản.\n\nGửi <b>/start MÃ_CODE</b> để bắt đầu.`
        );
        return NextResponse.json({ ok: true });
      }

      const { code, name: babyName, dob } = profile;

      let measureDate = new Date();
      if (dateStrInput) {
        const pDate = parseDate(dateStrInput);
        if (pDate) {
          measureDate = pDate;
        } else {
          await sendTelegramMessage(chatId, `❌ Định dạng ngày không hợp lệ. Vui lòng dùng định dạng DD/MM/YYYY.`);
          return NextResponse.json({ ok: true });
        }
      }

      const dd = String(measureDate.getDate()).padStart(2, '0');
      const mm = String(measureDate.getMonth() + 1).padStart(2, '0');
      const yyyy = measureDate.getFullYear();
      const measureDateStr = `${dd}/${mm}/${yyyy}`;

      let ageMonths = 0;
      const dobDate = parseDate(dob);
      if (dobDate) {
        ageMonths = (measureDate.getFullYear() - dobDate.getFullYear()) * 12 + (measureDate.getMonth() - dobDate.getMonth());
        if (measureDate.getDate() < dobDate.getDate()) {
          ageMonths -= 1;
        }
        ageMonths = Math.max(0, ageMonths);
      }

      await addGrowthRecord(code, {
        date: measureDateStr,
        ageMonths,
        weight,
        height
      });

      await sendTelegramMessage(chatId,
        `✅ Đã cập nhật chỉ số phát triển cho <b>${babyName}</b>:\n\n` +
        `⚖️ Cân nặng: <b>${weight} kg</b>\n` +
        `📏 Chiều cao: <b>${height} cm</b>\n` +
        `📅 Ngày đo: <b>${measureDateStr}</b> (${ageMonths} tháng tuổi)`
      );
      return NextResponse.json({ ok: true });
    }

    // ==========================================
    // /stop [CODE] — Ngừng nhận thông báo
    // ==========================================
    if (text.startsWith('/stop')) {
      const parts = text.split(' ');
      let code;

      if (parts.length >= 2) {
        code = parts[1].toUpperCase();
      } else {
        const profile = await getBabyByTelegramChatId(chatId);
        if (profile) {
          code = profile.code;
        } else {
          await sendTelegramMessage(chatId,
            `Gửi <b>/stop MÃ_CODE</b> để ngừng nhận thông báo.\n\nVí dụ: <code>/stop SOC010125.0426</code>`
          );
          return NextResponse.json({ ok: true });
        }
      }

      const exists = await checkBabyExists(code);
      if (exists) {
        await createOrUpdateBaby(code, { telegramChatId: '' });
        await sendTelegramMessage(chatId,
          `✅ Đã ngừng nhắc lịch tiêm cho mã <b>${code}</b>.\n\nGửi /start ${code} nếu muốn bật lại.`
        );
      } else {
        await sendTelegramMessage(chatId, `❌ Không tìm thấy mã <b>${code}</b>.`);
      }
      return NextResponse.json({ ok: true });
    }

    // ==========================================
    // /help or /status — Danh sách lệnh
    // ==========================================
    if (text.startsWith('/help') || text.startsWith('/status') || text === '/h') {
      await sendTelegramMessage(chatId,
        `🤖 <b>Babie Tracker Bot</b>\n\n` +
        `📋 <b>Các lệnh:</b>\n\n` +
        `• /start MÃ_CODE — Liên kết tài khoản\n` +
        `• /lichtiem — 📅 Xem lịch tiêm sắp tới\n` +
        `• /datiem — ✅ Xem mũi đã tiêm\n` +
        `• /info — 👶 Thông tin bé\n` +
        `• /phattrien — 📈 Cập nhật chiều cao, cân nặng\n` +
        `• /stop — 🔕 Ngừng nhận thông báo\n` +
        `• /help — ❓ Trợ giúp\n\n` +
        `<b>Phím tắt:</b> /lt /dt /i /pt /h`
      );
      return NextResponse.json({ ok: true });
    }

    // ==========================================
    // Unknown — Gợi ý
    // ==========================================
    await sendTelegramMessage(chatId,
      `Xin chào ${firstName}! 👋\n\n` +
      `Gửi /help để xem danh sách lệnh.\n\n` +
      `Hoặc gửi <b>/start MÃ_CODE</b> để bắt đầu nhận nhắc lịch tiêm.`
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Telegram webhook error:', err);
    return NextResponse.json({ ok: true });
  }
}
