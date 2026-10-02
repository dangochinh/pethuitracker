import test from 'node:test';
import assert from 'node:assert/strict';

import {
    formatBabyAge,
    getLatestActivitiesSummary,
    getTeethingArchData,
    getUpcomingVaccination,
    getKeepsakeMilestone,
    getDaysUntilNextBirthday
} from '../app/lib/baby-utils.js';

test('1. formatBabyAge correctly formats baby age in months and days', () => {
    // Bé sinh cách đây 45 ngày (1 tháng 14 ngày)
    const baseDate = new Date('2026-06-15');
    const dob = '2026-05-01';
    const age = formatBabyAge(dob, baseDate);

    assert.equal(age.totalMonths, 1);
    assert.equal(age.days, 14);
    assert.equal(age.formatted, '1 tháng 14 ngày tuổi');

    // Bé trên 1 tuổi (ví dụ 19 tháng tuổi - không hiển thị 'tuổi' mà chuyển thành '19 tháng 1 ngày tuổi')
    const toddlerDob = '2025-03-01';
    const toddlerCheckDate = new Date('2026-10-02');
    const toddlerAge = formatBabyAge(toddlerDob, toddlerCheckDate);
    assert.equal(toddlerAge.totalMonths, 19);
    assert.equal(toddlerAge.days, 1);
    assert.equal(toddlerAge.formatted, '19 tháng 1 ngày tuổi');

    // Sơ sinh (5 ngày tuổi)
    const newbornDob = '2026-06-10';
    const newbornAge = formatBabyAge(newbornDob, baseDate);
    assert.equal(newbornAge.totalMonths, 0);
    assert.equal(newbornAge.days, 5);
    assert.equal(newbornAge.formatted, '5 ngày tuổi');

    // Không có DOB
    const emptyAge = formatBabyAge(null);
    assert.equal(emptyAge.totalMonths, 0);
    assert.equal(emptyAge.formatted, '0 ngày tuổi');

    // Đếm ngược sinh nhật
    const bday = getDaysUntilNextBirthday('2025-03-01', new Date('2026-10-02'));
    assert.equal(bday.nextAge, 2);
    assert.equal(bday.daysUntil, 150);
    assert.ok(bday.label.includes('150 ngày'));
});

test('2. getLatestActivitiesSummary extracts most recent feeding, sleep, and diaper events', () => {
    const feedings = [
        { id: 'f1', amount: 100, time: '08:00', createdAt: '2026-06-15T08:00:00Z' },
        { id: 'f2', amount: 120, time: '11:30', createdAt: '2026-06-15T11:30:00Z' }
    ];
    const sleeps = [
        { id: 's1', startTime: '2026-06-15T12:00:00Z', endTime: '2026-06-15T13:30:00Z' }
    ];
    const diapers = [
        { id: 'd1', type: 'wet', time: '10:00' },
        { id: 'd2', type: 'dirty', time: '12:30' }
    ];

    const summary = getLatestActivitiesSummary(feedings, sleeps, diapers);

    // Latest Feed should be f2 (120ml)
    assert.ok(summary.latestFeed);
    assert.equal(summary.latestFeed.amount, '120ml');
    assert.equal(summary.latestFeed.time, '11:30');

    // Latest Sleep should be 1h30m
    assert.ok(summary.latestSleep);
    assert.equal(summary.latestSleep.isSleeping, false);
    assert.equal(summary.latestSleep.durationText, '1h30m');

    // Latest Diaper should be d2 (Tã bẩn)
    assert.ok(summary.latestDiaper);
    assert.equal(summary.latestDiaper.label, 'Tã bẩn');
    assert.equal(summary.latestDiaper.time, '12:30');
});

test('3. getTeethingArchData provides 10 upper and 10 lower teeth with eruption status', () => {
    // Giả định bé đã mọc 2 răng cửa giữa dưới và 2 răng cửa giữa trên
    const teethingRecords = [
        { toothId: 'lci-l', date: '2026-01-10' },
        { toothId: 'lci-r', date: '2026-01-15' },
        { toothId: 'uci-l', date: '2026-03-01' },
        { toothId: 'uci-r', date: '2026-03-20' }
    ];

    const data = getTeethingArchData(teethingRecords);

    assert.equal(data.totalCount, 20);
    assert.equal(data.sproutedCount, 4);
    assert.equal(data.upperJaw.length, 10);
    assert.equal(data.lowerJaw.length, 10);

    assert.equal(data.upperEruptedCount, 2);
    assert.equal(data.lowerEruptedCount, 2);

    // Răng mọc gần nhất là uci-r (2026-03-20)
    assert.ok(data.mostRecentTooth);
    assert.equal(data.mostRecentTooth.date, '2026-03-20');
    assert.ok(data.mostRecentTooth.name.includes('Răng cửa giữa'));
});

test('4. getUpcomingVaccination calculates pending vaccine and remaining days', () => {
    // Bé sinh cách đây khoảng 10 tháng
    const dob = new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    
    // Giả sử bé đã tiêm hết các mũi sơ sinh đến 9 tháng
    const completedRecords = [
        { vaccineId: 'bcg', date: '2025-08-01' },
        { vaccineId: 'hepb-0', date: '2025-08-01' },
        { vaccineId: '6in1-1', date: '2025-10-01' },
        { vaccineId: 'pneumo-1', date: '2025-10-01' },
        { vaccineId: 'rota-1', date: '2025-10-01' },
        { vaccineId: 'meningo-b-1', date: '2025-10-01' },
        { vaccineId: '6in1-2', date: '2025-11-01' },
        { vaccineId: 'pneumo-2', date: '2025-11-01' },
        { vaccineId: 'rota-2', date: '2025-11-01' },
        { vaccineId: '6in1-3', date: '2025-12-01' },
        { vaccineId: 'pneumo-3', date: '2025-12-01' },
        { vaccineId: 'rota-3', date: '2025-12-01' },
        { vaccineId: 'meningo-b-2', date: '2025-12-01' },
        { vaccineId: 'flu-1', date: '2026-02-01' },
        { vaccineId: 'meningo-bc-1', date: '2026-02-01' },
        { vaccineId: 'flu-2', date: '2026-03-01' },
        { vaccineId: 'meningo-bc-2', date: '2026-05-01' },
        { vaccineId: 'je-1', date: '2026-05-01' },
        { vaccineId: 'mmr-1', date: '2026-05-01' }
    ];

    const upcoming = getUpcomingVaccination(dob, completedRecords);

    assert.ok(upcoming);
    // Mũi tiếp theo là đợt 12 tháng (ví dụ: pneumo-4)
    assert.equal(upcoming.vaccine.recommendedAge, 12);
    assert.equal(upcoming.recommendedAgeText, '12 tháng');
    assert.ok(typeof upcoming.daysUntilDue === 'number');
});

test('5. getKeepsakeMilestone provides encouraging developmental milestones', () => {
    const m6 = getKeepsakeMilestone(6, 'Pe Thúi');
    assert.equal(m6.title, 'Kỷ niệm tròn 6 tháng');
    assert.ok(m6.message.includes('ăn dặm'));

    const m10 = getKeepsakeMilestone(10, 'Pe Thúi');
    assert.equal(m10.title, 'Kỷ niệm tròn 10 tháng');
    assert.ok(m10.message.includes('bám tay vịn'));

    const m12 = getKeepsakeMilestone(12, 'Pe Thúi');
    assert.equal(m12.title, 'Kỷ niệm tròn 12 tháng');
    assert.ok(m12.message.includes('thôi nôi') || m12.message.includes('1 tuổi'));
});
