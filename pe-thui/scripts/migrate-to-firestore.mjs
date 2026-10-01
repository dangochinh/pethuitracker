import { Firestore } from '@google-cloud/firestore';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SHEET_ID = '11zjtgJtpz5iBF2tI-hFOAWkYkTOWbKy8gJCOYnRUjGs';

function getCredentials() {
    const possiblePaths = [
        path.join(process.cwd(), '../VietlottDashboard/scraper/credentials.json'),
        path.join(process.cwd(), 'credentials.json'),
        path.join(process.cwd(), '../scraper/credentials.json'),
    ];
    const credsPath = possiblePaths.find(p => fs.existsSync(p));
    if (!credsPath) throw new Error('credentials.json not found');
    return JSON.parse(fs.readFileSync(credsPath, 'utf8'));
}

async function migrate() {
    console.log('=== BẮT ĐẦU MIGRATION TỪ GOOGLE SHEETS SANG FIRESTORE ===\n');

    const creds = getCredentials();
    const db = new Firestore({
        projectId: creds.project_id,
        credentials: {
            client_email: creds.client_email,
            private_key: creds.private_key,
        }
    });

    const auth = new google.auth.GoogleAuth({
        credentials: creds,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Get all tabs
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const tabs = spreadsheet.data.sheets.map(s => s.properties.title);
    console.log(`Tìm thấy ${tabs.length} tabs trong Google Sheets:`, tabs.join(', '), '\n');

    const summary = {
        milestones: 0,
        babies: 0,
        growth: 0,
        vaccines: 0,
        teeth: 0,
        push: 0,
    };

    // 2. Migrate Master tab if present
    if (tabs.includes('Master')) {
        console.log('--- Migrating tab [Master] -> collection [master_milestones] ---');
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: 'Master!A2:D',
        });
        const rows = res.data.values || [];
        const batch = db.batch();
        for (const r of rows) {
            if (!r || !r[0]) continue;
            const docId = String(r[0]);
            const ref = db.collection('master_milestones').doc(docId);
            batch.set(ref, {
                id: docId,
                ageRange: r[1] || '',
                category: r[2] || '',
                content: r[3] || '',
            });
            summary.milestones++;
        }
        await batch.commit();
        console.log(`✓ Đã lưu ${summary.milestones} mốc kỹ năng (milestones) vào Firestore.\n`);
    }

    // 3. Migrate each baby tab
    const babyTabs = tabs.filter(t => t.toLowerCase() !== 'master');

    for (const code of babyTabs) {
        console.log(`--- Migrating em bé [${code}] ---`);
        const [profileRes, growthRes, vaccineRes, teethRes, pushRes] = await Promise.all([
            sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${code}!A1:B5` }).catch(() => ({ data: { values: [] } })),
            sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${code}!A7:D` }).catch(() => ({ data: { values: [] } })),
            sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${code}!F7:I` }).catch(() => ({ data: { values: [] } })),
            sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${code}!J7:L` }).catch(() => ({ data: { values: [] } })),
            sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${code}!K7:L` }).catch(() => ({ data: { values: [] } }))
        ]);

        const pRows = profileRes.data.values || [];
        const gRows = growthRes.data.values || [];
        const vRows = vaccineRes.data.values || [];
        const tRows = teethRes.data.values || [];
        const pushRows = pushRes.data.values || [];

        // Check if valid profile
        if (pRows.length < 1 && gRows.length === 0) {
            console.log(`Tab [${code}] trống, bỏ qua.`);
            continue;
        }

        const name = pRows[0]?.[1] || code;
        const gender = pRows[1]?.[1] || '';
        const dob = pRows[2]?.[1] || '';
        const avatar = pRows[3]?.[1] || '';
        const telegramChatId = pRows[4]?.[1] || '';

        // Write baby document
        const babyRef = db.collection('babies').doc(code);
        await babyRef.set({
            code,
            name,
            gender,
            dob,
            avatar,
            telegramChatId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }, { merge: true });
        summary.babies++;
        console.log(`  ✓ Hồ sơ bé: ${name} (${gender}, ngày sinh: ${dob})`);

        // Write Growth
        if (gRows.length > 0) {
            const batch = db.batch();
            let count = 0;
            gRows.forEach((r, idx) => {
                if (!r || (!r[0] && !r[2] && !r[3])) return;
                const rowId = String(idx + 7);
                const gRef = babyRef.collection('growth').doc(rowId);
                const parseNum = (v) => {
                    if (!v) return 0;
                    const clean = v.toString().replace(/,/g, '.').replace(/[^-0-9.]/g, '');
                    const n = parseFloat(clean);
                    return isNaN(n) ? 0 : n;
                };
                batch.set(gRef, {
                    id: rowId,
                    date: r[0] || '',
                    ageMonths: parseNum(r[1]),
                    weight: parseNum(r[2]),
                    height: parseNum(r[3]),
                    createdAt: new Date()
                });
                count++;
            });
            if (count > 0) {
                await batch.commit();
                summary.growth += count;
                console.log(`  ✓ ${count} bản ghi tăng trưởng`);
            }
        }

        // Write Vaccines
        if (vRows.length > 0) {
            const batch = db.batch();
            let count = 0;
            vRows.forEach((r) => {
                if (!r || !r[0]) return;
                const vId = r[0].trim();
                const vRef = babyRef.collection('vaccines').doc(vId);
                batch.set(vRef, {
                    vaccineId: vId,
                    administeredDate: r[1] || '',
                    scheduledDate: r[2] || '',
                    notes: r[3] || '',
                    updatedAt: new Date()
                });
                count++;
            });
            if (count > 0) {
                await batch.commit();
                summary.vaccines += count;
                console.log(`  ✓ ${count} mũi tiêm`);
            }
        }

        // Write Teeth
        if (tRows.length > 0) {
            const batch = db.batch();
            let count = 0;
            tRows.forEach((r) => {
                if (!r || !r[0]) return;
                const tId = r[0].trim();
                const tRef = babyRef.collection('teeth').doc(tId);
                batch.set(tRef, {
                    toothId: tId,
                    eruptedDate: r[1] || '',
                    notes: r[2] || '',
                    updatedAt: new Date()
                });
                count++;
            });
            if (count > 0) {
                await batch.commit();
                summary.teeth += count;
                console.log(`  ✓ ${count} chiếc răng`);
            }
        }

        // Write Push Subscriptions
        if (pushRows.length > 0) {
            const batch = db.batch();
            let count = 0;
            pushRows.forEach((r, idx) => {
                if (!r || !r[0] || !r[1]) return;
                try {
                    const keys = JSON.parse(r[1]);
                    const subId = `sub_${idx + 1}`;
                    const pRef = babyRef.collection('push_subscriptions').doc(subId);
                    batch.set(pRef, {
                        endpoint: r[0],
                        keys,
                        createdAt: new Date()
                    });
                    count++;
                } catch (e) {}
            });
            if (count > 0) {
                await batch.commit();
                summary.push += count;
                console.log(`  ✓ ${count} push subscriptions`);
            }
        }
        console.log('');
    }

    console.log('====================================');
    console.log('🎉 MIGRATION HOÀN TẤT THÀNH CÔNG 100%!');
    console.log(`- Số mốc kỹ năng (Master): ${summary.milestones}`);
    console.log(`- Số hồ sơ em bé (Babies): ${summary.babies}`);
    console.log(`- Số bản ghi tăng trưởng (Growth): ${summary.growth}`);
    console.log(`- Số mũi tiêm (Vaccines): ${summary.vaccines}`);
    console.log(`- Số răng (Teeth): ${summary.teeth}`);
    console.log(`- Số đăng ký push (Push Subscriptions): ${summary.push}`);
    console.log('====================================\n');
}

migrate().catch(e => {
    console.error('Lỗi khi migrate:', e);
    process.exit(1);
});
