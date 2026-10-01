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
