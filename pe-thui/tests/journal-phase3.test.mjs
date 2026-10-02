import test from 'node:test';
import assert from 'node:assert/strict';

import {
    generateDayCarousel,
    aggregateDailyStats,
    getTimePeriodLabel,
    mergeTimelineEvents,
    getStandardMilestones,
    calculateMilestoneProgress
} from '../app/lib/journal-utils.js';

test('1. generateDayCarousel produces correct range of days and flags', () => {
    const todayStr = '2026-06-15';
    const carousel = generateDayCarousel(todayStr, 3);

    // Range 3 means 3 before + 1 current + 3 after = 7 days
    assert.equal(carousel.length, 7);

    // Selected day must have isSelected = true
    const selected = carousel.find(d => d.dateString === todayStr);
    assert.ok(selected);
    assert.equal(selected.isSelected, true);
    assert.equal(selected.dayNumber, 15);
});

test('2. aggregateDailyStats accurately computes totals for milk, sleep, diapers, and milestones', () => {
    const feedings = [
        { amount: 150 },
        { amount: 180 },
        { amount: 90 }
    ];
    const sleeps = [
        { startTime: '2026-06-15T09:00:00Z', endTime: '2026-06-15T10:30:00Z' }, // 90 mins
        { startTime: '2026-06-15T13:00:00Z', endTime: '2026-06-15T14:00:00Z' }  // 60 mins
    ];
    const diapers = [
        { type: 'wet' },
        { type: 'dirty' },
        { type: 'both' }
    ];
    const journals = [
        { type: 'milestone', caption: 'Con biết vỗ tay' },
        { type: 'memory', photos: ['photo1.jpg'] }
    ];

    const stats = aggregateDailyStats(feedings, sleeps, diapers, journals);

    // Total milk = 150 + 180 + 90 = 420ml
    assert.equal(stats.totalMilkMl, 420);
    assert.equal(stats.milkDisplay, '420ml');

    // Total sleep = 90 + 60 = 150 mins = 2h 30m
    assert.equal(stats.totalSleepMinutes, 150);
    assert.equal(stats.sleepDisplay, '2h30m');

    // Diapers = 3
    assert.equal(stats.diaperCount, 3);
    assert.equal(stats.diaperDisplay, '3 lần');

    // Milestones = 2
    assert.equal(stats.milestoneCount, 2);
    assert.equal(stats.milestoneDisplay, '2 mốc');

    // Empty list safe fallback
    const emptyStats = aggregateDailyStats([], [], [], []);
    assert.equal(emptyStats.totalMilkMl, 0);
    assert.equal(emptyStats.milkDisplay, '0ml');
    assert.equal(emptyStats.totalSleepMinutes, 0);
    assert.equal(emptyStats.sleepDisplay, '0h');
});

test('3. getTimePeriodLabel returns Vietnamese morning, noon, afternoon, and evening labels', () => {
    assert.equal(getTimePeriodLabel('08:15'), 'SÁNG');
    assert.equal(getTimePeriodLabel('12:30'), 'TRƯA');
    assert.equal(getTimePeriodLabel('15:45'), 'CHIỀU');
    assert.equal(getTimePeriodLabel('20:00'), 'TỐI');
    assert.equal(getTimePeriodLabel('23:59'), 'TỐI');
    assert.equal(getTimePeriodLabel(null), 'TRONG NGÀY');
});

test('4. mergeTimelineEvents combines feeds, sleeps, diapers, and milestones in chronological order', () => {
    const feedings = [
        { id: 'f1', amount: 180, time: '08:30' }
    ];
    const sleeps = [
        { id: 's1', time: '10:15', startTime: '2026-06-15T10:15:00', endTime: '2026-06-15T11:30:00' }
    ];
    const diapers = [
        { id: 'd1', time: '14:30', type: 'wet' }
    ];
    const journals = [
        { id: 'j1', type: 'milestone', title: 'Tự đứng bám vịn', time: '16:00', photos: ['url'] }
    ];

    const stream = mergeTimelineEvents(feedings, sleeps, diapers, journals);

    assert.equal(stream.length, 4);

    // Chronological order verification: 08:30 -> 10:15 -> 14:30 -> 16:00
    assert.equal(stream[0].category, 'feed');
    assert.equal(stream[0].time, '08:30');

    assert.equal(stream[1].category, 'sleep');

    assert.equal(stream[2].category, 'diaper');
    assert.equal(stream[2].time, '14:30');

    assert.equal(stream[3].category, 'milestone');
    assert.equal(stream[3].time, '16:00');
    assert.equal(stream[3].badge, 'Cột Mốc Mới! 🎉');
});

test('5. getStandardMilestones and calculateMilestoneProgress evaluate age-based WHO achievements', () => {
    const milestones = getStandardMilestones(10);
    assert.equal(milestones.stageTitle, 'Giai đoạn 9 - 12 Tháng');
    assert.equal(milestones.categories.length, 3);

    // Mock completed checklist
    const checkedMap = {
        gm_1: true,
        gm_2: true,
        gm_3: true,
        fm_1: true,
        fm_2: true,
        fm_3: false,
        comm_1: true,
        comm_2: true,
        comm_3: false,
        comm_4: true
    };

    const progress = calculateMilestoneProgress(milestones.categories, checkedMap);
    assert.equal(progress.totalItems, 10);
    assert.equal(progress.completedItems, 8);
    assert.equal(progress.percent, 80);
    assert.ok(progress.summaryText.includes('8 / 10 mốc'));
});
