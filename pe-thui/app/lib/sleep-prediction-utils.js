/**
 * Sleep Prediction & Wake Window Utilities (SweetSpot® Engine)
 * Khoa học giấc ngủ trẻ em theo tiêu chuẩn Nhi khoa quốc tế (AAP / Huckleberry / NSF)
 */

export const WAKE_WINDOWS_BY_AGE = [
    {
        minMonths: 0,
        maxMonths: 1, // 0 - 4 tuần (Sơ sinh)
        minMinutes: 35,
        maxMinutes: 60,
        sweetSpotMinutes: 45,
        napsPerDay: '4 - 5 cữ',
        label: 'Sơ sinh (0 - 1 tháng)',
        tip: 'Bé sơ sinh mau mệt. Sau khi ăn no và thay tã khoảng 45 phút, bé cần được dỗ ngủ ngay.'
    },
    {
        minMonths: 1,
        maxMonths: 2, // 1 - 2 tháng (4 - 8 tuần)
        minMinutes: 60,
        maxMinutes: 90,
        sweetSpotMinutes: 75,
        napsPerDay: '4 - 5 cữ',
        label: '1 - 2 tháng',
        tip: 'Thời gian thức từ 60 - 75 phút. Mẹ chú ý tín hiệu ngáp, dụi mắt, nhìn chằm chằm vào khoảng không.'
    },
    {
        minMonths: 2,
        maxMonths: 3, // 2 - 3 tháng
        minMinutes: 75,
        maxMinutes: 100,
        sweetSpotMinutes: 85,
        napsPerDay: '3 - 4 cữ',
        label: '2 - 3 tháng',
        tip: 'Thời gian thức tăng lên khoảng 1h15p - 1h30p. Bắt đầu thiết lập trình tự ngủ: kéo rèm, quấn/nhộng, tiếng ồn trắng.'
    },
    {
        minMonths: 3,
        maxMonths: 4, // 3 - 4 tháng
        minMinutes: 90,
        maxMinutes: 120,
        sweetSpotMinutes: 105,
        napsPerDay: '3 - 4 cữ',
        label: '3 - 4 tháng',
        tip: 'Giai đoạn khủng hoảng giấc ngủ 4 tháng. Bé thức được khoảng 1.5 - 2 tiếng. Cần hỗ trợ tự ngủ đúng nhịp.'
    },
    {
        minMonths: 4,
        maxMonths: 6, // 4 - 6 tháng
        minMinutes: 120,
        maxMinutes: 150,
        sweetSpotMinutes: 135,
        napsPerDay: '3 cữ',
        label: '4 - 6 tháng',
        tip: 'Bé chuyển dần sang lịch 3 cữ ngủ ngày. Thời gian thức khoảng 2 - 2.5 tiếng.'
    },
    {
        minMonths: 6,
        maxMonths: 8, // 6 - 8 tháng
        minMinutes: 150,
        maxMinutes: 180,
        sweetSpotMinutes: 165,
        napsPerDay: '2 - 3 cữ',
        label: '6 - 8 tháng',
        tip: 'Thời gian thức từ 2.5 - 3 tiếng. Bé bắt đầu ăn dặm, giấc ngủ ngày ổn định hơn.'
    },
    {
        minMonths: 8,
        maxMonths: 12, // 8 - 12 tháng
        minMinutes: 180,
        maxMinutes: 240,
        sweetSpotMinutes: 210,
        napsPerDay: '2 cữ',
        label: '8 - 12 tháng',
        tip: 'Lịch chuẩn 2 cữ ngủ (Nap sáng & Nap trưa). Bé thức được khoảng 3 - 3.5 tiếng giữa các cữ.'
    },
    {
        minMonths: 12,
        maxMonths: 18, // 12 - 18 tháng (1 - 1.5 tuổi)
        minMinutes: 210,
        maxMinutes: 280,
        sweetSpotMinutes: 240,
        napsPerDay: '1 - 2 cữ',
        label: '12 - 18 tháng',
        tip: 'Giai đoạn chuyển từ 2 cữ xuống 1 cữ trưa duy nhất. Bé thức được 3.5 - 4.5 tiếng.'
    },
    {
        minMonths: 18,
        maxMonths: 24, // 18 - 24 tháng (1.5 - 2 tuổi)
        minMinutes: 270,
        maxMinutes: 330,
        sweetSpotMinutes: 300,
        napsPerDay: '1 cữ trưa',
        label: '18 - 24 tháng',
        tip: 'Chỉ còn 1 cữ ngủ trưa dài khoảng 1.5 - 2.5 tiếng. Thời gian thức trước khi ngủ đêm kéo dài khoảng 5 tiếng.'
    },
    {
        minMonths: 24,
        maxMonths: 36, // 2 - 3 tuổi
        minMinutes: 300,
        maxMinutes: 390,
        sweetSpotMinutes: 330,
        napsPerDay: '1 cữ trưa',
        label: '2 - 3 tuổi',
        tip: 'Bé thức 5 - 6 tiếng giữa các giấc. Giữ giờ đi ngủ đêm cố định (khoảng 20h30 - 21h30).'
    },
    {
        minMonths: 36,
        maxMonths: 72, // 3 - 6 tuổi
        minMinutes: 360,
        maxMinutes: 480,
        sweetSpotMinutes: 420,
        napsPerDay: '0 - 1 cữ trưa',
        label: 'Trên 3 tuổi',
        tip: 'Một số bé có thể bỏ ngủ trưa hoặc chỉ chợp mắt 30-45 phút. Giấc ngủ đêm kéo dài 10-11 tiếng.'
    }
];

/**
 * Tính tuổi của bé theo tháng (chính xác đến số thập phân)
 */
export function calculateAgeMonths(dob, refDate = new Date()) {
    if (!dob) return 6; // Mặc định 6 tháng nếu chưa có ngày sinh
    const birth = new Date(dob);
    const now = new Date(refDate);
    const diffMs = now.getTime() - birth.getTime();
    if (diffMs <= 0) return 0;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays / 30.4375; // Trung bình 30.4375 ngày/tháng
}

/**
 * Lấy Wake Window chuẩn theo độ tuổi của bé
 */
export function getWakeWindowForAge(ageInMonths) {
    const age = Math.max(0, Number(ageInMonths) || 0);
    const match = WAKE_WINDOWS_BY_AGE.find(w => age >= w.minMonths && age < w.maxMonths);
    if (match) return match;
    // Nếu lớn hơn 72 tháng, lấy mốc cuối
    return WAKE_WINDOWS_BY_AGE[WAKE_WINDOWS_BY_AGE.length - 1];
}

/**
 * Định dạng thời gian theo định dạng giờ:phút Việt Nam (VD: "14:35")
 */
export function formatTimeHM(date) {
    if (!date) return '--:--';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/**
 * Dự đoán tên cữ ngủ tiếp theo dựa trên thời gian
 */
export function getEstimatedNapType(targetTime) {
    const d = new Date(targetTime);
    const h = d.getHours();
    if (h >= 6 && h < 11) return { id: 'nap1', name: 'Cữ ngủ sáng (Nap 1)', icon: '☀️' };
    if (h >= 11 && h < 15) return { id: 'nap2', name: 'Cữ ngủ trưa (Nap 2)', icon: '🌤️' };
    if (h >= 15 && h < 19) return { id: 'nap3', name: 'Cữ ngủ chiều (Nap 3)', icon: '🌇' };
    return { id: 'night', name: 'Giấc ngủ đêm (Bedtime)', icon: '🌙' };
}

/**
 * Thuật toán lõi: SweetSpot® Nap & Bedtime Prediction Engine
 * Phân tích nhật ký giấc ngủ và độ tuổi để tính toán chính xác cữ ngủ tiếp theo
 */
export function calculateNextNapSweetSpot({ dob, sleeps = [], activeSleep = null, now = new Date() }) {
    const currentTime = new Date(now);
    const ageInMonths = calculateAgeMonths(dob, currentTime);
    const wakeWindow = getWakeWindowForAge(ageInMonths);

    // 1. Kiểm tra nếu bé đang trong giấc ngủ (Active sleep)
    const runningSleep = activeSleep || sleeps.find(s => !s.endTime);
    if (runningSleep) {
        const sleepStart = new Date(runningSleep.startTime);
        const elapsedMinutes = Math.max(0, Math.round((currentTime - sleepStart) / 60000));
        const hours = Math.floor(elapsedMinutes / 60);
        const mins = elapsedMinutes % 60;
        const durationText = hours > 0 ? `${hours}h ${mins}p` : `${mins} phút`;

        return {
            isSleeping: true,
            status: 'sleeping',
            badgeText: 'Bé đang ngủ',
            badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            elapsedMinutes,
            durationText,
            sleepStartedAt: sleepStart,
            wakeWindow,
            title: `Bé đang ngủ được ${durationText}`,
            subtitle: `Bắt đầu lúc ${formatTimeHM(sleepStart)}. Khi bé thức dậy, SweetSpot sẽ tự động đếm ngược cữ kế tiếp.`,
            actionHint: 'Nhấn vào nút Thức dậy khi bé tỉnh giấc.'
        };
    }

    // 2. Tìm giấc ngủ gần nhất đã kết thúc để xác định mốc thức dậy
    const completedSleeps = sleeps
        .filter(s => s.endTime || s.startTime)
        .map(s => {
            const end = s.endTime ? new Date(s.endTime) : new Date(s.startTime);
            return { ...s, parsedEnd: end };
        })
        .sort((a, b) => b.parsedEnd.getTime() - a.parsedEnd.getTime());

    const lastSleep = completedSleeps[0] || null;

    // Trường hợp chưa có bản ghi giấc ngủ nào
    if (!lastSleep) {
        // Ước lượng SweetSpot sau thời điểm hiện tại khoảng 1 wakeWindow trung bình
        const estimatedSweetSpot = new Date(currentTime.getTime() + wakeWindow.sweetSpotMinutes * 60000);
        const napType = getEstimatedNapType(estimatedSweetSpot);

        return {
            isSleeping: false,
            hasData: false,
            status: 'no_data',
            badgeText: 'Chưa có giờ thức',
            badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
            wakeWindow,
            title: `Thời gian thức khuyến nghị: ${wakeWindow.sweetSpotMinutes} phút`,
            subtitle: `Độ tuổi ${wakeWindow.label} nên thức tối đa ${wakeWindow.minMinutes} - ${wakeWindow.maxMinutes} phút giữa các cữ ngủ.`,
            estimatedSweetSpot,
            napType,
            actionHint: 'Hãy bấm "Ghi nhận Ngủ" hoặc đánh dấu cữ thức dậy gần nhất để kích hoạt SweetSpot.'
        };
    }

    // 3. Đã có mốc thức dậy: Tính toán chính xác thời gian thức và SweetSpot
    const lastWakeTime = lastSleep.parsedEnd;
    const awakeMinutes = Math.max(0, Math.round((currentTime - lastWakeTime) / 60000));
    const awakeHours = Math.floor(awakeMinutes / 60);
    const awakeMins = awakeMinutes % 60;
    const awakeText = awakeHours > 0 ? `${awakeHours}h ${awakeMins}p` : `${awakeMins} phút`;

    // Thời điểm vào giấc lý tưởng (SweetSpot)
    const sweetSpotTime = new Date(lastWakeTime.getTime() + wakeWindow.sweetSpotMinutes * 60000);
    
    // Thời điểm bắt đầu chuẩn bị (Wind-down: trước SweetSpot 15 phút)
    const windDownTime = new Date(sweetSpotTime.getTime() - 15 * 60000);

    // Thời gian còn lại tính đến SweetSpot (phút)
    const minutesRemaining = Math.round((sweetSpotTime - currentTime) / 60000);

    const napType = getEstimatedNapType(sweetSpotTime);

    // 4. Phân loại trạng thái (Status classification)
    let status = 'fresh';
    let badgeText = 'Đang tỉnh táo';
    let badgeColor = 'bg-teal-50 text-teal-700 border-teal-200';
    let guidance = '';
    let progressPercent = 0; // 0% đến 100% trong khoảng wakeWindow

    progressPercent = Math.min(100, Math.max(0, Math.round((awakeMinutes / wakeWindow.sweetSpotMinutes) * 100)));

    if (minutesRemaining > 30) {
        status = 'fresh';
        badgeText = 'Đang tỉnh táo';
        badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        guidance = 'Bé đang rất tỉnh táo và tràn đầy năng lượng. Đây là thời điểm vàng để cho bé bú no, chơi đùa hoặc tập tummy time.';
    } else if (minutesRemaining > 15) {
        status = 'approaching';
        badgeText = 'Sắp đến giờ ngủ';
        badgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
        guidance = 'Còn khoảng 15-30 phút nữa. Ba mẹ nên giảm dần ánh sáng, tránh các trò chơi quá hưng phấn để bé bình tĩnh lại.';
    } else if (minutesRemaining > 0) {
        status = 'wind_down';
        badgeText = 'Chuẩn bị vào giấc';
        badgeColor = 'bg-amber-50 text-amber-700 border-amber-300';
        guidance = 'Cửa sổ vàng vào giấc! Hãy kéo rèm tối, bật tiếng ồn trắng, quấn nhộng/túi ngủ và vỗ về để bé chìm vào giấc ngủ đúng lúc.';
    } else if (minutesRemaining >= -15) {
        status = 'sweet_spot';
        badgeText = 'Giờ ngủ lý tưởng!';
        badgeColor = 'bg-rose-100 text-[#861949] border-rose-300 animate-pulse';
        guidance = 'Chính là lúc này! Đặt bé xuống giường hoặc dỗ bé ngủ ngay để không bỏ lỡ cơn buồn ngủ tự nhiên.';
    } else {
        status = 'overtired';
        badgeText = 'Cảnh báo: Quá giờ thức';
        badgeColor = 'bg-red-100 text-red-700 border-red-300';
        guidance = `Bé đã thức quá SweetSpot ${Math.abs(minutesRemaining)} phút! Bé có thể bắt đầu gắt ngủ, khóc ngặt. Cần bế ôm sát ngực, làm tối phòng và hỗ trợ bé ngủ khẩn cấp.`;
    }

    return {
        isSleeping: false,
        hasData: true,
        status,
        badgeText,
        badgeColor,
        guidance,
        wakeWindow,
        awakeMinutes,
        awakeText,
        lastWakeTime,
        sweetSpotTime,
        windDownTime,
        minutesRemaining,
        progressPercent,
        napType,
        sweetSpotFormatted: formatTimeHM(sweetSpotTime),
        windDownFormatted: formatTimeHM(windDownTime),
        lastWakeFormatted: formatTimeHM(lastWakeTime)
    };
}
