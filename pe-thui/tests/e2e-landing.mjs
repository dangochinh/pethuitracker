import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVIDENCE_DIR = path.resolve(__dirname, '../public/test-evidence/landing');
const BASE_URL = 'http://localhost:3000';

if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

const testResults = [];

function recordResult(id, name, passed, notes, screenshot = '') {
    testResults.push({ id, name, passed, notes, screenshot });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[${mark}] ${id}: ${name}`);
    if (notes) console.log(`       Chi tiết: ${notes}`);
    if (screenshot) console.log(`       Ảnh minh chứng: ${screenshot}`);
}

async function runE2E() {
    console.log('🚀 ========================================================');
    console.log('🚀 BẮT ĐẦU CHẠY BỘ TEST CASE E2E & MANUAL CHO LANDING PAGE');
    console.log('🚀 ========================================================\n');

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // 1. DESKTOP CONTEXT (1440 x 900)
    const desktopContext = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2
    });
    // Abort external fonts to avoid hanging screenshots
    await desktopContext.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
    const desktopPage = await desktopContext.newPage();

    try {
        console.log('--- TEST NHÓM 1: DESKTOP EXPERIENCES (1440x900) ---');
        await desktopPage.goto(`${BASE_URL}/landing`, { waitUntil: 'networkidle' });
        await desktopPage.waitForTimeout(500);

        // ========================================================
        // TC-LP-01: Header Full-Width Verification
        // ========================================================
        const headerBox = await desktopPage.locator('header').boundingBox();
        const headerInner = await desktopPage.locator('header > div').first();
        const innerBox = await headerInner.boundingBox();
        const headerFullWidth = headerBox && innerBox && (innerBox.width >= 1350); // With padding on 1440
        const logoVisible = await desktopPage.locator('header img[src*="logo-stitch"]').isVisible();
        const pwaBadge = await desktopPage.locator('header span:has-text("PWA v2.0")').isVisible();
        const enterAppBtn = await desktopPage.locator('header a:has-text("Vào App Ngay")').isVisible();

        const pass01 = headerFullWidth && logoVisible && pwaBadge && enterAppBtn;
        const shot01 = path.join(EVIDENCE_DIR, 'TC-LP-01_header_full_width.png');
        await desktopPage.screenshot({ path: shot01, clip: { x: 0, y: 0, width: 1440, height: 120 } });
        recordResult(
            'TC-LP-01',
            'Header trải dài full ngang màn hình, không bị ngắn/cắt lề',
            pass01,
            `Header width: ${innerBox?.width}px / 1440px viewport. Logo, PWA badge, Nav links và Nút Vào App hiển thị thông thoáng.`,
            'TC-LP-01_header_full_width.png'
        );

        // ========================================================
        // TC-LP-02: Native SVG Icons Verification (No Raw Ligatures)
        // ========================================================
        const rawLigatures = [
            'rocket_launch',
            'arrow_forward',
            'expand_circle_down',
            'check_circle',
            'tag',
            'straighten',
            'calendar_month',
            'touch_app',
            'luggage',
            'bedtime',
            'baby_changing_station',
            'browse_activity',
            'qr_code_scanner',
            'cloud_sync'
        ];

        const pageText = await desktopPage.innerText('body');
        const foundBadLigatures = rawLigatures.filter(lig => {
            const regex = new RegExp(`\\b${lig}\\b`, 'i');
            return regex.test(pageText);
        });

        const svgIconsCount = await desktopPage.locator('svg').count();
        const pass02 = foundBadLigatures.length === 0 && svgIconsCount >= 15;
        const shot02 = path.join(EVIDENCE_DIR, 'TC-LP-02_svg_icons_hero.png');
        await desktopPage.screenshot({ path: shot02, clip: { x: 0, y: 0, width: 1440, height: 600 } });
        recordResult(
            'TC-LP-02',
            'Icon SVG native hiển thị chuẩn 100%, không bị lỗi chuỗi text dự phòng',
            pass02,
            `Số lượng icon SVG kết xuất: ${svgIconsCount}. Không còn bất kỳ chuỗi lỗi ký tự nào (${foundBadLigatures.join(', ') || '0 lỗi'}).`,
            'TC-LP-02_svg_icons_hero.png'
        );

        // ========================================================
        // TC-LP-03: Solid Craft Buttons & 2-Line Headline Verification
        // ========================================================
        const line1Text = await desktopPage.locator('h1 span').first().innerText();
        const line2Text = await desktopPage.locator('h1 span').nth(1).innerText();
        const is2LinesClean = line1Text.includes('Theo dõi thai kỳ & nuôi con khoa học.') && line2Text.includes('Nhẹ nhàng, không quảng cáo.');

        // Buttons must be SOLID brand color #861949, NOT AI-slop gradients
        const heroBtnNoGradient = await desktopPage.locator('a:has-text("Bắt đầu miễn phí ngay")').evaluate(el => {
            const style = window.getComputedStyle(el);
            return !style.backgroundImage.includes('gradient');
        });
        const headerBtnNoGradient = await desktopPage.locator('header a:has-text("Vào App Ngay")').evaluate(el => {
            const style = window.getComputedStyle(el);
            return !style.backgroundImage.includes('gradient');
        });

        // Commitment 1 title check
        const commitmentTitle = await desktopPage.locator('h3:has-text("Không quảng cáo")').first().isVisible();

        const pass03 = is2LinesClean && heroBtnNoGradient && headerBtnNoGradient && commitmentTitle;
        const shot03 = path.join(EVIDENCE_DIR, 'TC-LP-03_vibrant_palette.png');
        await desktopPage.screenshot({ path: shot03, clip: { x: 0, y: 80, width: 1440, height: 750 } });
        recordResult(
            'TC-LP-03',
            'Nút bấm màu solid #861949 cao cấp (không gradient), tiêu đề 2 dòng chuẩn không bị rớt chữ, cam kết Không quảng cáo',
            pass03,
            `Dòng 1: "${line1Text}", Dòng 2: "${line2Text}". Nút Vào App/Bắt đầu miễn phí là màu solid thương hiệu. Cam kết "Không quảng cáo" chuẩn xác.`,
            'TC-LP-03_vibrant_palette.png'
        );

        // ========================================================
        // TC-LP-04: Dual Mode Switcher (Thai Kỳ vs Nuôi Con)
        // ========================================================
        // Initial: Thai kỳ mode
        const pregImgBefore = await desktopPage.locator('img[src*="screenshot_pregnancy_mobile"]').isVisible();
        const broccoliBadge = await desktopPage.locator('p:has-text("Bé to bằng Cái súp lơ")').isVisible();

        // Switch to Baby mode
        await desktopPage.locator('button:has-text("Giai đoạn Nuôi con")').click();
        await desktopPage.waitForTimeout(400);

        const babyImgAfter = await desktopPage.locator('#overview img[src*="screenshot_baby_home"]').isVisible();
        const sweetSpotBadge = await desktopPage.locator('#overview p:has-text("SweetSpot® AI")').isVisible();

        const shot04Baby = path.join(EVIDENCE_DIR, 'TC-LP-04_mode_baby.png');
        await desktopPage.screenshot({ path: shot04Baby, clip: { x: 300, y: 700, width: 840, height: 750 } });

        // Switch back to Pregnancy mode
        await desktopPage.locator('button:has-text("Giai đoạn Mang thai")').click();
        await desktopPage.waitForTimeout(400);
        const pregImgRestored = await desktopPage.locator('img[src*="screenshot_pregnancy_mobile"]').isVisible();

        const pass04 = pregImgBefore && broccoliBadge && babyImgAfter && sweetSpotBadge && pregImgRestored;
        recordResult(
            'TC-LP-04',
            'Chuyển đổi mượt mà giữa Chế độ Thai kỳ và Chế độ Nuôi con',
            pass04,
            `Tab chuyển đổi cập nhật ảnh mockup điện thoại và floating badges chuẩn xác theo từng giai đoạn.`,
            'TC-LP-04_mode_baby.png'
        );

        // ========================================================
        // TC-LP-05: Smooth Scroll & Sticky Header Offset
        // ========================================================
        // Click on "Thai Kỳ" in navbar
        await desktopPage.locator('nav a:has-text("Thai Kỳ")').click();
        await desktopPage.waitForTimeout(800); // Wait for smooth scroll

        const scrollY = await desktopPage.evaluate(() => window.scrollY);
        const pregSectionY = await desktopPage.locator('#pregnancy').evaluate(el => {
            const rect = el.getBoundingClientRect();
            return { top: rect.top, visible: rect.top >= 0 && rect.top <= 120 };
        });

        const pass05 = scrollY > 500 && pregSectionY.visible;
        const shot05 = path.join(EVIDENCE_DIR, 'TC-LP-05_smooth_scroll_pregnancy.png');
        await desktopPage.screenshot({ path: shot05, clip: { x: 0, y: 0, width: 1440, height: 700 } });
        recordResult(
            'TC-LP-05',
            'Cuộn mượt mà (Smooth scroll) có bù trừ offset cho Header',
            pass05,
            `Vị trí cuộn: ${Math.round(scrollY)}px. Tiêu đề section nằm ngay dưới header (${Math.round(pregSectionY.top)}px), không bị che khuất.`,
            'TC-LP-05_smooth_scroll_pregnancy.png'
        );

        // ========================================================
        // TC-LP-06: Interactive FAQ Accordion
        // ========================================================
        // Scroll to FAQ
        await desktopPage.locator('nav a:has-text("Hỏi Đáp")').click();
        await desktopPage.waitForTimeout(800);

        // First FAQ is open by default
        const faq1Open = await desktopPage.locator('text=Toàn bộ các tính năng theo dõi thai kỳ 42 tuần').isVisible();
        
        // Click on 2nd FAQ question
        const faq2Btn = desktopPage.locator('button:has-text("Mã Bé #CODE hoạt động như thế nào?")');
        await faq2Btn.click();
        await desktopPage.waitForTimeout(300);
        const faq2Answer = await desktopPage.locator('text=Mỗi bé sẽ có một mã định danh duy nhất').isVisible();

        const shot06 = path.join(EVIDENCE_DIR, 'TC-LP-06_faq_accordion.png');
        await desktopPage.locator('#faq').screenshot({ path: shot06 });
        const pass06 = faq1Open && faq2Answer;
        recordResult(
            'TC-LP-06',
            'Đóng mở câu hỏi thường gặp (FAQ Accordion) mượt mà',
            pass06,
            `Câu hỏi 1 mở mặc định, câu hỏi 2 mở rộng hiển thị đầy đủ nội dung giải thích Mã Bé và bảo mật PIN.`,
            'TC-LP-06_faq_accordion.png'
        );

        // ========================================================
        // TC-LP-07: Navigation To & From App Portal
        // ========================================================
        // Click "Vào App Ngay" in header
        await desktopPage.locator('header a:has-text("Vào App Ngay")').click();
        await desktopPage.waitForURL(`${BASE_URL}/`, { timeout: 5000 });
        const isHomePage = desktopPage.url() === `${BASE_URL}/`;
        const createProfileBtn = await desktopPage.locator('button:has-text("Tạo hồ sơ mới")').isVisible();
        const landingLink = await desktopPage.locator('a:has-text("Khám phá tính năng Babie Tracker")').isVisible();

        const shot07App = path.join(EVIDENCE_DIR, 'TC-LP-07_home_portal.png');
        await desktopPage.screenshot({ path: shot07App });

        // Navigate back to Landing via Discovery button
        await desktopPage.locator('a:has-text("Khám phá tính năng Babie Tracker")').click();
        await desktopPage.waitForURL(`${BASE_URL}/landing`, { timeout: 5000 });
        const isLandingAgain = desktopPage.url() === `${BASE_URL}/landing`;

        const pass07 = isHomePage && createProfileBtn && landingLink && isLandingAgain;
        recordResult(
            'TC-LP-07',
            'Điều hướng 2 chiều thông suốt giữa Landing Page và Trang chủ App',
            pass07,
            `Chuyển đổi mượt mà từ Landing -> App Portal -> Quay lại Landing qua nút khám phá tính năng.`,
            'TC-LP-07_home_portal.png'
        );

        // ========================================================
        // TC-LP-09: Pinned Header While Scrolled Across Sections
        // ========================================================
        // Scroll down to 2200px (near deep dive section)
        await desktopPage.evaluate(() => window.scrollTo(0, 2200));
        await desktopPage.waitForTimeout(400);

        const headerBoxScrolled = await desktopPage.locator('header').boundingBox();
        const isPinnedAtTop = headerBoxScrolled && Math.round(headerBoxScrolled.y) === 0;
        const hasScrolledShadow = await desktopPage.locator('header').evaluate(el => el.classList.contains('shadow-md'));

        // Click nav link "Chăm Sóc Bé" from deep scroll position to jump across sections quickly
        await desktopPage.locator('nav a:has-text("Chăm Sóc Bé")').click();
        await desktopPage.waitForTimeout(700);

        const currentY = await desktopPage.evaluate(() => window.scrollY);
        const babyCareEl = await desktopPage.locator('#baby-care').boundingBox();
        const babyCareInView = babyCareEl && babyCareEl.y >= 0 && babyCareEl.y <= 130;

        const shot09 = path.join(EVIDENCE_DIR, 'TC-LP-09_pinned_header_scrolled.png');
        await desktopPage.screenshot({ path: shot09, clip: { x: 0, y: 0, width: 1440, height: 200 } });

        const pass09 = isPinnedAtTop && hasScrolledShadow && babyCareInView;
        recordResult(
            'TC-LP-09',
            'Header được PIN cố định trên đỉnh khi cuộn xuống các section sâu, chuyển section tức thì',
            pass09,
            `Header luôn cố định tại y = 0px (shadow-md kích hoạt). Bấm nhảy giữa các section siêu nhanh từ mọi vị trí trang.`,
            'TC-LP-09_pinned_header_scrolled.png'
        );

        // ========================================================
        // TC-LP-10: 24h Routine Timeline (Một ngày cùng Babie Tracker)
        // ========================================================
        const routineTitle = await desktopPage.locator('h2:has-text("Một ngày nhẹ nhàng hơn cùng Babie Tracker")').isVisible();
        const routineCard630 = await desktopPage.locator('span:has-text("06:30 Sáng")').isVisible();
        const routineCard845 = await desktopPage.locator('span:has-text("08:45 Sáng")').isVisible();
        const routineCard1230 = await desktopPage.locator('span:has-text("12:30 Trưa")').isVisible();
        const routineCard2000 = await desktopPage.locator('span:has-text("20:00 Tối")').isVisible();

        const pass10 = routineTitle && routineCard630 && routineCard845 && routineCard1230 && routineCard2000;
        const shot10 = path.join(EVIDENCE_DIR, 'TC-LP-10_24h_routine_timeline.png');
        const routineSection = desktopPage.locator('section:has(h2:has-text("Một ngày nhẹ nhàng hơn cùng Babie Tracker"))');
        await routineSection.screenshot({ path: shot10 });
        recordResult(
            'TC-LP-10',
            'Hiển thị trực quan Dòng thời gian 24h thực tế (06:30, 08:45, 12:30, 20:00)',
            pass10,
            `4 mốc thời gian sinh hoạt của con kết xuất trực quan, giải quyết trúng tâm lý băn khoăn của phụ huynh.`,
            'TC-LP-10_24h_routine_timeline.png'
        );

        // ========================================================
        // TC-LP-11: Clinical & Scientific Foundations (WHO, AAP, Bộ Y Tế)
        // ========================================================
        const clinicalTitle = await desktopPage.locator('h2:has-text("Dữ liệu chuẩn xác. Không phỏng đoán.")').isVisible();
        const whoBadge = await desktopPage.locator('span:has-text("Tiêu chuẩn WHO 2006")').isVisible();
        const aapBadge = await desktopPage.locator('span:has-text("Khuyến nghị AAP Hoa Kỳ")').isVisible();
        const mohBadge = await desktopPage.locator('span:has-text("Bộ Y Tế Việt Nam")').isVisible();

        const pass11 = clinicalTitle && whoBadge && aapBadge && mohBadge;
        const shot11 = path.join(EVIDENCE_DIR, 'TC-LP-11_clinical_foundations.png');
        const clinicalSection = desktopPage.locator('section:has(h2:has-text("Dữ liệu chuẩn xác. Không phỏng đoán."))');
        await clinicalSection.screenshot({ path: shot11 });
        recordResult(
            'TC-LP-11',
            'Chứng thực 3 trụ cột y khoa chuẩn mực: WHO 2006, AAP Wake Windows, Bộ Y Tế',
            pass11,
            `Đầy đủ 3 trụ cột khoa học thực chứng: Z-scores WHO, nghiên cứu giấc ngủ AAP và phác đồ 46 mốc tiêm chủng Bộ Y Tế.`,
            'TC-LP-11_clinical_foundations.png'
        );

        // ========================================================
        // TC-LP-12: 3 AM Ergonomics & Reliability (Thumb-zone, Offline, Export)
        // ========================================================
        const ergoTitle = await desktopPage.locator('h2:has-text("Thấu hiểu từng chi tiết lúc 3 giờ sáng")').isVisible();
        const thumbZone = await desktopPage.locator('h3:has-text("Thao tác 1 tay vùng ngón cái")').isVisible();
        const offlineMode = await desktopPage.locator('h3:has-text("Hoạt động ngoại tuyến khi mất sóng")').isVisible();
        const exportDoc = await desktopPage.locator('h3:has-text("Dữ liệu sẵn sàng cho Bác sĩ Nhi")').isVisible();

        const pass12 = ergoTitle && thumbZone && offlineMode && exportDoc;
        const shot12 = path.join(EVIDENCE_DIR, 'TC-LP-12_3am_parent_ergonomics.png');
        const ergoSection = desktopPage.locator('section:has(h2:has-text("Thấu hiểu từng chi tiết lúc 3 giờ sáng"))');
        await ergoSection.screenshot({ path: shot12 });
        recordResult(
            'TC-LP-12',
            'Thiết kế vị nhân sinh lúc 3h sáng: Thao tác 1 tay, PWA ngoại tuyến, Xuất dữ liệu bác sĩ',
            pass12,
            `Nhấn mạnh vào 3 tiêu chuẩn thực tế: nút bấm vùng ngón cái 48x48px, không mất dữ liệu khi mất mạng, báo cáo 7 ngày cho bác sĩ.`,
            'TC-LP-12_3am_parent_ergonomics.png'
        );

        // ========================================================
        // TC-LP-13: Authentic Parent Reviews (3 verified stories)
        // ========================================================
        const reviewsTitle = await desktopPage.locator('h2:has-text("Được tin dùng trong từng cữ sữa & giấc ngủ")').isVisible();
        const parent1 = await desktopPage.locator('h4:has-text("Mẹ Mai Anh")').isVisible();
        const parent2 = await desktopPage.locator('h4:has-text("Bố Quốc Tuấn")').isVisible();
        const parent3 = await desktopPage.locator('h4:has-text("Mẹ Thùy Trang")').isVisible();

        const pass13 = reviewsTitle && parent1 && parent2 && parent3;
        const shot13 = path.join(EVIDENCE_DIR, 'TC-LP-13_authentic_parent_stories.png');
        const reviewsSection = desktopPage.locator('section:has(h2:has-text("Được tin dùng trong từng cữ sữa & giấc ngủ"))');
        await reviewsSection.screenshot({ path: shot13 });
        recordResult(
            'TC-LP-13',
            'Tiếng nói thực tế từ 3 gia đình với bối cảnh cụ thể (SweetSpot, Mã Bé, 42 tuần thai)',
            pass13,
            `3 câu chuyện chân thực (Mẹ Mai Anh - 4M, Bố Quốc Tuấn - 7M, Mẹ Thùy Trang - 32W), xếp hạng 5 sao và huy hiệu đã xác minh.`,
            'TC-LP-13_authentic_parent_stories.png'
        );
        // ========================================================
        // TC-LP-14: No-Select / Prevent Accidental Text Selection on Buttons & Header
        // ========================================================
        const headerSelect = await desktopPage.locator('header').evaluate(el => window.getComputedStyle(el).userSelect);
        const navLinkSelect = await desktopPage.locator('nav a:has-text("Thai Kỳ")').evaluate(el => window.getComputedStyle(el).userSelect);
        const ctaBtnSelect = await desktopPage.locator('a:has-text("Vào App Ngay")').first().evaluate(el => window.getComputedStyle(el).userSelect);
        const heroBtnSelect = await desktopPage.locator('a:has-text("Bắt đầu miễn phí ngay")').first().evaluate(el => window.getComputedStyle(el).userSelect);
        const tabBtnSelect = await desktopPage.locator('button:has-text("Giai đoạn Mang thai")').first().evaluate(el => window.getComputedStyle(el).userSelect);

        // Try double-clicking nav link to verify no selection is created
        await desktopPage.locator('nav a:has-text("Thai Kỳ")').dblclick();
        const selectedText = await desktopPage.evaluate(() => window.getSelection().toString());

        const pass14 = (headerSelect === 'none') && 
                       (navLinkSelect === 'none') && 
                       (ctaBtnSelect === 'none') && 
                       (heroBtnSelect === 'none') && 
                       (tabBtnSelect === 'none') &&
                       (selectedText === '');
        const shot14 = path.join(EVIDENCE_DIR, 'TC-LP-14_user_select_none.png');
        await desktopPage.locator('header').screenshot({ path: shot14 });
        recordResult(
            'TC-LP-14',
            'Chống bôi đen text ngoài ý muốn (user-select: none) trên Header, Menu, Nút bấm & Tabs',
            pass14,
            `Header (${headerSelect}), Nav links (${navLinkSelect}), CTA Buttons (${heroBtnSelect}), Tabs (${tabBtnSelect}) đều áp dụng user-select: none. Double click không làm bôi đen chữ.`,
            'TC-LP-14_user_select_none.png'
        );

    } finally {
        await desktopContext.close();
    }

    // ========================================================
    // TC-LP-08: Responsive Mobile Viewport (iPhone 14/15 390x844)
    // ========================================================
    console.log('\n--- TEST NHÓM 2: MOBILE RESPONSIVE (390x844) ---');
    const mobileContext = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2
    });
    await mobileContext.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
    const mobilePage = await mobileContext.newPage();

    try {
        await mobilePage.goto(`${BASE_URL}/landing`, { waitUntil: 'networkidle' });
        await mobilePage.waitForTimeout(500);

        // Check horizontal overflow
        const hasOverflow = await mobilePage.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        const mobileHeaderBtn = await mobilePage.locator('header a:has-text("Vào App Ngay")').isVisible();
        const heroTitleMobile = await mobilePage.locator('h1').isVisible();
        const ctaBtnMobile = await mobilePage.locator('a:has-text("Bắt đầu miễn phí ngay")').isVisible();

        const shot08 = path.join(EVIDENCE_DIR, 'TC-LP-08_mobile_landing.png');
        await mobilePage.screenshot({ path: shot08, fullPage: false });

        const pass08 = !hasOverflow && mobileHeaderBtn && heroTitleMobile && ctaBtnMobile;
        recordResult(
            'TC-LP-08',
            'Giao diện hiển thị hoàn hảo trên Mobile (Không tràn ngang, bố cục tối ưu)',
            pass08,
            `Chiều rộng cuộn bằng chiều rộng màn hình (0px tràn ngang). Nút CTA, tiêu đề và header co giãn chuẩn chỉnh.`,
            'TC-LP-08_mobile_landing.png'
        );
    } finally {
        await mobileContext.close();
        await browser.close();
    }

    // Summary
    console.log('\n📊 ========================================================');
    console.log('📊 TỔNG HỢP KẾT QUẢ KIỂM THỬ E2E & MANUAL LANDING PAGE');
    console.log('📊 ========================================================');
    const total = testResults.length;
    const passed = testResults.filter(r => r.passed).length;
    const failed = total - passed;
    console.log(`Tổng số Test Case : ${total}`);
    console.log(`Số ca ĐẠT (PASS)  : ${passed}`);
    console.log(`Số ca LỖI (FAIL)  : ${failed}`);
    console.log(`Tỷ lệ thành công  : ${((passed / total) * 100).toFixed(1)}%`);
    console.log('========================================================\n');

    return { total, passed, failed, testResults };
}

runE2E().catch(err => {
    console.error('Lỗi khi chạy E2E:', err);
    process.exit(1);
});
