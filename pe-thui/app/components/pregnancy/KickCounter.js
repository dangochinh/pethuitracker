'use client';

import { useState, useEffect } from 'react';
import { evaluateKickCount } from '../../lib/pregnancy-utils';

export default function KickCounter({ selectedWeek }) {
    const todayKey = new Date().toISOString().slice(0, 10);
    const [count, setCount] = useState(0);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`pethui_kicks_${todayKey}`);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setCount(parsed.count || 0);
                    setHistory(parsed.history || []);
                } catch (e) {}
            }
        }
    }, [todayKey]);

    const saveKicks = (newCount, newHistory) => {
        setCount(newCount);
        setHistory(newHistory);
        if (typeof window !== 'undefined') {
            localStorage.setItem(`pethui_kicks_${todayKey}`, JSON.stringify({
                count: newCount,
                history: newHistory,
                date: todayKey
            }));
        }
    };

    const handleKick = () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const newCount = count + 1;
        const newHistory = [timeStr, ...history].slice(0, 30);
        
        saveKicks(newCount, newHistory);

        // Haptic feedback
        if (typeof window !== 'undefined' && window.navigator?.vibrate) {
            try { window.navigator.vibrate([15, 30, 20]); } catch (e) {}
        }
    };

    const handleReset = () => {
        if (window.confirm('Đặt lại số lần đạp hôm nay về 0?')) {
            saveKicks(0, []);
        }
    };

    const kickStatus = evaluateKickCount(count);

    return (
        <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-purple-100/80 flex flex-col gap-4 text-left">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                    </span>
                    <div>
                        <h4 className="font-headline font-bold text-base text-gray-800">Máy đếm cử động thai</h4>
                        <span className="text-xs text-gray-500 font-medium">Mục tiêu ≥ 10 lần / 2 giờ</span>
                    </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px] uppercase tracking-wider border border-purple-200/50">
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                    Đang theo dõi
                </span>
            </div>

            {/* Counter Interaction Area */}
            <div className="bg-gradient-to-br from-purple-50/70 to-pink-50/50 rounded-2xl p-4 flex items-center justify-between gap-3 border border-purple-100/60">
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-1.5">
                        <span className="font-headline text-4xl font-black text-purple-900 leading-none">
                            {count}
                        </span>
                        <span className="text-xs font-bold text-gray-600">lần đạp hôm nay</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500 mt-1 flex items-center gap-1">
                        {kickStatus.isTargetMet ? (
                            <>
                                <span className="material-symbols-outlined text-[16px] text-teal-600">check_circle</span>
                                <span className="text-teal-700 font-bold">Bé rất năng động hôm nay!</span>
                            </>
                        ) : kickStatus.count > 0 ? (
                            <>
                                <span className="material-symbols-outlined text-[16px] text-purple-500">favorite</span>
                                <span>Cần thêm {kickStatus.remaining} cử động nữa</span>
                            </>
                        ) : (
                            <span>Chạm nút bên cạnh khi cảm nhận bé đạp</span>
                        )}
                    </span>
                </div>

                <button 
                    onClick={handleKick}
                    type="button"
                    className="h-13 px-4 rounded-full bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white font-headline font-bold text-sm flex items-center gap-2 shadow-[0_6px_20px_rgba(165,51,97,0.3)] active:scale-95 transition-all cursor-pointer shrink-0"
                >
                    <span className="material-symbols-outlined text-xl">touch_app</span>
                    <span>Bé vừa đạp!</span>
                </button>
            </div>

            {/* Recent kicks history tag list & reset */}
            {history.length > 0 && (
                <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0">Gần nhất:</span>
                        {history.slice(0, 4).map((time, idx) => (
                            <span key={idx} className="bg-purple-100/70 text-purple-800 text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0">
                                {time}
                            </span>
                        ))}
                    </div>
                    <button 
                        onClick={handleReset}
                        className="text-[11px] text-gray-400 hover:text-red-500 underline ml-2 shrink-0 cursor-pointer"
                    >
                        Đặt lại
                    </button>
                </div>
            )}
        </section>
    );
}
