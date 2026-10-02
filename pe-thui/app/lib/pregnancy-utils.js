export function calculatePregnancyWeeks(eddString) {
    const edd = new Date(eddString);
    const today = new Date();
    
    // Conception is typically 280 days (40 weeks) before EDD
    const conceptionDate = new Date(edd.getTime() - 280 * 24 * 60 * 60 * 1000);
    
    const diffTime = Math.abs(today - conceptionDate);
    const totalDaysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // If today is past EDD, just cap it at 40 weeks or handle post-term
    const cappedDays = Math.min(totalDaysPassed, 294); // cap at 42 weeks
    
    const weeks = Math.floor(cappedDays / 7);
    const days = cappedDays % 7;
    
    const daysRemaining = Math.max(0, 280 - totalDaysPassed);
    
    let trimester = 1;
    if (weeks >= 13 && weeks <= 26) trimester = 2;
    if (weeks >= 27) trimester = 3;

    const fruitMap = getFruitMap();
    const w = Math.min(Math.max(weeks, 0), 42);
    const fruit = fruitMap[w] || fruitMap[0];

    return {
        weeks,
        days,
        totalDaysPassed,
        daysRemaining,
        trimester,
        fruitName: fruit.name,
        fruitEmoji: fruit.emoji,
        estimatedWeight: fruit.weight,
        estimatedLength: fruit.length
    };
}

export function getFruitMap() {
    return {
        0: { name: 'Mầm sống (Chuẩn bị)', emoji: '✨', weight: 0, length: 0 },
        1: { name: 'Tế bào trứng', emoji: '🥚', weight: 0, length: 0.01 },
        2: { name: 'Hợp tử thụ tinh', emoji: '🧬', weight: 0.01, length: 0.02 },
        3: { name: 'Hạt mầm (Phôi nang)', emoji: '🌱', weight: 0.05, length: 0.1 },
        4: { name: 'Hạt tiêu', emoji: '🌑', weight: 0.1, length: 0.2 },
        5: { name: 'Hạt vừng', emoji: '🌱', weight: 0.1, length: 0.3 },
        6: { name: 'Đậu lăng', emoji: '🥜', weight: 0.2, length: 0.6 },
        7: { name: 'Quả việt quất', emoji: '🫐', weight: 0.5, length: 1.3 },
        8: { name: 'Quả mâm xôi', emoji: '🍇', weight: 1, length: 1.6 },
        9: { name: 'Quả nho', emoji: '🍇', weight: 2, length: 2.3 },
        10: { name: 'Quả quất', emoji: '🍊', weight: 4, length: 3.1 },
        11: { name: 'Quả sung', emoji: '🌰', weight: 7, length: 4.1 },
        12: { name: 'Quả chanh ta', emoji: '🍋', weight: 14, length: 5.4 },
        13: { name: 'Quả chanh tây', emoji: '🍋', weight: 23, length: 7.4 },
        14: { name: 'Quả đào', emoji: '🍑', weight: 43, length: 8.7 },
        15: { name: 'Quả táo', emoji: '🍎', weight: 70, length: 10.1 },
        16: { name: 'Quả bơ', emoji: '🥑', weight: 100, length: 11.6 },
        17: { name: 'Củ hành tây', emoji: '🧅', weight: 140, length: 13.0 },
        18: { name: 'Quả ớt chuông', emoji: '🫑', weight: 190, length: 14.2 },
        19: { name: 'Quả cà chua heirloom', emoji: '🍅', weight: 240, length: 15.3 },
        20: { name: 'Quả chuối', emoji: '🍌', weight: 300, length: 16.4 },
        21: { name: 'Củ cà rốt', emoji: '🥕', weight: 360, length: 26.7 },
        22: { name: 'Quả đu đủ nhỏ', emoji: '🍈', weight: 430, length: 27.8 },
        23: { name: 'Quả xoài lớn', emoji: '🥭', weight: 501, length: 28.9 },
        24: { name: 'Bắp ngô', emoji: '🌽', weight: 600, length: 30.0 },
        25: { name: 'Củ cải', emoji: '🍠', weight: 660, length: 34.6 },
        26: { name: 'Cây hành lá', emoji: '🥬', weight: 760, length: 35.6 },
        27: { name: 'Cái súp lơ', emoji: '🥦', weight: 875, length: 36.6 },
        28: { name: 'Quả cà tím lớn', emoji: '🍆', weight: 1005, length: 37.6 },
        29: { name: 'Bí hồ lô', emoji: '🥒', weight: 1153, length: 38.6 },
        30: { name: 'Bắp cải lớn', emoji: '🥬', weight: 1319, length: 39.9 },
        31: { name: 'Quả dừa', emoji: '🥥', weight: 1502, length: 41.1 },
        32: { name: 'Củ sắn', emoji: '🍠', weight: 1702, length: 42.4 },
        33: { name: 'Quả khóm (Dứa)', emoji: '🍍', weight: 1918, length: 43.7 },
        34: { name: 'Quả dưa vàng', emoji: '🍈', weight: 2146, length: 45.0 },
        35: { name: 'Quả dưa lê', emoji: '🍈', weight: 2383, length: 46.2 },
        36: { name: 'Quả đu đủ lớn', emoji: '🍈', weight: 2622, length: 47.4 },
        37: { name: 'Cây cải thảo', emoji: '🥬', weight: 2859, length: 48.6 },
        38: { name: 'Quả dưa hấu nhỏ', emoji: '🍉', weight: 3083, length: 49.8 },
        39: { name: 'Quả bí ngô nhỏ', emoji: '🎃', weight: 3288, length: 50.7 },
        40: { name: 'Quả dưa hấu', emoji: '🍉', weight: 3462, length: 51.2 },
        41: { name: 'Quả mít nhỏ', emoji: '🍈', weight: 3597, length: 51.7 },
        42: { name: 'Quả mít', emoji: '🍈', weight: 3685, length: 51.5 },
    };
}

export function getPregnancyWeekStats(weekNumber) {
    const w = Math.min(Math.max(weekNumber, 0), 42);
    const fruitMap = getFruitMap();
    return fruitMap[w] || fruitMap[0];
}

export function getUpcomingCheckup(w) {
    if (w <= 8) return { title: 'Khám thai lần đầu', type: 'Siêu âm 2D xác định vị trí & tim thai', weeks: '5 - 8 tuần', badge: 'Quan trọng' };
    if (w <= 13) return { title: 'Đo độ mờ da gáy & Double Test', type: 'Siêu âm 4D sàng lọc dị tật bẩm sinh', weeks: '11 - 13 tuần', badge: 'Rất quan trọng' };
    if (w <= 20) return { title: 'Khám thai định kỳ & Triple Test', type: 'Siêu âm kiểm tra phát triển & NIPT', weeks: '15 - 20 tuần', badge: 'Định kỳ' };
    if (w <= 24) return { title: 'Khảo sát hình thái thai nhi', type: 'Siêu âm 4D chi tiết cơ quan (tim, não, tay chân)', weeks: '20 - 24 tuần', badge: 'Rất quan trọng' };
    if (w <= 28) return { title: 'Tầm soát tiểu đường thai kỳ', type: 'Dung nạp đường huyết & Tiêm uốn ván mũi 1', weeks: '24 - 28 tuần', badge: 'Quan trọng' };
    if (w <= 32) return { title: 'Đánh giá sự phát triển của thai', type: 'Kiểm tra ngôi thai, lượng ối & Tiêm uốn ván mũi 2', weeks: '28 - 32 tuần', badge: 'Quan trọng' };
    if (w <= 36) return { title: 'Theo dõi ngôi thai & tăng trưởng', type: 'Siêu âm Doppler màu mạch máu rốn/não', weeks: '32 - 36 tuần', badge: 'Định kỳ' };
    return { title: 'Khám thai hàng tuần trước sinh', type: 'Đo Non-Stress Test (NST) & chuẩn bị nhập viện', weeks: '37 - 40 tuần', badge: 'Gần sinh' };
}

export function getWeeklyAdvice(w) {
    if (w < 13) {
        return {
            diet: 'Bổ sung Axit Folic (400mcg/ngày), uống đủ 2L nước, chia nhỏ 5-6 bữa để giảm ốm nghén.',
            warning: 'Cần đến viện ngay nếu xuất hiện ra máu âm đạo, đau bụng dưới dữ dội hoặc nghén kiệt sức.'
        };
    }
    if (w < 27) {
        return {
            diet: 'Bổ sung Canxi (1000-1200mg/ngày) và Sắt. Ăn thêm trứng, sữa, cá hồi và rau lá xanh đậm.',
            warning: 'Cảnh báo đau đầu dữ dội, hoa mắt, phù tay chân đột ngột (dấu hiệu tiền sản giật).'
        };
    }
    return {
        diet: 'Tăng cường thực phẩm giàu DHA/Omega-3 cho não bé, đạm nạc. Giảm ăn mặn để hạn chế tích nước, phù chân.',
        warning: 'Bé cử động ít hơn 10 lần trong 2 giờ, hoặc có rỉ ối, đau bụng co thắt từng cơn đều đặn cần vào viện ngay.'
    };
}

export const INITIAL_HOSPITAL_BAG_ITEMS = [
    // Cho bé
    { id: 'b1', name: 'Quần áo sơ sinh & bao tay chân (3-5 bộ)', category: 'baby', checked: true },
    { id: 'b2', name: 'Tã dán sơ sinh (size NB, 1 bịch)', category: 'baby', checked: true },
    { id: 'b3', name: 'Khăn xô tắm & khăn quấn ủ ấm bé', category: 'baby', checked: true },
    { id: 'b4', name: 'Nước muối sinh lý 0.9% & gạc rơ lưỡi', category: 'baby', checked: false },
    { id: 'b5', name: 'Sữa non / Sữa công thức số 1 & bình sữa nhỏ', category: 'baby', checked: false },
    { id: 'b6', name: 'Gối ôm chặn sơ sinh & nón che thóp', category: 'baby', checked: true },

    // Cho mẹ
    { id: 'm1', name: 'Quần áo mẹ mặc ngày xuất viện (rộng, cài cúc)', category: 'mom', checked: true },
    { id: 'm2', name: 'Băng vệ sinh mama & quần lót dùng 1 lần', category: 'mom', checked: true },
    { id: 'm3', name: 'Áo ngực cho con bú & miếng lót thấm sữa', category: 'mom', checked: false },
    { id: 'm4', name: 'Máy hút sữa & túi trữ sữa non', category: 'mom', checked: false },
    { id: 'm5', name: 'Vớ chân giữ ấm & tinh dầu tràm', category: 'mom', checked: true },
    { id: 'm6', name: 'Bình nước giữ nhiệt & ly có ống hút', category: 'mom', checked: true },

    // Giấy tờ
    { id: 'd1', name: 'Căn cước công dân (CCCD) gắn chip của mẹ', category: 'docs', checked: true },
    { id: 'd2', name: 'Thẻ BHYT (hoặc app VssID trên điện thoại)', category: 'docs', checked: true },
    { id: 'd3', name: 'Hồ sơ khám thai, kết quả siêu âm, xét nghiệm', category: 'docs', checked: true },
    { id: 'd4', name: 'Tiền mặt đặt cọc viện phí & thẻ ngân hàng', category: 'docs', checked: true },
];

export function calculateBagProgress(items = []) {
    const totalCount = items.length;
    const checkedCount = items.filter(i => i && i.checked).length;
    const percent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
    return {
        totalCount,
        checkedCount,
        percent,
        isComplete: totalCount > 0 && checkedCount === totalCount
    };
}

export function filterBagItems(items = [], category = 'all') {
    if (!Array.isArray(items)) return [];
    if (!category || category === 'all') return items;
    return items.filter(it => it && it.category === category);
}

export function isLatePregnancy(weeks, daysRemaining) {
    if (typeof weeks === 'number' && weeks >= 37) return true;
    if (typeof daysRemaining === 'number' && daysRemaining <= 21 && daysRemaining >= 0) return true;
    return false;
}

export function getLaborSignsGuide() {
    return [
        {
            category: 'early',
            categoryName: 'Dấu hiệu sớm (Sắp chuyển dạ)',
            badge: 'Theo dõi tại nhà',
            badgeColor: 'bg-[#006972]/10 text-[#006972] border-[#006972]/20',
            description: 'Có thể xuất hiện vài ngày hoặc vài tuần trước khi sinh. Cơ thể mẹ đang chuẩn bị sẵn sàng.',
            items: [
                {
                    id: 'drop',
                    icon: 'arrow_downward',
                    title: 'Sa bụng bầu (Bụng tụt xuống)',
                    summary: 'Đầu bé di chuyển sâu vào tiểu khung để chuẩn bị chào đời.',
                    detail: 'Mẹ sẽ cảm thấy dễ thở hơn, bớt tức ngực và dạ dày, nhưng lại đi tiểu thường xuyên hơn và cảm thấy nặng nề, tức nhẹ ở vùng chậu xương mu.'
                },
                {
                    id: 'plug',
                    icon: 'water_drop',
                    title: 'Bong nút nhầy cổ tử cung (Nhớt hồng)',
                    summary: 'Nút nhầy bảo vệ cổ tử cung bong ra khi cổ tử cung bắt đầu giãn mở.',
                    detail: 'Chất nhầy đặc quánh màu trắng đục, hồng nhạt hoặc nâu sẫm tiết ra ở âm đạo. Đây là tín hiệu chuyển dạ có thể bắt đầu trong vài giờ hoặc vài ngày tới.'
                },
                {
                    id: 'backache',
                    icon: 'accessibility_new',
                    title: 'Đau lưng dưới âm ỉ & Chuột rút',
                    summary: 'Các dây chằng và khớp xương chậu giãn nở tối đa.',
                    detail: 'Cảm giác đau mỏi nhức nhối dọc thắt lưng lan ra vùng hông và đùi dưới, tương tự cảm giác đau bụng kinh nhưng nặng hơn.'
                },
                {
                    id: 'braxton',
                    icon: 'speed',
                    title: 'Cơn gò Braxton Hicks dày hơn',
                    summary: 'Cơn gò giả tập dượt cho tử cung.',
                    detail: 'Bụng căng cứng thành từng đợt nhưng chưa có chu kỳ đều đặn, không tăng dần về cường độ và thường dịu bớt khi mẹ đổi tư thế nằm nghiêng hoặc nghỉ ngơi.'
                }
            ]
        },
        {
            category: 'active',
            categoryName: 'Chuyển dạ thực sự (CẦN ĐẾN VIỆN NGAY)',
            badge: 'Đến bệnh viện',
            badgeColor: 'bg-[#861949]/10 text-[#861949] border-[#861949]/20',
            description: 'Quá trình chuyển dạ đã chính thức bắt đầu. Hãy mang giỏ đồ và đến viện đã đăng ký sinh.',
            items: [
                {
                    id: 'contractions_511',
                    icon: 'timer',
                    title: 'Cơn gò tử cung dồn dập (Quy tắc 5-1-1)',
                    summary: '5 phút/cơn – Kéo dài 1 phút – Liên tục trong 1 giờ.',
                    detail: 'Cơn gò diễn ra đều đặn, nhịp nhàng. Bụng gò cứng như đá, đau từ thắt lưng lan vòng ra phía trước bụng. Cường độ đau tăng dần và KHÔNG giảm dù mẹ nằm nghỉ hay đi lại.'
                },
                {
                    id: 'water_break',
                    icon: 'waves',
                    title: 'VỠ ỐI (Rỉ ối hoặc ối vỡ ào ạt)',
                    summary: 'Nước ối chảy ra từ âm đạo. ĐẾN VIỆN NGAY LẬP TỨC!',
                    detail: 'Dịch lỏng trong suốt hoặc hơi đục chảy liên tục không kiểm soát được bằng cơ thắt bàng quang. Dù có cơn đau bụng hay chưa, mẹ cần đến viện ngay để tránh nguy cơ nhiễm trùng ối và sa dây rốn.'
                },
                {
                    id: 'bloody_show',
                    icon: 'bloodtype',
                    title: 'Ra máu báo chuyển dạ',
                    summary: 'Cổ tử cung mở rộng làm vỡ các mao mạch nhỏ.',
                    detail: 'Chảy dịch nhầy kèm máu tươi hoặc hồng đậm báo hiệu cổ tử cung đang mở tích cực để chuẩn bị đưa bé ra ngoài.'
                }
            ]
        },
        {
            category: 'emergency',
            categoryName: 'Dấu hiệu nguy hiểm (CẤP CỨU KHẨN CẤP)',
            badge: 'Cấp cứu 115',
            badgeColor: 'bg-red-500/10 text-red-700 border-red-500/20',
            description: 'Đến ngay cơ sở y tế gần nhất hoặc gọi cấp cứu nếu gặp bất kỳ dấu hiệu nào dưới đây:',
            items: [
                {
                    id: 'heavy_bleeding',
                    icon: 'warning',
                    title: 'Chảy máu âm đạo đỏ tươi ồ ạt',
                    summary: 'Nguy cơ nhau bong non hoặc nhau tiền đạo đe dọa tính mạng.',
                    detail: 'Máu đỏ tươi ra nhiều ướt đẫm băng vệ sinh kèm theo bụng cứng đờ liên tục.'
                },
                {
                    id: 'green_amniotic',
                    icon: 'report_problem',
                    title: 'Nước ối có màu xanh rêu hoặc vàng sậm đục',
                    summary: 'Dấu hiệu bé đã thải phân su vào buồng ối do ngạt/suy thai.',
                    detail: 'Cần can thiệp y khoa khẩn cấp để hút phân su, tránh bé hít dịch ối vào phổi khi cất tiếng khóc.'
                },
                {
                    id: 'low_fetal_movement',
                    icon: 'pets',
                    title: 'Thai máy giảm đột ngột hoặc ngưng cử động',
                    summary: 'Bé cử động ít hơn 10 lần trong 2 giờ sau khi mẹ đã uống nước ngọt.',
                    detail: 'Cần đo tim thai và Doppler mạch máu ngay để đánh giá sức khỏe thai nhi.'
                },
                {
                    id: 'preeclampsia',
                    icon: 'medical_information',
                    title: 'Đau đầu dữ dội, hoa mắt, nhìn mờ, phù nề mặt',
                    summary: 'Dấu hiệu tiền sản giật nặng đe dọa tính mạng mẹ và bé.',
                    detail: 'Huyết áp tăng cao đột ngột, phù mặt và tay, đau vùng thượng vị dưới xương ức.'
                }
            ]
        }
    ];
}

export function evaluateKickCount(count = 0, target = 10) {
    const safeCount = Math.max(0, count || 0);
    const remaining = Math.max(0, target - safeCount);
    const isTargetMet = safeCount >= target;
    return {
        count: safeCount,
        target,
        remaining,
        isTargetMet
    };
}
