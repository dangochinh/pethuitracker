import test from 'node:test';
import assert from 'node:assert/strict';
import { 
    calculatePregnancyWeeks, 
    getUpcomingCheckup, 
    getWeeklyAdvice,
    isLatePregnancy,
    calculateGestationalAgeAtDate,
    getLaborSignsGuide
} from '../app/lib/pregnancy-utils.js';

test('Phase 7: calculatePregnancyWeeks edge cases & trimesters', () => {
    // 20 tuần nữa sinh => hiện tại khoảng tuần 20
    const today = new Date();
    const edd20Weeks = new Date(today);
    edd20Weeks.setDate(edd20Weeks.getDate() + 20 * 7);

    const stats20 = calculatePregnancyWeeks(edd20Weeks.toISOString().slice(0, 10));
    assert.equal(stats20.weeks, 20, 'Tính đúng tuần thai 20');
    assert.ok(stats20.trimester === 2, 'Tuần 20 thuộc tam cá nguyệt 2');

    // 32 tuần nữa sinh => hiện tại khoảng tuần 8 (tam cá nguyệt 1)
    const edd8Weeks = new Date(today);
    edd8Weeks.setDate(edd8Weeks.getDate() + 32 * 7);
    const stats8 = calculatePregnancyWeeks(edd8Weeks.toISOString().slice(0, 10));
    assert.equal(stats8.weeks, 8, 'Tính đúng tuần thai 8');
    assert.ok(stats8.trimester === 1, 'Tuần 8 thuộc tam cá nguyệt 1');

    // 4 tuần nữa sinh => hiện tại khoảng tuần 36 (tam cá nguyệt 3)
    const edd36Weeks = new Date(today);
    edd36Weeks.setDate(edd36Weeks.getDate() + 4 * 7);
    const stats36 = calculatePregnancyWeeks(edd36Weeks.toISOString().slice(0, 10));
    assert.equal(stats36.weeks, 36, 'Tính đúng tuần thai 36');
    assert.ok(stats36.trimester === 3, 'Tuần 36 thuộc tam cá nguyệt 3');
});

test('Phase 7: getUpcomingCheckup accurately returns major medical milestones', () => {
    // Tuần 12: Đo độ mờ da gáy
    const checkup12 = getUpcomingCheckup(12);
    assert.ok(checkup12.title.includes('độ mờ da gáy') || checkup12.weeks.includes('11 - 13'), 'Mốc tuần 12 sàng lọc độ mờ da gáy');

    // Tuần 22: Hình thái 4D
    const checkup22 = getUpcomingCheckup(22);
    assert.ok(checkup22.title.includes('hình thái') || checkup22.weeks.includes('20 - 24'), 'Mốc tuần 22 siêu âm hình thái 4D');

    // Tuần 26: Tiểu đường thai kỳ
    const checkup26 = getUpcomingCheckup(26);
    assert.ok(checkup26.title.includes('tiểu đường') || checkup26.weeks.includes('24 - 28'), 'Mốc tuần 26 tầm soát tiểu đường');

    // Tuần 39: Theo dõi trước sinh
    const checkup39 = getUpcomingCheckup(39);
    assert.ok(checkup39.weeks.includes('38') || checkup39.weeks.includes('40'), 'Mốc cuối tuần 38-40');
});

test('Phase 7: Maternal weight gain calculation', () => {
    const records = [
        { weight: 50.0, date: '2026-01-01' },
        { weight: 52.5, date: '2026-03-01' },
        { weight: 56.2, date: '2026-05-01' }
    ];

    const initialWeight = records[0].weight;
    const currentWeight = records[records.length - 1].weight;
    const gained = currentWeight - initialWeight;

    assert.equal(Number(gained.toFixed(1)), 6.2, 'Mẹ đã tăng chính xác 6.2 kg');
    assert.ok(gained > 0, 'Cân nặng mẹ tăng bình thường trong thai kỳ');
});

test('Phase 7: Weekly dietary & medical warning advice', () => {
    // Tam cá nguyệt 1: Axit folic
    const adviceEarly = getWeeklyAdvice(8);
    assert.ok(adviceEarly.diet.toLowerCase().includes('folic'), 'Tam cá nguyệt 1 khuyên dùng Axit Folic');

    // Tam cá nguyệt 2: Sắt & Canxi
    const adviceMid = getWeeklyAdvice(20);
    assert.ok(adviceMid.diet.toLowerCase().includes('canxi') || adviceMid.diet.toLowerCase().includes('sắt'), 'Tam cá nguyệt 2 khuyên dùng Canxi / Sắt');

    // Tam cá nguyệt 3: DHA / Omega-3
    const adviceLate = getWeeklyAdvice(32);
    assert.ok(adviceLate.diet.toLowerCase().includes('dha') || adviceLate.diet.toLowerCase().includes('omega'), 'Tam cá nguyệt 3 khuyên dùng DHA/Omega');
});

test('Phase 7+: isLatePregnancy calculation & popup triggers', () => {
    // Chưa đến tuần cuối (> 21 ngày và < 37 tuần)
    assert.equal(isLatePregnancy(32, 56), false, 'Tuần 32 còn 56 ngày => Không phải tuần cuối');
    assert.equal(isLatePregnancy(36, 28), false, 'Tuần 36 còn 28 ngày => Chưa đạt ngưỡng 21 ngày');

    // Đạt mốc tuần 37 trở lên (thai đủ tháng)
    assert.equal(isLatePregnancy(37, 21), true, 'Tuần 37 => Tuần cuối thai kỳ');
    assert.equal(isLatePregnancy(38, 14), true, 'Tuần 38 => Tuần cuối thai kỳ');
    assert.equal(isLatePregnancy(40, 0), true, 'Tuần 40 (ngày dự sinh) => Tuần cuối thai kỳ');
    assert.equal(isLatePregnancy(41, 0), true, 'Tuần 41 (quá ngày dự sinh) => Tuần cuối thai kỳ');

    // Đạt mốc còn <= 21 ngày (3 tuần cuối) kể cả khi tuần tính toán là 35-36
    assert.equal(isLatePregnancy(36, 20), true, 'Còn 20 ngày => Kích hoạt cảnh báo tuần cuối');
    assert.equal(isLatePregnancy(36, 7), true, 'Còn 7 ngày => Kích hoạt cảnh báo tuần cuối');
});

test('Phase 7+: getLaborSignsGuide medical correctness', () => {
    const guide = getLaborSignsGuide();
    assert.ok(Array.isArray(guide) && guide.length === 3, 'Cẩm nang có đủ 3 cấp độ: sớm, chuyển dạ thật, và cấp cứu');

    const early = guide.find(g => g.category === 'early');
    const active = guide.find(g => g.category === 'active');
    const emergency = guide.find(g => g.category === 'emergency');

    assert.ok(early && active && emergency, 'Đủ 3 danh mục early, active, emergency');

    // Kiểm tra quy tắc 5-1-1 và vỡ ối trong active
    const has511 = active.items.some(item => item.id === 'contractions_511');
    const hasWaterBreak = active.items.some(item => item.id === 'water_break');
    assert.ok(has511, 'Active category phải có quy tắc chuyển dạ 5-1-1');
    assert.ok(hasWaterBreak, 'Active category phải có dấu hiệu Vỡ ối');

    // Kiểm tra dấu hiệu nguy hiểm cấp cứu
    const hasBleeding = emergency.items.some(item => item.id === 'heavy_bleeding');
    const hasPreeclampsia = emergency.items.some(item => item.id === 'preeclampsia');
    assert.ok(hasBleeding, 'Emergency phải có cảnh báo chảy máu ồ ạt');
    assert.ok(hasPreeclampsia, 'Emergency phải có cảnh báo tiền sản giật');
});

test('Phase 7+: calculateGestationalAgeAtDate accurately handles preterm birth (sinh sớm)', () => {
    // 1. Trường hợp sinh non / sinh sớm (sinh sớm 6 tuần, tức tuần 34)
    const edd = '2026-11-15';
    const pretermBirth = '2026-10-04'; // Sớm 42 ngày (6 tuần) => Tuần 34
    const pretermResult = calculateGestationalAgeAtDate(edd, pretermBirth);

    assert.ok(pretermResult !== null, 'Tính được kết quả tuổi thai lúc sinh');
    assert.equal(pretermResult.isPreterm, true, 'Xác định chính xác là sinh non (tuần < 37)');
    assert.equal(pretermResult.weeks, 34, 'Tính chính xác tuần thai lúc sinh là tuần 34');
    assert.ok(pretermResult.daysBeforeEdd > 0, 'Sớm hơn ngày dự sinh');

    // 2. Trường hợp sinh đủ tháng (tuần 39 + 3 ngày)
    const fullTermBirth = '2026-11-11';
    const fullTermResult = calculateGestationalAgeAtDate(edd, fullTermBirth);
    assert.equal(fullTermResult.isPreterm, false, 'Sinh ở tuần 39 là đủ tháng (không phải sinh non)');
    assert.equal(fullTermResult.weeks, 39, 'Tuần thai 39');
});

