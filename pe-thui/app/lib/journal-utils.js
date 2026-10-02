import dayjs from 'dayjs';

/**
 * Tạo danh sách ngày xung quanh ngày được chọn để hiển thị trên Carousel Mini Calendar
 */
export function generateDayCarousel(selectedDateStr, range = 3) {
    const selected = dayjs(selectedDateStr || new Date());
    const today = dayjs().startOf('day');
    const days = [];

    const weekDayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let offset = -range; offset <= range; offset++) {
        const d = selected.add(offset, 'day');
        const dStart = d.startOf('day');
        const isToday = dStart.isSame(today);
        const isSelected = d.format('YYYY-MM-DD') === selected.format('YYYY-MM-DD');
        const isFuture = dStart.isAfter(today);

        days.push({
            dateString: d.format('YYYY-MM-DD'),
            dayNumber: d.date(),
            dayOfWeek: weekDayNames[d.day()],
            isToday,
            isSelected,
            isFuture,
            label: isToday ? 'Hôm nay' : weekDayNames[d.day()]
        });
    }

    return days;
}

/**
 * Tổng hợp các số liệu trong ngày: Tổng sữa (ml), Giờ ngủ (phút/giờ), Thay tã (lần), Kỷ niệm (mốc)
 */
export function aggregateDailyStats(feedings = [], sleeps = [], diapers = [], journals = []) {
    // 1. Sữa: tổng ml
    const totalMilkMl = (feedings || []).reduce((acc, f) => {
        const val = Number(f.amount) || 0;
        return acc + val;
    }, 0);

    // 2. Ngủ: tổng số phút
    const totalSleepMinutes = (sleeps || []).reduce((acc, s) => {
        if (!s.endTime || !s.startTime) return acc;
        const start = dayjs(s.startTime);
        const end = dayjs(s.endTime);
        const diff = Math.max(0, end.diff(start, 'minute'));
        return acc + diff;
    }, 0);

    const sleepHours = (totalSleepMinutes / 60).toFixed(1).replace('.0', '');
    const sleepDisplay = totalSleepMinutes >= 60 
        ? `${Math.floor(totalSleepMinutes / 60)}h${totalSleepMinutes % 60 > 0 ? `${totalSleepMinutes % 60}m` : ''}`
        : `${totalSleepMinutes}m`;

    // 3. Tã: tổng số lần
    const diaperCount = (diapers || []).length;

    // 4. Kỷ niệm / Cột mốc
    const milestoneCount = (journals || []).filter(j => j.type === 'milestone' || (j.photos && j.photos.length > 0)).length;

    return {
        totalMilkMl,
        milkDisplay: totalMilkMl > 0 ? `${totalMilkMl}ml` : '0ml',
        totalSleepMinutes,
        sleepHours,
        sleepDisplay: totalSleepMinutes > 0 ? sleepDisplay : '0h',
        diaperCount,
        diaperDisplay: `${diaperCount} lần`,
        milestoneCount,
        milestoneDisplay: `${milestoneCount} mốc`
    };
}

/**
 * Phân loại buổi trong ngày từ chuỗi giờ hoặc ISO string
 */
export function getTimePeriodLabel(timeStr) {
    if (!timeStr) return 'TRONG NGÀY';
    let hour = 12;
    if (timeStr.includes('T')) {
        hour = dayjs(timeStr).hour();
    } else {
        const parts = timeStr.split(':');
        if (parts.length >= 1) hour = parseInt(parts[0], 10);
    }

    if (hour >= 4 && hour < 11) return 'SÁNG';
    if (hour >= 11 && hour < 14) return 'TRƯA';
    if (hour >= 14 && hour < 18) return 'CHIỀU';
    return 'TỐI';
}

/**
 * Gộp các hoạt động hàng ngày thành 1 luồng Timeline thống nhất
 */
export function mergeTimelineEvents(feedings = [], sleeps = [], diapers = [], journals = []) {
    const events = [];

    // Gộp feedings
    (feedings || []).forEach(f => {
        const time = f.time || (f.createdAt ? dayjs(f.createdAt).format('HH:mm') : '08:00');
        events.push({
            id: `feed_${f.id || Math.random()}`,
            rawId: f.id,
            category: 'feed',
            title: f.amount ? `Cữ sữa ${f.amount}ml` : 'Cữ bú sữa',
            subtitle: f.type === 'breast' ? 'Bú sữa mẹ trực tiếp' : `Bú bình (${f.amount || 0}ml)`,
            detail: f.notes || 'Bé hợp tác bú ngoan, tiêu hóa tốt.',
            badge: f.amount ? `${f.amount} ml` : 'Đã bú',
            time,
            period: `${time} ${getTimePeriodLabel(time)}`,
            sortTime: time,
            color: 'primary',
            icon: 'baby_changing_station'
        });
    });

    // Gộp sleeps
    (sleeps || []).forEach(s => {
        const startTime = s.time || (s.startTime ? (s.startTime.includes('T') ? dayjs(s.startTime).format('HH:mm') : s.startTime) : '12:00');
        let durationText = 'Đang ngủ';
        if (s.endTime) {
            const start = dayjs(s.startTime);
            const end = dayjs(s.endTime);
            const diff = Math.max(0, end.diff(start, 'minute'));
            const h = Math.floor(diff / 60);
            const m = diff % 60;
            durationText = h > 0 ? `${h}h ${m}p` : `${m}p`;
        }

        events.push({
            id: `sleep_${s.id || Math.random()}`,
            rawId: s.id,
            category: 'sleep',
            title: s.endTime ? 'Giấc ngủ ngon' : 'Bé đang ngủ',
            subtitle: s.notes || (s.endTime ? `Ngủ từ ${startTime} đến ${dayjs(s.endTime).format('HH:mm')}` : 'Bé đang ngủ say giấc'),
            detail: s.notes || 'Ngủ sâu giấc, không giật mình quấy khóc.',
            badge: durationText,
            time: startTime,
            period: `${startTime} ${getTimePeriodLabel(startTime)}`,
            sortTime: startTime,
            color: 'secondary',
            icon: 'dark_mode'
        });
    });

    // Gộp diapers
    (diapers || []).forEach(d => {
        const time = d.time ? (d.time.includes('T') ? dayjs(d.time).format('HH:mm') : d.time) : '14:00';
        let typeLabel = 'Tã ướt';
        if (d.type === 'dirty') typeLabel = 'Tã bẩn';
        if (d.type === 'both' || d.type === 'mixed') typeLabel = 'Ướt & bẩn';

        events.push({
            id: `diaper_${d.id || Math.random()}`,
            rawId: d.id,
            category: 'diaper',
            title: `Thay tã: ${typeLabel}`,
            subtitle: d.notes || 'Thay tã sạch sẽ, vệ sinh thoáng mát.',
            detail: d.notes || 'Da mông bé khô thoáng, không có dấu hiệu hăm đỏ.',
            badge: typeLabel,
            time,
            period: `${time} ${getTimePeriodLabel(time)}`,
            sortTime: time,
            color: 'tertiary',
            icon: 'cleaning_services'
        });
    });

    // Gộp journals (Ảnh & Cột mốc)
    (journals || []).forEach(j => {
        const time = j.time || (j.date ? dayjs(j.date).format('HH:mm') : '16:00');
        const isMilestone = j.type === 'milestone';

        events.push({
            id: `journal_${j.id || Math.random()}`,
            rawId: j.id,
            category: isMilestone ? 'milestone' : 'photo',
            title: j.title || (isMilestone ? 'Cột mốc đặc biệt của bé!' : 'Khoảnh khắc đáng yêu'),
            subtitle: j.caption || 'Ghi lại kỷ niệm ngọt ngào của thiên thần nhỏ.',
            detail: j.caption || '',
            photos: j.photos || [],
            badge: isMilestone ? 'Cột Mốc Mới! 🎉' : 'Khoảnh khắc',
            emotion: j.emotion || 'Cả nhà vỡ òa hạnh phúc ❤️',
            time,
            period: `${time} ${getTimePeriodLabel(time)}`,
            sortTime: time,
            color: 'primary',
            icon: isMilestone ? 'star' : 'photo_camera'
        });
    });

    // Sắp xếp theo giờ tăng dần (hoặc giảm dần theo ngày)
    return events.sort((a, b) => a.sortTime.localeCompare(b.sortTime));
}

/**
 * Danh sách cột mốc phát triển theo chuẩn WHO phân theo lứa tuổi
 */
export function getStandardMilestones(ageMonths = 10) {
    let stageTitle = 'Giai đoạn 9 - 12 Tháng';
    let ageRange = '9 - 12 Tháng';

    if (ageMonths < 3) {
        stageTitle = 'Giai đoạn 0 - 3 Tháng';
        ageRange = '0 - 3 Tháng';
    } else if (ageMonths < 6) {
        stageTitle = 'Giai đoạn 3 - 6 Tháng';
        ageRange = '3 - 6 Tháng';
    } else if (ageMonths < 9) {
        stageTitle = 'Giai đoạn 6 - 9 Tháng';
        ageRange = '6 - 9 Tháng';
    } else if (ageMonths >= 12) {
        stageTitle = 'Giai đoạn 12 - 18 Tháng';
        ageRange = '12 - 18 Tháng';
    }

    const categories = [
        {
            id: 'gross_motor',
            name: 'Vận động thô',
            icon: 'directions_walk',
            color: 'primary',
            items: [
                { id: 'gm_1', title: 'Tự ngồi vững không cần điểm tựa', subtitle: 'Biết ngồi thẳng lưng chơi đồ chơi', defaultChecked: true },
                { id: 'gm_2', title: 'Bò thuần thục bằng tay và đầu gối', subtitle: 'Bò trườn nhanh nhẹn khắp nhà', defaultChecked: true },
                { id: 'gm_3', title: 'Tự bám vịn đứng dậy vững vàng', subtitle: 'Vịn thành ghế/cũi đứng thẳng chân', defaultChecked: true },
            ]
        },
        {
            id: 'fine_motor',
            name: 'Vận động tinh',
            icon: 'front_hand',
            color: 'secondary',
            items: [
                { id: 'fm_1', title: 'Chuyền đồ vật linh hoạt giữa 2 tay', subtitle: 'Cầm nắm và chuyển từ tay này sang tay kia', defaultChecked: true },
                { id: 'fm_2', title: 'Nhón ngón tay cái và trỏ nhặt đồ ăn (Pincer grasp)', subtitle: 'Tự nhặt hạt đậu, mẩu bánh nhỏ', defaultChecked: true },
                { id: 'fm_3', title: 'Tự cầm cốc nước có quai uống ngụm nhỏ', subtitle: 'Đang tập luyện uống nước bằng cốc', defaultChecked: false },
            ]
        },
        {
            id: 'communication',
            name: 'Ngôn ngữ & Cảm xúc',
            icon: 'record_voice_over',
            color: 'tertiary',
            items: [
                { id: 'comm_1', title: 'Bập bẹ các âm đôi: ba-ba, ma-ma, măm-măm', subtitle: 'Phát âm rõ ràng khi vui mừng hoặc đòi ăn', defaultChecked: true },
                { id: 'comm_2', title: 'Vẫy tay chào tạm biệt & vỗ tay hoan hô', subtitle: 'Bắt chước cử chỉ của người lớn', defaultChecked: true },
                { id: 'comm_3', title: 'Hiểu và phản xạ khi nghe từ "Không được"', subtitle: 'Biết dừng tay hoặc nhìn ba mẹ', defaultChecked: false },
                { id: 'comm_4', title: 'Nhận biết tên của chính mình khi được gọi', subtitle: 'Quay đầu lại ngay khi nghe gọi tên', defaultChecked: true },
            ]
        }
    ];

    return {
        stageTitle,
        ageRange,
        categories
    };
}

/**
 * Tính toán tiến độ hoàn thành các mốc phát triển
 */
export function calculateMilestoneProgress(categories = [], checkedMap = {}) {
    let totalItems = 0;
    let completedItems = 0;

    categories.forEach(cat => {
        cat.items.forEach(item => {
            totalItems++;
            const isChecked = checkedMap[item.id] !== undefined ? checkedMap[item.id] : item.defaultChecked;
            if (isChecked) completedItems++;
        });
    });

    const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    return {
        totalItems,
        completedItems,
        percent,
        summaryText: `Đã đạt ${completedItems} / ${totalItems} mốc phát triển theo chuẩn WHO`
    };
}
