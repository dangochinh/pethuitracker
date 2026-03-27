import { NextResponse } from 'next/server';
import { getGoogleSheets, SHEET_ID } from '../../lib/google-sheets';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MASTER_SHEET_CANDIDATES = ['MASTER', 'Master', 'master', 'PHAT_TRIEN', 'PhatTrien', 'Milestones'];

function normalizeText(value = '') {
    return String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();
}

function normalizeKey(value = '') {
    return normalizeText(value).replace(/[^a-z0-9]/g, '');
}

function parseNumber(raw) {
    if (raw === undefined || raw === null || raw === '') return null;
    const cleaned = String(raw).replace(',', '.');
    const match = cleaned.match(/-?\d+(\.\d+)?/);
    if (!match) return null;
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : null;
}

function isNumericOnly(value = '') {
    const text = String(value).trim();
    if (!text) return false;
    return /^-?\d+([.,]\d+)?$/.test(text);
}

function isMonthRangeOnly(value = '') {
    const text = normalizeText(value);
    return /^\d+\s*(?:-|–|~)\s*\d+$/.test(text);
}

function parseSingleAgeToMonths(raw) {
    if (raw === undefined || raw === null || raw === '') return null;
    const text = normalizeText(raw);
    if (!text) return null;
    if (text.includes('so sinh')) return 0;

    const yearsMatch = text.match(/(\d+(?:[.,]\d+)?)\s*tuoi/);
    const monthsMatch = text.match(/(\d+(?:[.,]\d+)?)\s*thang/);

    if (yearsMatch || monthsMatch) {
        const years = yearsMatch ? Number(yearsMatch[1].replace(',', '.')) : 0;
        const months = monthsMatch ? Number(monthsMatch[1].replace(',', '.')) : 0;
        return Math.max(0, Math.round(years * 12 + months));
    }

    const n = parseNumber(text);
    if (n === null) return null;
    // If no unit is provided, default to months.
    return Math.max(0, Math.round(n));
}

function parseRangeToMonths(raw) {
    if (!raw) return { min: null, max: null };
    const text = normalizeText(raw);
    const rangeMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:-|–|~|to|den)\s*(\d+(?:[.,]\d+)?)/);
    if (!rangeMatch) {
        const single = parseSingleAgeToMonths(raw);
        return { min: single, max: single };
    }

    const a = Number(rangeMatch[1].replace(',', '.'));
    const b = Number(rangeMatch[2].replace(',', '.'));
    if (!Number.isFinite(a) || !Number.isFinite(b)) return { min: null, max: null };

    const useYears = text.includes('tuoi');
    const min = useYears ? Math.round(a * 12) : Math.round(a);
    const max = useYears ? Math.round(b * 12) : Math.round(b);
    return { min: Math.min(min, max), max: Math.max(min, max) };
}

function parseMonthRangeStrict(raw) {
    if (raw === undefined || raw === null) return { min: null, max: null };
    const text = normalizeText(raw);
    const match = text.match(/^(\d+)\s*(?:-|–|~)\s*(\d+)$/);
    if (!match) return { min: null, max: null };
    const min = Number(match[1]);
    const max = Number(match[2]);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: null, max: null };
    return { min: Math.min(min, max), max: Math.max(min, max) };
}

function formatAgeLabel(minMonths, maxMonths) {
    if (minMonths === null && maxMonths === null) return 'Khác';
    if (maxMonths === null || minMonths === maxMonths) return `${minMonths} tháng`;
    return `${minMonths} - ${maxMonths} tháng`;
}

function findColumnIndex(headers, aliases) {
    const normalizedAliases = aliases.map(normalizeKey);
    for (let i = 0; i < headers.length; i += 1) {
        const key = normalizeKey(headers[i]);
        if (!key) continue;
        if (normalizedAliases.includes(key)) return i;
    }

    for (let i = 0; i < headers.length; i += 1) {
        const key = normalizeKey(headers[i]);
        if (!key) continue;
        if (normalizedAliases.some((alias) => key.includes(alias) || alias.includes(key))) return i;
    }
    return -1;
}

function resolveMasterSheetName(spreadsheetSheets = []) {
    const titles = spreadsheetSheets.map((s) => s.properties?.title).filter(Boolean);

    for (const candidate of MASTER_SHEET_CANDIDATES) {
        if (titles.includes(candidate)) return candidate;
    }

    const fuzzy = titles.find((title) => {
        const key = normalizeKey(title);
        return key.includes('master') || key.includes('phattrien') || key.includes('kynang');
    });
    return fuzzy || null;
}

function isUsableFactText(value) {
    if (value === undefined || value === null) return false;
    const text = String(value).trim();
    if (!text) return false;
    if (isNumericOnly(text)) return false;
    if (isMonthRangeOnly(text)) return false;
    return true;
}

function pickTitleCell(row, headers, preferredIndex, blockedIndices = new Set()) {
    if (
        preferredIndex >= 0 &&
        !blockedIndices.has(preferredIndex) &&
        isUsableFactText(row[preferredIndex])
    ) {
        return String(row[preferredIndex]).trim();
    }

    for (let i = 0; i < row.length; i += 1) {
        if (blockedIndices.has(i)) continue;
        const key = normalizeKey(headers[i]);
        if (key.includes('thangtuoi') || key.includes('age') || key.includes('thutu') || key.includes('order')) continue;
        if (isUsableFactText(row[i])) return String(row[i]).trim();
    }
    return '';
}

function pickDescriptionCell(row, headers, preferredIndex, titleText, blockedIndices = new Set()) {
    const valid = (value) => {
        const text = String(value || '').trim();
        if (!isUsableFactText(text)) return false;
        if (normalizeText(text) === normalizeText(titleText)) return false;
        return true;
    };

    if (
        preferredIndex >= 0 &&
        !blockedIndices.has(preferredIndex) &&
        valid(row[preferredIndex])
    ) {
        return String(row[preferredIndex]).trim();
    }

    for (let i = 0; i < row.length; i += 1) {
        if (blockedIndices.has(i)) continue;
        const key = normalizeKey(headers[i]);
        if (key.includes('thangtuoi') || key.includes('age') || key.includes('thutu') || key.includes('order')) continue;
        if (valid(row[i])) return String(row[i]).trim();
    }
    return '';
}

export async function GET() {
    try {
        const sheets = await getGoogleSheets();
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SHEET_ID,
        });

        const masterSheet = resolveMasterSheetName(spreadsheet.data.sheets || []);
        if (!masterSheet) {
            return NextResponse.json({
                success: true,
                data: {
                    sourceSheet: null,
                    sections: [],
                },
            });
        }

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${masterSheet}!A1:Z`,
        });

        const rows = response.data.values || [];
        if (rows.length < 2) {
            return NextResponse.json({
                success: true,
                data: {
                    sourceSheet: masterSheet,
                    sections: [],
                },
            });
        }

        const headers = rows[0];
        const thangTuoiIdx = findColumnIndex(headers, ['thang_tuoi', 'thang tuoi', 'thangtuoi']);
        const ageLabelIdx = findColumnIndex(headers, ['age_label', 'độ tuổi', 'do tuoi', 'age group', 'nhóm tuổi']);
        const ageFromIdx = findColumnIndex(headers, ['age_from', 'tuoi_tu', 'from_month', 'min_month', 'tu bat dau']);
        const ageToIdx = findColumnIndex(headers, ['age_to', 'tuoi_den', 'to_month', 'max_month', 'tu ket thuc']);
        const titleIdx = findColumnIndex(headers, ['title', 'skill', 'ky nang', 'moc phat trien', 'fact title', 'ten', 'noi dung']);
        const descIdx = findColumnIndex(headers, ['description', 'mo ta', 'detail', 'chi tiet', 'dien giai', 'ghi chu']);
        const orderIdx = findColumnIndex(headers, ['order', 'stt', 'thu tu', 'priority', 'sort']);
        const iconIdx = findColumnIndex(headers, ['icon', 'emoji']);

        const sectionMap = new Map();

        rows.slice(1).forEach((row, index) => {
            const thangTuoiRaw = thangTuoiIdx >= 0 ? row[thangTuoiIdx] : '';
            const ageLabelRaw = ageLabelIdx >= 0 ? row[ageLabelIdx] : '';
            const blockedIndices = new Set([thangTuoiIdx, ageLabelIdx, ageFromIdx, ageToIdx, orderIdx, iconIdx].filter((i) => i >= 0));
            const title = pickTitleCell(row, headers, titleIdx, blockedIndices);
            const description = pickDescriptionCell(row, headers, descIdx, title, blockedIndices);
            const icon = iconIdx >= 0 ? row[iconIdx] || '' : '';
            const orderValue = orderIdx >= 0 ? parseNumber(row[orderIdx]) : null;

            if (!title && !description) return;

            const parsedFrom = ageFromIdx >= 0 ? parseSingleAgeToMonths(row[ageFromIdx]) : null;
            const parsedTo = ageToIdx >= 0 ? parseSingleAgeToMonths(row[ageToIdx]) : null;
            const parsedMonthRange = parseMonthRangeStrict(thangTuoiRaw);
            const parsedRange = parseRangeToMonths(ageLabelRaw);

            let minAgeMonths = parsedMonthRange.min ?? parsedFrom ?? parsedRange.min;
            let maxAgeMonths = parsedMonthRange.max ?? parsedTo ?? parsedRange.max ?? parsedFrom ?? parsedRange.min;

            minAgeMonths = Number(minAgeMonths);
            maxAgeMonths = Number(maxAgeMonths);
            if (!Number.isFinite(minAgeMonths) || !Number.isFinite(maxAgeMonths)) return;
            if (minAgeMonths > maxAgeMonths) {
                const temp = minAgeMonths;
                minAgeMonths = maxAgeMonths;
                maxAgeMonths = temp;
            }

            minAgeMonths = Math.max(0, Math.round(minAgeMonths));
            maxAgeMonths = Math.max(0, Math.round(maxAgeMonths));

            const ageLabel = formatAgeLabel(minAgeMonths, maxAgeMonths);
            const sectionKey = `${minAgeMonths}-${maxAgeMonths}`;

            if (!sectionMap.has(sectionKey)) {
                sectionMap.set(sectionKey, {
                    id: sectionKey,
                    ageLabel,
                    minAgeMonths,
                    maxAgeMonths,
                    facts: [],
                });
            }

            sectionMap.get(sectionKey).facts.push({
                id: `${sectionKey}-${index + 1}`,
                title: title || description,
                description: description || '',
                icon,
                sortOrder: orderValue ?? (index + 1),
            });
        });

        const sections = Array.from(sectionMap.values())
            .map((section) => ({
                ...section,
                facts: section.facts.sort((a, b) => a.sortOrder - b.sortOrder),
            }))
            .sort((a, b) => {
                if (a.minAgeMonths !== b.minAgeMonths) return a.minAgeMonths - b.minAgeMonths;
                if (a.maxAgeMonths !== b.maxAgeMonths) return a.maxAgeMonths - b.maxAgeMonths;
                return a.ageLabel.localeCompare(b.ageLabel, 'vi');
            });

        return NextResponse.json({
            success: true,
            data: {
                sourceSheet: masterSheet,
                sections,
            },
        });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
