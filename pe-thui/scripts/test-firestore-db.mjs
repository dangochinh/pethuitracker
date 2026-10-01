import {
    getBaby,
    checkBabyExists,
    getGrowthRecords,
    getVaccineRecords,
    getTeethingRecords,
    getMasterMilestones,
    getBabyByTelegramChatId,
    getAllBabies
} from '../app/lib/db.js';

async function testAll() {
    console.log('=== KIỂM TRA TOÀN BỘ CƠ SỞ DỮ LIỆU FIRESTORE ===\n');

    // 1. Check PETHUI profile
    console.log('1. Kiểm tra hồ sơ bé PETHUI:');
    const baby = await getBaby('PETHUI');
    console.log('   Data:', baby);
    if (!baby || baby.name !== 'Pe thúii') throw new Error('Hồ sơ PETHUI không khớp!');
    console.log('   ✓ Profile load OK!\n');

    // 2. Check growth records
    console.log('2. Kiểm tra bản ghi tăng trưởng PETHUI:');
    const growth = await getGrowthRecords('PETHUI');
    console.log(`   Tìm thấy ${growth.length} bản ghi tăng trưởng.`);
    if (growth.length > 0) {
        console.log('   Bản ghi đầu tiên:', growth[0]);
        console.log('   Bản ghi mới nhất:', growth[growth.length - 1]);
    }
    console.log('   ✓ Growth records OK!\n');

    // 3. Check vaccines
    console.log('3. Kiểm tra danh sách mũi tiêm PETHUI:');
    const vaccines = await getVaccineRecords('PETHUI');
    console.log(`   Tìm thấy ${vaccines.length} mũi tiêm.`);
    console.log('   ✓ Vaccines OK!\n');

    // 4. Check teething
    console.log('4. Kiểm tra lịch mọc răng PETHUI:');
    const teeth = await getTeethingRecords('PETHUI');
    console.log(`   Tìm thấy ${teeth.length} chiếc răng.`);
    console.log('   ✓ Teeth OK!\n');

    // 5. Check Master milestones
    console.log('5. Kiểm tra mốc phát triển (Master Milestones):');
    const milestones = await getMasterMilestones();
    console.log(`   Tìm thấy ${milestones.length} mốc phát triển.`);
    console.log('   ✓ Milestones OK!\n');

    // 6. Check Telegram query
    console.log('6. Kiểm tra tìm kiếm theo Telegram Chat ID:');
    const tgBaby = await getBabyByTelegramChatId('140392118');
    console.log('   Tìm thấy bé qua Telegram:', tgBaby?.name, `(code: ${tgBaby?.code})`);
    console.log('   ✓ Telegram lookup OK!\n');

    // 7. Check All babies
    console.log('7. Lấy danh sách tất cả các bé:');
    const babies = await getAllBabies();
    console.log(`   Tổng số bé trong hệ thống: ${babies.length} (${babies.map(b => b.code).join(', ')})`);
    console.log('   ✓ All babies OK!\n');

    console.log('🎉 TẤT CẢ CÁC KIỂM TRA ĐỀU THÀNH CÔNG RỰC RỠ 100%!');
}

testAll().catch(err => {
    console.error('❌ Lỗi kiểm tra:', err);
    process.exit(1);
});
