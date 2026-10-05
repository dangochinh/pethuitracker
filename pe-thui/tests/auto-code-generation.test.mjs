import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Logic generateUniqueBabyCode tái hiện cùng mock database
 */
function createMockCodeGenerator(existingDocs = new Set()) {
    const checkBabyExists = async (code) => existingDocs.has(code);

    const generateUniqueBabyCode = async (name, dateStr, mode = 'born') => {
        const noAccents = String(name || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
        const baseCode = noAccents.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'BABIE';

        // 1. Kiểm tra mã cơ bản (lấy tên bé làm code)
        const exists = await checkBabyExists(baseCode);
        if (!exists) {
            return baseCode;
        }

        // 2. Nếu đã có code đó trong DB -> thêm ngày sinh / ngày dự sinh vào sau code
        const rawDate = dateStr || new Date().toISOString().slice(0, 10);
        const parts = String(rawDate).split('-');
        let dateSuffix = '';
        if (parts.length >= 3) {
            const [year, month, day] = parts;
            const yy = year.slice(-2);
            dateSuffix = `${day.padStart(2, '0')}${month.padStart(2, '0')}${yy}`;
        } else {
            const now = new Date();
            const d = String(now.getDate()).padStart(2, '0');
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const yy = String(now.getFullYear()).slice(-2);
            dateSuffix = `${d}${m}${yy}`;
        }

        const codeWithDate = `${baseCode}${dateSuffix}`;
        const existsWithDate = await checkBabyExists(codeWithDate);
        if (!existsWithDate) {
            return codeWithDate;
        }

        // 3. Dự phòng trường hợp trùng cả tên lẫn ngày: thử năm 4 chữ số (DDMMYYYY)
        if (parts.length >= 3) {
            const [year, month, day] = parts;
            const codeWithFullYear = `${baseCode}${day.padStart(2, '0')}${month.padStart(2, '0')}${year}`;
            const existsFull = await checkBabyExists(codeWithFullYear);
            if (!existsFull) {
                return codeWithFullYear;
            }
        }

        // 4. Nếu vẫn trùng, thêm số thứ tự .1, .2...
        for (let i = 1; i <= 99; i++) {
            const candidate = `${codeWithDate}.${i}`;
            const candidateExists = await checkBabyExists(candidate);
            if (!candidateExists) {
                return candidate;
            }
        }

        return `${codeWithDate}.${Date.now().toString().slice(-4)}`;
    };

    return { generateUniqueBabyCode, existingDocs };
}

test('1. Uses baby name as base code if not yet registered in DB', async () => {
    const { generateUniqueBabyCode } = createMockCodeGenerator(new Set());

    const code1 = await generateUniqueBabyCode('Sóc', '2026-04-15', 'born');
    assert.equal(code1, 'SOC');

    const code2 = await generateUniqueBabyCode('Bé Bơ', '2026-05-20', 'born');
    assert.equal(code2, 'BEBO');

    const code3 = await generateUniqueBabyCode('Đậu Đậu', '2026-08-10', 'pregnancy');
    assert.equal(code3, 'DAUDAU');
});

test('2. Appends DOB or EDD if base code is already taken in DB', async () => {
    const existing = new Set(['SOC', 'BEBO', 'DAUDAU']);
    const { generateUniqueBabyCode } = createMockCodeGenerator(existing);

    // Sóc sinh ngày 15/04/2026 -> mã sẽ là SOC150426
    const code1 = await generateUniqueBabyCode('Sóc', '2026-04-15', 'born');
    assert.equal(code1, 'SOC150426');

    // Bé Bơ sinh ngày 02/09/2025 -> mã sẽ là BEBO020925
    const code2 = await generateUniqueBabyCode('Bé Bơ', '2025-09-02', 'born');
    assert.equal(code2, 'BEBO020925');

    // Đậu Đậu dự sinh 10/12/2026 -> mã sẽ là DAUDAU101226
    const code3 = await generateUniqueBabyCode('Đậu Đậu', '2026-12-10', 'pregnancy');
    assert.equal(code3, 'DAUDAU101226');
});

test('3. Handles extreme collision when both base code and code with date already exist', async () => {
    const existing = new Set(['SOC', 'SOC150426']);
    const { generateUniqueBabyCode } = createMockCodeGenerator(existing);

    // Thử DDMMYYYY: SOC15042026
    const code = await generateUniqueBabyCode('Sóc', '2026-04-15', 'born');
    assert.equal(code, 'SOC15042026');

    // Thêm SOC15042026 vào existing -> Thử .1
    existing.add('SOC15042026');
    const codeIncrement = await generateUniqueBabyCode('Sóc', '2026-04-15', 'born');
    assert.equal(codeIncrement, 'SOC150426.1');
});
