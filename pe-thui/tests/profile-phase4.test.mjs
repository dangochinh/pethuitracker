import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getSavedProfilesFromStorage,
    saveProfileToStorage,
    removeProfileFromStorage,
    formatFamilyShareCode,
    generateBackupDataPayload,
    isProfileUnlocked,
    setProfileUnlocked
} from '../app/lib/profile-utils.js';

// Mock localStorage cho Node.js testing environment
class MockLocalStorage {
    constructor() {
        this.store = {};
    }
    getItem(key) {
        return this.store[key] || null;
    }
    setItem(key, value) {
        this.store[key] = String(value);
    }
    removeItem(key) {
        delete this.store[key];
    }
    clear() {
        this.store = {};
    }
}

test('1. saveProfileToStorage and getSavedProfilesFromStorage handle multi-profile switching', () => {
    const mockStorage = new MockLocalStorage();

    // 1. Initial state empty
    assert.deepEqual(getSavedProfilesFromStorage(mockStorage), []);

    // 2. Add profile 1: Pe Thúi
    saveProfileToStorage({
        code: 'THUI-8869',
        name: 'Pe Thúi',
        mode: 'born',
        dob: '2025-08-01'
    }, mockStorage);

    let profiles = getSavedProfilesFromStorage(mockStorage);
    assert.equal(profiles.length, 1);
    assert.equal(profiles[0].code, 'THUI-8869');
    assert.equal(profiles[0].name, 'Pe Thúi');

    // 3. Add profile 2: Bé Gạo
    saveProfileToStorage({
        code: 'GAO-2025',
        name: 'Thai kỳ Bé Gạo',
        mode: 'pregnancy',
        estimatedDueDate: '2025-10-15'
    }, mockStorage);

    profiles = getSavedProfilesFromStorage(mockStorage);
    assert.equal(profiles.length, 2);
    // Most recently saved should be first
    assert.equal(profiles[0].code, 'GAO-2025');
    assert.equal(profiles[1].code, 'THUI-8869');

    // 4. Update profile 1: Should not duplicate, but update and move to top
    saveProfileToStorage({
        code: 'THUI-8869',
        name: 'Pe Thúi Đáng Yêu',
        mode: 'born'
    }, mockStorage);

    profiles = getSavedProfilesFromStorage(mockStorage);
    assert.equal(profiles.length, 2);
    assert.equal(profiles[0].code, 'THUI-8869');
    assert.equal(profiles[0].name, 'Pe Thúi Đáng Yêu');
});

test('2. removeProfileFromStorage deletes target profile correctly', () => {
    const mockStorage = new MockLocalStorage();
    saveProfileToStorage({ code: 'BABY-1', name: 'Bé 1' }, mockStorage);
    saveProfileToStorage({ code: 'BABY-2', name: 'Bé 2' }, mockStorage);

    assert.equal(getSavedProfilesFromStorage(mockStorage).length, 2);

    const remaining = removeProfileFromStorage('BABY-1', mockStorage);
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].code, 'BABY-2');
});

test('3. formatFamilyShareCode generates standard uppercase family connection codes', () => {
    assert.equal(formatFamilyShareCode('thui-8869'), 'THUI-8869-FAMILY');
    assert.equal(formatFamilyShareCode('#GAO-2025'), 'GAO-2025-FAMILY');
    assert.equal(formatFamilyShareCode('  demo  '), 'DEMO-FAMILY');
    assert.equal(formatFamilyShareCode(null), 'PETHUI-FAMILY');
});

test('4. generateBackupDataPayload creates comprehensive Firebase JSON backup with metadata', () => {
    const code = 'THUI-8869';
    const profile = {
        name: 'Pe Thúi',
        dob: '2025-08-01',
        gender: 'female',
        mode: 'born'
    };
    const records = {
        growth: [{ weight: 9.4, height: 74.5 }],
        vaccines: [{ vaccineId: 'bcg', date: '2025-08-01' }],
        feedings: [{ amount: 180 }],
        sleeps: [{ duration: 90 }]
    };

    const payload = generateBackupDataPayload(code, profile, records);

    assert.equal(payload.app, 'Babie Tracker');
    assert.equal(payload.baby.code, code);
    assert.equal(payload.baby.name, 'Pe Thúi');
    assert.equal(payload.records.growth.length, 1);
    assert.equal(payload.records.vaccines.length, 1);
    assert.equal(payload.records.feedings.length, 1);
    assert.equal(payload.records.sleeps.length, 1);

    // Meta total calculation: 1 + 1 + 1 + 1 = 4
    assert.equal(payload.meta.totalEntries, 4);
    assert.equal(payload.meta.syncEngine, 'Firebase Firestore Realtime');
    assert.ok(payload.exportedAt);
});

test('5. isProfileUnlocked and setProfileUnlocked properly toggle edit permissions per baby code', () => {
    const mockStorage = new MockLocalStorage();
    const code = 'HANA010426';

    // Ban đầu chưa mở khoá
    assert.equal(isProfileUnlocked(code, mockStorage), false);

    // Mở khoá
    setProfileUnlocked(code, true, mockStorage);
    assert.equal(isProfileUnlocked(code, mockStorage), true);

    // Hồ sơ khác vẫn bị khoá
    assert.equal(isProfileUnlocked('MOCHI', mockStorage), false);

    // Khoá lại
    setProfileUnlocked(code, false, mockStorage);
    assert.equal(isProfileUnlocked(code, mockStorage), false);
});
