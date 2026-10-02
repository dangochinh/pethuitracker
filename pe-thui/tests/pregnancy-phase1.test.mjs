import test from 'node:test';
import assert from 'node:assert/strict';

import {
    calculatePregnancyWeeks,
    getPregnancyWeekStats,
    getUpcomingCheckup,
    getWeeklyAdvice,
    calculateBagProgress,
    filterBagItems,
    evaluateKickCount,
    INITIAL_HOSPITAL_BAG_ITEMS
} from '../app/lib/pregnancy-utils.js';

test('1. calculatePregnancyWeeks should calculate correct pregnancy stats from EDD', () => {
    // Giả định ngày dự sinh cách hôm nay khoảng 100 ngày (tam cá nguyệt 3, tuần ~ 25-26)
    const futureDate = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString();
    const stats = calculatePregnancyWeeks(futureDate);

    assert.ok(stats.weeks >= 24 && stats.weeks <= 27, `Expected weeks around 25-26, got ${stats.weeks}`);
    assert.ok(stats.daysRemaining >= 99 && stats.daysRemaining <= 101, `Expected daysRemaining around 100, got ${stats.daysRemaining}`);
    assert.ok(stats.fruitName, 'Fruit name should be defined');
    assert.ok(stats.fruitEmoji, 'Fruit emoji should be defined');
    assert.ok(stats.estimatedWeight >= 0, 'Estimated weight should be positive');
});

test('2. getPregnancyWeekStats handles boundaries and clamps properly', () => {
    const week0 = getPregnancyWeekStats(0);
    assert.equal(week0.name, 'Mầm sống (Chuẩn bị)');

    const week12 = getPregnancyWeekStats(12);
    assert.equal(week12.name, 'Quả chanh ta');
    assert.equal(week12.weight, 14);

    const week40 = getPregnancyWeekStats(40);
    assert.equal(week40.name, 'Quả dưa hấu');
    assert.equal(week40.weight, 3462);

    // Over 42 weeks should clamp to week 42
    const week50 = getPregnancyWeekStats(50);
    assert.equal(week50.name, 'Quả mít');
});

test('3. getUpcomingCheckup returns correct medical milestone based on gestational week', () => {
    // Tuần 6 (tam cá nguyệt 1 sớm)
    const checkup6 = getUpcomingCheckup(6);
    assert.equal(checkup6.title, 'Khám thai lần đầu');
    assert.equal(checkup6.badge, 'Quan trọng');

    // Tuần 12 (độ mờ da gáy)
    const checkup12 = getUpcomingCheckup(12);
    assert.equal(checkup12.title, 'Đo độ mờ da gáy & Double Test');
    assert.equal(checkup12.badge, 'Rất quan trọng');

    // Tuần 22 (hình thái 4D)
    const checkup22 = getUpcomingCheckup(22);
    assert.equal(checkup22.title, 'Khảo sát hình thái thai nhi');

    // Tuần 26 (tiểu đường thai kỳ)
    const checkup26 = getUpcomingCheckup(26);
    assert.equal(checkup26.title, 'Tầm soát tiểu đường thai kỳ');

    // Tuần 38 (gần sinh)
    const checkup38 = getUpcomingCheckup(38);
    assert.equal(checkup38.title, 'Khám thai hàng tuần trước sinh');
    assert.equal(checkup38.badge, 'Gần sinh');
});

test('4. getWeeklyAdvice returns targeted medical & diet tips by trimester', () => {
    // Trimester 1: tuần 8
    const adviceT1 = getWeeklyAdvice(8);
    assert.ok(adviceT1.diet.includes('Axit Folic'));
    assert.ok(adviceT1.warning.includes('ra máu âm đạo'));

    // Trimester 2: tuần 20
    const adviceT2 = getWeeklyAdvice(20);
    assert.ok(adviceT2.diet.includes('Canxi'));
    assert.ok(adviceT2.warning.includes('tiền sản giật'));

    // Trimester 3: tuần 34
    const adviceT3 = getWeeklyAdvice(34);
    assert.ok(adviceT3.diet.includes('DHA'));
    assert.ok(adviceT3.warning.includes('10 lần trong 2 giờ'));
});

test('5. calculateBagProgress computes counts, percentage, and completion status', () => {
    // Empty list
    const emptyResult = calculateBagProgress([]);
    assert.deepEqual(emptyResult, { totalCount: 0, checkedCount: 0, percent: 0, isComplete: false });

    // Partial list
    const sampleItems = [
        { id: '1', checked: true },
        { id: '2', checked: false },
        { id: '3', checked: true },
        { id: '4', checked: false }
    ];
    const partialResult = calculateBagProgress(sampleItems);
    assert.equal(partialResult.totalCount, 4);
    assert.equal(partialResult.checkedCount, 2);
    assert.equal(partialResult.percent, 50);
    assert.equal(partialResult.isComplete, false);

    // Full list
    const completedItems = [
        { id: '1', checked: true },
        { id: '2', checked: true }
    ];
    const fullResult = calculateBagProgress(completedItems);
    assert.equal(fullResult.percent, 100);
    assert.equal(fullResult.isComplete, true);

    // Initial items check
    const initialStats = calculateBagProgress(INITIAL_HOSPITAL_BAG_ITEMS);
    assert.equal(initialStats.totalCount, 16);
    assert.ok(initialStats.checkedCount > 0);
    assert.ok(initialStats.percent > 0 && initialStats.percent < 100);
});

test('6. filterBagItems filters checklist by category tabs', () => {
    const all = filterBagItems(INITIAL_HOSPITAL_BAG_ITEMS, 'all');
    assert.equal(all.length, INITIAL_HOSPITAL_BAG_ITEMS.length);

    const babyItems = filterBagItems(INITIAL_HOSPITAL_BAG_ITEMS, 'baby');
    assert.ok(babyItems.length > 0);
    assert.ok(babyItems.every(i => i.category === 'baby'));

    const momItems = filterBagItems(INITIAL_HOSPITAL_BAG_ITEMS, 'mom');
    assert.ok(momItems.length > 0);
    assert.ok(momItems.every(i => i.category === 'mom'));

    const docItems = filterBagItems(INITIAL_HOSPITAL_BAG_ITEMS, 'docs');
    assert.ok(docItems.length > 0);
    assert.ok(docItems.every(i => i.category === 'docs'));
});

test('7. evaluateKickCount accurately checks kick count against medical threshold', () => {
    // 0 kicks
    const zero = evaluateKickCount(0, 10);
    assert.equal(zero.count, 0);
    assert.equal(zero.remaining, 10);
    assert.equal(zero.isTargetMet, false);

    // 4 kicks
    const mid = evaluateKickCount(4, 10);
    assert.equal(mid.count, 4);
    assert.equal(mid.remaining, 6);
    assert.equal(mid.isTargetMet, false);

    // 10 kicks (met)
    const met = evaluateKickCount(10, 10);
    assert.equal(met.count, 10);
    assert.equal(met.remaining, 0);
    assert.equal(met.isTargetMet, true);

    // Over 10 kicks
    const over = evaluateKickCount(15, 10);
    assert.equal(over.count, 15);
    assert.equal(over.remaining, 0);
    assert.equal(over.isTargetMet, true);

    // Edge case: null or negative count
    const edge = evaluateKickCount(null, 10);
    assert.equal(edge.count, 0);
    assert.equal(edge.remaining, 10);
    assert.equal(edge.isTargetMet, false);
});
