'use client';

import { useState, useEffect, useRef } from 'react';
import { calculatePregnancyWeeks, getPregnancyWeekStats } from '../lib/pregnancy-utils';

export default function PregnancyHomeView({ profile }) {
    const [stats, setStats] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const timelineRef = useRef(null);

    useEffect(() => {
        if (profile.estimatedDueDate) {
            const current = calculatePregnancyWeeks(profile.estimatedDueDate);
            setStats(current);
            setSelectedWeek(current.weeks);
        }
    }, [profile.estimatedDueDate]);

    // Center the active week on load
    useEffect(() => {
        if (stats && timelineRef.current && selectedWeek === stats.weeks) {
            const activeEl = timelineRef.current.querySelector('.is-current');
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [stats]);

    if (!stats || !selectedWeek) return <div className="text-center py-10 opacity-50 font-bold">Đang tải dữ liệu thai kỳ...</div>;

    const weeks = Array.from({ length: 39 }, (_, i) => i + 4); // 4 to 42
    const selectedStats = getPregnancyWeekStats(selectedWeek);
    const isCurrentWeek = selectedWeek === stats.weeks;

    return (
        <div className="space-y-6">
            <section className="bg-gradient-to-br from-purple-100 to-pink-50 rounded-[2.5rem] p-6 shadow-sm border border-purple-200/50 text-center relative overflow-hidden">
                <div className="absolute -top-4 -right-4 text-6xl opacity-10 blur-[2px]">🤰</div>
                <div className="absolute -bottom-4 -left-4 text-6xl opacity-10 blur-[2px]">✨</div>
                
                <h2 className="text-purple-800 font-headline font-black text-2xl mb-1">
                    {isCurrentWeek ? `Mẹ đang ở tuần ${stats.weeks}` : `Xem trước tuần ${selectedWeek}`}
                </h2>
                {isCurrentWeek && (
                    <p className="text-purple-600/80 font-bold text-sm">Ngày thứ {stats.days} của thai kỳ</p>
                )}

                {/* Timeline UI */}
                <div className="mt-6 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-white/50 -translate-y-1/2 rounded-full"></div>
                    <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-400 to-pink-400 -translate-y-1/2 rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, ((selectedWeek - 4) / 38) * 100))}%` }}></div>
                    
                    <div ref={timelineRef} className="flex overflow-x-auto gap-4 py-4 px-1/2 hide-scrollbar relative z-10 snap-x snap-mandatory">
                        {/* Add padding elements to allow centering first and last items */}
                        <div className="w-[40%] shrink-0"></div>
                        {weeks.map(w => {
                            const isSelected = w === selectedWeek;
                            const isCurrent = w === stats.weeks;
                            const isPast = w < stats.weeks;
                            
                            return (
                                <button
                                    key={w}
                                    onClick={() => setSelectedWeek(w)}
                                    className={`shrink-0 flex flex-col items-center justify-center transition-all snap-center ${isCurrent ? 'is-current' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-4 transition-all ${
                                        isSelected ? 'bg-purple-500 text-white border-purple-200 scale-125 shadow-lg' : 
                                        isCurrent ? 'bg-white text-purple-500 border-purple-300 shadow-md' :
                                        isPast ? 'bg-purple-100 text-purple-400 border-white' :
                                        'bg-white text-gray-400 border-white opacity-60'
                                    }`}>
                                        {w}
                                    </div>
                                </button>
                            );
                        })}
                        <div className="w-[40%] shrink-0"></div>
                    </div>
                </div>
                <p className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mt-2">Kéo để xem các tuần khác</p>
            </section>

            <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-outline-variant/20 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300" key={selectedWeek}>
                <div className="w-28 h-28 bg-purple-50 rounded-full flex items-center justify-center text-6xl mb-4 border-4 border-purple-100 shadow-inner">
                    {selectedStats.emoji}
                </div>
                <h3 className="font-headline font-bold text-lg text-gray-800 mb-2">
                    Bé to bằng <span className="text-purple-600">{selectedStats.name}</span>
                </h3>
                <div className="flex gap-4 mt-2 w-full justify-center">
                    <div className="bg-purple-50 border border-purple-100 text-purple-700 px-4 py-2 rounded-2xl flex-1 max-w-[120px]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-1">Cân nặng</p>
                        <p className="font-black text-lg">{selectedStats.weight}g</p>
                    </div>
                    <div className="bg-pink-50 border border-pink-100 text-pink-700 px-4 py-2 rounded-2xl flex-1 max-w-[120px]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-pink-400 mb-1">Chiều dài</p>
                        <p className="font-black text-lg">{selectedStats.length}cm</p>
                    </div>
                </div>
                
                {selectedWeek >= 21 && selectedWeek <= 42 && (
                    <p className="text-[9px] text-gray-400 mt-4 font-bold">* Từ tuần 21, chiều dài đo từ đỉnh đầu đến gót chân.</p>
                )}
            </section>
        </div>
    );
}
