'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
    calculatePregnancyWeeks, 
    getPregnancyWeekStats, 
    getUpcomingCheckup, 
    getWeeklyAdvice,
    isLatePregnancy
} from '../lib/pregnancy-utils';
import KickCounter from './pregnancy/KickCounter';
import HospitalBagChecklist from './pregnancy/HospitalBagChecklist';
import ConvertBabyModal from './pregnancy/ConvertBabyModal';
import LaborSignsModal from './pregnancy/LaborSignsModal';
import LatePregnancyRemindModal from './pregnancy/LatePregnancyRemindModal';

export default function PregnancyHomeView({ profile, code }) {
    const [stats, setStats] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [showConvertBabyModal, setShowConvertBabyModal] = useState(false);
    const [showLaborSignsModal, setShowLaborSignsModal] = useState(false);
    const [showLateRemindModal, setShowLateRemindModal] = useState(false);
    const timelineRef = useRef(null);

    // Drag-to-scroll refs (Desktop mouse & Touch)
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);
    const hasMovedRef = useRef(false);
    const rafIdRef = useRef(null);
    const isInitialCenteringRef = useRef(true);

    useEffect(() => {
        if (profile?.estimatedDueDate) {
            const current = calculatePregnancyWeeks(profile.estimatedDueDate);
            setStats(current);
            setSelectedWeek(current.weeks);

            // Tự động kiểm tra nhắc nhở nếu vào giai đoạn cuối thai kỳ (>= 37 tuần hoặc <= 21 ngày)
            if (isLatePregnancy(current.weeks, current.daysRemaining)) {
                if (typeof window !== 'undefined') {
                    const todayStr = new Date().toISOString().slice(0, 10);
                    const dismissed = localStorage.getItem('pethui_late_pregnancy_dismissed');
                    if (dismissed !== todayStr) {
                        const t = setTimeout(() => {
                            setShowLateRemindModal(true);
                        }, 500);
                        return () => clearTimeout(t);
                    }
                }
            }
        }
    }, [profile?.estimatedDueDate]);

    // Center the target week into the select area
    const scrollToWeek = useCallback((w, behavior = 'smooth') => {
        if (!timelineRef.current) return;
        const targetBtn = timelineRef.current.querySelector(`[data-week="${w}"]`);
        if (targetBtn) {
            targetBtn.scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
        }
    }, []);

    // Center initial active week on load
    useEffect(() => {
        if (stats && timelineRef.current && isInitialCenteringRef.current) {
            isInitialCenteringRef.current = false;
            const timer = setTimeout(() => {
                scrollToWeek(stats.weeks, 'auto');
            }, 60);
            return () => clearTimeout(timer);
        }
    }, [stats, scrollToWeek]);

    // Recalculate which week is directly in the center select area during scroll
    const updateSelectedWeekFromScroll = useCallback(() => {
        if (!timelineRef.current) return;
        const container = timelineRef.current;
        const containerRect = container.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;

        const buttons = container.querySelectorAll('[data-week]');
        let closestWeek = null;
        let minDistance = Infinity;

        buttons.forEach((btn) => {
            const rect = btn.getBoundingClientRect();
            const btnCenter = rect.left + rect.width / 2;
            const dist = Math.abs(btnCenter - centerX);
            if (dist < minDistance) {
                minDistance = dist;
                closestWeek = parseInt(btn.getAttribute('data-week'), 10);
            }
        });

        if (closestWeek !== null && closestWeek !== selectedWeek) {
            setSelectedWeek(closestWeek);
            if (typeof window !== 'undefined' && window.navigator?.vibrate) {
                try { window.navigator.vibrate(5); } catch (e) {}
            }
        }
    }, [selectedWeek]);

    const handleScroll = () => {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(() => {
            updateSelectedWeekFromScroll();
        });
    };

    // Desktop mouse drag to scroll handlers
    const handleMouseDown = (e) => {
        if (!timelineRef.current) return;
        isDraggingRef.current = true;
        hasMovedRef.current = false;
        startXRef.current = e.pageX - timelineRef.current.offsetLeft;
        scrollLeftRef.current = timelineRef.current.scrollLeft;
    };

    const handleMouseMove = (e) => {
        if (!isDraggingRef.current || !timelineRef.current) return;
        const x = e.pageX - timelineRef.current.offsetLeft;
        const walk = (x - startXRef.current);
        if (Math.abs(walk) > 4) {
            hasMovedRef.current = true;
        }
        timelineRef.current.scrollLeft = scrollLeftRef.current - walk;
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    const handleMouseLeave = () => {
        isDraggingRef.current = false;
    };

    const handleWeekClick = (w) => {
        if (hasMovedRef.current) return;
        setSelectedWeek(w);
        scrollToWeek(w, 'smooth');
    };

    if (!stats || selectedWeek === null) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="animate-bounce text-4xl mb-3">🤰</div>
                <p className="text-purple-600 font-bold tracking-wide animate-pulse">Đang tải dữ liệu thai kỳ...</p>
            </div>
        );
    }

    const weeks = Array.from({ length: 43 }, (_, i) => i); // 0 to 42
    const selectedStats = getPregnancyWeekStats(selectedWeek);
    const isCurrentWeek = selectedWeek === stats.weeks;
    const upcomingCheckup = getUpcomingCheckup(selectedWeek);
    const weeklyAdvice = getWeeklyAdvice(selectedWeek);

    return (
        <div className="flex flex-col gap-3.5 pb-20">
            {/* Card 1: Header + Reel with CS:GO Select Area */}
            <section className="mt-[38px] bg-gradient-to-br from-purple-100 to-pink-50 rounded-[2.5rem] p-6 shadow-sm border border-purple-200/50 text-center overflow-hidden relative">
                <div className="absolute -top-4 -right-4 text-6xl opacity-10 blur-[2px] pointer-events-none">🤰</div>
                <div className="absolute -bottom-4 -left-4 text-6xl opacity-10 blur-[2px] pointer-events-none">✨</div>
                
                <h2 className="text-purple-800 font-headline font-black text-2xl mb-1 transition-all">
                    {isCurrentWeek ? `Mẹ đang ở tuần ${stats.weeks}` : `Xem trước tuần ${selectedWeek}`}
                </h2>
                {isCurrentWeek ? (
                    <p className="text-purple-600/80 font-bold text-sm">Ngày thứ {stats.days} của thai kỳ</p>
                ) : (
                    <div className="flex justify-center mt-1">
                        <button 
                            onClick={() => handleWeekClick(stats.weeks)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-200/70 hover:bg-purple-200 px-3.5 py-1 rounded-full transition-all active:scale-95 shadow-xs cursor-pointer"
                            title="Quay lại tuần thực tế của bé"
                        >
                            <span>Quay lại tuần hiện tại ({stats.weeks})</span>
                            <span className="text-sm leading-none">↩</span>
                        </button>
                    </div>
                )}


                {/* Timeline Carousel with CS:GO Style Select Area */}
                <div className="mt-6 relative">
                    {/* Background track line */}
                    <div className="absolute top-[36px] left-0 w-full h-1 bg-white/60 -translate-y-1/2 rounded-full pointer-events-none"></div>
                    <div 
                        className="absolute top-[36px] left-0 h-1 bg-gradient-to-r from-purple-400 to-pink-400 -translate-y-1/2 rounded-full transition-all duration-150 pointer-events-none" 
                        style={{ width: `${Math.min(100, Math.max(0, (selectedWeek / 42) * 100))}%` }}
                    ></div>
                    
                    {/* CS:GO Selector Reticle / Select Area Frame */}
                    <div 
                        className="pointer-events-none absolute left-1/2 top-[36px] -translate-x-1/2 -translate-y-1/2 z-20 w-[56px] h-[58px] rounded-2xl border-2 border-gray-900 shadow-[0_6px_20px_rgba(0,0,0,0.18)] bg-black/[0.02]"
                        aria-hidden="true"
                    >
                        {/* Top indicator tick (CS:GO style) */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-gray-900"></div>
                        {/* Bottom indicator tick (CS:GO style) */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[7px] border-b-gray-900"></div>
                    </div>

                    {/* Scrollable / Draggable Track */}
                    <div 
                        ref={timelineRef} 
                        onScroll={handleScroll}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        className="flex items-center overflow-x-auto gap-4 py-4 no-scrollbar hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative z-10 snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
                    >
                        {/* Spacer to allow centering Week 0 exactly in the select area */}
                        <div className="shrink-0 pointer-events-none" style={{ width: 'calc(50% - 20px)' }}></div>
                        
                        {weeks.map(w => {
                            const isSelected = w === selectedWeek;
                            const isCurrent = w === stats.weeks;
                            const isPast = w < stats.weeks;
                            
                            return (
                                <button
                                    key={w}
                                    data-week={w}
                                    onClick={() => handleWeekClick(w)}
                                    className={`shrink-0 flex flex-col items-center justify-center transition-all duration-150 snap-center outline-none focus:outline-none ${isCurrent ? 'is-current' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-4 transition-all duration-150 ${
                                        isSelected ? 'bg-purple-600 text-white border-purple-200 scale-125 shadow-lg' : 
                                        isCurrent ? 'bg-white text-purple-600 border-purple-300 shadow-md font-extrabold' :
                                        isPast ? 'bg-purple-100 text-purple-400 border-white' :
                                        'bg-white text-gray-400 border-white opacity-60'
                                    }`}>
                                        {w}
                                    </div>
                                </button>
                            );
                        })}
                        
                        {/* Spacer to allow centering Week 42 exactly in the select area */}
                        <div className="shrink-0 pointer-events-none" style={{ width: 'calc(50% - 20px)' }}></div>
                    </div>
                </div>
                
                <p className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mt-2">
                    Kéo hoặc vuốt để đổi tuần
                </p>
            </section>

            {/* Card 2: Dynamically updates as weeks slide through the select area */}
            <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-purple-100/80 flex flex-col items-center text-center transition-all duration-200">
                <div className="w-28 h-28 bg-purple-50 rounded-full flex items-center justify-center text-6xl mb-4 border-4 border-purple-100 shadow-inner transition-transform duration-200 hover:scale-105">
                    {selectedStats.emoji}
                </div>
                <h3 className="font-headline font-bold text-lg text-gray-800 mb-2">
                    Bé to bằng <span className="text-purple-600 font-extrabold">{selectedStats.name}</span>
                </h3>
                <div className="flex gap-4 mt-2 w-full justify-center">
                    <div className="bg-purple-50 border border-purple-100 text-purple-700 px-4 py-2.5 rounded-2xl flex-1 max-w-[120px] transition-all">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-1">Cân nặng</p>
                        <p className="font-black text-lg">{selectedStats.weight}g</p>
                    </div>
                    <div className="bg-pink-50 border border-pink-100 text-pink-700 px-4 py-2.5 rounded-2xl flex-1 max-w-[120px] transition-all">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-pink-400 mb-1">Chiều dài</p>
                        <p className="font-black text-lg">{selectedStats.length}cm</p>
                    </div>
                </div>
                
                {selectedWeek >= 21 && selectedWeek <= 42 && (
                    <p className="text-[9px] text-gray-400 mt-4 font-bold">* Từ tuần 21, chiều dài đo từ đỉnh đầu đến gót chân.</p>
                )}
            </section>

            {/* Card 3: Máy đếm cử động thai (Fetal Kick Counter từ Stitch) */}
            <KickCounter selectedWeek={selectedWeek} code={code} />

            {/* Card 4: Lịch khám thai sắp tới (Prenatal Checkup Card từ Stitch) */}
            <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-purple-100/80 flex flex-col gap-3 text-left">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-xs">
                            <span className="material-symbols-outlined text-2xl">calendar_month</span>
                        </span>
                        <div>
                            <h4 className="font-headline font-bold text-base text-gray-800">Lịch khám thai sắp tới</h4>
                            <p className="text-xs text-gray-500">Mốc dự kiến: {upcomingCheckup.weeks}</p>
                        </div>
                    </div>
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-100/80 px-3 py-1 rounded-full border border-teal-200/50">
                        {upcomingCheckup.badge}
                    </span>
                </div>
                <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100/60 flex items-center justify-between">
                    <div>
                        <h5 className="font-headline font-bold text-sm text-purple-900">{upcomingCheckup.title}</h5>
                        <p className="text-xs text-gray-600 mt-0.5">{upcomingCheckup.type}</p>
                    </div>
                    <span className="material-symbols-outlined text-purple-400 text-xl">event_available</span>
                </div>
            </section>

            {/* Card 5: Lời khuyên dinh dưỡng & Cảnh báo bác sĩ (Weekly Advice & Alerts từ Stitch) */}
            <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-purple-100/80 flex flex-col gap-3 text-left">
                <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-2xl">tips_and_updates</span>
                    </span>
                    <div>
                        <h4 className="font-headline font-bold text-base text-gray-800">Lời khuyên tuần {selectedWeek}</h4>
                        <p className="text-xs text-gray-500">Chăm sóc sức khỏe mẹ & bé</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2.5">
                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-950 flex gap-2.5 items-start">
                        <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">nutrition</span>
                        <div>
                            <span className="font-bold block mb-0.5 text-emerald-900">Dinh dưỡng khuyên dùng:</span>
                            <span>{weeklyAdvice.diet}</span>
                        </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 text-xs text-rose-950 flex gap-2.5 items-start">
                        <span className="material-symbols-outlined text-rose-600 text-[18px] shrink-0 mt-0.5">warning</span>
                        <div>
                            <span className="font-bold block mb-0.5 text-rose-900">Dấu hiệu cần gọi bác sĩ:</span>
                            <span>{weeklyAdvice.warning}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Late Pregnancy Alert Banner (khi >= 37 tuần hoặc <= 21 ngày) */}
            {isLatePregnancy(stats.weeks, stats.daysRemaining) && (
                <section className="bg-gradient-to-r from-[#861949]/10 via-pink-50 to-amber-50 rounded-[2.5rem] p-5 shadow-xs border border-[#861949]/20 text-left relative overflow-hidden">
                    <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-[#861949] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#861949]/30">
                            <span className="material-symbols-outlined text-2xl">notifications_active</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#861949] bg-white px-2 py-0.5 rounded-full border border-[#861949]/20">
                                    Tuần cuối thai kỳ
                                </span>
                                <span className="text-xs font-bold text-gray-800">
                                    {stats.daysRemaining <= 0 ? 'Đã đến ngày sinh!' : `Còn ~${stats.daysRemaining} ngày`}
                                </span>
                            </div>
                            <h4 className="font-headline font-black text-sm text-gray-900 mt-1">
                                Mẹ ơi, thiên thần nhỏ sắp chào đời!
                            </h4>
                            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                Đã đến lúc kiểm tra giỏ đồ sinh, ghi nhớ các dấu hiệu chuyển dạ thực sự và sẵn sàng chào đón bé yêu.
                            </p>

                            <div className="flex flex-wrap gap-2 mt-3.5">
                                <button
                                    type="button"
                                    onClick={() => setShowLaborSignsModal(true)}
                                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-pink-50 text-[#861949] font-headline font-bold text-xs flex items-center gap-1.5 border border-pink-200 shadow-xs cursor-pointer active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined text-[16px]">medical_services</span>
                                    <span>Xem dấu hiệu chuyển dạ</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowConvertBabyModal(true)}
                                    className="px-3.5 py-2 rounded-xl bg-[#861949] hover:bg-[#6c123a] text-white font-headline font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined text-[16px]">celebration</span>
                                    <span>Bé đã sinh? Chuyển hồ sơ</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Quick Action: Cẩm nang dấu hiệu chuyển dạ y khoa (Luôn có sẵn cho mẹ) */}
            <section className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-purple-100/80 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-teal-50 text-[#006972] flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-2xl">medical_information</span>
                    </span>
                    <div>
                        <h4 className="font-headline font-bold text-sm text-gray-800">Cẩm nang chuyển dạ y khoa</h4>
                        <p className="text-xs text-gray-500">Quy tắc 5-1-1, vỡ ối & dấu hiệu khẩn cấp</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setShowLaborSignsModal(true)}
                    className="px-3.5 py-1.5 rounded-full bg-teal-50 hover:bg-teal-100 text-[#006972] text-xs font-bold border border-teal-200/50 cursor-pointer active:scale-95 transition-all"
                >
                    Tra cứu
                </button>
            </section>

            {/* Card 6: Giỏ đồ đi sinh (Hospital Bag Checklist từ Stitch) */}
            <div id="hospital-bag-section">
                <HospitalBagChecklist />
            </div>

            {/* Thẻ chuyển đổi hồ sơ: Khi và chỉ khi mang thai từ tuần 25 mới hiện card này ở dưới cùng */}
            {stats.weeks >= 25 && (
                <section className="bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 rounded-[2.5rem] p-5 shadow-xs border border-pink-200/80 flex items-center justify-between text-left">
                    <div className="flex items-center gap-3.5">
                        <span className="w-11 h-11 rounded-2xl bg-[#861949] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#861949]/20">
                            <span className="material-symbols-outlined text-2xl">celebration</span>
                        </span>
                        <div>
                            <h4 className="font-headline font-bold text-sm text-gray-900">Bé đã cất tiếng khóc?</h4>
                            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                Chuyển sang chế độ em bé để ghi nhận cân nặng, chiều dài sơ sinh và bắt đầu theo dõi cữ bú, giấc ngủ.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowConvertBabyModal(true)}
                        className="px-4 py-2.5 rounded-2xl bg-[#861949] hover:bg-[#6c123a] text-white font-headline font-bold text-xs shrink-0 shadow-sm active:scale-95 transition-all cursor-pointer ml-2"
                    >
                        Chuyển đổi ngay
                    </button>
                </section>
            )}

            {/* Modals */}
            {showLateRemindModal && (
                <LatePregnancyRemindModal
                    weeks={stats.weeks}
                    daysRemaining={stats.daysRemaining}
                    onClose={() => setShowLateRemindModal(false)}
                    onOpenLaborSigns={() => setShowLaborSignsModal(true)}
                    onOpenConvertBaby={() => setShowConvertBabyModal(true)}
                />
            )}

            {showLaborSignsModal && (
                <LaborSignsModal
                    onClose={() => setShowLaborSignsModal(false)}
                    onOpenHospitalBag={() => {
                        const el = document.getElementById('hospital-bag-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                />
            )}

            {showConvertBabyModal && (
                <ConvertBabyModal
                    profile={profile}
                    code={code}
                    onClose={() => setShowConvertBabyModal(false)}
                    onSuccess={() => window.location.reload()}
                />
            )}
        </div>
    );
}
