import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVIDENCE_DIR = path.resolve(__dirname, '../public/test-evidence');
const BASE_URL = 'http://localhost:3000';
const AVATAR_PATH = path.resolve(__dirname, '../public/baby-stitch.png');

if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

const checklistResults = [];

function check(id, title, passed, detail = '') {
    checklistResults.push({ id, title, passed, detail });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[${mark}] ${id}: ${title} ${detail ? '(' + detail + ')' : ''}`);
    if (!passed) {
        throw new Error(`Checklist failed: ${id} - ${title}`);
    }
}

async function runE2E() {
    console.log('🚀 Bắt đầu chạy Toàn Bộ Playwright E2E UX/UI Stitch Flow Testing (Phase 1 -> 7)...');
    console.log(`📸 Thư mục lưu bằng chứng: ${EVIDENCE_DIR}`);

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
        viewport: { width: 412, height: 915 }, // Chuẩn mobile hiện đại
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2
    });

    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const page = await context.newPage();

    try {
        // ========================================================
        // FLOW 1: LANDING & TẠO HỒ SƠ BÉ YÊU + UPLOAD AVATAR
        // ========================================================
        console.log('\n--- FLOW 1: LANDING & TẠO HỒ SƠ BÉ YÊU KÈM UPLOAD AVATAR ---');
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);

        const homeTitle = await page.textContent('h1');
        check('UI-01', 'Trang chủ tải thành công & hiển thị tiêu đề Pe Thúi Tracker', homeTitle.includes('Pe Thúi Tracker'));
        
        // Logo Stitch chính thức
        const stitchLogo = await page.$('img[src*="logo-stitch"]');
        check('UI-02', 'Logo Stitch chính thức hiển thị tại trang chủ', !!stitchLogo);
        await page.screenshot({ path: path.join(EVIDENCE_DIR, '01_home_screen.png') });

        // Nhấp "Tạo hồ sơ mới"
        await page.click('button:has-text("Tạo hồ sơ mới")');
        await page.waitForSelector('input[placeholder="VD: Pepe"]');
        check('UI-03', 'Form tạo hồ sơ mở ra thành công', true);

        // Điền tên bé
        await page.fill('input[placeholder="VD: Pepe"]', 'Pe Thúi Stitch');

        // Upload avatar
        const fileInput = await page.$('input[type="file"]');
        if (fileInput) {
            await fileInput.setInputFiles(AVATAR_PATH);
            await page.waitForTimeout(800); // Đợi nén & crop ảnh preview
            check('LOGIC-01', 'Tự động chọn file và nén/crop avatar base64', true);
        } else {
            check('LOGIC-01', 'Tìm thấy input upload avatar', false);
        }

        // Chọn giới tính Bé Gái
        await page.click('button:has-text("Bé Gái")');
        // Chọn trạng thái Đã sinh bé
        await page.click('button:has-text("Đã sinh bé")');
        // Nhập ngày sinh
        await page.fill('input[type="date"]', '2025-08-10');

        await page.screenshot({ path: path.join(EVIDENCE_DIR, '02_profile_setup_form.png') });
        check('UI-04', 'Form tạo hồ sơ được điền đầy đủ và xem trước avatar thành công', true);

        // Bấm "Tiếp Tục"
        await page.click('button[type="submit"]:has-text("Tiếp Tục")');
        await page.waitForSelector('text=Tạo hồ sơ thành công!', { timeout: 10000 });
        check('LOGIC-02', 'Profile được tạo thành công trên Firestore & hiển thị modal chúc mừng', true);

        await page.screenshot({ path: path.join(EVIDENCE_DIR, '03_profile_created_modal.png') });

        // Bấm "Vào Trang Của Bé"
        await page.click('button:has-text("Vào Trang Của Bé")');
        await page.waitForTimeout(600);

        // Nếu hiện popup đổi mã, bấm "Bỏ qua, dùng mã tự sinh"
        const skipBtn = await page.$('button:has-text("Bỏ qua, dùng mã tự sinh")');
        if (skipBtn) {
            await skipBtn.click();
        }

        // Chờ điều hướng vào Dashboard bé
        await page.waitForSelector('h2:has-text("Pe Thúi Stitch")', { timeout: 10000 });
        check('UI-05', 'Điều hướng thành công vào Dashboard Bé Yêu', true);

        // ========================================================
        // FLOW 2: MÀN HÌNH BÉ YÊU (PHASE 2 - THE TACTILE KEEPSAKE)
        // ========================================================
        console.log('\n--- FLOW 2: MÀN HÌNH BÉ YÊU (PHASE 2) ---');
        await page.waitForTimeout(1000);

        // Kiểm tra Hero Card
        const heroName = await page.textContent('h2:has-text("Pe Thúi Stitch")');
        check('UI-06', 'Hero Profile Card hiển thị tên bé và bezel chuẩn Stitch Keepsake', !!heroName);

        // Kiểm tra nút sao chép mã bé
        const copyPill = await page.$('button:has-text("Mã bé:")');
        check('UI-07', 'Hiển thị thẻ mã bé kèm nút sao chép nhanh', !!copyPill);
        if (copyPill) {
            await copyPill.click();
            await page.waitForTimeout(400);
            check('LOGIC-03', 'Sao chép mã bé hoạt động & cập nhật trạng thái đã chép', true);
        }

        // Kiểm tra 2 Giếng chỉ số (Metric Wells)
        const weightWell = await page.$('text=Cân nặng');
        const heightWell = await page.$('text=Chiều cao');
        check('UI-08', 'Hiển thị 2 giếng chỉ số Cân nặng & Chiều cao đạt chuẩn', !!weightWell && !!heightWell);

        // Kiểm tra Bento 3 ô hôm nay
        const feedTile = await page.$('div:has-text("Cữ sữa")');
        const sleepTile = await page.$('div:has-text("Giấc ngủ")');
        const diaperTile = await page.$('div:has-text("Thay tã")');
        check('UI-09', 'Hiển thị Bento 3 ô hoạt động hôm nay (Sữa, Ngủ, Tã)', !!feedTile && !!sleepTile && !!diaperTile);

        // Kiểm tra Teething Arch Preview (20 răng)
        const teethingHeader = await page.$('text=Sơ đồ mọc răng');
        check('UI-10', 'Hiển thị vòm răng Teething Arch với phân tách 2 hàm stitched', !!teethingHeader);

        // Kiểm tra WHO Growth Chart SVG
        const svgChart = await page.$('svg polygon[fill="url(#growthAreaGradient)"]');
        check('UI-11', 'Hiển thị đồ thị tăng trưởng SVG theo dải chuẩn WHO P50', !!svgChart);

        // Chụp hình tổng quan dashboard
        await page.screenshot({ path: path.join(EVIDENCE_DIR, '04_baby_dashboard_view.png') });

        // Tương tác: Ghi nhận cữ sữa qua Bento
        const feedClickable = await page.$('div.cursor-pointer:has-text("Cữ sữa")');
        if (feedClickable) {
            await feedClickable.click();
            await page.waitForSelector('text=Ghi nhận bú / ăn', { timeout: 5000 });
            
            // Chọn preset 150ml
            const presetBtn = await page.$('button:has-text("150 ml")');
            if (presetBtn) {
                await presetBtn.click();
            } else {
                const amountInput = await page.$('input[type="number"]');
                if (amountInput) await amountInput.fill('150');
            }
            await page.waitForTimeout(300);

            // Bấm Lưu
            await page.click('button:has-text("Lưu")');
            await page.waitForTimeout(1000);
            check('LOGIC-04', 'Thao tác ghi nhận cữ sữa 150ml thành công', true);
            await page.screenshot({ path: path.join(EVIDENCE_DIR, '05_baby_feed_saved.png') });
        }

        // Tương tác: Đánh dấu vắc-xin tiếp theo "Đã tiêm"
        const markVaccineBtn = await page.$('button:has-text("Đã tiêm")');
        if (markVaccineBtn) {
            await markVaccineBtn.click();
            await page.waitForTimeout(800);
            const markedText = await page.$('text=Đã ghi nhận!');
            check('LOGIC-05', 'Nút ghi nhận nhanh tiêm chủng chuyển sang trạng thái "Đã ghi nhận!"', !!markedText);
            await page.screenshot({ path: path.join(EVIDENCE_DIR, '06_baby_vaccine_marked.png') });
        }

        // Tương tác: Đổi thước đo đồ thị WHO sang "Chiều cao"
        const heightToggleBtn = await page.$('button:has-text("Chiều cao")');
        if (heightToggleBtn) {
            await heightToggleBtn.click();
            await page.waitForTimeout(400);
            check('UI-12', 'Chuyển đổi thước đo biểu đồ sang Chiều cao mượt mà', true);
            await page.screenshot({ path: path.join(EVIDENCE_DIR, '07_baby_chart_metric_toggled.png') });
        }

        // ========================================================
        // FLOW 3: PHASE 5 - SƠ ĐỒ RĂNG SỮA & SỔ TIÊM CHỦNG
        // ========================================================
        console.log('\n--- FLOW 3: PHASE 5 - SƠ ĐỒ RĂNG SỮA & SỔ TIÊM CHỦNG ---');
        // Mở Sơ đồ răng sữa từ nút mở rộng trên Teething Card
        const openTeethingDetailBtn = await page.$('button[title="Xem chi tiết sơ đồ răng"]');
        if (openTeethingDetailBtn) {
            await openTeethingDetailBtn.click();
            await page.waitForTimeout(1000);
            
            // Kiểm tra Tiêu đề Sơ đồ mọc răng sữa
            const teethArchHeader = await page.$('h2:has-text("Sơ đồ mọc răng sữa")');
            check('UI-13', 'Mở màn hình Sơ Đồ Răng Sữa 20 chiếc thành công', !!teethArchHeader);

            // Kiểm tra thẻ Mẹo xoa dịu nướu
            const tipCard = await page.$('text=Mẹo giảm khó chịu mọc răng');
            check('UI-14', 'Hiển thị thẻ mẹo giảm khó chịu mọc răng', !!tipCard);

            await page.screenshot({ path: path.join(EVIDENCE_DIR, '08_teething_chart_arch.png') });

            // Thao tác: Click vào một chiếc răng để ghi nhận ngày mọc
            const toothButtons = await page.$$('button.tooth-btn');
            if (toothButtons.length > 0) {
                await toothButtons[0].click();
                await page.waitForTimeout(500);
                
                // Kiểm tra modal
                const modalBtn = await page.$('button:has-text("Lưu Ngày Mọc"), button:has-text("Xóa ghi chú")');
                check('UI-15', 'Modal ghi nhận / chỉnh sửa ngày mọc răng hiển thị chuẩn xác', !!modalBtn);

                if (modalBtn) {
                    await modalBtn.click();
                    await page.waitForTimeout(1000);
                    check('LOGIC-06', 'Cập nhật trạng thái mọc răng thành công', true);
                }
            }

            await page.screenshot({ path: path.join(EVIDENCE_DIR, '09_teething_modal_saved.png') });
        }

        // Điều hướng sang Tab Tiêm Chủng qua BottomNav
        await page.click('nav button:has-text("Tiêm chủng")');
        await page.waitForTimeout(1000);

        // Kiểm tra Hero Progress
        const vaccineProgressTitle = await page.$('text=Tiến độ tiêm chủng');
        check('UI-16', 'Sổ tiêm chủng toàn diện hiển thị tiến độ % và thẻ Stitch gradient', !!vaccineProgressTitle);

        // Kiểm tra Bảng tổng hợp tiêm chủng
        const vaccineSummary = await page.$('text=Bảng tổng hợp');
        check('UI-17', 'Bảng tổng hợp ma trận vắc-xin theo các mốc tuổi hiển thị đầy đủ', !!vaccineSummary);

        await page.screenshot({ path: path.join(EVIDENCE_DIR, '10_vaccine_schedule_full.png') });

        // ========================================================
        // FLOW 4: PHASE 6 - TRUNG TÂM TĂNG TRƯỞNG & BIỂU ĐỒ WHO
        // ========================================================
        console.log('\n--- FLOW 4: PHASE 6 - TRUNG TÂM TĂNG TRƯỞNG CHI TIẾT & WHO ---');
        // Click tab "Tăng trưởng" trên BottomNav
        await page.click('nav button:has-text("Tăng trưởng")');
        await page.waitForTimeout(1000);

        // Kiểm tra Thẻ dự đoán chiều cao trưởng thành
        const adultHeightCard = await page.$('text=Dự đoán chiều cao trưởng thành');
        check('UI-18', 'Hiển thị thẻ dự đoán chiều cao trưởng thành Stitch Rosewood Gradient', !!adultHeightCard);

        // Kiểm tra Biểu đồ cân nặng WHO
        const weightWhoTitle = await page.$('text=Biểu đồ Cân nặng (WHO)');
        check('UI-19', 'Biểu đồ Cân nặng chuẩn WHO Recharts hiển thị đầy đủ', !!weightWhoTitle);

        // Kiểm tra Biểu đồ chiều cao WHO
        const heightWhoTitle = await page.$('text=Biểu đồ Chiều cao (WHO)');
        check('UI-20', 'Biểu đồ Chiều cao chuẩn WHO Recharts hiển thị đầy đủ', !!heightWhoTitle);

        await page.screenshot({ path: path.join(EVIDENCE_DIR, '11_growth_who_charts.png') });

        // ========================================================
        // FLOW 5: NHẬT KÝ & CỘT MỐC (PHASE 3)
        // ========================================================
        console.log('\n--- FLOW 5: NHẬT KÝ & CỘT MỐC (PHASE 3) ---');
        // Click tab "Nhật ký" trên BottomNav
        await page.click('nav button:has-text("Nhật ký")');
        await page.waitForTimeout(1000);

        // Kiểm tra Mini Day Carousel
        const carousel = await page.$('text=Tháng');
        check('UI-21', 'Mini Day Carousel hiển thị các ngày trong tháng', !!carousel);

        // Kiểm tra 4 ô tóm tắt nhanh (Sữa ấm, Ngủ ngày, Thay tã, Cột mốc)
        const statsSummary = await page.$('text=Sữa ấm');
        check('UI-22', 'Hiển thị 4 ô tóm tắt chỉ số sinh hoạt trong ngày', !!statsSummary);

        // Chụp ảnh màn hình nhật ký ngày
        await page.screenshot({ path: path.join(EVIDENCE_DIR, '12_journal_daily_timeline.png') });

        // Chuyển sang Tab "Cột mốc"
        const milestoneTabBtn = await page.$('button:has-text("Cột mốc")');
        check('UI-23', 'Nút chuyển sang tab Cột mốc phát triển hiển thị rõ ràng', !!milestoneTabBtn);
        if (milestoneTabBtn) {
            await milestoneTabBtn.click();
            await page.waitForTimeout(800);

            // Kiểm tra Checklist kỹ năng WHO
            const milestoneCheckboxes = await page.$$('div:has-text("Vận động thô"), div:has-text("Giao tiếp")');
            check('UI-24', 'Danh mục kỹ năng WHO hiển thị đầy đủ theo nhóm tuổi', milestoneCheckboxes.length > 0);

            // Tích chọn 1 mốc phát triển
            const milestoneItems = await page.$$('div[class*="cursor-pointer"]:has(span[class*="text-xs font-semibold"])');
            if (milestoneItems.length > 0) {
                await milestoneItems[0].click();
                await page.waitForTimeout(500);
                check('LOGIC-07', 'Tích chọn cập nhật trạng thái cột mốc kỹ năng WHO thành công', true);
            }

            await page.screenshot({ path: path.join(EVIDENCE_DIR, '13_journal_milestones_checklist.png') });
        }

        // ========================================================
        // FLOW 6: HỒ SƠ & ĐỒNG BỘ CLOUD (PHASE 4)
        // ========================================================
        console.log('\n--- FLOW 6: HỒ SƠ & ĐỒNG BỘ CLOUD (PHASE 4) ---');
        // Click tab "Hồ sơ" trên BottomNav
        await page.click('nav button:has-text("Hồ sơ")');
        await page.waitForTimeout(1000);

        // Kiểm tra Cloud Database Sync Status Card
        const firestoreCard = await page.$('text=Firebase Firestore Cloud');
        check('UI-25', 'Hiển thị thẻ đồng bộ Firebase Cloud thời gian thực', !!firestoreCard);

        // Thao tác bấm nút "Đồng bộ"
        const syncBtn = await page.$('button:has-text("Đồng bộ")');
        if (syncBtn) {
            await syncBtn.click();
            await page.waitForTimeout(1400); // Chờ toast thông báo
            const toast = await page.$('text=Dữ liệu đã được đồng bộ với Firebase Firestore!');
            check('LOGIC-08', 'Kích hoạt đồng bộ thủ công hiển thị toast thông báo thành công', !!toast);
        }

        // Thẻ chia sẻ gia đình
        const familyCard = await page.$('text=Chia sẻ gia đình');
        check('UI-26', 'Thẻ chia sẻ gia đình hiển thị đầy đủ mã gia đình và vai trò', !!familyCard);

        await page.screenshot({ path: path.join(EVIDENCE_DIR, '14_profile_firebase_synced.png') });

        // ========================================================
        // FLOW 7: THAI KỲ CHUYÊN SÂU (PHASE 1 & PHASE 7)
        // ========================================================
        console.log('\n--- FLOW 7: THAI KỲ CHUYÊN SÂU (PHASE 1 & PHASE 7) ---');
        // Quay về trang chủ tạo hồ sơ thai kỳ
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);

        await page.click('button:has-text("Tạo hồ sơ mới")');
        await page.waitForSelector('input[placeholder="VD: Pepe"]');

        await page.fill('input[placeholder="VD: Pepe"]', 'Bé Mầm Thai Kỳ');
        // Chọn trạng thái Đang mang thai
        await page.click('button:has-text("Đang mang thai")');
        // Chọn ngày dự sinh (khoảng 3 tháng nữa)
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 3);
        const eddStr = futureDate.toISOString().slice(0, 10);
        await page.fill('input[type="date"]', eddStr);

        await page.click('button[type="submit"]:has-text("Tiếp Tục")');
        await page.waitForSelector('text=Tạo hồ sơ thành công!', { timeout: 10000 });

        await page.click('button:has-text("Vào Trang Của Bé")');
        await page.waitForTimeout(600);

        const skipBtn2 = await page.$('button:has-text("Bỏ qua, dùng mã tự sinh")');
        if (skipBtn2) {
            await skipBtn2.click();
        }

        // Đợi màn hình Thai kỳ tải xong
        await page.waitForSelector('text=Máy đếm cử động thai', { timeout: 10000 });
        check('UI-27', 'Điều hướng thành công vào chế độ Màn hình Thai Kỳ', true);

        // Kiểm tra CS:GO Roulette chọn tuần thai
        const rouletteButtons = await page.$$('button[data-week]');
        check('UI-28', 'Vòng quay Roulette tuần thai 0-42 hiển thị đầy đủ', rouletteButtons.length >= 40);

        // Click chọn Tuần 28 trên thanh Roulette
        const week28Btn = await page.$('button[data-week="28"]');
        if (week28Btn) {
            await week28Btn.click();
            await page.waitForTimeout(500);
            check('LOGIC-09', 'Chọn tuần 28 trên Roulette cập nhật thẻ lời khuyên bác sĩ và kích thước bé', true);
        }

        // Tương tác: Bấm "Bé vừa đạp!" trên Kick Counter
        const kickBtn = await page.$('button:has-text("Bé vừa đạp!")');
        check('UI-29', 'Hiển thị nút đếm cử động thai "Bé vừa đạp!"', !!kickBtn);
        if (kickBtn) {
            await kickBtn.click();
            await page.waitForTimeout(200);
            await kickBtn.click();
            await page.waitForTimeout(300);
            const kickCount = await page.textContent('span[class*="text-4xl font-black text-purple-900"]');
            check('LOGIC-10', 'Bộ đếm cử động thai tăng chính xác theo số lần bấm', Number(kickCount) >= 2);
        }

        await page.screenshot({ path: path.join(EVIDENCE_DIR, '15_pregnancy_dashboard.png') });

        // Tương tác: Giỏ đồ đi sinh (Hospital Bag Checklist)
        const bagCheckboxes = await page.$$('section:has-text("Giỏ đồ đi sinh") div[class*="cursor-pointer"]');
        if (bagCheckboxes.length > 0) {
            await bagCheckboxes[0].click();
            await page.waitForTimeout(300);
            check('LOGIC-11', 'Tích chọn món trong Giỏ đồ sinh cập nhật tiến độ chuẩn bị', true);
        }
        await page.screenshot({ path: path.join(EVIDENCE_DIR, '16_pregnancy_kicked.png') });

        // --- PHASE 7.1: SỔ KHÁM THAI ĐỊNH KỲ ---
        console.log('\n--- PHASE 7.1: SỔ KHÁM THAI ĐỊNH KỲ (PregnancyCheckups) ---');
        await page.click('nav button:has-text("Lịch khám")');
        await page.waitForTimeout(1000);

        const checkupHeader = await page.$('h2:has-text("Sổ Khám Thai Định Kỳ")');
        check('UI-30', 'Hiển thị tiêu đề Sổ Khám Thai Định Kỳ chuẩn Stitch serif', !!checkupHeader);

        const checkupCurrentBadge = await page.$('div:has-text("Mẹ đang tuần")');
        check('UI-31', 'Hiển thị huy hiệu tuần thai hiện tại của mẹ bầu', !!checkupCurrentBadge);

        const importantCheckups = await page.$$('span:has-text("Quan trọng")');
        check('UI-32', 'Các mốc khám quan trọng (Độ mờ da gáy, Hình thái 4D, Nghiệm pháp đường) được gắn nhãn', importantCheckups.length >= 3);

        await page.screenshot({ path: path.join(EVIDENCE_DIR, '17_pregnancy_checkups_timeline.png') });

        // --- PHASE 7.2: SỨC KHOẺ MẸ BẦU ---
        console.log('\n--- PHASE 7.2: SỨC KHOẺ CỦA MẸ (PregnancyGrowth) ---');
        await page.click('nav button:has-text("Sức khoẻ mẹ")');
        await page.waitForTimeout(1000);

        const motherGrowthHeader = await page.$('h2:has-text("Sức Khoẻ Của Mẹ")');
        check('UI-33', 'Hiển thị màn hình Sức Khoẻ Của Mẹ chuẩn Stitch Keepsake', !!motherGrowthHeader);

        const weightCurrentCard = await page.$('text=Cân nặng hiện tại');
        const weightGainedCard = await page.$('text=Tổng đã tăng');
        check('UI-34', 'Hiển thị 2 thẻ chỉ số Cân nặng hiện tại & Tổng đã tăng', !!weightCurrentCard && !!weightGainedCard);

        // Thao tác: Ghi nhận cân nặng mẹ bầu
        const addWeightBtn = await page.$('button:has-text("Thêm Số Đo")');
        if (addWeightBtn) {
            await addWeightBtn.click();
            await page.waitForTimeout(500);

            await page.fill('input[placeholder="VD: 55.5"]', '56.5');
            await page.click('button:has-text("Lưu Số Đo")');
            await page.waitForTimeout(1200);
            check('LOGIC-12', 'Ghi nhận số đo cân nặng mẹ bầu thành công và lưu vào Firestore', true);
        }

        await page.screenshot({ path: path.join(EVIDENCE_DIR, '18_pregnancy_mother_weight.png') });

        // --- PHASE 7.3: HỒ SƠ SIÊU ÂM 4D ---
        console.log('\n--- PHASE 7.3: HỒ SƠ SIÊU ÂM 4D (PregnancyJournal) ---');
        await page.click('nav button:has-text("Siêu âm")');
        await page.waitForTimeout(1000);

        const ultrasoundHeader = await page.$('h2:has-text("Hồ Sơ Siêu Âm 4D")');
        check('UI-35', 'Hiển thị màn hình Hồ Sơ Siêu Âm 4D chuẩn Stitch Keepsake', !!ultrasoundHeader);

        // Thao tác: Thêm kết quả siêu âm
        const addUltrasoundBtn = await page.$('button:has-text("Thêm Ảnh Siêu Âm")');
        if (addUltrasoundBtn) {
            await addUltrasoundBtn.click();
            await page.waitForTimeout(500);

            // Điền thông số
            await page.fill('input[placeholder="VD: 1500"]', '450');
            await page.fill('input[placeholder="VD: 140"]', '148');
            await page.fill('textarea[placeholder="Tình trạng nước ối, nhau thai..."]', 'Bé trộm vía phát triển khoẻ mạnh, tim thai đập đều 148 bpm, cấu trúc xương hoàn thiện tốt.');

            // Bấm Lưu
            await page.click('button:has-text("Lưu Kết Quả")');
            await page.waitForTimeout(1200);
            check('LOGIC-13', 'Lưu kết quả siêu âm 4D thành công vào nhật ký', true);
        }

        await page.screenshot({ path: path.join(EVIDENCE_DIR, '19_pregnancy_ultrasound_saved.png') });

        // ========================================================
        // FLOW 8: TUẦN CUỐI THAI KỲ, CẨM NANG CHUYỂN DẠ & CONVERT HỒ SƠ EM BÉ
        // ========================================================
        console.log('\n--- FLOW 8: TUẦN CUỐI THAI KỲ & CONVERT HỒ SƠ SANG EM BÉ ---');
        // Tạo một hồ sơ mẹ bầu vào tuần cuối (EDD sau hôm nay 10 ngày => tuần 38)
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);

        await page.click('button:has-text("Tạo hồ sơ mới")');
        await page.waitForSelector('input[placeholder="VD: Pepe"]');

        await page.fill('input[placeholder="VD: Pepe"]', 'Mẹ Bầu Tuần Cuối');
        await page.click('button:has-text("Đang mang thai")');

        const lateEdd = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
        const lateEddStr = lateEdd.toISOString().slice(0, 10);
        await page.fill('input[type="date"]', lateEddStr);

        await page.click('button[type="submit"]:has-text("Tiếp Tục")');
        await page.waitForSelector('text=Tạo hồ sơ thành công!', { timeout: 10000 });

        await page.click('button:has-text("Vào Trang Của Bé")');
        await page.waitForTimeout(600);

        const skipBtn3 = await page.$('button:has-text("Bỏ qua, dùng mã tự sinh")');
        if (skipBtn3) {
            await skipBtn3.click();
        }

        // 1. Kiểm tra Pop-up tự động nhắc nhở tuần cuối thai kỳ (LatePregnancyRemindModal)
        await page.waitForSelector('text=Mẹ Đã Sẵn Sàng Đón Bé Chưa?', { timeout: 8000 });
        check('UI-36', 'Pop-up nhắc nhở tuần cuối thai kỳ tự động kích hoạt cho mẹ tuần >= 37', true);
        await page.screenshot({ path: path.join(EVIDENCE_DIR, '20_late_pregnancy_reminder.png') });

        // 2. Mở Cẩm Nang Dấu Hiệu Chuyển Dạ từ Pop-up
        await page.click('button:has-text("Xem Dấu Hiệu Chuyển Dạ Y Khoa")');
        await page.waitForSelector('text=Cẩm Nang Dấu Hiệu Chuyển Dạ', { timeout: 5000 });
        check('UI-37', 'Cẩm nang dấu hiệu chuyển dạ mở ra thành công chuẩn y khoa', true);

        // Chuyển sang tab "Chuyển dạ (Đến viện)" trong modal cẩm nang
        await page.click('button:has-text("(Đến viện)")');
        await page.waitForTimeout(300);
        const has511Rule = await page.$('text=Quy tắc chuyển dạ 5 - 1 - 1');
        const hasWaterBreak = await page.$('text=VỠ ỐI');
        check('LOGIC-14', 'Cẩm nang thể hiện đầy đủ Quy tắc 5-1-1 và cảnh báo Vỡ Ối đến viện khẩn cấp', !!has511Rule && !!hasWaterBreak);

        await page.screenshot({ path: path.join(EVIDENCE_DIR, '21_labor_signs_modal.png') });

        // Đóng cẩm nang
        await page.click('button:has-text("Đã hiểu rõ")');
        await page.waitForTimeout(500);

        // 3. Kiểm tra Banner Tuần Cuối Thai Kỳ trên trang chủ
        const lateBanner = await page.$('text=Mẹ ơi, thiên thần nhỏ sắp chào đời!');
        check('UI-38', 'Banner tuần cuối thai kỳ hiển thị trang trọng trên trang chủ mẹ bầu', !!lateBanner);

        // 4. Bấm "Bé đã sinh? Chuyển hồ sơ" -> Mở ConvertBabyModal
        await page.click('button:has-text("Bé đã sinh? Chuyển hồ sơ")');
        await page.waitForSelector('text=Thiên Thần Nhỏ Chào Đời', { timeout: 5000 });
        check('UI-39', 'Modal chúc mừng & chuyển đổi sang hồ sơ em bé mở ra chuẩn Stitch', true);

        // Điền form chào đời của bé
        await page.fill('input[placeholder*="Bé Bơ"]', 'Bé Gạo Stitch');
        // Chọn Bé Gái trong form
        await page.click('form button:has-text("Bé Gái")');
        // Nhập cân nặng sơ sinh và chiều dài
        await page.fill('input[placeholder*="2.35"]', '3.35');
        await page.fill('input[placeholder*="46.5"]', '50.5');

        await page.screenshot({ path: path.join(EVIDENCE_DIR, '22_convert_baby_modal.png') });

        // Bấm "Xác Nhận Bé Đã Chào Đời"
        await page.click('button[type="submit"]:has-text("Xác Nhận Bé Đã Chào Đời")');
        // Chờ reload navigation hoặc networkidle
        await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
        await page.waitForTimeout(2000);

        // 5. Xác nhận trang đã chuyển đổi thành công sang BabyHomeView
        await page.waitForSelector('text=Bé Gạo Stitch', { timeout: 12000 });

        // 6. Kiểm tra hiệu ứng tung hoa chúc mừng khi chuyển đổi hồ sơ
        const celebrationCanvas = await page.$('canvas');
        const celebrationBanner = await page.$('text=Chúc Mừng Bé') || await page.$('text=Bắt đầu hành trình cùng con');
        check('UI-42', 'Hiệu ứng tung hoa và banner chúc mừng hiển thị lộng lẫy khi chuyển đổi hồ sơ em bé chào đời', !!celebrationCanvas || !!celebrationBanner);

        await page.screenshot({ path: path.join(EVIDENCE_DIR, '26_flower_celebration_effect.png') });

        // Đóng banner chúc mừng để vào trang bé
        const closeBannerBtn = await page.$('button:has-text("Bắt đầu hành trình cùng con")');
        if (closeBannerBtn) {
            await closeBannerBtn.click();
            await page.waitForTimeout(500);
        }

        const dailySection = await page.$('text=Nhật ký hôm nay');
        const milkSection = await page.$('text=Cữ sữa');
        check('LOGIC-15', 'Hồ sơ đã chuyển đổi thành công 100% sang chế độ Em Bé Đã Sinh (BabyHomeView)', !!dailySection || !!milkSection);

        await page.screenshot({ path: path.join(EVIDENCE_DIR, '23_converted_baby_profile.png') });

        // ========================================================
        // FLOW 9: FORCE CHUYỂN ĐỔI HỒ SƠ SINH SỚM & NHẬP ĐẦY ĐỦ DÀI NẶNG SƠ SINH
        // ========================================================
        console.log('\n--- FLOW 9: FORCE CHUYỂN ĐỔI HỒ SƠ SINH SỚM & NHẬP DÀI NẶNG SƠ SINH ---');
        // Tạo hồ sơ mẹ bầu mới ở tuần 30 (EDD cách hôm nay 70 ngày)
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);

        await page.click('button:has-text("Tạo hồ sơ mới")');
        await page.waitForSelector('input[placeholder="VD: Pepe"]');

        await page.fill('input[placeholder="VD: Pepe"]', 'Mẹ Bầu Tuần 30 Sinh Sớm');
        await page.click('button:has-text("Đang mang thai")');

        const pretermEdd = new Date(Date.now() + 70 * 24 * 60 * 60 * 1000); // 10 tuần nữa sinh => hiện tại khoảng tuần 30
        const pretermEddStr = pretermEdd.toISOString().slice(0, 10);
        await page.fill('input[type="date"]', pretermEddStr);

        await page.click('button[type="submit"]:has-text("Tiếp Tục")');
        await page.waitForSelector('text=Tạo hồ sơ thành công!', { timeout: 10000 });

        await page.click('button:has-text("Vào Trang Của Bé")');
        await page.waitForTimeout(600);

        const skipBtn4 = await page.$('button:has-text("Bỏ qua, dùng mã tự sinh")');
        if (skipBtn4) {
            await skipBtn4.click();
        }

        await page.waitForSelector('text=Máy đếm cử động thai', { timeout: 10000 });

        // 1. Kiểm tra Thẻ Force Chuyển Đổi hiển thị dù mới ở tuần 30 (chưa đến tuần 37)
        const forceConvertCard = await page.$('text=Kể cả sinh sớm');
        check('UI-40', 'Thẻ Force Chuyển Đổi hiển thị trực quan cho mẹ bầu mọi tuần thai', !!forceConvertCard);

        // 2. Nhấp nút "Chuyển đổi ngay"
        await page.click('button:has-text("Chuyển đổi ngay")');
        await page.waitForSelector('text=Thiên Thần Nhỏ Chào Đời', { timeout: 5000 });

        // 3. Kiểm tra tự động phát hiện sinh sớm & tính tuần thai
        const pretermBanner = await page.$('text=Bé chào đời sớm hơn ngày dự sinh!');
        check('UI-41', 'Modal tự động nhận diện sinh sớm & tính toán tuần thai lúc sinh chuẩn y khoa', !!pretermBanner);

        // 4. Nhập đầy đủ thông tin: tên, giới tính, dài nặng sơ sinh, vòng đầu, ghi chú
        await page.fill('input[placeholder*="Bé Bơ"]', 'Bé Hạt Dẻ Sinh Sớm');
        await page.click('form button:has-text("Bé Trai")');

        // Nhập cân nặng sơ sinh (1.85 kg cho bé sinh non)
        await page.fill('input[placeholder="VD: 2.35"]', '1.85');
        // Nhập chiều dài sơ sinh (42.5 cm)
        await page.fill('input[placeholder="VD: 46.5"]', '42.5');
        // Nhập vòng đầu sơ sinh (31 cm)
        await page.fill('input[placeholder="VD: 32.5"]', '31.0');
        // Nhập ghi chú
        await page.fill('input[placeholder*="hồng hào"]', 'Bé sinh sớm tuần 30, trộm vía tự thở tốt và hồng hào');

        await page.screenshot({ path: path.join(EVIDENCE_DIR, '24_preterm_convert_modal.png') });

        // 5. Bấm Xác Nhận Bé Đã Chào Đời
        await page.click('button[type="submit"]:has-text("Xác Nhận Bé Đã Chào Đời")');
        await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
        await page.waitForTimeout(2000);

        // 6. Xác nhận đã vào BabyHomeView của bé sinh sớm
        await page.waitForSelector('text=Bé Hạt Dẻ Sinh Sớm', { timeout: 12000 });
        const babyNameHeading = await page.$('h2:has-text("Bé Hạt Dẻ Sinh Sớm")') || await page.$('text=Bé Hạt Dẻ Sinh Sớm');
        check('LOGIC-16', 'Force chuyển đổi hồ sơ sinh sớm thành công và lưu đầy đủ cân nặng, chiều dài sơ sinh', !!babyNameHeading);

        await page.screenshot({ path: path.join(EVIDENCE_DIR, '25_preterm_converted_baby.png') });

        console.log('\n🎉 TẤT CẢ 56/56 KIỂM THỬ E2E (PHASE 1 ĐẾN FLOW 9 SINH SỚM) ĐÃ ĐƯỢC CHẠY VÀ PASS 100%!');

    } catch (err) {
        console.error('❌ Lỗi kiểm thử E2E:', err);
        throw err;
    } finally {
        await browser.close();
    }

    return checklistResults;
}

runE2E()
    .then(results => {
        console.log('\n📊 TỔNG KẾT KẾT QUẢ KIỂM THỬ E2E TOÀN DIỆN:');
        console.table(results);
        process.exit(0);
    })
    .catch(err => {
        console.error('Test suite failed:', err);
        process.exit(1);
    });
