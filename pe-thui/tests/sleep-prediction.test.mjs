import test from 'node:test';
import assert from 'node:assert/strict';
import { 
    calculateAgeMonths,
    getWakeWindowForAge,
    formatTimeHM,
    getEstimatedNapType,
    calculateNextNapSweetSpot,
    WAKE_WINDOWS_BY_AGE 
} from '../app/lib/sleep-prediction-utils.js';

test('1. getWakeWindowForAge returns correct medical wake windows across all age brackets', () => {
    // Sơ sinh (0 - 1 tháng)
    const newborn = getWakeWindowForAge(0.5);
    assert.equal(newborn.sweetSpotMinutes, 45);
    assert.equal(newborn.minMinutes, 35);
    assert.equal(newborn.maxMinutes, 60);

    // 3 tháng
    const threeMonths = getWakeWindowForAge(3.2);
    assert.equal(threeMonths.sweetSpotMinutes, 105);

    // 6 tháng
    const sixMonths = getWakeWindowForAge(6.5);
    assert.equal(sixMonths.sweetSpotMinutes, 165);

    // 12 tháng (1 tuổi)
    const oneYear = getWakeWindowForAge(12.5);
    assert.equal(oneYear.sweetSpotMinutes, 240);

    // 2 tuổi (24 tháng)
    const twoYears = getWakeWindowForAge(24.5);
    assert.equal(twoYears.sweetSpotMinutes, 330);
});

test('2. calculateNextNapSweetSpot accurately detects active sleep', () => {
    const now = new Date('2026-10-05T14:30:00Z');
    const sleepStartedAt = new Date('2026-10-05T13:45:00Z'); // đã ngủ 45 phút

    const result = calculateNextNapSweetSpot({
        dob: '2026-06-01', // ~4 tháng tuổi
        sleeps: [],
        activeSleep: {
            id: 'sleep-123',
            startTime: sleepStartedAt.toISOString()
        },
        now
    });

    assert.equal(result.isSleeping, true);
    assert.equal(result.status, 'sleeping');
    assert.equal(result.elapsedMinutes, 45);
    assert.equal(result.durationText, '45 phút');
});

test('3. calculateNextNapSweetSpot provides fallback advice when no sleep records exist', () => {
    const now = new Date('2026-10-05T09:00:00Z');
    const result = calculateNextNapSweetSpot({
        dob: '2026-04-01', // ~6 tháng tuổi
        sleeps: [],
        activeSleep: null,
        now
    });

    assert.equal(result.isSleeping, false);
    assert.equal(result.hasData, false);
    assert.equal(result.status, 'no_data');
    assert.ok(result.wakeWindow.sweetSpotMinutes > 0);
});

test('4. calculateNextNapSweetSpot calculates exact sweetSpotTime and minutesRemaining', () => {
    // Giả sử bé 3 tháng tuổi (sweetSpot = 105 phút)
    // Bé thức dậy lúc 08:00
    // SweetSpot phải là 08:00 + 105 phút = 09:45
    const wakeUpTime = new Date('2026-10-05T08:00:00Z');
    const dob = '2026-07-01'; // ~3.1 tháng

    // Case 4A: Hiện tại là 08:30 (bé mới thức 30p, còn 75p nữa -> trạng thái 'fresh')
    const nowFresh = new Date('2026-10-05T08:30:00Z');
    const resFresh = calculateNextNapSweetSpot({
        dob,
        sleeps: [{ id: 's1', endTime: wakeUpTime.toISOString() }],
        now: nowFresh
    });
    assert.equal(resFresh.status, 'fresh');
    assert.equal(resFresh.awakeMinutes, 30);
    assert.equal(resFresh.minutesRemaining, 75);
    assert.ok(resFresh.progressPercent > 0 && resFresh.progressPercent < 50);

    // Case 4B: Hiện tại là 09:25 (còn 20p nữa -> trạng thái 'approaching')
    const nowApproaching = new Date('2026-10-05T09:25:00Z');
    const resApproaching = calculateNextNapSweetSpot({
        dob,
        sleeps: [{ id: 's1', endTime: wakeUpTime.toISOString() }],
        now: nowApproaching
    });
    assert.equal(resApproaching.status, 'approaching');
    assert.equal(resApproaching.minutesRemaining, 20);

    // Case 4C: Hiện tại là 09:35 (còn 10p nữa -> trạng thái 'wind_down' chuẩn bị vào giấc)
    const nowWindDown = new Date('2026-10-05T09:35:00Z');
    const resWindDown = calculateNextNapSweetSpot({
        dob,
        sleeps: [{ id: 's1', endTime: wakeUpTime.toISOString() }],
        now: nowWindDown
    });
    assert.equal(resWindDown.status, 'wind_down');
    assert.equal(resWindDown.minutesRemaining, 10);

    // Case 4D: Hiện tại là 09:45 (đúng giờ SweetSpot -> 'sweet_spot')
    const nowSweetSpot = new Date('2026-10-05T09:45:00Z');
    const resSweetSpot = calculateNextNapSweetSpot({
        dob,
        sleeps: [{ id: 's1', endTime: wakeUpTime.toISOString() }],
        now: nowSweetSpot
    });
    assert.equal(resSweetSpot.status, 'sweet_spot');
    assert.equal(resSweetSpot.minutesRemaining, 0);

    // Case 4E: Hiện tại là 10:10 (đã quá giờ thức 25 phút -> 'overtired' cảnh báo gắt ngủ)
    const nowOvertired = new Date('2026-10-05T10:10:00Z');
    const resOvertired = calculateNextNapSweetSpot({
        dob,
        sleeps: [{ id: 's1', endTime: wakeUpTime.toISOString() }],
        now: nowOvertired
    });
    assert.equal(resOvertired.status, 'overtired');
    assert.equal(resOvertired.minutesRemaining, -25);
});

test('5. getEstimatedNapType identifies correct nap session by time of day', () => {
    assert.equal(getEstimatedNapType(new Date('2026-10-05T08:30:00')).id, 'nap1');
    assert.equal(getEstimatedNapType(new Date('2026-10-05T12:45:00')).id, 'nap2');
    assert.equal(getEstimatedNapType(new Date('2026-10-05T16:00:00')).id, 'nap3');
    assert.equal(getEstimatedNapType(new Date('2026-10-05T20:30:00')).id, 'night');
});
