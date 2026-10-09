'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FaArrowRight,
    FaRocket,
    FaCircleChevronDown,
    FaCircleCheck,
    FaHashtag,
    FaRulerCombined,
    FaCalendarCheck,
    FaHeartPulse,
    FaSuitcaseMedical,
    FaMoon,
    FaDroplet,
    FaClockRotateLeft,
    FaQrcode,
    FaLock,
    FaCloudArrowUp,
    FaChevronDown,
    FaBaby,
    FaShieldHeart,
    FaChartLine,
    FaBolt,
    FaHeart,
    FaBookOpen,
    FaMobileScreen,
    FaQuoteLeft,
    FaFileExport,
    FaWifi,
    FaStar
} from 'react-icons/fa6';

export default function LandingPage() {
    const [modeTab, setModeTab] = useState('pregnancy'); // 'pregnancy' | 'baby'
    const [faqOpen, setFaqOpen] = useState([0]); // Open first FAQ by default
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('');

    const toggleFaq = (index) => {
        setFaqOpen(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 15);

            // Active section spy
            const sections = ['pregnancy', 'baby-care', 'family-sync', 'compare', 'faq'];
            const scrollPosition = window.scrollY + 130;
            let current = '';

            for (const sectionId of sections) {
                const el = document.getElementById(sectionId);
                if (el) {
                    const top = el.offsetTop;
                    const height = el.offsetHeight;
                    if (scrollPosition >= top && scrollPosition < top + height) {
                        current = sectionId;
                        break;
                    }
                }
            }
            if (current) setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Smooth scroll handler with offset for pinned sticky header
    const handleScrollTo = (e, id) => {
        if (e) e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const navOffset = 85;
            const targetY = element.getBoundingClientRect().top + window.pageYOffset - navOffset;
            window.scrollTo({
                top: targetY,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-[#fff6f6] via-[#fffbf9] to-[#fef2f4] text-gray-800 selection:bg-pink-200 selection:text-[#861949] overflow-x-hidden font-body pt-18 sm:pt-20">
            
            {/* 1. PINNED FIXED NAVIGATION BAR */}
            <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl transition-all duration-300 w-full select-none ${
                scrolled 
                    ? 'bg-white/95 shadow-md shadow-pink-950/10 border-b border-pink-200/90 py-0.5' 
                    : 'bg-white/90 shadow-xs border-b border-pink-200/60 py-1 sm:py-1.5'
            }`}>
                <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 h-16 sm:h-18 flex items-center justify-between">
                    
                    {/* Logo & Brand (Far Left) */}
                    <Link href="/" className="flex items-center gap-3 group shrink-0 select-none">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-0.5 bg-white border-2 border-pink-300/80 shadow-sm overflow-hidden transition-transform group-hover:scale-105 group-hover:rotate-3">
                            <img src="/logo-stitch.png" alt="Babie Tracker Logo" className="w-full h-full object-cover rounded-full" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-headline font-black text-xl sm:text-2xl text-gray-900 tracking-tight">
                                    Babie Tracker
                                </span>
                                <span className="hidden sm:inline-block text-[10px] font-black bg-gradient-to-r from-pink-500 to-[#861949] text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                                    PWA v2.0
                                </span>
                            </div>
                            <span className="text-[11px] text-[#861949]/70 font-semibold hidden sm:block">
                                Đồng bộ gia đình • Riêng tư & Miễn phí
                            </span>
                        </div>
                    </Link>

                    {/* Nav Links (Desktop Middle) with Active Section Highlights */}
                    <nav className="hidden lg:flex items-center gap-3 xl:gap-5 text-sm font-bold text-gray-700 select-none">
                        <a 
                            href="#pregnancy" 
                            onClick={(e) => handleScrollTo(e, 'pregnancy')}
                            className={`transition-all py-1.5 px-3 rounded-xl select-none ${
                                activeSection === 'pregnancy'
                                    ? 'text-[#861949] bg-pink-100/90 font-black shadow-2xs'
                                    : 'text-gray-700 hover:text-[#861949] hover:bg-pink-50/60'
                            }`}
                        >
                            Thai Kỳ
                        </a>
                        <a 
                            href="#baby-care" 
                            onClick={(e) => handleScrollTo(e, 'baby-care')}
                            className={`transition-all py-1.5 px-3 rounded-xl select-none ${
                                activeSection === 'baby-care'
                                    ? 'text-[#861949] bg-pink-100/90 font-black shadow-2xs'
                                    : 'text-gray-700 hover:text-[#861949] hover:bg-pink-50/60'
                            }`}
                        >
                            Chăm Sóc Bé
                        </a>
                        <a 
                            href="#family-sync" 
                            onClick={(e) => handleScrollTo(e, 'family-sync')}
                            className={`transition-all py-1.5 px-3 rounded-xl select-none ${
                                activeSection === 'family-sync'
                                    ? 'text-[#861949] bg-pink-100/90 font-black shadow-2xs'
                                    : 'text-gray-700 hover:text-[#861949] hover:bg-pink-50/60'
                            }`}
                        >
                            Mã Bé #CODE
                        </a>
                        <a 
                            href="#compare" 
                            onClick={(e) => handleScrollTo(e, 'compare')}
                            className={`transition-all py-1.5 px-3 rounded-xl select-none ${
                                activeSection === 'compare'
                                    ? 'text-[#861949] bg-pink-100/90 font-black shadow-2xs'
                                    : 'text-gray-700 hover:text-[#861949] hover:bg-pink-50/60'
                            }`}
                        >
                            So Sánh
                        </a>
                        <a 
                            href="#faq" 
                            onClick={(e) => handleScrollTo(e, 'faq')}
                            className={`transition-all py-1.5 px-3 rounded-xl select-none ${
                                activeSection === 'faq'
                                    ? 'text-[#861949] bg-pink-100/90 font-black shadow-2xs'
                                    : 'text-gray-700 hover:text-[#861949] hover:bg-pink-50/60'
                            }`}
                        >
                            Hỏi Đáp
                        </a>
                    </nav>

                    {/* CTA Actions (Far Right) */}
                    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 select-none">
                        <Link 
                            href="/" 
                            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-800 bg-white hover:bg-pink-50/70 border border-pink-200/80 shadow-2xs transition-all active:scale-95 select-none"
                        >
                            <FaHashtag className="text-[#861949] text-xs" />
                            <span>Nhập Mã Bé</span>
                        </Link>
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-headline font-bold text-white bg-[#861949] hover:bg-[#6f123c] shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer select-none"
                        >
                            <span>Vào App Ngay</span>
                            <FaArrowRight className="text-xs" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* 2. HERO SECTION */}
            <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
                {/* Vibrant Ambient Glow Mesh Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[480px] bg-gradient-to-tr from-pink-300/40 via-rose-200/35 to-amber-200/30 rounded-full blur-[100px] pointer-events-none -z-10" />
                <div className="absolute top-36 -right-24 w-80 h-80 bg-gradient-to-bl from-teal-200/40 to-emerald-200/30 rounded-full blur-[90px] pointer-events-none -z-10" />
                <div className="absolute top-48 -left-20 w-80 h-80 bg-gradient-to-tr from-purple-200/40 to-pink-200/30 rounded-full blur-[90px] pointer-events-none -z-10" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
                        

                        {/* Main Headline (2 Clean Lines, No Awkward Word-Wrap) */}
                        <h1 className="font-headline font-black text-2xl sm:text-4xl md:text-5xl text-gray-950 tracking-tight leading-tight mb-5">
                            <span className="block whitespace-normal sm:whitespace-nowrap">Theo dõi thai kỳ & nuôi con khoa học.</span>
                            <span className="block text-[#861949] whitespace-normal sm:whitespace-nowrap mt-2 sm:mt-3">Nhẹ nhàng, không quảng cáo.</span>
                        </h1>

                        {/* Human Subtitle (Anti AI-Slop) */}
                        <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto mb-8 font-medium">
                            Từ tuần đầu tiên biết tin con đến những đêm thức trắng chăm bé sơ sinh. 
                            Dự đoán giờ ngủ <strong className="text-[#861949] font-bold">SweetSpot®</strong> chống gắt ngủ, biểu đồ WHO chuẩn quốc tế và đồng bộ cả gia đình bằng <strong className="text-[#861949] font-bold">một Mã Bé duy nhất</strong>.
                        </p>

                        {/* CTA Buttons Row (Solid Craft Buttons, No AI-Slop Gradients) */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-7 select-none">
                            <Link 
                                href="/" 
                                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-base font-headline font-bold text-white bg-[#861949] hover:bg-[#6f123c] shadow-xs hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer select-none"
                            >
                                <span>Bắt đầu miễn phí ngay</span>
                                <FaRocket className="text-sm" />
                            </Link>
                            
                            <a 
                                href="#overview" 
                                onClick={(e) => handleScrollTo(e, 'overview')}
                                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-base font-headline font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 shadow-2xs transition-all active:scale-95 flex items-center justify-center gap-2 select-none"
                            >
                                <FaCircleChevronDown className="text-sm text-gray-500" />
                                <span>Xem các tính năng</span>
                            </a>
                        </div>

                        {/* Colorful Micro Guarantee Pills */}
                        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs select-none">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200 text-emerald-800 font-bold shadow-2xs select-none">
                                <FaCircleCheck className="text-emerald-500 text-xs" />
                                Không cần thẻ tín dụng
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50/90 border border-pink-200 text-pink-900 font-bold shadow-2xs select-none">
                                <FaCircleCheck className="text-pink-600 text-xs" />
                                Đồng bộ tức thì cả nhà
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50/90 border border-sky-200 text-sky-900 font-bold shadow-2xs select-none">
                                <FaCircleCheck className="text-sky-600 text-xs" />
                                Cài đặt PWA nhẹ & mượt
                            </span>
                        </div>
                    </div>

                    {/* HERO MOCKUP: REAL DEVICE PREVIEW WITH INTERACTIVE TABS */}
                    <div id="overview" className="max-w-4xl mx-auto pt-4">
                        
                        {/* Tab Switcher: Thai kỳ vs Em bé */}
                        <div className="flex justify-center mb-7 select-none">
                            <div className="inline-flex p-1.5 bg-pink-100/70 rounded-2xl border border-pink-200 shadow-inner select-none">
                                <button
                                    onClick={() => setModeTab('pregnancy')}
                                    className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-headline font-bold flex items-center gap-2 transition-all cursor-pointer select-none ${
                                        modeTab === 'pregnancy'
                                            ? 'bg-gradient-to-r from-[#861949] to-[#b3275c] text-white shadow-md shadow-pink-900/25 scale-[1.02]'
                                            : 'text-gray-700 hover:text-[#861949] hover:bg-white/60'
                                    }`}
                                >
                                    <span>🤰</span>
                                    <span>Giai đoạn Mang thai (42 Tuần)</span>
                                </button>
                                <button
                                    onClick={() => setModeTab('baby')}
                                    className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-headline font-bold flex items-center gap-2 transition-all cursor-pointer select-none ${
                                        modeTab === 'baby'
                                            ? 'bg-gradient-to-r from-[#861949] to-[#b3275c] text-white shadow-md shadow-pink-900/25 scale-[1.02]'
                                            : 'text-gray-700 hover:text-[#861949] hover:bg-white/60'
                                    }`}
                                >
                                    <span>👶</span>
                                    <span>Giai đoạn Nuôi con (Sơ sinh & Lớn khôn)</span>
                                </button>
                            </div>
                        </div>

                        {/* Device Frame Displaying Authentic Screenshot with Glow Backlight */}
                        <div className="relative mx-auto max-w-sm sm:max-w-md">
                            {/* Colorful Ambient Backlight */}
                            <div className="absolute -inset-4 bg-gradient-to-tr from-pink-400/30 via-rose-300/30 to-purple-400/30 rounded-[3.5rem] blur-2xl -z-10" />

                            <div className="rounded-[3rem] p-3 sm:p-4 bg-gray-950 shadow-2xl shadow-pink-950/25 ring-2 ring-gray-800">
                                {/* Realistic Phone Screen Bezel */}
                                <div className="relative bg-white rounded-[2.5rem] overflow-hidden border-4 border-gray-900 shadow-inner aspect-[9/19.5]">
                                    
                                    {modeTab === 'pregnancy' ? (
                                        <img 
                                            src="/landing/screenshot_pregnancy_mobile.png" 
                                            alt="Giao diện Thai kỳ Babie Tracker"
                                            className="w-full h-full object-cover object-top"
                                        />
                                    ) : (
                                        <img 
                                            src="/landing/screenshot_baby_home.png" 
                                            alt="Giao diện Chăm sóc bé Babie Tracker"
                                            className="w-full h-full object-cover object-top"
                                        />
                                    )}
                                </div>

                                {/* Floating Highlight Badges around the Phone */}
                                {modeTab === 'pregnancy' ? (
                                    <>
                                        <div className="hidden sm:flex absolute -left-12 top-24 bg-white/95 backdrop-blur-md border-2 border-pink-200 p-3.5 rounded-2xl shadow-xl shadow-pink-900/10 items-center gap-3 animate-in fade-in duration-300 select-none">
                                            <span className="text-3xl">🥦</span>
                                            <div>
                                                <p className="text-[10px] font-black text-pink-500 uppercase tracking-wider">Tuần 27</p>
                                                <p className="text-xs font-black text-gray-900">Bé to bằng Cái súp lơ</p>
                                                <p className="text-[11px] font-bold text-[#861949]">875g • 36.6cm</p>
                                            </div>
                                        </div>

                                        <div className="hidden sm:flex absolute -right-12 bottom-32 bg-white/95 backdrop-blur-md border-2 border-purple-200 p-3.5 rounded-2xl shadow-xl shadow-purple-900/10 items-center gap-3 animate-in fade-in duration-300 select-none">
                                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-xs shadow-2xs">
                                                42W
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-purple-500 uppercase tracking-wider">Thước đo thai kỳ</p>
                                                <p className="text-xs font-black text-gray-900">Khung ngắm tuần CS:GO</p>
                                                <p className="text-[11px] font-bold text-purple-700">Trượt 42 tuần mượt mà</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="hidden sm:flex absolute -left-12 top-28 bg-white/95 backdrop-blur-md border-2 border-indigo-200 p-3.5 rounded-2xl shadow-xl shadow-indigo-900/10 items-center gap-3 animate-in fade-in duration-300 select-none">
                                            <span className="text-3xl">💤</span>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">SweetSpot® AI</p>
                                                    <span className="text-[8px] bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black px-1.5 rounded-full">PRO</span>
                                                </div>
                                                <p className="text-xs font-black text-gray-900">Cữ tiếp theo: 14:30</p>
                                                <p className="text-[11px] font-bold text-indigo-600">Còn 25 phút • Chống gắt ngủ</p>
                                            </div>
                                        </div>

                                        <div className="hidden sm:flex absolute -right-12 bottom-28 bg-white/95 backdrop-blur-md border-2 border-pink-200 p-3.5 rounded-2xl shadow-xl shadow-pink-900/10 items-center gap-3 animate-in fade-in duration-300 select-none">
                                            <span className="text-3xl">🍼</span>
                                            <div>
                                                <p className="text-[10px] font-black text-pink-500 uppercase tracking-wider">Ghi nhận 1 chạm</p>
                                                <p className="text-xs font-black text-gray-900">Bú mẹ, bú bình, thay tã</p>
                                                <p className="text-[11px] font-bold text-[#861949]">Cả nhà thấy tức thì</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. CORE COMMITMENTS (WHY PARENTS LOVE BABIE TRACKER) */}
            <section className="py-16 sm:py-20 bg-white/90 border-y border-pink-200/70 shadow-xs">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-4xl mx-auto mb-12">
                        <span className="text-xs font-bold text-[#861949] uppercase tracking-widest bg-pink-100/80 px-3.5 py-1 rounded-full border border-pink-200">
                            Tôn chỉ sản phẩm
                        </span>
                        <h2 className="font-headline font-black text-2xl sm:text-3xl lg:text-4xl text-gray-950 mt-3 mb-3 whitespace-normal md:whitespace-nowrap">
                            Tại sao ba mẹ chọn Babie Tracker thay vì các app khác?
                        </h2>
                        <p className="text-sm text-gray-600 font-medium max-w-2xl mx-auto">
                            Không tính năng thừa, không làm phiền cha mẹ những lúc chăm con vất vả nhất.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {/* Commitment 1 */}
                        <div className="bg-gradient-to-b from-white to-rose-50/50 rounded-3xl p-6 sm:p-7 border-2 border-rose-100 shadow-sm hover:shadow-md hover:border-rose-300 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-[#861949] flex items-center justify-center text-2xl mb-5 shadow-2xs">
                                🚫
                            </div>
                            <h3 className="font-headline font-black text-lg text-gray-900 mb-2">
                                Không quảng cáo
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Nửa đêm bé khóc, mẹ mở app lên là để ghi nhận trong 3 giây. Chúng tôi cam kết không chèn banner chớp nháy, không bắt xem video 30 giây quảng cáo sữa hay bỉm.
                            </p>
                        </div>

                        {/* Commitment 2 */}
                        <div className="bg-gradient-to-b from-white to-purple-50/50 rounded-3xl p-6 sm:p-7 border-2 border-purple-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl mb-5 shadow-2xs">
                                🏷️
                            </div>
                            <h3 className="font-headline font-black text-lg text-gray-900 mb-2">
                                Một Mã Bé duy nhất (#CODE)
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Không bắt Bố, Mẹ, Ông, Bà phải nhớ từng tài khoản mật khẩu email. Chỉ cần nhập hoặc quét mã bé (Ví dụ: <code className="bg-purple-100 text-purple-900 px-1 rounded font-bold">#SOC</code>), cả nhà có thể cùng xem và cập nhật tức thì.
                            </p>
                        </div>

                        {/* Commitment 3 */}
                        <div className="bg-gradient-to-b from-white to-teal-50/50 rounded-3xl p-6 sm:p-7 border-2 border-teal-100 shadow-sm hover:shadow-md hover:border-teal-300 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-2xl mb-5 shadow-2xs">
                                🩺
                            </div>
                            <h3 className="font-headline font-black text-lg text-gray-900 mb-2">
                                Dựa trên y khoa chuẩn xác
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Biểu đồ tăng trưởng bách phân vị chuẩn WHO, lịch tiêm chủng theo Bộ Y Tế, thuật toán dự đoán giấc ngủ Wake Windows chuẩn Viện Hàn lâm Nhi khoa Hoa Kỳ (AAP).
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. DEEP DIVE: PREGNANCY MODE */}
            <section id="pregnancy" className="py-16 sm:py-24 bg-gradient-to-b from-[#fff5f7] to-[#fffbfc]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        
                        {/* Text and Features Column */}
                        <div className="flex-1 order-2 lg:order-1">
                            <span className="text-xs font-bold text-[#861949] uppercase tracking-widest bg-pink-100 px-3.5 py-1 rounded-full border border-pink-200">
                                Chế độ Thai Kỳ
                            </span>
                            <h2 className="font-headline font-black text-2xl sm:text-4xl text-gray-950 mt-3 mb-4 leading-tight">
                                Đồng hành cùng mẹ bầu qua 42 tuần thai kỳ trọn vẹn
                            </h2>
                            <p className="text-base text-gray-700 leading-relaxed mb-8 font-medium">
                                Mỗi tuần trôi qua là một cột mốc diệu kỳ. Babie Tracker giúp mẹ biết bé phát triển ra sao, khi nào cần đi khám và sẵn sàng cho ngày đón bé chào đời.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 bg-white/95 rounded-2xl border border-pink-200/80 shadow-xs">
                                    <div className="p-2.5 rounded-xl bg-pink-100/80 text-[#861949] shrink-0 mt-0.5">
                                        <FaRulerCombined className="text-lg" />
                                    </div>
                                    <div>
                                        <h4 className="font-headline font-black text-sm text-gray-900">Bé to bằng quả gì & Cân nặng theo tuần</h4>
                                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">So sánh kích thước trực quan với hoa quả, hiển thị cân nặng gram và chiều dài cm chuẩn y khoa từng tuần.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-white/95 rounded-2xl border border-teal-200/80 shadow-xs">
                                    <div className="p-2.5 rounded-xl bg-teal-100/80 text-teal-700 shrink-0 mt-0.5">
                                        <FaCalendarCheck className="text-lg" />
                                    </div>
                                    <div>
                                        <h4 className="font-headline font-black text-sm text-gray-900">Lịch mốc khám thai quan trọng</h4>
                                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">Tự động nhắc các mốc vàng: Siêu âm đo độ mờ da gáy 12W, hình thái học 22W, tiểu đường thai kỳ 26W, siêu âm Doppler 32W.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-white/95 rounded-2xl border border-purple-200/80 shadow-xs">
                                    <div className="p-2.5 rounded-xl bg-purple-100/80 text-purple-700 shrink-0 mt-0.5">
                                        <FaHeartPulse className="text-lg" />
                                    </div>
                                    <div>
                                        <h4 className="font-headline font-black text-sm text-gray-900">Máy đếm thai máy & Cơn gò chuyển dạ</h4>
                                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">Bấm đếm số lần bé đạp trong 1 giờ để phát hiện sớm suy thai; nhận biết cơn gò thật theo quy tắc 5-1-1 khi sắp sinh.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-white/95 rounded-2xl border border-amber-200/80 shadow-xs">
                                    <div className="p-2.5 rounded-xl bg-amber-100/80 text-amber-700 shrink-0 mt-0.5">
                                        <FaSuitcaseMedical className="text-lg" />
                                    </div>
                                    <div>
                                        <h4 className="font-headline font-black text-sm text-gray-900">Checklist giỏ đồ đi sinh & Cẩm nang Thai giáo</h4>
                                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">Danh sách đồ dùng mẹ & bé được chia ngăn thông minh, kèm bài tập thai giáo 5 giác quan theo ngày.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Real Screenshot Preview Column */}
                        <div className="flex-1 order-1 lg:order-2 w-full max-w-md lg:max-w-none flex justify-center">
                            <div className="relative rounded-3xl p-3 bg-white shadow-2xl shadow-pink-900/10 border-2 border-pink-200">
                                <img 
                                    src="/landing/screenshot_pregnancy.png" 
                                    alt="Màn hình Thai kỳ thực tế của Babie Tracker"
                                    className="rounded-2xl w-full h-auto max-h-[580px] object-contain shadow-xs"
                                />
                                <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-[#861949] to-[#b3275c] text-white p-3.5 rounded-2xl shadow-xl text-xs font-headline font-black flex items-center gap-2">
                                    <span className="text-xl">🤰</span>
                                    <span>Đo lường 42 tuần thai kỳ chuẩn</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. DEEP DIVE: BABY CARE & SWEETSPOT® */}
            <section id="baby-care" className="py-16 sm:py-24 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        
                        {/* Screenshot Preview Column */}
                        <div className="flex-1 w-full max-w-md lg:max-w-none flex justify-center">
                            <div className="relative rounded-3xl p-3 bg-white shadow-2xl shadow-indigo-900/10 border-2 border-indigo-200">
                                <img 
                                    src="/landing/screenshot_baby_home.png" 
                                    alt="Màn hình Chăm sóc bé Babie Tracker"
                                    className="rounded-2xl w-full h-auto max-h-[580px] object-contain shadow-xs"
                                />
                                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-3.5 rounded-2xl shadow-xl text-xs font-headline font-black flex items-center gap-1.5">
                                    <span>🌙 SweetSpot® AI</span>
                                    <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">Độc quyền</span>
                                </div>
                            </div>
                        </div>

                        {/* Text and Features Column */}
                        <div className="flex-1" id="sweetspot">
                            <span className="text-xs font-bold text-indigo-800 uppercase tracking-widest bg-indigo-100 px-3.5 py-1 rounded-full border border-indigo-200">
                                Chăm sóc bé & Rèn ngủ
                            </span>
                            <h2 className="font-headline font-black text-2xl sm:text-4xl text-gray-950 mt-3 mb-4 leading-tight">
                                Thấu hiểu nhịp sinh học của con. Tạm biệt những đêm gắt ngủ.
                            </h2>
                            <p className="text-base text-gray-700 leading-relaxed mb-8 font-medium">
                                Nỗi sợ lớn nhất của mẹ bỉm là bé bị quá mệt (overtired) dẫn đến quấy khóc không dỗ nổi. SweetSpot® giải quyết triệt để nỗi lo này.
                            </p>

                            <div className="space-y-4">
                                <div className="p-4.5 bg-gradient-to-r from-indigo-50/90 to-purple-50/60 rounded-2xl border-2 border-indigo-100 shadow-2xs">
                                    <div className="flex items-center gap-2.5 mb-1.5">
                                        <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                                            <FaMoon className="text-base" />
                                        </div>
                                        <h4 className="font-headline font-black text-sm text-indigo-950">
                                            Dự đoán giờ ngủ SweetSpot® (Chuẩn Wake Windows AAP)
                                        </h4>
                                    </div>
                                    <p className="text-xs text-indigo-900/80 leading-relaxed pl-10">
                                        Thuật toán y khoa tự động đọc giờ bé thức dậy và tuổi của bé để tính chính xác thời điểm mẹ cần dỗ ngủ, đếm ngược từng phút và cảnh báo trước khi bé bị gắt ngủ.
                                    </p>
                                </div>

                                <div className="p-4.5 bg-gradient-to-r from-amber-50/90 to-orange-50/60 rounded-2xl border-2 border-amber-100 shadow-2xs">
                                    <div className="flex items-center gap-2.5 mb-1.5">
                                        <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                                            <FaDroplet className="text-base" />
                                        </div>
                                        <h4 className="font-headline font-black text-sm text-amber-950">
                                            Ghi nhận cữ bú & thay tã trong 3 giây
                                        </h4>
                                    </div>
                                    <p className="text-xs text-amber-900/80 leading-relaxed pl-10">
                                        Bú mẹ có đồng hồ bấm giờ chia bên trái/phải; bú bình ghi nhanh lượng ml; theo dõi tã ướt/bẩn để đánh giá lượng sữa bé hấp thụ hàng ngày.
                                    </p>
                                </div>

                                <div className="p-4.5 bg-gradient-to-r from-teal-50/90 to-emerald-50/60 rounded-2xl border-2 border-teal-100 shadow-2xs">
                                    <div className="flex items-center gap-2.5 mb-1.5">
                                        <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
                                            <FaClockRotateLeft className="text-base" />
                                        </div>
                                        <h4 className="font-headline font-black text-sm text-teal-950">
                                            Dòng thời gian hoạt động trực quan
                                        </h4>
                                    </div>
                                    <p className="text-xs text-teal-900/80 leading-relaxed pl-10">
                                        Tổng hợp toàn bộ các cữ ăn, giấc ngủ, tã bỉm trong ngày thành một dòng thời gian liền mạch, giúp mẹ nhìn thấy ngay quy luật sinh hoạt của con.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5.5. A DAY IN THE LIFE (24H WITH BABIE TRACKER) */}
            <section className="py-16 sm:py-20 bg-[#fffbfc] border-y border-pink-100/70">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="text-xs font-bold text-[#861949] uppercase tracking-widest bg-pink-100/80 px-3.5 py-1 rounded-full border border-pink-200">
                            Thực tế từng ngày
                        </span>
                        <h2 className="font-headline font-black text-2xl sm:text-3xl text-gray-950 mt-3 mb-2 whitespace-normal md:whitespace-nowrap">
                            Một ngày nhẹ nhàng hơn cùng Babie Tracker
                        </h2>
                        <p className="text-sm text-gray-600 font-medium">
                            Từ sáng sớm tinh mơ đến đêm muộn, ứng dụng đồng hành như một người bạn thấu hiểu.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {/* 06:30 */}
                        <div className="bg-white p-5 rounded-2xl border border-pink-200/80 shadow-2xs hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-black text-[#861949] bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-200/60">06:30 Sáng</span>
                                <span className="text-lg">🌅</span>
                            </div>
                            <h4 className="font-headline font-bold text-sm text-gray-900 mb-1">Cữ bú đầu ngày & Đổi bên</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Bấm 1 chạm bắt đầu cữ bú mẹ. Đồng hồ đếm giờ chia bên ngực trái/phải giúp mẹ không bao giờ phải băn khoăn: "Vừa nãy bé bú bên nào nhỉ?".
                            </p>
                        </div>

                        {/* 08:45 */}
                        <div className="bg-white p-5 rounded-2xl border border-indigo-200/80 shadow-2xs hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60">08:45 Sáng</span>
                                <span className="text-lg">☀️</span>
                            </div>
                            <h4 className="font-headline font-bold text-sm text-gray-900 mb-1">SweetSpot® đón giấc ngủ ngày</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Thuật toán đọc thời gian thức, thông báo cữ nap 1 lúc 09:00. Mẹ chuẩn bị phòng trước 15 phút, bé vào giấc êm dịu không gắt khóc vì quá mệt.
                            </p>
                        </div>

                        {/* 12:30 */}
                        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-2xs hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">12:30 Trưa</span>
                                <span className="text-lg">🥪</span>
                            </div>
                            <h4 className="font-headline font-bold text-sm text-gray-900 mb-1">Ghi nhận lượng sữa & Tã bỉm</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Bà cho bé bú bình 130ml và thay tã ướt. Chỉ 3 giây thao tác, cả bố mẹ đều nắm được tình trạng tiêu hóa của con mà không cần ghi sổ tay.
                            </p>
                        </div>

                        {/* 20:00 */}
                        <div className="bg-white p-5 rounded-2xl border border-purple-200/80 shadow-2xs hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200/60">20:00 Tối</span>
                                <span className="text-lg">🌙</span>
                            </div>
                            <h4 className="font-headline font-bold text-sm text-gray-900 mb-1">Chốt ngày & Giấc ngủ đêm</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Tự động thống kê lượng sữa và số giờ ngủ trong ngày. Bố đi làm về mở điện thoại là an tâm biết con đã sinh hoạt nề nếp, ngủ say.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. DEEP DIVE: HEALTH, WHO CHARTS & TEETHING */}
            <section className="py-16 sm:py-24 bg-gradient-to-b from-[#fffbfc] to-[#fff6f8]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-4xl mx-auto mb-14">
                        <span className="text-xs font-bold text-teal-800 uppercase tracking-widest bg-teal-100 px-3.5 py-1 rounded-full border border-teal-200">
                            Sổ sức khỏe số
                        </span>
                        <h2 className="font-headline font-black text-2xl sm:text-3xl lg:text-4xl text-gray-950 mt-3 mb-3 whitespace-normal md:whitespace-nowrap">
                            Theo dõi tăng trưởng & Tiêm chủng chuẩn Bộ Y Tế
                        </h2>
                        <p className="text-sm text-gray-600 font-medium max-w-2xl mx-auto">
                            Tự tin mỗi khi đưa con đi khám định kỳ với đầy đủ dữ liệu tăng trưởng trong tay.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {/* WHO Chart Card */}
                        <div className="bg-white rounded-3xl p-5 border-2 border-pink-200/80 shadow-md hover:shadow-xl transition-all flex flex-col">
                            <div className="rounded-2xl overflow-hidden mb-4 border border-gray-100 aspect-video bg-gray-50">
                                <img 
                                    src="/landing/screenshot_growth.png" 
                                    alt="Biểu đồ WHO chuẩn quốc tế"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="font-headline font-black text-base text-gray-900 mb-1 flex items-center gap-2">
                                <FaChartLine className="text-pink-600 text-sm" />
                                <span>Biểu đồ tăng trưởng WHO</span>
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed flex-1">
                                Vẽ biểu đồ bách phân vị (Percentiles) Cân nặng và Chiều cao theo từng tháng tuổi, tự động đánh giá bé đạt chuẩn, nguy cơ suy dinh dưỡng hay béo phì.
                            </p>
                        </div>

                        {/* Vaccine Schedule Card */}
                        <div className="bg-white rounded-3xl p-5 border-2 border-purple-200/80 shadow-md hover:shadow-xl transition-all flex flex-col">
                            <div className="rounded-2xl overflow-hidden mb-4 border border-gray-100 aspect-video bg-gray-50">
                                <img 
                                    src="/landing/screenshot_vaccine.png" 
                                    alt="Lịch tiêm chủng đầy đủ"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="font-headline font-black text-base text-gray-900 mb-1 flex items-center gap-2">
                                <FaShieldHeart className="text-purple-600 text-sm" />
                                <span>Sổ tiêm chủng 46 mốc tiêu chuẩn</span>
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed flex-1">
                                Đầy đủ các mũi tiêm trong chương trình Tiêm chủng mở rộng và tiêm dịch vụ (Lao, 6in1, Phế cầu, Rota, Sởi...), tự đếm ngược ngày đến hẹn tiêm.
                            </p>
                        </div>

                        {/* Teething Arch Card */}
                        <div className="bg-white rounded-3xl p-5 border-2 border-teal-200/80 shadow-md hover:shadow-xl transition-all flex flex-col">
                            <div className="rounded-2xl overflow-hidden mb-4 border border-gray-100 aspect-video bg-gray-50">
                                <img 
                                    src="/landing/screenshot_teething.png" 
                                    alt="Sơ đồ mọc răng 20 chiếc"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="font-headline font-black text-base text-gray-900 mb-1 flex items-center gap-2">
                                <span className="text-sm">🦷</span>
                                <span>Sơ đồ mọc răng 20 chiếc sữa</span>
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed flex-1">
                                Trực quan hóa hình vòm cung 10 răng hàm trên và 10 răng hàm dưới. Chạm vào răng để ghi nhận ngày mọc, theo dõi thứ tự mọc răng sữa đúng chuẩn.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6.5. CLINICAL & SCIENTIFIC FOUNDATIONS */}
            <section className="py-16 sm:py-20 bg-white border-b border-pink-100/70">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-xs font-bold text-teal-800 uppercase tracking-widest bg-teal-100/80 px-3.5 py-1 rounded-full border border-teal-200">
                            Chứng thực khoa học
                        </span>
                        <h2 className="font-headline font-black text-2xl sm:text-3xl text-gray-950 mt-3 mb-2">
                            Dữ liệu chuẩn xác. Không phỏng đoán.
                        </h2>
                        <p className="text-sm text-gray-600 font-medium">
                            Mọi thuật toán gợi ý, biểu đồ và mốc phát triển trong Babie Tracker đều dựa trên các phác đồ y khoa chuẩn mực quốc tế và Bộ Y Tế.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* WHO 2006 */}
                        <div className="p-6 rounded-3xl bg-[#f8fbfa] border-2 border-teal-100/90 shadow-2xs hover:shadow-md transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-xl mb-4">
                                <FaChartLine />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                                Tiêu chuẩn WHO 2006
                            </span>
                            <h3 className="font-headline font-black text-base text-gray-900 mt-2 mb-2">
                                Biểu đồ bách phân vị Z-Scores
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Ứng dụng tích hợp bộ số liệu nghiên cứu đa trung tâm của Tổ chức Y tế Thế giới (WHO MGRS), so sánh chuẩn P3, P15, P50, P85, P97 theo tháng tuổi cho bé trai và bé gái.
                            </p>
                            <div className="mt-4 pt-3 border-t border-teal-100 text-[11px] font-semibold text-teal-900 flex items-center gap-1.5">
                                <FaCircleCheck className="text-teal-600 text-xs shrink-0" />
                                <span>Phát hiện sớm nguy cơ nhẹ cân / béo phì</span>
                            </div>
                        </div>

                        {/* AAP Sleep */}
                        <div className="p-6 rounded-3xl bg-[#fbf9fe] border-2 border-purple-100/90 shadow-2xs hover:shadow-md transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center text-xl mb-4">
                                <FaMoon />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/60">
                                Khuyến nghị AAP Hoa Kỳ
                            </span>
                            <h3 className="font-headline font-black text-base text-gray-900 mt-2 mb-2">
                                Khoảng thức Wake Windows
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Thuật toán SweetSpot® tuân thủ nghiên cứu sinh lý giấc ngủ của Viện Hàn lâm Nhi khoa Hoa Kỳ (AAP), tính toán áp lực giấc ngủ (sleep pressure) để dự đoán chính xác giờ bé buồn ngủ.
                            </p>
                            <div className="mt-4 pt-3 border-t border-purple-100 text-[11px] font-semibold text-purple-900 flex items-center gap-1.5">
                                <FaCircleCheck className="text-purple-600 text-xs shrink-0" />
                                <span>Tránh kích thích quá mức (Overtired)</span>
                            </div>
                        </div>

                        {/* VN MOH Vaccine */}
                        <div className="p-6 rounded-3xl bg-[#fdf8f9] border-2 border-pink-100/90 shadow-2xs hover:shadow-md transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-[#861949] flex items-center justify-center text-xl mb-4">
                                <FaShieldHeart />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#861949] bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200/60">
                                Bộ Y Tế Việt Nam
                            </span>
                            <h3 className="font-headline font-black text-base text-gray-900 mt-2 mb-2">
                                Tiêm chủng Mở rộng & Dịch vụ
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Danh mục 46 mũi tiêm được xây dựng đồng bộ với phác đồ y tế dự phòng Việt Nam: Lao sơ sinh, 6in1, Rota, Phế cầu, Sởi - Quai bị - Rubella, Viêm não Nhật Bản và Cúm mùa.
                            </p>
                            <div className="mt-4 pt-3 border-t border-pink-100 text-[11px] font-semibold text-[#861949] flex items-center gap-1.5">
                                <FaCircleCheck className="text-[#861949] text-xs shrink-0" />
                                <span>Tự động đếm ngược ngày tiêm kế tiếp</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. FAMILY SYNC WITH BABY CODE #CODE */}
            <section id="family-sync" className="py-16 sm:py-20 bg-gradient-to-br from-pink-100/70 via-rose-50/50 to-purple-100/60 border-y-2 border-pink-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-[#861949] to-[#c2185b] text-white mx-auto flex items-center justify-center text-3xl shadow-lg shadow-pink-900/20 mb-6">
                        👨‍👩‍👧
                    </div>
                    <span className="text-xs font-black text-[#861949] uppercase tracking-widest bg-white/90 px-3.5 py-1 rounded-full border border-pink-200 shadow-2xs">
                        Đột phá trải nghiệm
                    </span>
                    <h2 className="font-headline font-black text-2xl sm:text-3xl lg:text-4xl text-gray-950 mt-3 mb-4 whitespace-normal md:whitespace-nowrap">
                        Đồng bộ cả gia đình chỉ bằng một Mã Bé duy nhất
                    </h2>
                    <p className="text-base text-gray-700 max-w-2xl mx-auto leading-relaxed mb-8 font-medium">
                        Bố ở cơ quan, mẹ ở nhà hay ông bà chăm cháu — không ai phải tạo tài khoản phức tạp. 
                        Chỉ cần chia sẻ mã bé (Ví dụ: <strong className="text-gray-950 bg-white px-2.5 py-1 rounded-lg border border-pink-300 font-black shadow-2xs">#SOC</strong> hoặc quét mã QR), 
                        mọi người đều có thể theo dõi và cập nhật thời gian thực.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                        <div className="bg-white/95 p-4.5 rounded-2xl border-2 border-pink-200/80 shadow-sm">
                            <div className="p-2 rounded-xl bg-pink-100 text-[#861949] w-fit mb-2">
                                <FaQrcode className="text-lg" />
                            </div>
                            <h4 className="font-headline font-black text-xs text-gray-900">Quét mã QR 3 giây</h4>
                            <p className="text-[11px] text-gray-600 mt-0.5">Ông bà dùng camera điện thoại quét là vào ngay.</p>
                        </div>

                        <div className="bg-white/95 p-4.5 rounded-2xl border-2 border-pink-200/80 shadow-sm">
                            <div className="p-2 rounded-xl bg-pink-100 text-[#861949] w-fit mb-2">
                                <FaLock className="text-lg" />
                            </div>
                            <h4 className="font-headline font-black text-xs text-gray-900">Khóa bảo vệ bằng mã PIN</h4>
                            <p className="text-[11px] text-gray-600 mt-0.5">Đặt mã PIN 4 số chống bấm nhầm dữ liệu.</p>
                        </div>

                        <div className="bg-white/95 p-4.5 rounded-2xl border-2 border-pink-200/80 shadow-sm">
                            <div className="p-2 rounded-xl bg-pink-100 text-[#861949] w-fit mb-2">
                                <FaCloudArrowUp className="text-lg" />
                            </div>
                            <h4 className="font-headline font-black text-xs text-gray-900">Đồng bộ đám mây tức thì</h4>
                            <p className="text-[11px] text-gray-600 mt-0.5">Mẹ vừa ghi cữ sữa, điện thoại bố thấy ngay.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7.5. 3 AM PARENT ERGONOMICS & RELIABILITY */}
            <section className="py-16 sm:py-24 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="text-xs font-bold text-[#861949] uppercase tracking-widest bg-pink-100/80 px-3.5 py-1 rounded-full border border-pink-200">
                            Thiết kế vị nhân sinh
                        </span>
                        <h2 className="font-headline font-black text-2xl sm:text-3xl text-gray-950 mt-3 mb-2 whitespace-normal md:whitespace-nowrap">
                            Thấu hiểu từng chi tiết lúc 3 giờ sáng
                        </h2>
                        <p className="text-sm text-gray-600 font-medium">
                            Khi một tay đang bế con và mắt còn ngái ngủ, bạn không cần một ứng dụng rối rắm — bạn cần sự chính xác trong từng cú chạm.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {/* 1-Hand Thumb Zone */}
                        <div className="bg-[#fffbfc] rounded-3xl p-6 border-2 border-pink-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col">
                            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-[#861949] flex items-center justify-center text-xl mb-4">
                                <FaMobileScreen />
                            </div>
                            <h3 className="font-headline font-black text-base text-gray-950 mb-2">
                                Thao tác 1 tay vùng ngón cái
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed flex-1">
                                Một tay bế con, mẹ chỉ còn một bàn tay thao tác. Toàn bộ các nút bấm chính (bấm giờ bú, đổi bên ngực, ghi tã) được tối ưu ở nửa dưới màn hình với tiết diện chạm lớn, không cần với tay lên đỉnh.
                            </p>
                            <div className="mt-4 pt-3 border-t border-pink-100/80 flex items-center gap-2 text-[11px] font-bold text-gray-700">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span>Tiết diện chạm tối thiểu 48x48px</span>
                            </div>
                        </div>

                        {/* PWA Offline Resilience */}
                        <div className="bg-[#fbfcff] rounded-3xl p-6 border-2 border-indigo-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl mb-4">
                                <FaWifi />
                            </div>
                            <h3 className="font-headline font-black text-base text-gray-950 mb-2">
                                Hoạt động ngoại tuyến khi mất sóng
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed flex-1">
                                Phòng ngủ của bé cách âm kín, WiFi chập chờn? Ứng dụng PWA khởi động ngay trong 0.3 giây, ghi nhận dữ liệu vào bộ nhớ máy và tự động đồng bộ lên đám mây ngay khi có mạng trở lại.
                            </p>
                            <div className="mt-4 pt-3 border-t border-indigo-100/80 flex items-center gap-2 text-[11px] font-bold text-indigo-900">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                <span>Zero mất mát dữ liệu cữ ăn/ngủ</span>
                            </div>
                        </div>

                        {/* Export to Pediatrician */}
                        <div className="bg-[#f9fbf9] rounded-3xl p-6 border-2 border-emerald-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl mb-4">
                                <FaFileExport />
                            </div>
                            <h3 className="font-headline font-black text-base text-gray-950 mb-2">
                                Dữ liệu sẵn sàng cho Bác sĩ Nhi
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed flex-1">
                                Khi đưa con đi khám, bác sĩ luôn hỏi: "Bé bú được bao nhiêu ml/ngày? Đi ngoài mấy lần?". Phụ huynh chỉ cần mở trang Thống kê đưa cho bác sĩ xem trực tiếp bảng tổng hợp 7 ngày rõ ràng.
                            </p>
                            <div className="mt-4 pt-3 border-t border-emerald-100/80 flex items-center gap-2 text-[11px] font-bold text-emerald-900">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span>Báo cáo lượng sữa & chu kỳ tã 7 ngày</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. COMPARISON TABLE */}
            <section id="compare" className="py-16 sm:py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-xl mx-auto mb-12">
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-widest bg-gray-100 px-3.5 py-1 rounded-full border border-gray-200">
                            Bảng so sánh
                        </span>
                        <h2 className="font-headline font-black text-2xl sm:text-3xl text-gray-950 mt-3 mb-2">
                            Minh bạch & Rõ ràng
                        </h2>
                        <p className="text-sm text-gray-600 font-medium">
                            Xem cách Babie Tracker tôn trọng trải nghiệm của ba mẹ hơn các ứng dụng khác.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl border-2 border-pink-200/80 overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                                        <th className="p-4 font-bold">Tính năng</th>
                                        <th className="p-4 font-black text-[#861949] bg-pink-100/70 border-x border-pink-200">Babie Tracker</th>
                                        <th className="p-4 font-bold">Huckleberry / Daybook</th>
                                        <th className="p-4 font-bold">App mẹ & bé thông thường</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="p-4 font-bold text-gray-900">Quảng cáo chèn ép</td>
                                        <td className="p-4 font-black text-emerald-700 bg-pink-50/50 border-x border-pink-200">🚫 100% Không có</td>
                                        <td className="p-4 text-gray-500">Banner & popup (Bản free)</td>
                                        <td className="p-4 text-red-600 font-semibold">Quảng cáo liên tục</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-bold text-gray-900">Đồng bộ gia đình (Bố, Mẹ, Ông Bà)</td>
                                        <td className="p-4 font-black text-emerald-700 bg-pink-50/50 border-x border-pink-200">✅ Miễn phí qua Mã Bé</td>
                                        <td className="p-4 text-gray-500">Bắt mua Family ($89/năm)</td>
                                        <td className="p-4 text-gray-500">Bắt tạo nhiều tài khoản</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-bold text-gray-900">Dự đoán giờ ngủ (SweetSpot)</td>
                                        <td className="p-4 font-black text-emerald-700 bg-pink-50/50 border-x border-pink-200">✅ Tích hợp sẵn</td>
                                        <td className="p-4 text-gray-500">Thu phí $11.99 / tháng</td>
                                        <td className="p-4 text-gray-400">Không có</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-bold text-gray-900">Biểu đồ WHO & Sơ đồ răng</td>
                                        <td className="p-4 font-black text-emerald-700 bg-pink-50/50 border-x border-pink-200">✅ Miễn phí</td>
                                        <td className="p-4 text-gray-500">Giới hạn thời gian lịch sử</td>
                                        <td className="p-4 text-gray-400">Cơ bản</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-bold text-gray-900">Cài đặt & Tốc độ</td>
                                        <td className="p-4 font-black text-emerald-700 bg-pink-50/50 border-x border-pink-200">⚡ PWA nhẹ &lt;5MB, tức thì</td>
                                        <td className="p-4 text-gray-500">Tải app 150MB+</td>
                                        <td className="p-4 text-gray-500">Nặng máy</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8.5. AUTHENTIC PARENT VOICES */}
            <section className="py-16 sm:py-24 bg-gradient-to-b from-[#fffbfc] to-white border-t border-pink-100/80">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="text-xs font-bold text-[#861949] uppercase tracking-widest bg-pink-100/80 px-3.5 py-1 rounded-full border border-pink-200">
                            Chia sẻ thực tế
                        </span>
                        <h2 className="font-headline font-black text-2xl sm:text-3xl text-gray-950 mt-3 mb-2 whitespace-normal md:whitespace-nowrap">
                            Được tin dùng trong từng cữ sữa & giấc ngủ
                        </h2>
                        <p className="text-sm text-gray-600 font-medium">
                            Không có những lời khen chung chung sáo rỗng. Đây là những trải nghiệm thực tế từ các gia đình đang nuôi con nhỏ.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {/* Parent 1 */}
                        <div className="bg-white rounded-3xl p-6 border-2 border-pink-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex text-amber-400 gap-0.5 text-xs">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        Đã xác minh
                                    </span>
                                </div>
                                <div className="text-pink-300 text-lg mb-2">
                                    <FaQuoteLeft />
                                </div>
                                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic mb-6">
                                    "Trước đây cứ tầm 6h tối là bé nhà mình quấy khóc vật vã 2 tiếng đồng hồ vì gắt ngủ. Từ khi dùng SweetSpot® và theo dõi wake window, mình cho con vào phòng ngủ trước giờ dự đoán 15 phút, bé ngủ ngon lành chỉ sau vài phút vỗ về. Đúng nghĩa giải cứu tinh thần cho cả 2 vợ chồng!"
                                </p>
                            </div>
                            <div className="pt-4 border-t border-pink-100 flex items-center justify-between">
                                <div>
                                    <h4 className="font-headline font-bold text-xs text-gray-950">Mẹ Mai Anh</h4>
                                    <p className="text-[11px] text-gray-500">Bé Bon (4 tháng tuổi) • Hà Nội</p>
                                </div>
                                <span className="text-[10px] bg-pink-50 text-[#861949] font-bold px-2 py-0.5 rounded-md border border-pink-200/60">
                                    SweetSpot®
                                </span>
                            </div>
                        </div>

                        {/* Parent 2 */}
                        <div className="bg-white rounded-3xl p-6 border-2 border-purple-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex text-amber-400 gap-0.5 text-xs">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        Đã xác minh
                                    </span>
                                </div>
                                <div className="text-purple-300 text-lg mb-2">
                                    <FaQuoteLeft />
                                </div>
                                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic mb-6">
                                    "Mình đi làm văn phòng cả ngày, bé ở nhà có bà nội chăm. Điểm ưng ý nhất là Mã Bé #CODE: bà chỉ cần chạm ghi cữ sữa hay thay tã là điện thoại mình ở công ty nhảy cập nhật ngay. Chiều về là nắm rõ hôm nay con ăn ngủ thế nào, không cần gặng hỏi dồn dập bà."
                                </p>
                            </div>
                            <div className="pt-4 border-t border-purple-100 flex items-center justify-between">
                                <div>
                                    <h4 className="font-headline font-bold text-xs text-gray-950">Bố Quốc Tuấn</h4>
                                    <p className="text-[11px] text-gray-500">Bé Miu (7 tháng tuổi) • TP.HCM</p>
                                </div>
                                <span className="text-[10px] bg-purple-50 text-purple-800 font-bold px-2 py-0.5 rounded-md border border-purple-200/60">
                                    Mã Bé #CODE
                                </span>
                            </div>
                        </div>

                        {/* Parent 3 */}
                        <div className="bg-white rounded-3xl p-6 border-2 border-teal-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex text-amber-400 gap-0.5 text-xs">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        Đã xác minh
                                    </span>
                                </div>
                                <div className="text-teal-300 text-lg mb-2">
                                    <FaQuoteLeft />
                                </div>
                                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic mb-6">
                                    "Mình từng tải qua 4-5 app thai kỳ khác nhau nhưng app nào cũng chèn quảng cáo nổ đôm đốp và giao diện rối mắt. Babie Tracker vào thẳng vấn đề, theo dõi tuần thai theo hình ảnh quả củ rất dễ thương, nhắc lịch tiêm uốn ván chuẩn chỉ và không có bất kỳ banner quảng cáo nào."
                                </p>
                            </div>
                            <div className="pt-4 border-t border-teal-100 flex items-center justify-between">
                                <div>
                                    <h4 className="font-headline font-bold text-xs text-gray-950">Mẹ Thùy Trang</h4>
                                    <p className="text-[11px] text-gray-500">Tuần thai thứ 32 • Đà Nẵng</p>
                                </div>
                                <span className="text-[10px] bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded-md border border-teal-200/60">
                                    42 Tuần Thai Kỳ
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. FREQUENTLY ASKED QUESTIONS (FAQ) */}
            <section id="faq" className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-pink-50/40 border-t border-gray-200/80">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10">
                        <span className="text-xs font-bold text-[#861949] uppercase tracking-widest bg-pink-100 px-3.5 py-1 rounded-full border border-pink-200">
                            Giải đáp thắc mắc
                        </span>
                        <h2 className="font-headline font-black text-2xl sm:text-3xl text-gray-950 mt-3 mb-2">
                            Câu hỏi thường gặp
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {[
                            {
                                q: "Babie Tracker có thực sự miễn phí không?",
                                a: "Có! Toàn bộ các tính năng theo dõi thai kỳ 42 tuần, ghi nhận bú/ngủ/bỉm, đồng bộ gia đình theo mã bé, biểu đồ WHO và lịch tiêm chủng đều hoàn toàn miễn phí. Chúng tôi không bao giờ bán dữ liệu hay ép xem quảng cáo."
                            },
                            {
                                q: "Mã Bé #CODE hoạt động như thế nào? Dữ liệu có an toàn không?",
                                a: "Mỗi bé sẽ có một mã định danh duy nhất (Ví dụ #SOC). Bạn có thể gửi mã này cho Bố hoặc Ông Bà để cùng xem. Ứng dụng có thêm tính năng Khóa mã PIN 4 số: chỉ người có mã PIN mới có quyền chỉnh sửa hoặc thêm dữ liệu, người khác chỉ có quyền xem."
                            },
                            {
                                q: "Làm thế nào để cài đặt Babie Tracker lên màn hình điện thoại?",
                                a: "Babie Tracker là ứng dụng PWA (Progressive Web App). Trên iPhone, bạn mở Safari -> bấm nút Chia sẻ (biểu tượng mũi tên hướng lên) -> chọn 'Thêm vào MH chính'. Trên Android, bạn mở Chrome và bấm 'Cài đặt ứng dụng'. App sẽ xuất hiện như một ứng dụng thông thường, không tốn bộ nhớ máy."
                            },
                            {
                                q: "Nếu tôi đổi điện thoại thì dữ liệu có bị mất không?",
                                a: "Hoàn toàn không mất! Toàn bộ dữ liệu của bé được lưu trữ an toàn trên đám mây Google Cloud Firestore. Khi đổi điện thoại, bạn chỉ cần mở Babie Tracker và nhập lại Mã Bé là toàn bộ dữ liệu sẽ hiện ra ngay lập tức."
                            },
                            {
                                q: "Tôi có thể theo dõi nhiều bé cùng lúc được không?",
                                a: "Có. Trên trang chủ, bạn có thể tạo và lưu danh sách nhiều mã bé khác nhau (ví dụ: Bé đầu và Bé thứ hai) và chuyển đổi qua lại giữa các hồ sơ chỉ bằng 1 chạm."
                            }
                        ].map((item, idx) => (
                            <div 
                                key={idx} 
                                className="bg-white rounded-2xl border-2 border-pink-100 overflow-hidden shadow-2xs transition-all hover:border-pink-300"
                            >
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full p-4.5 sm:p-5 text-left font-headline font-bold text-sm sm:text-base text-gray-900 flex items-center justify-between gap-4 cursor-pointer select-none"
                                >
                                    <span>{item.q}</span>
                                    <FaChevronDown 
                                        className="text-[#861949] text-xs transition-transform duration-300 shrink-0" 
                                        style={{ transform: faqOpen.includes(idx) ? 'rotate(180deg)' : 'none' }} 
                                    />
                                </button>
                                {faqOpen.includes(idx) && (
                                    <div className="px-4.5 pb-4.5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-pink-50 pt-3">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 10. FINAL CALL TO ACTION & FOOTER */}
            <section className="py-16 sm:py-24 bg-gradient-to-b from-[#fff6f8] to-[#fee6ed] text-center border-t-2 border-pink-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="w-16 h-16 rounded-full mx-auto p-1 bg-white border-2 border-pink-300 shadow-lg overflow-hidden mb-6 select-none">
                        <img src="/logo-stitch.png" alt="Babie Tracker Logo" className="w-full h-full object-cover rounded-full" />
                    </div>

                    <h2 className="font-headline font-black text-2xl sm:text-3xl lg:text-4xl text-gray-950 mb-3 whitespace-normal md:whitespace-nowrap">
                        Bắt đầu hành trình chăm con an tâm ngay hôm nay
                    </h2>
                    <p className="text-sm sm:text-base text-gray-700 max-w-xl mx-auto mb-8 font-medium">
                        Không cần đăng ký thẻ tín dụng, mở trình duyệt là dùng ngay.
                    </p>

                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-headline font-bold text-white bg-[#861949] hover:bg-[#6f123c] shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer select-none"
                    >
                        <span>Mở Babie Tracker Ngay</span>
                        <FaArrowRight className="text-sm" />
                    </Link>

                    {/* Footer text */}
                    <div className="mt-16 pt-8 border-t border-pink-300/60 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 gap-4 select-none">
                        <div className="flex items-center gap-2 font-semibold">
                            <span>Babie Tracker © 2026</span>
                            <span>•</span>
                            <span>From parents with ❤️</span>
                        </div>

                        <div className="flex items-center gap-4 font-bold text-gray-700 select-none">
                            <Link href="/" className="hover:text-[#861949] select-none">Trang chủ</Link>
                            <a 
                                href="#pregnancy" 
                                onClick={(e) => handleScrollTo(e, 'pregnancy')}
                                className="hover:text-[#861949] select-none"
                            >
                                Thai kỳ
                            </a>
                            <a 
                                href="#baby-care" 
                                onClick={(e) => handleScrollTo(e, 'baby-care')}
                                className="hover:text-[#861949] select-none"
                            >
                                Chăm sóc bé
                            </a>
                            <a 
                                href="#faq" 
                                onClick={(e) => handleScrollTo(e, 'faq')}
                                className="hover:text-[#861949] select-none"
                            >
                                Hỏi đáp
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
