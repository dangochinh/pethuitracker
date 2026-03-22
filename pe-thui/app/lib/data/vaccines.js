export const VACCINES = [
  // INFANCY (0-6 MONTHS)
  { id: 'bcg', name: 'Lao (BCG)', disease: 'Lao', recommendedAge: 0, category: 'Sơ sinh' },
  { id: 'hepb-0', name: 'Viêm gan B - Sơ sinh', disease: 'Viêm gan B', recommendedAge: 0, category: 'Sơ sinh' },
  
  { id: '6in1-1', name: '6 trong 1 - Mũi 1', disease: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, VGB, Hib', recommendedAge: 2, category: '2 tháng' },
  { id: 'pneumo-1', name: 'Phế cầu - Mũi 1', disease: 'Viêm phổi, Viêm màng não, Viêm tai giữa', recommendedAge: 2, category: '2 tháng' },
  { id: 'rota-1', name: 'Rota virus - Mũi 1', disease: 'Tiêu chảy cấp', recommendedAge: 2, category: '2 tháng' },
  { id: 'meningo-b-1', name: 'Não mô cầu B - Mũi 1', disease: 'Viêm màng não nhóm B', recommendedAge: 2, category: '2 tháng' },
  
  { id: '6in1-2', name: '6 trong 1 - Mũi 2', disease: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, VGB, Hib', recommendedAge: 3, category: '3 tháng' },
  { id: 'pneumo-2', name: 'Phế cầu - Mũi 2', disease: 'Viêm phổi, Viêm màng não, Viêm tai giữa', recommendedAge: 3, category: '3 tháng' },
  { id: 'rota-2', name: 'Rota virus - Mũi 2', disease: 'Tiêu chảy cấp', recommendedAge: 3, category: '3 tháng' },
  
  { id: '6in1-3', name: '6 trong 1 - Mũi 3', disease: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, VGB, Hib', recommendedAge: 4, category: '4 tháng' },
  { id: 'pneumo-3', name: 'Phế cầu - Mũi 3', disease: 'Viêm phổi, Viêm màng não, Viêm tai giữa', recommendedAge: 4, category: '4 tháng' },
  { id: 'rota-3', name: 'Rota virus - Mũi 3', disease: 'Tiêu chảy cấp', recommendedAge: 4, category: '4 tháng' },
  { id: 'meningo-b-2', name: 'Não mô cầu B - Mũi 2', disease: 'Viêm màng não nhóm B', recommendedAge: 4, category: '4 tháng' },
  
  { id: 'flu-1', name: 'Cúm - Mũi 1', disease: 'Cúm mùa', recommendedAge: 6, category: '6 tháng' },
  { id: 'meningo-bc-1', name: 'Não mô cầu B+C - Mũi 1', disease: 'Viêm màng não nhóm B, C', recommendedAge: 6, category: '6 tháng' },
  
  { id: 'flu-2', name: 'Cúm - Mũi 2', disease: 'Cúm mùa', recommendedAge: 7, category: '7 tháng' },
  
  // 9-12 MONTHS
  { id: 'meningo-bc-2', name: 'Não mô cầu B+C - Mũi 2', disease: 'Viêm màng não nhóm B, C', recommendedAge: 9, category: '9 tháng' },
  { id: 'je-1', name: 'Viêm não Nhật Bản - Mũi 1', disease: 'Viêm não Nhật Bản', recommendedAge: 9, category: '9 tháng' },
  { id: 'mmr-1', name: 'Sởi, Quai bị, Rubella - Mũi 1', disease: 'Sởi, Quai bị, Rubella', recommendedAge: 9, category: '9 tháng' },
  
  { id: 'pneumo-4', name: 'Phế cầu - Mũi 4', disease: 'Viêm phổi, Viêm màng não, Viêm tai giữa', recommendedAge: 12, category: '12 tháng' },
  { id: 'chickenpox-1', name: 'Thủy đậu - Mũi 1', disease: 'Thủy đậu', recommendedAge: 12, category: '12 tháng' },
  { id: 'hepa-1', name: 'Viêm gan A - Mũi 1', disease: 'Viêm gan A', recommendedAge: 12, category: '12 tháng' },
  { id: 'meningo-acyw-1', name: 'Não mô cầu ACYW - Liều 1', disease: 'Viêm màng não ACYW', recommendedAge: 12, category: '12 tháng' },
  
  // TODDLER (15-24 MONTHS)
  { id: '6in1-4', name: '6 trong 1 - Nhắc lại', disease: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, VGB, Hib', recommendedAge: 18, category: '18 tháng' },
  { id: 'mmr-2', name: 'Sởi, Quai bị, Rubella - Mũi 2', disease: 'Sởi, Quai bị, Rubella', recommendedAge: 18, category: '18 tháng' },
  { id: 'chickenpox-2', name: 'Thủy đậu - Mũi 2', disease: 'Thủy đậu', recommendedAge: 18, category: '18 tháng' },
  { id: 'hepa-2', name: 'Viêm gan A - Mũi 2', disease: 'Viêm gan A', recommendedAge: 18, category: '18 tháng' },
  
  // PRESCHOOL & SCHOOL AGE (2-8 YEARS)
  { id: 'typhoid', name: 'Thương hàn', disease: 'Thương hàn', recommendedAge: 24, category: '24 tháng' },
  { id: 'je-2', name: 'Viêm não Nhật Bản - Mũi 2', disease: 'Viêm não Nhật Bản', recommendedAge: 24, category: '24 tháng' },
  { id: 'tả', name: 'Tả (Uống)', disease: 'Bệnh Tả', recommendedAge: 24, category: '24 tháng' },
  { id: 'meningo-acyw-2', name: 'Não mô cầu ACYW - Nhắc lại', disease: 'Viêm màng não ACYW', recommendedAge: 36, category: '3 tuổi' },
  
  { id: 'dpt-5', name: 'DPT/Bại liệt - Nhắc lại', disease: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt', recommendedAge: 48, category: '4-6 tuổi' },
  { id: 'mmr-3', name: 'Sởi, Quai bị, Rubella - Nhắc lại', disease: 'Sởi, Quai bị, Rubella', recommendedAge: 48, category: '4-6 tuổi' },
  { id: 'dengue-1', name: 'Sốt xuất huyết - Mũi 1', disease: 'Sốt xuất huyết', recommendedAge: 48, category: '4-6 tuổi' },
  { id: 'dengue-2', name: 'Sốt xuất huyết - Mũi 2', disease: 'Sốt xuất huyết', recommendedAge: 51, category: '4-6 tuổi' },
  
  { id: 'flu-annual', name: 'Cúm hàng năm', disease: 'Cúm mùa', recommendedAge: 120, category: 'Hàng năm' }
];
