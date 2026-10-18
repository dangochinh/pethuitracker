import dayjs from 'dayjs';

export function calculateAge(dob, toDate = new Date()) {
    const start = dayjs(dob);
    const end = dayjs(toDate);
    const totalMonths = end.diff(start, 'month');
    const startPlusMonths = start.add(totalMonths, 'month');
    const days = end.diff(startPlusMonths, 'day');

    let text = '';
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (years > 0) {
        text += `${years} tuổi `;
    }
    if (months > 0) {
        text += `${months} tháng `;
    }
    if (days > 0 || (years === 0 && months === 0)) {
        text += `${days} ngày`;
    }

    return {
        totalMonths,
        days,
        text: text.trim()
    };
}

export function predictAdultHeight(currentHeight, gender, ageMonths) {
    if (!currentHeight || ageMonths === undefined) return 0;

    // Simplified MVP formula
    const factor = gender === 'male' ? 1.05 : 1;
    let baseMultiplier = 2.0;
    if (ageMonths < 12) baseMultiplier = 2.4;
    else if (ageMonths < 24) baseMultiplier = 2.0;
    else if (ageMonths < 48) baseMultiplier = 1.6;
    else baseMultiplier = 1.4;

    let predicted = currentHeight * baseMultiplier * factor;
    predicted = Math.max(145, Math.min(195, predicted));
    return Math.round(predicted);
}

export function assessWeight(weight, ageMonths) {
    // Rough estimate for MVP
    const avg = ageMonths * 0.5 + 4;
    if (weight > avg * 1.3) return { status: 'Vượt chuẩn', color: 'text-[#e65100]', bg: 'bg-[#ffe0b2]' };
    if (weight < avg * 0.75) return { status: 'Dưới chuẩn', color: 'text-[#c2185b]', bg: 'bg-[#f8bbd0]' };
    return { status: 'Đạt chuẩn', color: 'text-[#00838f]', bg: 'bg-[#b2ebf2]' };
}

export function assessHeight(height, ageMonths) {
    // Rough estimate for MVP
    const avg = ageMonths * 1.5 + 50;
    if (height > avg * 1.1) return { status: 'Vượt chuẩn', color: 'text-[#e65100]', bg: 'bg-[#ffe0b2]' };
    if (height < avg * 0.9) return { status: 'Dưới chuẩn', color: 'text-[#c2185b]', bg: 'bg-[#f8bbd0]' };
    return { status: 'Đạt chuẩn', color: 'text-[#00838f]', bg: 'bg-[#b2ebf2]' };
}

export function normalizeIsoDate(dateStr) {
    if (!dateStr) return '';
    const trimmed = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
        const [d, m, y] = trimmed.split('/');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    return trimmed;
}

export function sortGrowthRecordsDescending(records = []) {
    return [...records].sort((a, b) => {
        const isoA = normalizeIsoDate(a.date);
        const isoB = normalizeIsoDate(b.date);
        const dateA = isoA ? new Date(isoA).getTime() : 0;
        const dateB = isoB ? new Date(isoB).getTime() : 0;
        if (!isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
            return dateB - dateA;
        }
        const ageA = Number(a.ageMonths) || 0;
        const ageB = Number(b.ageMonths) || 0;
        if (ageB !== ageA) {
            return ageB - ageA;
        }
        const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (!isNaN(createdA) && !isNaN(createdB) && createdA !== createdB) {
            return createdB - createdA;
        }
        return String(b.id || '').localeCompare(String(a.id || ''));
    });
}

