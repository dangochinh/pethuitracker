/**
 * Quản lý danh sách các hồ sơ bé đã lưu trên thiết bị (Multi-profile switcher)
 */
export function getSavedProfilesFromStorage(storage = typeof window !== 'undefined' ? window.localStorage : null) {
    if (!storage) return [];
    try {
        const raw = storage.getItem('pethui_saved_profiles');
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

export function saveProfileToStorage(profileItem, storage = typeof window !== 'undefined' ? window.localStorage : null) {
    if (!storage || !profileItem?.code) return [];
    try {
        const current = getSavedProfilesFromStorage(storage);
        const filtered = current.filter(p => p.code !== profileItem.code);
        const updated = [
            {
                code: profileItem.code,
                name: profileItem.name || 'Bé',
                mode: profileItem.mode || 'born',
                avatar: profileItem.avatar || '',
                dob: profileItem.dob || '',
                estimatedDueDate: profileItem.estimatedDueDate || null,
                lastAccessed: new Date().toISOString()
            },
            ...filtered
        ].slice(0, 10); // Lưu tối đa 10 bé

        storage.setItem('pethui_saved_profiles', JSON.stringify(updated));
        return updated;
    } catch (e) {
        return [];
    }
}

export function removeProfileFromStorage(code, storage = typeof window !== 'undefined' ? window.localStorage : null) {
    if (!storage || !code) return [];
    try {
        const current = getSavedProfilesFromStorage(storage);
        const updated = current.filter(p => p.code !== code);
        storage.setItem('pethui_saved_profiles', JSON.stringify(updated));
        return updated;
    } catch (e) {
        return [];
    }
}

/**
 * Định dạng mã kết nối gia đình
 */
export function formatFamilyShareCode(code) {
    if (!code) return 'PETHUI-FAMILY';
    const clean = String(code).trim().replace(/^#/, '').toUpperCase();
    return `${clean}-FAMILY`;
}

/**
 * Tạo dữ liệu sao lưu gia đình dạng JSON
 */
export function generateBackupDataPayload(code, profile, allRecords = {}) {
    return {
        app: 'PeThui Tracker',
        version: '1.6.0',
        exportedAt: new Date().toISOString(),
        baby: {
            code,
            name: profile?.name || '',
            dob: profile?.dob || '',
            gender: profile?.gender || '',
            mode: profile?.mode || 'born',
            estimatedDueDate: profile?.estimatedDueDate || null
        },
        records: {
            growth: allRecords.growth || [],
            vaccines: allRecords.vaccines || [],
            teeth: allRecords.teeth || [],
            feedings: allRecords.feedings || [],
            sleeps: allRecords.sleeps || [],
            diapers: allRecords.diapers || [],
            journal: allRecords.journal || []
        },
        meta: {
            totalEntries: Object.values(allRecords).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0),
            syncEngine: 'Firebase Firestore Realtime'
        }
    };
}
