import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_WEEKS_ADVICE, THAI_GIAO_GUIDES, EASY_METHOD_GUIDES } from '../app/lib/data/pregnancy-guides.js';
import { getWeeklyAdvice, calculatePregnancyWeeks } from '../app/lib/pregnancy-utils.js';

test('1. ALL_WEEKS_ADVICE covers weeks 0 to 42 with comprehensive medical & parenting tips', () => {
    assert.equal(Object.keys(ALL_WEEKS_ADVICE).length, 43, 'Đầy đủ 43 tuần từ 0 đến 42');

    for (let w = 0; w <= 42; w++) {
        const advice = ALL_WEEKS_ADVICE[w];
        assert.ok(advice, `Tuần ${w} phải tồn tại`);
        assert.equal(advice.week, w, `advice.week phải khớp ${w}`);
        assert.ok(advice.title && advice.title.length > 5, `Tuần ${w} có tiêu đề rõ ràng`);
        assert.ok(advice.babyDevelopment && advice.babyDevelopment.length > 10, `Tuần ${w} có thông tin phát triển bé`);
        assert.ok(advice.diet && advice.diet.length > 10, `Tuần ${w} có hướng dẫn dinh dưỡng`);
        assert.ok(advice.warning && advice.warning.length > 10, `Tuần ${w} có cảnh báo sức khỏe y tế`);
        assert.ok(advice.thaiGiaoTip && advice.thaiGiaoTip.length > 10, `Tuần ${w} có lời khuyên thai giáo`);
    }
});

test('2. THAI_GIAO_GUIDES covers core prenatal education sensory methods', () => {
    assert.ok(Array.isArray(THAI_GIAO_GUIDES) && THAI_GIAO_GUIDES.length >= 5, 'Có ít nhất 5 cẩm nang thai giáo');

    const guideIds = THAI_GIAO_GUIDES.map(g => g.id);
    assert.ok(guideIds.includes('thinh-giac'), 'Có thai giáo thính giác');
    assert.ok(guideIds.includes('xuc-giac'), 'Có thai giáo xúc giác');
    assert.ok(guideIds.includes('thi-giac'), 'Có thai giáo thị giác');
    assert.ok(guideIds.includes('cam-xuc-van-dong'), 'Có thai giáo cảm xúc vận động');
    assert.ok(guideIds.includes('daily-routine'), 'Có lịch thực hành thai giáo mẫu');

    THAI_GIAO_GUIDES.forEach(g => {
        assert.ok(g.title, 'Mỗi cẩm nang có tiêu đề');
        assert.ok(g.summary, 'Mỗi cẩm nang có tóm tắt');
        assert.ok(Array.isArray(g.content) && g.content.length > 0, 'Mỗi cẩm nang có các phần chi tiết');
    });
});

test('3. EASY_METHOD_GUIDES covers EASY routine, age cycles, tools and sleep routine', () => {
    assert.ok(Array.isArray(EASY_METHOD_GUIDES) && EASY_METHOD_GUIDES.length >= 5, 'Có ít nhất 5 chuyên đề EASY');

    const easyIds = EASY_METHOD_GUIDES.map(g => g.id);
    assert.ok(easyIds.includes('easy-core'), 'Có phần bản chất EASY (Ăn - Vận động - Ngủ - Mẹ nghỉ)');
    assert.ok(easyIds.includes('easy-cycles'), 'Có các chu kỳ EASY 3, 3.5, 4, 2-3-4');
    assert.ok(easyIds.includes('bo-tu-easy'), 'Có bộ tứ dụng cụ quấn chũn, ti giả, white noise, phòng tối');
    assert.ok(easyIds.includes('trinh-tu-4s'), 'Có trình tự ngủ 4S/5S');
    assert.ok(easyIds.includes('wonder-weeks'), 'Có bí kíp Wonder Weeks và xử lý catnap');

    // Kiểm tra chi tiết chu kỳ EASY
    const cycleGuide = EASY_METHOD_GUIDES.find(g => g.id === 'easy-cycles');
    const cycleText = JSON.stringify(cycleGuide.content);
    assert.ok(cycleText.includes('EASY 3'), 'Chứa chu kỳ EASY 3');
    assert.ok(cycleText.includes('EASY 4'), 'Chứa chu kỳ EASY 4');
});

test('4. getWeeklyAdvice seamlessly provides weekly development and Thai Giao tips', () => {
    const advice29 = getWeeklyAdvice(29);
    assert.equal(advice29.week, 29);
    assert.ok(advice29.title.includes('Tuần 29'));
    assert.ok(advice29.thaiGiaoTip.length > 0);
    assert.ok(advice29.babyDevelopment.length > 0);

    // Clamping checks
    const adviceUnder = getWeeklyAdvice(-5);
    assert.equal(adviceUnder.week, 0);

    const adviceOver = getWeeklyAdvice(99);
    assert.equal(adviceOver.week, 42);
});

test('5. Gestational age calculation clarifies week + days vs total pregnancy days', () => {
    // Giả định ngày dự sinh cách hôm nay 77 ngày (280 - 77 = 203 ngày, tức tuần 29 ngày 0)
    const today = new Date();
    const edd = new Date(today);
    edd.setDate(today.getDate() + 77); // 77 ngày nữa sinh => đã qua 203 ngày => 29 tuần 0 ngày
    const stats = calculatePregnancyWeeks(edd.toISOString().slice(0, 10));

    assert.equal(stats.weeks, 29);
    assert.equal(stats.days, 0);
    assert.equal(stats.totalDaysPassed, 203);

    // Thêm 3 ngày (còn 74 ngày nữa sinh => đã qua 206 ngày => 29 tuần 3 ngày)
    const edd2 = new Date(today);
    edd2.setDate(today.getDate() + 74);
    const stats2 = calculatePregnancyWeeks(edd2.toISOString().slice(0, 10));
    assert.equal(stats2.weeks, 29);
    assert.equal(stats2.days, 3);
    assert.equal(stats2.totalDaysPassed, 206);
});
