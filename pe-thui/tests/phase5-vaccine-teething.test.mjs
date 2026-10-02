import test from 'node:test';
import assert from 'node:assert/strict';
import { VACCINES } from '../app/lib/data/vaccines.js';
import { TEETH } from '../app/lib/data/teeth.js';

test('Phase 5: Teething dataset structure & jaw counts', () => {
    assert.equal(TEETH.length, 20, 'Tổng số răng sữa của trẻ phải đúng 20 chiếc');
    
    const upperJaw = TEETH.filter(t => t.jaw === 'upper');
    const lowerJaw = TEETH.filter(t => t.jaw === 'lower');
    assert.equal(upperJaw.length, 10, 'Hàm trên phải có đúng 10 răng sữa');
    assert.equal(lowerJaw.length, 10, 'Hàm dưới phải có đúng 10 răng sữa');

    const groups = new Set(TEETH.map(t => t.group));
    assert.ok(groups.has('central'), 'Có nhóm răng cửa giữa');
    assert.ok(groups.has('lateral'), 'Có nhóm răng cửa bên');
    assert.ok(groups.has('canine'), 'Có nhóm răng nanh');
    assert.ok(groups.has('molar1'), 'Có nhóm răng hàm 1');
    assert.ok(groups.has('molar2'), 'Có nhóm răng hàm 2');
});

test('Phase 5: Vaccines dataset standard schedule coverage', () => {
    assert.ok(VACCINES.length >= 15, 'Danh mục vắc xin chuẩn có ít nhất 15 mũi');

    // Mũi sơ sinh
    const newbornVaccines = VACCINES.filter(v => v.recommendedAge === 0);
    assert.ok(newbornVaccines.length >= 2, 'Có ít nhất 2 mũi tiêm sơ sinh (Lao, Viêm gan B)');

    // Kiểm tra các mũi quan trọng
    const hasBCG = VACCINES.some(v => v.id.startsWith('bcg'));
    const hasHepB = VACCINES.some(v => v.id.startsWith('hepb'));
    const has6in1 = VACCINES.some(v => v.id.startsWith('6in1'));
    const hasMMR = VACCINES.some(v => v.id.startsWith('mmr'));

    assert.ok(hasBCG, 'Có mũi vắc-xin Lao (BCG)');
    assert.ok(hasHepB, 'Có mũi vắc-xin Viêm gan B');
    assert.ok(has6in1, 'Có mũi vắc-xin 6 trong 1');
    assert.ok(hasMMR, 'Có mũi vắc-xin Sởi - Quai bị - Rubella');
});

test('Phase 5: Custom vaccine parsing & unique deduplication', () => {
    const rawRecords = [
        { vaccineId: 'bcg', date: '2025-08-11' },
        { vaccineId: 'custom-123', date: '2025-09-01', note: JSON.stringify({ name: 'Cúm dịch vụ Vaxigrip', disease: 'Cúm A/B' }) },
        { vaccineId: 'custom-123', date: '2025-09-01', note: JSON.stringify({ name: 'Cúm dịch vụ Vaxigrip', disease: 'Cúm A/B' }) }, // Trùng
        { vaccineId: 'custom-456', date: '2025-10-01', note: JSON.stringify({ name: 'Phế cầu Synflorix', disease: 'Phế cầu khuẩn' }) }
    ];

    const customVaccines = rawRecords
        .filter(r => r.vaccineId && r.vaccineId.startsWith('custom-'))
        .map(r => {
            const noteObj = JSON.parse(r.note || '{}');
            return {
                id: r.vaccineId,
                name: noteObj.name,
                disease: noteObj.disease,
                category: 'Mũi tiêm dịch vụ ngoài'
            };
        });

    const uniqueCustom = customVaccines.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    assert.equal(uniqueCustom.length, 2, 'Lọc chính xác 2 mũi dịch vụ không trùng lặp');
    assert.equal(uniqueCustom[0].name, 'Cúm dịch vụ Vaxigrip');
    assert.equal(uniqueCustom[1].name, 'Phế cầu Synflorix');
});

test('Phase 5: Vaccine progress percentage calculation', () => {
    const totalCount = 30;
    const completedCount = 15;
    const percentage = Math.round((completedCount / totalCount) * 100);
    assert.equal(percentage, 50, 'Tiến độ 15/30 mũi phải ra đúng 50%');

    const completedZero = 0;
    assert.equal(Math.round((completedZero / totalCount) * 100), 0, '0 mũi hoàn thành = 0%');

    const completedAll = 30;
    assert.equal(Math.round((completedAll / totalCount) * 100), 100, '30/30 mũi hoàn thành = 100%');
});
