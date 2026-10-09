'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
    const [modeTab, setModeTab] = useState('pregnancy'); // 'pregnancy' | 'baby'
    const [faqOpen, setFaqOpen] = useState([0]); // Open first FAQ by default

    const toggleFaq = (index) => {
        setFaqOpen(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    return (
        <div className="w-full min-h-screen bg-[#fffdfb] text-gray-800 selection:bg-pink-100 selection:text-[#861949] overflow-x-hidden font-body">
            
            {/* 1. STICKY TOP NAVIGATION BAR */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-pink-100/70 transition-all">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    
                    {/* Logo & Brand */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-0.5 bg-white border border-pink-200 shadow-xs overflow-hidden transition-transform group-hover:scale-105">
                            <img src="/logo-stitch.png" alt="Babie Tracker Logo" className="w-full h-full object-cover rounded-full" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-headline font-black text-lg sm:text-xl text-gray-900 tracking-tight">
                                    Babie Tracker
                                </span>
                                <span className="hidden sm:inline-block text-[10px] font-bold bg-pink-50 text-[#861949] px-2 py-0.5 rounded-full border border-pink-200/60 uppercase tracking-wider">
                                    PWA v2.0
                                </span>
                            </div>
                            <span className="text-[11px] text-gray-500 hidden sm:block">
                                Không quảng cáo • Đồng bộ cả nhà
                            </span>
                        </div>
                    </Link>

                    {/* Nav Links (Desktop) */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
                        <a href="#pregnancy" className="hover:text-[#861949] transition-colors">42 Tuần Thai Kỳ</a>
                        <a href="#baby-care" className="hover:text-[#861949] transition-colors">Chăm Sóc Bé</a>
                        <a href="#sweetspot" className="hover:text-[#861949] transition-colors flex items-center gap-1">
                            <span>SweetSpot®</span>
                            <span className="text-[9px] bg-gradient-to-r from-amber-500 to-amber-600 text-white px-1.5 py-0.2 rounded-full font-black">PRO</span>
                        </a>
                        <a href="#family-sync" className="hover:text-[#861949] transition-colors">Mã Bé #CODE</a>
                        <a href="#compare" className="hover:text-[#861949] transition-colors">So Sánh</a>
                        <a href="#faq" className="hover:text-[#861949] transition-colors">Hỏi Đáp</a>
                    </nav>

                    {/* CTA Actions */}
                    <div className="flex items-center gap-2.5">
                        <Link 
                            href="/" 
                            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[15px] text-[#861949]">tag</span>
                            <span>Nhập Mã Bé</span>
                        </Link>
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-headline font-bold text-white bg-[#861949] hover:bg-[#6c123a] shadow-sm shadow-[#861949]/20 transition-all active:scale-95 cursor-pointer"
                        >
                            <span>Vào App Ngay</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* 2. HERO SECTION */}
            <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
                {/* Subtle Ambient Blobs */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-pink-100/60 to-purple-50/30 rounded-full blur-3xl pointer-events-none -z-10" />
                <div className="absolute top-40 right-10 w-72 h-72 bg-teal-50/50 rounded-full blur-2xl pointer-events-none -z-10" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
                        
                        {/* Trust Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 border border-pink-200/80 shadow-2xs mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                            <span className="text-sm">🌿</span>
                            <span className="text-xs font-bold text-[#861949]">
                                Ứng dụng theo dõi thai kỳ & nuôi con • 100% Không quảng cáo
                            </span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="font-headline font-black text-3xl sm:text-5xl lg:text-6xl text-gray-950 tracking-tight leading-[1.15] sm:leading-[1.15] mb-5">
                            Theo dõi thai kỳ & nuôi con khoa học. <br className="hidden sm:inline" />
                            <span className="text-[#861949]">Nhẹ nhàng, không quảng cáo.</span>
                        </h1>

                        {/* Human Subtitle (Anti AI-Slop) */}
                        <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8 font-medium">
                            Từ tuần đầu tiên biết tin con đến những đêm thức trắng chăm bé sơ sinh. 
                            Dự đoán giờ ngủ <strong>SweetSpot®</strong> chống gắt ngủ, biểu đồ WHO chuẩn quốc tế và đồng bộ cả gia đình bằng <strong>một Mã Bé duy nhất</strong>.
                        </p>

                        {/* CTA Buttons Row */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
                            <Link 
                                href="/" 
                                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-base font-headline font-black text-white bg-[#861949] hover:bg-[#6c123a] shadow-lg shadow-[#861949]/25 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>Bắt đầu miễn phí ngay</span>
                                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                            </Link>
                            
                            <a 
                                href="#overview" 
                                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-base font-headline font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 shadow-2xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-[18px] text-gray-500">expand_circle_down</span>
                                <span>Xem các tính năng</span>
                            </a>
                        </div>

                        {/* Micro Guarantees */}
                        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-500">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-teal-600">check_circle</span>
                                Không cần thẻ tín dụng
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-teal-600">check_circle</span>
                                Đồng bộ tức thì cả nhà
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-teal-600">check_circle</span>
                                Cài đặt PWA nhẹ & mượt
                            </span>
                        </div>
                    </div>

                    {/* HERO MOCKUP: REAL DEVICE PREVIEW WITH INTERACTIVE TABS */}
                    <div id="overview" className="max-w-4xl mx-auto">
                        
                        {/* Tab Switcher: Thai kỳ vs Em bé */}
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200/60 shadow-inner">
                                <button
                                    onClick={() => setModeTab('pregnancy')}
                                    className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-headline font-bold flex items-center gap-2 transition-all ${
                                        modeTab === 'pregnancy'
                                            ? 'bg-white text-[#861949] shadow-sm'
                                            : 'text-gray-500 hover:text-gray-800'
                                    }`}
                                >
                                    <span>🤰</span>
                                    <span>Giai đoạn Mang thai (42 Tuần)</span>
                                </button>
                                <button
                                    onClick={() => setModeTab('baby')}
                                    className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-headline font-bold flex items-center gap-2 transition-all ${
                                        modeTab === 'baby'
                                            ? 'bg-white text-[#861949] shadow-sm'
                                            : 'text-gray-500 hover:text-gray-800'
                                    }`}
                                >
                                    <span>👶</span>
                                    <span>Giai đoạn Nuôi con (Sơ sinh & Lớn khôn)</span>
                                </button>
                            </div>
                        </div>

                        {/* Device Frame Displaying Authentic Screenshot */}
                        <div className="relative mx-auto max-w-sm sm:max-w-md rounded-[3rem] p-3 sm:p-4 bg-gray-900 shadow-2xl shadow-gray-900/20 ring-1 ring-gray-800">
                            {/* Realistic iPhone Screen Bezel */}
                            <div className="relative bg-white rounded-[2.5rem] overflow-hidden border-4 border-gray-800 shadow-inner aspect-[9/19.5]">
                                
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
                                    <div className="hidden sm:flex absolute -left-12 top-24 bg-white/95 backdrop-blur-md border border-pink-100 p-3 rounded-2xl shadow-lg items-center gap-3 animate-in fade-in duration-300">
                                        <span className="text-2xl">🥦</span>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tuần 27</p>
                                            <p className="text-xs font-black text-gray-900">Bé to bằng Cái súp lơ</p>
                                            <p className="text-[10px] font-bold text-[#861949]">875g • 36.6cm</p>
                                        </div>
                                    </div>

                                    <div className="hidden sm:flex absolute -right-12 bottom-32 bg-white/95 backdrop-blur-md border border-purple-100 p-3 rounded-2xl shadow-lg items-center gap-3 animate-in fade-in duration-300">
                                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                                            42W
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thước đo thai kỳ</p>
                                            <p className="text-xs font-black text-gray-900">Khung ngắm tuần CS:GO</p>
                                            <p className="text-[10px] font-bold text-purple-600">Trượt xem 42 tuần mượt mà</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="hidden sm:flex absolute -left-12 top-28 bg-white/95 backdrop-blur-md border border-indigo-100 p-3 rounded-2xl shadow-lg items-center gap-3 animate-in fade-in duration-300">
                                        <span className="text-2xl">💤</span>
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <p className="text-[10px] font-black text-indigo-900 uppercase tracking-wider">SweetSpot® AI</p>
                                                <span className="text-[8px] bg-amber-500 text-white font-bold px-1 rounded-full">PRO</span>
                                            </div>
                                            <p className="text-xs font-black text-gray-900">Cữ tiếp theo: 14:30</p>
                                            <p className="text-[10px] font-bold text-indigo-600">Còn 25 phút • Chống gắt ngủ</p>
                                        </div>
                                    </div>

                                    <div className="hidden sm:flex absolute -right-12 bottom-28 bg-white/95 backdrop-blur-md border border-pink-100 p-3 rounded-2xl shadow-lg items-center gap-3 animate-in fade-in duration-300">
                                        <span className="text-2xl">🍼</span>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ghi nhận 1 chạm</p>
                                            <p className="text-xs font-black text-gray-900">Bú mẹ, bú bình, thay tã</p>
                                            <p className="text-[10px] font-bold text-[#861949]">Cả nhà thấy ngay</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. CORE COMMITMENTS (WHY PARENTS LOVE BABIE TRACKER) */}
            <section className="py-16 bg-white border-y border-pink-100/60">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-xs font-bold text-[#861949] uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full border border-pink-200/50">
                            Tôn chỉ sản phẩm
                        </span>
                        <h2 className="font-headline font-black text-2xl sm:text-3xl text-gray-950 mt-3 mb-3">
                            Tại sao ba mẹ chọn Babie Tracker thay vì các app khác?
                        </h2>
                        <p className="text-sm text-gray-600">
                            Không tính năng thừa, không làm phiền cha mẹ những lúc chăm con vất vả nhất.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {/* Commitment 1 */}
                        <div className="bg-[#fffdfb] rounded-3xl p-6 sm:p-7 border border-pink-100 shadow-2xs hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#861949] flex items-center justify-center text-2xl mb-5 shadow-2xs">
                                🚫
                            </div>
                            <h3 className="font-headline font-bold text-lg text-gray-900 mb-2">
                                100% Không bao giờ có quảng cáo
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Nửa đêm bé khóc, mẹ mở app lên là để ghi nhận trong 3 giây. Chúng tôi cam kết không chèn banner chớp nháy, không bắt xem video 30 giây quảng cáo sữa hay bỉm.
                            </p>
                        </div>

                        {/* Commitment 2 */}
                        <div className="bg-[#fffdfb] rounded-3xl p-6 sm:p-7 border border-purple-100 shadow-2xs hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-2xl mb-5 shadow-2xs">
                                🏷️
                            </div>
                            <h3 className="font-headline font-bold text-lg text-gray-900 mb-2">
                                Một Mã Bé duy nhất (#CODE)
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Không bắt Bố, Mẹ, Ông, Bà phải nhớ từng tài khoản mật khẩu email. Chỉ cần nhập hoặc quét mã bé (Ví dụ: <code>#SOC</code>), cả nhà có thể cùng xem và cập nhật tức thì.
                            </p>
                        </div>

                        {/* Commitment 3 */}
                        <div className="bg-[#fffdfb] rounded-3xl p-6 sm:p-7 border border-teal-100 shadow-2xs hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-2xl mb-5 shadow-2xs">
                                🩺
                            </div>
                            <h3 className="font-headline font-bold text-lg text-gray-900 mb-2">
                                Dựa trên y khoa chuẩn xác
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Biểu đồ tăng trưởng bách phân vị chuẩn WHO, lịch tiêm ngừa theo Bộ Y Tế, thuật toán dự đoán giấc ngủ Wake Windows chuẩn Viện Hàn lâm Nhi khoa Hoa Kỳ (AAP).
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. DEEP DIVE: PREGNANCY MODE */}
            <section id="pregnancy" className="py-16 sm:py-24 bg-[#fff9fa]/60">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        
                        {/* Text and Features Column */}
                        <div className="flex-1 order-2 lg:order-1">
                            <span className="text-xs font-bold text-[#861949] uppercase tracking-widest bg-pink-100/70 px-3 py-1 rounded-full border border-pink-200">
                                Chế độ Thai Kỳ
                            </span>
                            <h2 className="font-headline font-black text-2xl sm:text-4xl text-gray-950 mt-3 mb-4 leading-tight">
                                Đồng hành cùng mẹ bầu qua 42 tuần thai kỳ trọn vẹn
                            </h2>
                            <p className="text-base text-gray-600 leading-relaxed mb-8 font-medium">
                                Mỗi tuần trôi qua là một cột mốc diệu kỳ. Babie Tracker giúp mẹ biết bé phát triển ra sao, khi nào cần đi khám và sẵn sàng cho ngày đón bé chào đời.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3.5 p-3.5 bg-white rounded-2xl border border-pink-100 shadow-2xs">
                                    <span className="material-symbols-outlined text-[#861949] text-2xl shrink-0 mt-0.5">straighten</span>
                                    <div>
                                        <h4 className="font-headline font-bold text-sm text-gray-900">Bé to bằng quả gì & Cân nặng theo tuần</h4>
                                        <p className="text-xs text-gray-600 mt-0.5">So sánh kích thước trực quan với hoa quả, hiển thị cân nặng gram và chiều dài cm chuẩn y khoa từng tuần.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5 p-3.5 bg-white rounded-2xl border border-pink-100 shadow-2xs">
                                    <span className="material-symbols-outlined text-teal-600 text-2xl shrink-0 mt-0.5">calendar_month</span>
                                    <div>
                                        <h4 className="font-headline font-bold text-sm text-gray-900">Lịch mốc khám thai quan trọng</h4>
                                        <p className="text-xs text-gray-600 mt-0.5">Tự động nhắc các mốc vàng: Siêu âm đo độ mờ da gáy 12W, hình thái học 22W, tiểu đường thai kỳ 26W, siêu âm Doppler 32W.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5 p-3.5 bg-white rounded-2xl border border-pink-100 shadow-2xs">
                                    <span className="material-symbols-outlined text-purple-600 text-2xl shrink-0 mt-0.5">touch_app</span>
                                    <div>
                                        <h4 className="font-headline font-bold text-sm text-gray-900">Máy đếm thai máy & Cơn gò chuyển dạ</h4>
                                        <p className="text-xs text-gray-600 mt-0.5">Bấm đếm số lần bé đạp trong 1 giờ để phát hiện sớm suy thai; nhận biết cơn gò thật theo quy tắc 5-1-1 khi sắp sinh.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5 p-3.5 bg-white rounded-2xl border border-pink-100 shadow-2xs">
                                    <span className="material-symbols-outlined text-amber-600 text-2xl shrink-0 mt-0.5">luggage</span>
                                    <div>
                                        <h4 className="font-headline font-bold text-sm text-gray-900">Checklist giỏ đồ đi sinh & Cẩm nang Thai giáo</h4>
                                        <p className="text-xs text-gray-600 mt-0.5">Danh sách đồ dùng mẹ & bé được chia ngăn thông minh, kèm bài tập thai giáo 5 giác quan theo ngày.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Real Screenshot Preview Column */}
                        <div className="flex-1 order-1 lg:order-2 w-full max-w-md lg:max-w-none flex justify-center">
                            <div className="relative rounded-3xl p-3 bg-white shadow-xl border border-pink-100/80">
                                <img 
                                    src="/landing/screenshot_pregnancy.png" 
                                    alt="Màn hình Thai kỳ thực tế của Babie Tracker"
                                    className="rounded-2xl w-full h-auto max-h-[580px] object-contain shadow-xs"
                                />
                                <div className="absolute -bottom-4 -left-4 bg-[#861949] text-white p-3 rounded-2xl shadow-lg text-xs font-bold flex items-center gap-2">
                                    <span className="text-lg">🤰</span>
                                    <span>Đo lường 42 tuần thai kỳ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. DEEP DIVE: BABY CARE & SWEETSPOT® */}
            <section id="sweetspot" className="py-16 sm:py-24 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        
                        {/* Screenshot Preview Column */}
                        <div className="flex-1 w-full max-w-md lg:max-w-none flex justify-center">
                            <div className="relative rounded-3xl p-3 bg-white shadow-xl border border-indigo-100/80">
                                <img 
                                    src="/landing/screenshot_baby_home.png" 
                                    alt="Màn hình Chăm sóc bé Babie Tracker"
                                    className="rounded-2xl w-full h-auto max-h-[580px] object-contain shadow-xs"
                                />
                                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-3 rounded-2xl shadow-lg text-xs font-headline font-black flex items-center gap-1.5">
                                    <span>🌙 SweetSpot® AI</span>
                                    <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">Độc quyền</span>
                                </div>
                            </div>
                        </div>

                        {/* Text and Features Column */}
                        <div className="flex-1" id="baby-care">
                            <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                                Chăm sóc bé & Rèn ngủ
                            </span>
                            <h2 className="font-headline font-black text-2xl sm:text-4xl text-gray-950 mt-3 mb-4 leading-tight">
                                Thấu hiểu nhịp sinh học của con. Tạm biệt những đêm gắt ngủ.
                            </h2>
                            <p className="text-base text-gray-600 leading-relaxed mb-8 font-medium">
                                Nỗi sợ lớn nhất của mẹ bỉm là bé bị quá mệt (overtired) dẫn đến quấy khóc không dỗ nổi. SweetSpot® giải quyết triệt để nỗi lo này.
                            </p>

                            <div className="space-y-4">
                                <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-indigo-600">bedtime</span>
                                        <h4 className="font-headline font-bold text-sm text-indigo-950">
                                            Dự đoán giờ ngủ SweetSpot® (Chuẩn Wake Windows)
                                        </h4>
                                    </div>
                                    <p className="text-xs text-indigo-900/80 leading-relaxed">
                                        Thuật toán y khoa tự động đọc giờ bé thức dậy và tuổi của bé để tính chính xác thời điểm mẹ cần dỗ ngủ, đếm ngược từng phút và cảnh báo trước khi bé bị gắt ngủ.
                                    </p>
                                </div>

                                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-amber-700">baby_changing_station</span>
                                        <h4 className="font-headline font-bold text-sm text-amber-950">
                                            Ghi nhận cữ bú & thay tã trong 3 giây
                                        </h4>
                                    </div>
                                    <p className="text-xs text-amber-900/80 leading-relaxed">
                                        Bú mẹ có đồng hồ bấm giờ chia bên trái/phải; bú bình ghi nhanh lượng ml; theo dõi tã ướt/bẩn để đánh giá lượng sữa bé hấp thụ hàng ngày.
                                    </p>
                                </div>

                                <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-teal-700">browse_activity</span>
                                        <h4 className="font-headline font-bold text-sm text-teal-950">
                                            Dòng thời gian hoạt động trực quan
                                        </h4>
                                    </div>
                                    <p className="text-xs text-teal-900/80 leading-relaxed">
                                        Tổng hợp toàn bộ các cữ ăn, giấc ngủ, tã bỉm trong ngày thành một dòng thời gian liền mạch, giúp mẹ nhìn thấy ngay quy luật sinh hoạt của con.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. DEEP DIVE: HEALTH, WHO CHARTS & TEETHING */}
            <section className="py-16 sm:py-24 bg-[#fffdfb]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="text-xs font-bold text-teal-800 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                            Sổ sức khỏe số
                        </span>
                        <h2 className="font-headline font-black text-2xl sm:text-3xl text-gray-950 mt-3 mb-3">
                            Theo dõi tăng trưởng & Tiêm chủng chuẩn Bộ Y Tế
                        </h2>
                        <p className="text-sm text-gray-600">
                            Tự tin mỗi khi đưa con đi khám định kỳ với đầy đủ dữ liệu tăng trưởng trong tay.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {/* WHO Chart Card */}
                        <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm flex flex-col">
                            <div className="rounded-2xl overflow-hidden mb-4 border border-gray-100 aspect-video bg-gray-50">
                                <img 
                                    src="/landing/screenshot_growth.png" 
                                    alt="Biểu đồ WHO chuẩn quốc tế"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="font-headline font-bold text-base text-gray-900 mb-1">
                                Biểu đồ tăng trưởng WHO
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed flex-1">
                                Vẽ biểu đồ bách phân vị (Percentiles) Cân nặng và Chiều cao theo từng tháng tuổi, tự động đánh giá bé đạt chuẩn, nguy cơ suy dinh dưỡng hay béo phì.
                            </p>
                        </div>

                        {/* Vaccine Schedule Card */}
                        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm flex flex-col">
                            <div className="rounded-2xl overflow-hidden mb-4 border border-gray-100 aspect-video bg-gray-50">
                                <img 
                                    src="/landing/screenshot_vaccine.png" 
                                    alt="Lịch tiêm chủng đầy đủ"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="font-headline font-bold text-base text-gray-900 mb-1">
                                Sổ tiêm chủng 46 mốc tiêu chuẩn
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed flex-1">
                                Đầy đủ các mũi tiêm trong chương trình Tiêm chủng mở rộng và tiêm dịch vụ (Lao, 6in1, Phế cầu, Rota, Sởi...), tự đếm ngược ngày đến hẹn tiêm.
                            </p>
                        </div>

                        {/* Teething Arch Card */}
                        <div className="bg-white rounded-3xl p-5 border border-teal-100 shadow-sm flex flex-col">
                            <div className="rounded-2xl overflow-hidden mb-4 border border-gray-100 aspect-video bg-gray-50">
                                <img 
                                    src="/landing/screenshot_teething.png" 
                                    alt="Sơ đồ mọc răng 20 chiếc"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="font-headline font-bold text-base text-gray-900 mb-1">
                                Sơ đồ mọc răng 20 chiếc sữa
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed flex-1">
                                Trực quan hóa hình vòm cung 10 răng hàm trên và 10 răng hàm dưới. Chạm vào răng để ghi nhận ngày mọc, theo dõi thứ tự mọc răng sữa đúng chuẩn.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. FAMILY SYNC WITH BABY CODE #CODE */}
            <section id="family-sync" className="py-16 sm:py-20 bg-gradient-to-br from-pink-50/80 via-white to-purple-50/50 border-y border-pink-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-[#861949] text-white mx-auto flex items-center justify-center text-3xl shadow-md mb-6">
                        👨‍👩‍👧
                    </div>
                    <span className="text-xs font-bold text-[#861949] uppercase tracking-widest bg-pink-100 px-3 py-1 rounded-full">
                        Đột phá trải nghiệm
                    </span>
                    <h2 className="font-headline font-black text-2xl sm:text-4xl text-gray-950 mt-3 mb-4">
                        Đồng bộ cả gia đình chỉ bằng một Mã Bé duy nhất
                    </h2>
                    <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
                        Bố ở cơ quan, mẹ ở nhà hay ông bà chăm cháu — không ai phải tạo tài khoản phức tạp. 
                        Chỉ cần chia sẻ mã bé (Ví dụ: <strong className="text-gray-900 bg-white px-2 py-0.5 rounded-lg border border-pink-200">#SOC</strong> hoặc quét mã QR), 
                        mọi người đều có thể theo dõi và cập nhật thời gian thực.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                        <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-2xs">
                            <span className="material-symbols-outlined text-[#861949] text-xl">qr_code_scanner</span>
                            <h4 className="font-headline font-bold text-xs text-gray-900 mt-1">Quét mã QR 3 giây</h4>
                            <p className="text-[11px] text-gray-500 mt-0.5">Ông bà dùng camera điện thoại quét là vào ngay.</p>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-2xs">
                            <span className="material-symbols-outlined text-[#861949] text-xl">lock</span>
                            <h4 className="font-headline font-bold text-xs text-gray-900 mt-1">Khóa bảo vệ bằng mã PIN</h4>
                            <p className="text-[11px] text-gray-500 mt-0.5">Đặt mã PIN 4 số chống bấm nhầm dữ liệu.</p>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-2xs">
                            <span className="material-symbols-outlined text-[#861949] text-xl">cloud_sync</span>
                            <h4 className="font-headline font-bold text-xs text-gray-900 mt-1">Đồng bộ đám mây tức thì</h4>
                            <p className="text-[11px] text-gray-500 mt-0.5">Mẹ vừa ghi cữ sữa, điện thoại bố thấy ngay.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. COMPARISON TABLE */}
            <section id="compare" className="py-16 sm:py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-xl mx-auto mb-12">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                            Bảng so sánh
                        </span>
                        <h2 className="font-headline font-black text-2xl sm:text-3xl text-gray-950 mt-3 mb-2">
                            Minh bạch & Rõ ràng
                        </h2>
                        <p className="text-sm text-gray-600">
                            Xem cách Babie Tracker tôn trọng trải nghiệm của ba mẹ hơn các ứng dụng khác.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500">
                                        <th className="p-4 font-bold">Tính năng</th>
                                        <th className="p-4 font-bold text-[#861949] bg-pink-50/50">Babie Tracker</th>
                                        <th className="p-4 font-bold">Huckleberry / Daybook</th>
                                        <th className="p-4 font-bold">App mẹ & bé thông thường</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="p-4 font-semibold text-gray-900">Quảng cáo chèn ép</td>
                                        <td className="p-4 font-bold text-emerald-600 bg-pink-50/30">🚫 100% Không có</td>
                                        <td className="p-4 text-gray-500">Banner & popup (Bản free)</td>
                                        <td className="p-4 text-red-500">Quảng cáo liên tục</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-semibold text-gray-900">Đồng bộ gia đình (Bố, Mẹ, Ông Bà)</td>
                                        <td className="p-4 font-bold text-emerald-600 bg-pink-50/30">✅ Miễn phí qua Mã Bé</td>
                                        <td className="p-4 text-gray-500">Bắt mua Family ($89/năm)</td>
                                        <td className="p-4 text-gray-500">Bắt tạo nhiều tài khoản</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-semibold text-gray-900">Dự đoán giờ ngủ (SweetSpot)</td>
                                        <td className="p-4 font-bold text-emerald-600 bg-pink-50/30">✅ Tích hợp sẵn</td>
                                        <td className="p-4 text-gray-500">Thu phí $11.99 / tháng</td>
                                        <td className="p-4 text-gray-400">Không có</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-semibold text-gray-900">Biểu đồ WHO & Sơ đồ răng</td>
                                        <td className="p-4 font-bold text-emerald-600 bg-pink-50/30">✅ Miễn phí</td>
                                        <td className="p-4 text-gray-500">Giới hạn thời gian lịch sử</td>
                                        <td className="p-4 text-gray-400">Cơ bản</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-semibold text-gray-900">Cài đặt & Tốc độ</td>
                                        <td className="p-4 font-bold text-emerald-600 bg-pink-50/30">⚡ PWA nhẹ &lt;5MB, tức thì</td>
                                        <td className="p-4 text-gray-500">Tải app 150MB+</td>
                                        <td className="p-4 text-gray-500">Nặng máy</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. FREQUENTLY ASKED QUESTIONS (FAQ) */}
            <section id="faq" className="py-16 sm:py-20 bg-gray-50/60 border-t border-gray-100">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10">
                        <span className="text-xs font-bold text-[#861949] uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full border border-pink-200/50">
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
                                className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs transition-all"
                            >
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full p-4.5 sm:p-5 text-left font-headline font-bold text-sm sm:text-base text-gray-900 flex items-center justify-between gap-4 cursor-pointer"
                                >
                                    <span>{item.q}</span>
                                    <span className="material-symbols-outlined text-gray-400 text-xl transition-transform duration-200 shrink-0" style={{ transform: faqOpen.includes(idx) ? 'rotate(180deg)' : 'none' }}>
                                        expand_more
                                    </span>
                                </button>
                                {faqOpen.includes(idx) && (
                                    <div className="px-4.5 pb-4.5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 10. FINAL CALL TO ACTION & FOOTER */}
            <section className="py-16 sm:py-20 bg-gradient-to-b from-[#fff8f8] to-[#fee9ee] text-center border-t border-pink-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="w-16 h-16 rounded-full mx-auto p-1 bg-white border-2 border-pink-200 shadow-md overflow-hidden mb-6">
                        <img src="/logo-stitch.png" alt="Babie Tracker Logo" className="w-full h-full object-cover rounded-full" />
                    </div>

                    <h2 className="font-headline font-black text-2xl sm:text-4xl text-gray-950 mb-3">
                        Bắt đầu hành trình chăm con an tâm ngay hôm nay
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto mb-8 font-medium">
                        Không cần đăng ký thẻ, không quảng cáo, mở ra là dùng ngay.
                    </p>

                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-headline font-black text-white bg-[#861949] hover:bg-[#6c123a] shadow-xl shadow-[#861949]/30 transition-all active:scale-95 cursor-pointer"
                    >
                        <span>Mở Babie Tracker Ngay</span>
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </Link>

                    {/* Footer text */}
                    <div className="mt-16 pt-8 border-t border-pink-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
                        <div className="flex items-center gap-2">
                            <span>Babie Tracker © 2026</span>
                            <span>•</span>
                            <span>From parents with ❤️</span>
                        </div>

                        <div className="flex items-center gap-4 font-semibold text-gray-600">
                            <Link href="/" className="hover:text-[#861949]">Trang chủ</Link>
                            <a href="#pregnancy" className="hover:text-[#861949]">Thai kỳ</a>
                            <a href="#sweetspot" className="hover:text-[#861949]">SweetSpot®</a>
                            <a href="#faq" className="hover:text-[#861949]">Hỏi đáp</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
