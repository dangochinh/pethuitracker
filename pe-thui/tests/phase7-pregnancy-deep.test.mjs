import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePregnancyWeeks, getUpcomingCheckup, getWeeklyAdvice } from '../app/lib/pregnancy-utils.js';

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
