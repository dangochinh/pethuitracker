import { getFirestore } from './firestore.js';

// -------------------------------------------------------------
// BABIES / PROFILE
// -------------------------------------------------------------

export async function getBaby(code) {
    if (!code) return null;
    const db = getFirestore();
    const doc = await db.collection('babies').doc(code).get();
    if (!doc.exists) return null;
    const data = doc.data();
    return {
        name: data.name || '',
        gender: data.gender || '',
        dob: data.dob || '',
        avatar: data.avatar || '',
        telegramChatId: data.telegramChatId || '',
        mode: data.mode || (data.estimatedDueDate ? 'pregnancy' : 'born'),
        estimatedDueDate: data.estimatedDueDate || null,
    };
}

export async function checkBabyExists(code) {
    if (!code) return false;
    const db = getFirestore();
    const doc = await db.collection('babies').doc(code).get();
    return doc.exists;
}

export async function createOrUpdateBaby(code, data) {
    if (!code) throw new Error('Code is required');
    const db = getFirestore();
    const ref = db.collection('babies').doc(code);
    await ref.set({
        code,
        name: data.name || '',
        gender: data.gender || '',
        dob: data.dob || '',
        avatar: data.avatar || '',
        telegramChatId: data.telegramChatId || '',
        mode: data.mode || (data.estimatedDueDate ? 'pregnancy' : 'born'),
        estimatedDueDate: data.estimatedDueDate || null,
        updatedAt: new Date(),
    }, { merge: true });
}

export async function renameBabyCode(oldCode, newCode) {
    const db = getFirestore();
    const oldRef = db.collection('babies').doc(oldCode);
    const newRef = db.collection('babies').doc(newCode);

    const oldDoc = await oldRef.get();
    if (!oldDoc.exists) throw new Error('Không tìm thấy dữ liệu cũ');

    const newDoc = await newRef.get();
    if (newDoc.exists) throw new Error('Mã code này đã được sử dụng bởi người khác!');

    // Copy main doc
    const batch = db.batch();
    batch.set(newRef, {
        ...oldDoc.data(),
        code: newCode,
        updatedAt: new Date()
    });
    batch.delete(oldRef);

    // Copy subcollections: growth, vaccines, teeth, push_subscriptions
    const subcols = ['growth', 'vaccines', 'teeth', 'push_subscriptions'];
    for (const sub of subcols) {
        const subSnap = await oldRef.collection(sub).get();
        for (const doc of subSnap.docs) {
            batch.set(newRef.collection(sub).doc(doc.id), doc.data());
            batch.delete(oldRef.collection(sub).doc(doc.id));
        }
    }

    await batch.commit();
}

export async function getBabyByTelegramChatId(chatId) {
    if (!chatId) return null;
    const db = getFirestore();
    const snap = await db.collection('babies').where('telegramChatId', '==', String(chatId)).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return {
        code: doc.id,
        ...doc.data()
    };
}

export async function getAllBabies() {
    const db = getFirestore();
    const snap = await db.collection('babies').get();
    return snap.docs.map(doc => ({
        code: doc.id,
        ...doc.data()
    }));
}

// -------------------------------------------------------------
// GROWTH RECORDS
// -------------------------------------------------------------

export async function getGrowthRecords(code) {
    if (!code) return [];
    const db = getFirestore();
    const snap = await db.collection('babies').doc(code).collection('growth').get();
    if (snap.empty) return [];

    const records = snap.docs.map(doc => {
        const d = doc.data();
        return {
            id: doc.id,
            date: d.date || '',
            ageMonths: Number(d.ageMonths) || 0,
            weight: Number(d.weight) || 0,
            height: Number(d.height) || 0,
        };
    });

    // Sort by date ascending, fallback by ageMonths
    records.sort((a, b) => {
        if (a.date && b.date) return a.date.localeCompare(b.date);
        return a.ageMonths - b.ageMonths;
    });

    return records;
}

export async function addGrowthRecord(code, record) {
    const db = getFirestore();
    const growthCol = db.collection('babies').doc(code).collection('growth');
    const docRef = await growthCol.add({
        date: record.date || '',
        ageMonths: Number(record.ageMonths) || 0,
        weight: Number(record.weight) || 0,
        height: Number(record.height) || 0,
        createdAt: new Date(),
    });
    return { id: docRef.id, ...record };
}

export async function updateGrowthRecord(code, id, record) {
    const db = getFirestore();
    const docRef = db.collection('babies').doc(code).collection('growth').doc(String(id));
    await docRef.set({
        date: record.date || '',
        ageMonths: Number(record.ageMonths) || 0,
        weight: Number(record.weight) || 0,
        height: Number(record.height) || 0,
        updatedAt: new Date(),
    }, { merge: true });
}

export async function deleteGrowthRecord(code, id) {
    const db = getFirestore();
    await db.collection('babies').doc(code).collection('growth').doc(String(id)).delete();
}

// -------------------------------------------------------------
// VACCINE RECORDS
// -------------------------------------------------------------

export async function getVaccineRecords(code) {
    if (!code) return [];
    const db = getFirestore();
    const snap = await db.collection('babies').doc(code).collection('vaccines').get();
    if (snap.empty) return [];

    return snap.docs.map(doc => {
        const d = doc.data();
        return {
            id: doc.id,
            vaccineId: doc.id,
            administeredDate: d.administeredDate || '',
            scheduledDate: d.scheduledDate || '',
            notes: d.notes || '',
        };
    });
}

export async function saveVaccineRecord(code, record) {
    const db = getFirestore();
    const vaccineId = record.vaccineId || record.id;
    if (!vaccineId) throw new Error('vaccineId is required');

    const docRef = db.collection('babies').doc(code).collection('vaccines').doc(vaccineId);
    await docRef.set({
        vaccineId,
        administeredDate: record.administeredDate || '',
        scheduledDate: record.scheduledDate || '',
        notes: record.notes || '',
        updatedAt: new Date(),
    }, { merge: true });
}

export async function deleteVaccineRecord(code, vaccineId) {
    const db = getFirestore();
    await db.collection('babies').doc(code).collection('vaccines').doc(vaccineId).delete();
}

// -------------------------------------------------------------
// TEETHING RECORDS
// -------------------------------------------------------------

export async function getTeethingRecords(code) {
    if (!code) return [];
    const db = getFirestore();
    const snap = await db.collection('babies').doc(code).collection('teeth').get();
    if (snap.empty) return [];

    return snap.docs.map(doc => {
        const d = doc.data();
        return {
            id: doc.id,
            toothId: doc.id,
            eruptedDate: d.eruptedDate || '',
            notes: d.notes || '',
        };
    });
}

export async function saveTeethingRecord(code, record) {
    const db = getFirestore();
    const toothId = record.toothId || record.id;
    if (!toothId) throw new Error('toothId is required');

    const docRef = db.collection('babies').doc(code).collection('teeth').doc(toothId);
    await docRef.set({
        toothId,
        eruptedDate: record.eruptedDate || '',
        notes: record.notes || '',
        updatedAt: new Date(),
    }, { merge: true });
}

export async function deleteTeethingRecord(code, toothId) {
    const db = getFirestore();
    await db.collection('babies').doc(code).collection('teeth').doc(toothId).delete();
}

// -------------------------------------------------------------
// PUSH NOTIFICATIONS
// -------------------------------------------------------------

export async function getPushSubscriptions(code) {
    if (!code) return [];
    const db = getFirestore();
    const snap = await db.collection('babies').doc(code).collection('push_subscriptions').get();
    return snap.docs.map(d => d.data());
}

export async function savePushSubscription(code, subscription) {
    const db = getFirestore();
    // Unique ID based on endpoint
    const hash = Buffer.from(subscription.endpoint).toString('base64').replace(/[/+=]/g, '_').slice(-40);
    const docRef = db.collection('babies').doc(code).collection('push_subscriptions').doc(hash);
    await docRef.set({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        createdAt: new Date(),
    });
}

export async function deletePushSubscription(code, endpoint) {
    const db = getFirestore();
    const hash = Buffer.from(endpoint).toString('base64').replace(/[/+=]/g, '_').slice(-40);
    await db.collection('babies').doc(code).collection('push_subscriptions').doc(hash).delete();
}

// -------------------------------------------------------------
// DEVELOPMENT MILESTONES (MASTER)
// -------------------------------------------------------------

export async function getMasterMilestones() {
    const db = getFirestore();
    const snap = await db.collection('master_milestones').get();
    const milestones = snap.docs.map(doc => doc.data());
    milestones.sort((a, b) => parseInt(a.id || 0) - parseInt(b.id || 0));
    return milestones;
}

// -------------------------------------------------------------
// FEEDINGS
// -------------------------------------------------------------

export async function getFeedings(code, dateStr) {
    if (!code) return [];
    const db = getFirestore();
    let query = db.collection('babies').doc(code).collection('feedings')
        .orderBy('startTime', 'desc');
    if (dateStr) {
        // Filter by date range (start of day to end of day)
        const start = new Date(dateStr + 'T00:00:00');
        const end = new Date(dateStr + 'T23:59:59');
        query = query.where('startTime', '>=', start).where('startTime', '<=', end);
    } else {
        query = query.limit(50);
    }
    const snap = await query.get();
    return snap.docs.map(doc => {
        const d = doc.data();
        return {
            id: doc.id,
            type: d.type || 'bottle', // 'breast' | 'bottle' | 'solid'
            startTime: d.startTime?.toDate?.() ? d.startTime.toDate().toISOString() : d.startTime,
            endTime: d.endTime?.toDate?.() ? d.endTime.toDate().toISOString() : d.endTime || null,
            duration: d.duration || 0, // seconds
            side: d.side || null, // 'left' | 'right'
            amount: d.amount ?? null, // ml
            notes: d.notes || '',
        };
    });
}

export async function addFeeding(code, record) {
    const db = getFirestore();
    const col = db.collection('babies').doc(code).collection('feedings');
    const data = {
        type: record.type || 'bottle',
        startTime: new Date(record.startTime),
        endTime: record.endTime ? new Date(record.endTime) : null,
        duration: Number(record.duration) || 0,
        side: record.side || null,
        amount: record.amount != null ? Number(record.amount) : null,
        notes: record.notes || '',
        createdAt: new Date(),
    };
    const docRef = await col.add(data);
    return { id: docRef.id, ...record };
}

export async function deleteFeeding(code, id) {
    const db = getFirestore();
    await db.collection('babies').doc(code).collection('feedings').doc(id).delete();
}

// -------------------------------------------------------------
// SLEEPS
// -------------------------------------------------------------

export async function getSleeps(code, dateStr) {
    if (!code) return [];
    const db = getFirestore();
    let query = db.collection('babies').doc(code).collection('sleeps')
        .orderBy('startTime', 'desc');
    if (dateStr) {
        const start = new Date(dateStr + 'T00:00:00');
        const end = new Date(dateStr + 'T23:59:59');
        query = query.where('startTime', '>=', start).where('startTime', '<=', end);
    } else {
        query = query.limit(50);
    }
    const snap = await query.get();
    return snap.docs.map(doc => {
        const d = doc.data();
        return {
            id: doc.id,
            type: d.type || 'nap', // 'nap' | 'night'
            startTime: d.startTime?.toDate?.() ? d.startTime.toDate().toISOString() : d.startTime,
            endTime: d.endTime?.toDate?.() ? d.endTime.toDate().toISOString() : d.endTime || null,
            duration: d.duration || 0, // minutes
            notes: d.notes || '',
        };
    });
}

export async function addSleep(code, record) {
    const db = getFirestore();
    const col = db.collection('babies').doc(code).collection('sleeps');
    const data = {
        type: record.type || 'nap',
        startTime: new Date(record.startTime),
        endTime: record.endTime ? new Date(record.endTime) : null,
        duration: Number(record.duration) || 0,
        notes: record.notes || '',
        createdAt: new Date(),
    };
    const docRef = await col.add(data);
    return { id: docRef.id, ...record };
}

export async function updateSleep(code, id, data) {
    const db = getFirestore();
    const docRef = db.collection('babies').doc(code).collection('sleeps').doc(id);
    const updateData = {};
    if (data.endTime) updateData.endTime = new Date(data.endTime);
    if (data.duration != null) updateData.duration = Number(data.duration);
    if (data.type) updateData.type = data.type;
    if (data.notes != null) updateData.notes = data.notes;
    updateData.updatedAt = new Date();
    await docRef.set(updateData, { merge: true });
}

export async function deleteSleep(code, id) {
    const db = getFirestore();
    await db.collection('babies').doc(code).collection('sleeps').doc(id).delete();
}

// -------------------------------------------------------------
// DIAPERS
// -------------------------------------------------------------

export async function getDiapers(code, dateStr) {
    if (!code) return [];
    const db = getFirestore();
    let query = db.collection('babies').doc(code).collection('diapers')
        .orderBy('time', 'desc');
    if (dateStr) {
        const start = new Date(dateStr + 'T00:00:00');
        const end = new Date(dateStr + 'T23:59:59');
        query = query.where('time', '>=', start).where('time', '<=', end);
    } else {
        query = query.limit(50);
    }
    const snap = await query.get();
    return snap.docs.map(doc => {
        const d = doc.data();
        return {
            id: doc.id,
            time: d.time?.toDate?.() ? d.time.toDate().toISOString() : d.time,
            type: d.type || 'wet', // 'wet' | 'dirty' | 'mixed'
            notes: d.notes || '',
        };
    });
}

export async function addDiaper(code, record) {
    const db = getFirestore();
    const col = db.collection('babies').doc(code).collection('diapers');
    const data = {
        time: new Date(record.time),
        type: record.type || 'wet',
        notes: record.notes || '',
        createdAt: new Date(),
    };
    const docRef = await col.add(data);
    return { id: docRef.id, ...record };
}

export async function deleteDiaper(code, id) {
    const db = getFirestore();
    await db.collection('babies').doc(code).collection('diapers').doc(id).delete();
}

// -------------------------------------------------------------
// JOURNAL / MILESTONES
// -------------------------------------------------------------

export async function getJournalEntries(code) {
    if (!code) return [];
    const db = getFirestore();
    const snap = await db.collection('babies').doc(code).collection('journal')
        .orderBy('date', 'desc')
        .get();
        
    return snap.docs.map(doc => {
        const d = doc.data();
        return {
            id: doc.id,
            date: d.date?.toDate?.() ? d.date.toDate().toISOString() : d.date,
            photos: d.photos || [],
            caption: d.caption || '',
            tags: d.tags || [],
            type: d.type || 'memory', // 'memory' | 'milestone'
            milestoneId: d.milestoneId || null,
        };
    });
}

export async function addJournalEntry(code, entry) {
    const db = getFirestore();
    const col = db.collection('babies').doc(code).collection('journal');
    const data = {
        date: new Date(entry.date || Date.now()),
        photos: entry.photos || [], // base64 strings
        caption: entry.caption || '',
        tags: entry.tags || [],
        type: entry.type || 'memory',
        milestoneId: entry.milestoneId || null,
        createdAt: new Date(),
    };
    const docRef = await col.add(data);
    return { id: docRef.id, ...entry };
}

export async function deleteJournalEntry(code, id) {
    const db = getFirestore();
    await db.collection('babies').doc(code).collection('journal').doc(id).delete();
}
