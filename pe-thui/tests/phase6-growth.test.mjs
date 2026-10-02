import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAge, predictAdultHeight, assessWeight, assessHeight } from '../app/lib/calculations.js';

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
