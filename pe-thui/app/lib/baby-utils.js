import dayjs from 'dayjs';
import { TEETH } from './data/teeth.js';
import { VACCINES } from './data/vaccines.js';
import { assessWeight, assessHeight } from './calculations.js';

/**
 * Tính toán tuổi chi tiết của bé (tháng, ngày - không cần đơn vị năm)
 */
export function formatBabyAge(dob, toDate = new Date()) {
    if (!dob) return { totalMonths: 0, days: 0, formatted: '0 ngày tuổi' };
    const start = dayjs(dob);
    const end = dayjs(toDate);
    const totalMonths = end.diff(start, 'month');
    const startPlusMonths = start.add(totalMonths, 'month');
    const days = end.diff(startPlusMonths, 'day');

    let formatted = '';
    if (totalMonths > 0) {
        formatted += `${totalMonths} tháng `;
    }
    if (days > 0 || totalMonths === 0) {
        formatted += `${days} ngày tuổi`;
    }

    return {
        totalMonths,
        days,
        formatted: formatted.trim()
    };
}

/**
 * Đếm ngược số ngày tới sinh nhật tiếp theo của bé
 */
export function getDaysUntilNextBirthday(dob, toDate = new Date()) {
    if (!dob) return null;
    const now = dayjs(toDate).startOf('day');
    const birth = dayjs(dob).startOf('day');
    let nextBday = birth.year(now.year());
    if (nextBday.isBefore(now, 'day')) {
        nextBday = nextBday.add(1, 'year');
    }
    const daysUntil = nextBday.diff(now, 'day');
    const nextAge = nextBday.diff(birth, 'year');

    let label = '';
    if (daysUntil === 0) {
        label = `Hôm nay sinh nhật tròn ${nextAge} tuổi! 🎂🎉`;
    } else if (daysUntil === 1) {
        label = `Ngày mai sinh nhật tròn ${nextAge} tuổi! 🎂`;
    } else {
        label = `Còn ${daysUntil} ngày nữa tới sinh nhật tròn ${nextAge} tuổi`;
    }

    return {
        daysUntil,
        nextAge,
        label
    };
}

function getComparableTime(item) {
    if (!item) return 0;
    if (item.createdAt) {
        const t = new Date(item.createdAt).getTime();
        if (!isNaN(t)) return t;
    }
    if (item.startTime) {
        const t = new Date(item.startTime).getTime();
        if (!isNaN(t)) return t;
    }
    if (item.date && item.time) {
        const t = new Date(`${item.date}T${item.time}`).getTime();
        if (!isNaN(t)) return t;
    }
    if (item.time && typeof item.time === 'string') {
        const parts = item.time.split(':');
        if (parts.length >= 2) {
            return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        }
        const t = new Date(item.time).getTime();
        if (!isNaN(t)) return t;
    }
    return 0;
}

/**
 * Xử lý hoạt động trong ngày gần nhất (sữa, ngủ, tã)
 */
export function getLatestActivitiesSummary(feedings = [], sleeps = [], diapers = []) {
    // 1. Cữ bú gần nhất
    let latestFeed = null;
    if (feedings && feedings.length > 0) {
        const sorted = [...feedings].sort((a, b) => getComparableTime(b) - getComparableTime(a));
        const f = sorted[0];
        latestFeed = {
            amount: f.amount ? `${f.amount}ml` : (f.type === 'breast' ? 'Bú mẹ' : 'Cữ bú'),
            rawAmount: f.amount || 0,
            type: f.type || 'bottle',
            time: f.time || '',
            label: f.amount ? `${f.amount}ml` : 'Đã bú'
        };
    }

    // 2. Giấc ngủ gần nhất
    let latestSleep = null;
    if (sleeps && sleeps.length > 0) {
        const sorted = [...sleeps].sort((a, b) => getComparableTime(b) - getComparableTime(a));
        const s = sorted[0];
        let durationText = 'Đang ngủ';
        if (s.endTime) {
            const start = dayjs(s.startTime);
            const end = dayjs(s.endTime);
            const totalMinutes = Math.max(0, end.diff(start, 'minute'));
            const h = Math.floor(totalMinutes / 60);
            const m = totalMinutes % 60;
            durationText = h > 0 ? `${h}h${m > 0 ? `${m}m` : ''}` : `${m}m`;
        }
        latestSleep = {
            isSleeping: !s.endTime,
            durationText,
            startTime: s.startTime,
            endTime: s.endTime,
            note: s.endTime ? `Dậy lúc ${dayjs(s.endTime).format('HH:mm')}` : 'Bé đang ngủ ngon'
        };
    }

    // 3. Tã gần nhất
    let latestDiaper = null;
    if (diapers && diapers.length > 0) {
        const sorted = [...diapers].sort((a, b) => getComparableTime(b) - getComparableTime(a));
        const d = sorted[0];
        let label = 'Tã ướt';
        if (d.type === 'dirty') label = 'Tã bẩn';
        if (d.type === 'both') label = 'Ướt & bẩn';
        latestDiaper = {
            type: d.type || 'wet',
            label,
            time: d.time || ''
        };
    }

    return {
        latestFeed,
        latestSleep,
        latestDiaper
    };
}

/**
 * Dữ liệu vòm cung mọc răng (Upper & Lower Jaw Arcs)
 */
export function getTeethingArchData(teethingRecords = []) {
    const recordsMap = new Map();
    (teethingRecords || []).forEach(r => {
        recordsMap.set(r.toothId, r);
    });

    const upperTeethOrder = ['usm-r', 'ufm-r', 'uc-r', 'uli-r', 'uci-r', 'uci-l', 'uli-l', 'uc-l', 'ufm-l', 'usm-l'];
    const lowerTeethOrder = ['lsm-r', 'lfm-r', 'lc-r', 'lli-r', 'lci-r', 'lci-l', 'lli-l', 'lc-l', 'lfm-l', 'lsm-l'];

    const getToothInfo = (id) => {
        const meta = TEETH.find(t => t.id === id) || { id, vnName: 'Răng sữa' };
        const record = recordsMap.get(id);
        return {
            ...meta,
            erupted: !!record,
            sproutDate: record?.date || null
        };
    };

    const upperJaw = upperTeethOrder.map(getToothInfo);
    const lowerJaw = lowerTeethOrder.map(getToothInfo);

    const sproutedCount = recordsMap.size;
    const totalCount = 20;

    // Tìm răng mọc gần nhất
    let mostRecentTooth = null;
    if (teethingRecords && teethingRecords.length > 0) {
        const sorted = [...teethingRecords].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        const rec = sorted[0];
        const toothMeta = TEETH.find(t => t.id === rec.toothId);
        if (toothMeta) {
            mostRecentTooth = {
                name: toothMeta.vnName,
                date: rec.date || null
            };
        }
    }

    return {
        upperJaw,
        lowerJaw,
        sproutedCount,
        totalCount,
        upperEruptedCount: upperJaw.filter(t => t.erupted).length,
        lowerEruptedCount: lowerJaw.filter(t => t.erupted).length,
        mostRecentTooth
    };
}

/**
 * Tìm mũi tiêm tiếp theo chưa tiêm & tính số ngày còn lại
 */
export function getUpcomingVaccination(dob, vaccineRecords = []) {
    if (!dob) return null;
    const completedSet = new Set((vaccineRecords || []).filter(r => r.date || !r.scheduledDate).map(r => r.vaccineId));
    const birth = dayjs(dob);
    const now = dayjs();
    const currentAgeMonths = now.diff(birth, 'month');

    // Lọc các mũi chưa tiêm và sắp xếp theo recommendedAge
    const pending = VACCINES
        .filter(v => !completedSet.has(v.id))
        .sort((a, b) => a.recommendedAge - b.recommendedAge);

    if (pending.length === 0) return null;

    const nextVaccine = pending[0];
    const dueDate = birth.add(nextVaccine.recommendedAge, 'month');
    const daysUntilDue = dueDate.diff(now, 'day');

    let urgency = 'Định kỳ';
    let urgencyBadgeClass = 'bg-secondary-fixed text-on-secondary-fixed';

    if (daysUntilDue <= 0) {
        urgency = 'Đến lịch tiêm';
        urgencyBadgeClass = 'bg-error-container text-on-error-container';
    } else if (daysUntilDue <= 30) {
        urgency = 'Sắp đến hạn';
        urgencyBadgeClass = 'bg-error-container text-on-error-container';
    }

    return {
        vaccine: nextVaccine,
        dueDate: dueDate.format('YYYY-MM-DD'),
        daysUntilDue,
        urgency,
        urgencyBadgeClass,
        recommendedAgeText: nextVaccine.category
    };
}

/**
 * Thông điệp cột mốc / kỷ niệm tuổi bé (Keepsake Note)
 */
export function getKeepsakeMilestone(ageMonths = 0, babyName = 'Bé') {
    const milestones = {
        0: `${babyName} vừa chào đời, hãy giữ ấm và cho bé bú mẹ thường xuyên nhé! 🍼`,
        1: `${babyName} tròn 1 tháng tuổi! Bé bắt đầu chú ý đến giọng nói ấm áp của ba mẹ. ✨`,
        2: `${babyName} tròn 2 tháng! Bé đã bắt đầu biết hóng chuyện và nở những nụ cười đầu tiên. 💕`,
        3: `${babyName} tròn 3 tháng! Bé đã ngóc đầu cứng cáp và thích ngắm nhìn bàn tay xinh. 🌸`,
        4: `${babyName} tròn 4 tháng! Bé bắt đầu tập lẫy và cười thành tiếng giòn tan. 🎉`,
        5: `${babyName} tròn 5 tháng! Bé thích với tay nắm lấy đồ chơi nhiều màu sắc. 🧸`,
        6: `${babyName} tròn 6 tháng! Cột mốc ăn dặm đầu đời và những chiếc răng sữa đầu tiên! 🥣`,
        7: `${babyName} tròn 7 tháng! Bé thích ngồi vững và bắt chước các âm thanh ngộ nghĩnh. 🎈`,
        8: `${babyName} tròn 8 tháng! Bé đang tập bò trườn khắp nhà để khám phá thế giới. 🐾`,
        9: `${babyName} tròn 9 tháng! Bé thích chơi trò trốn tìm ú òa và vẫy tay 'bye bye'. 👋`,
        10: `${babyName} tròn 10 tháng! Bé đã biết tự bám tay vịn đứng lên và bập bẹ gọi 'Ba Ba', 'Mẹ Mẹ'! ✨`,
        11: `${babyName} tròn 11 tháng! Bé tập đứng chựng vài giây và thích tự cầm đồ ăn. 🍞`,
        12: `${babyName} tròn 1 tuổi! Chúc mừng sinh nhật đầu đời của thiên thần nhỏ! 🎂🎈`
    };

    const capped = Math.min(Math.max(ageMonths, 0), 12);
    return {
        title: `Kỷ niệm tròn ${capped} tháng`,
        message: milestones[capped] || `${babyName} đang lớn khôn từng ngày trong tình yêu thương của gia đình! ❤️`
    };
}
