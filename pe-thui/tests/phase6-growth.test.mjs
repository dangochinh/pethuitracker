import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAge, predictAdultHeight, assessWeight, assessHeight, normalizeIsoDate, sortGrowthRecordsDescending } from '../app/lib/calculations.js';

test('Phase 6: calculateAge correctly breaks down months and days', () => {
    const dob = '2025-01-01';
    const checkDate = new Date('2025-07-15');
    const age = calculateAge(dob, checkDate);

    assert.equal(age.totalMonths, 6, 'Số tháng phải là 6');
    assert.equal(age.days, 14, 'Số ngày lẻ phải là 14');
    assert.ok(age.text.includes('6 tháng'), 'Chuỗi hiển thị có 6 tháng');
});

test('Phase 6: predictAdultHeight computes reasonable adult heights', () => {
    // Bé trai 12 tháng, cao 75cm
    const boyPredicted = predictAdultHeight(75, 'male', 12);
    assert.ok(boyPredicted >= 150 && boyPredicted <= 190, `Chiều cao dự đoán bé trai phải hợp lý (${boyPredicted}cm)`);

    // Bé gái 12 tháng, cao 74cm
    const girlPredicted = predictAdultHeight(74, 'female', 12);
    assert.ok(girlPredicted >= 145 && girlPredicted <= 180, `Chiều cao dự đoán bé gái phải hợp lý (${girlPredicted}cm)`);

    // Bé trai cao hơn bé gái cùng chỉ số do factor
    const boySame = predictAdultHeight(75, 'male', 12);
    const girlSame = predictAdultHeight(75, 'female', 12);
    assert.ok(boySame >= girlSame, 'Bé trai cùng chiều cao có dự đoán trưởng thành cao hơn hoặc bằng');

    // Edge cases
    assert.equal(predictAdultHeight(0, 'male', 12), 0, 'Chiều cao 0 trả về 0');
    assert.equal(predictAdultHeight(null, 'female', 12), 0, 'Chiều cao null trả về 0');
});

test('Phase 6: assessWeight matches WHO percentile categories', () => {
    // 6 tháng tuổi, chuẩn TB ~ 7kg
    const normal = assessWeight(7.2, 6);
    assert.equal(normal.status, 'Đạt chuẩn');

    // Quá nhẹ: 4.5kg ở 6 tháng
    const under = assessWeight(4.5, 6);
    assert.equal(under.status, 'Dưới chuẩn');

    // Quá nặng: 10.5kg ở 6 tháng
    const over = assessWeight(10.5, 6);
    assert.equal(over.status, 'Vượt chuẩn');
});

test('Phase 6: assessHeight matches WHO percentile categories', () => {
    // 6 tháng tuổi, chuẩn TB ~ 59cm
    const normal = assessHeight(60, 6);
    assert.equal(normal.status, 'Đạt chuẩn');

    // Thấp: 50cm ở 6 tháng
    const under = assessHeight(50, 6);
    assert.equal(under.status, 'Dưới chuẩn');

    // Vượt trội: 68cm ở 6 tháng
    const over = assessHeight(68, 6);
    assert.equal(over.status, 'Vượt chuẩn');
});

test('Phase 6: normalizeIsoDate converts various formats to standard YYYY-MM-DD', () => {
    assert.equal(normalizeIsoDate('2026-05-10'), '2026-05-10', 'ISO format stays unchanged');
    assert.equal(normalizeIsoDate('10/05/2026'), '2026-05-10', 'DD/MM/YYYY format is converted to YYYY-MM-DD');
    assert.equal(normalizeIsoDate('5/5/2026'), '2026-05-05', 'D/M/YYYY format pads zeroes');
    assert.equal(normalizeIsoDate('2026-05-10T08:30:00.000Z'), '2026-05-10', 'Full ISO timestamp is converted to date string');
    assert.equal(normalizeIsoDate(''), '', 'Empty string returns empty');
    assert.equal(normalizeIsoDate(null), '', 'Null returns empty');
});

test('Phase 6: sortGrowthRecordsDescending places latest measurements first and prevents NaN string ID bugs', () => {
    const records = [
        { id: 'docOld', date: '2026-06-01', ageMonths: 6, weight: 7.0, height: 65 },
        { id: 'docNew', date: '2026-06-20', ageMonths: 6, weight: 7.8, height: 67 },
        { id: 'docPreterm', date: '2025-12-01', ageMonths: 0, weight: 3.2, height: 49 },
        { id: 'docTelegram', date: '25/06/2026', ageMonths: 6, weight: 8.0, height: 68 }
    ];

    const sorted = sortGrowthRecordsDescending(records);

    // Latest date is 25/06/2026 (converted to 2026-06-25), followed by 2026-06-20, then 2026-06-01, then 2025-12-01
    assert.equal(sorted[0].id, 'docTelegram', 'Bản ghi mới nhất ngày 25/06 phải đứng đầu');
    assert.equal(sorted[1].id, 'docNew', 'Bản ghi ngày 20/06 phải đứng thứ 2');
    assert.equal(sorted[2].id, 'docOld', 'Bản ghi ngày 01/06 phải đứng thứ 3');
    assert.equal(sorted[3].id, 'docPreterm', 'Bản ghi sơ sinh tháng 0 phải đứng cuối');

    // Latest weight and height records properly found
    const latestWeight = sorted.find(r => r.weight > 0);
    const latestHeight = sorted.find(r => r.height > 0);
    assert.equal(latestWeight.weight, 8.0, 'Cân nặng mới nhất cập nhật đúng thành 8.0kg');
    assert.equal(latestHeight.height, 68, 'Chiều cao mới nhất cập nhật đúng thành 68cm');
});

test('Phase 6: sortGrowthRecordsDescending handles independent weight-only and height-only records', () => {
    const records = [
        { id: 'w1', date: '2026-07-01', ageMonths: 7, weight: 8.5, height: 0 },
        { id: 'h1', date: '2026-07-10', ageMonths: 7, weight: 0, height: 71.5 }
    ];

    const sorted = sortGrowthRecordsDescending(records);
    const latestWeight = sorted.find(r => r.weight > 0);
    const latestHeight = sorted.find(r => r.height > 0);

    assert.equal(latestWeight.id, 'w1', 'Tìm đúng bản ghi cân nặng gần nhất');
    assert.equal(latestWeight.weight, 8.5, 'Cân nặng là 8.5');
    assert.equal(latestHeight.id, 'h1', 'Tìm đúng bản ghi chiều cao gần nhất');
    assert.equal(latestHeight.height, 71.5, 'Chiều cao là 71.5');
});

