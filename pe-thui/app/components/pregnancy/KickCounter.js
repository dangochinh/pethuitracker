'use client';

import { useState, useEffect } from 'react';
import { evaluateKickCount } from '../../lib/pregnancy-utils';

export default function KickCounter({ selectedWeek, code }) {
    const todayKey = new Date().toISOString().slice(0, 10);
    const [count, setCount] = useState(0);
    const [history, setHistory] = useState([]);
    const [showChart, setShowChart] = useState(true);
    const [weeklyHistory, setWeeklyHistory] = useState([]);

    // Tải dữ liệu hôm nay & 7 ngày gần nhất
    const loadKickData = () => {
        if (typeof window === 'undefined') return;
        const prefix = code ? `pethui_${code}_kicks_` : 'pethui_kicks_';

        // Load today
        const savedToday = localStorage.getItem(`${prefix}${todayKey}`) || localStorage.getItem(`pethui_kicks_${todayKey}`);
        if (savedToday) {
            try {
                const parsed = JSON.parse(savedToday);
                setCount(parsed.count || 0);
                setHistory(parsed.history || []);
            } catch (e) {}
        } else {
            setCount(0);
            setHistory([]);
        }

        // Load 7 days history
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);
            const dayLabel = i === 0 ? 'H.nay' : `${d.getDate()}/${d.getMonth() + 1}`;
            const raw = localStorage.getItem(`${prefix}${dateStr}`) || localStorage.getItem(`pethui_kicks_${dateStr}`);
            let dayCount = 0;
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    dayCount = parsed.count || 0;
                } catch (e) {}
            }
            days.push({
                date: dateStr,
                label: dayLabel,
                count: dayCount,
                isToday: i === 0
            });
        }
        setWeeklyHistory(days);
    };

    useEffect(() => {
        loadKickData();
    }, [todayKey, code]);

    const saveKicks = (newCount, newHistory) => {
        setCount(newCount);
        setHistory(newHistory);
        if (typeof window !== 'undefined') {
            const prefix = code ? `pethui_${code}_kicks_` : 'pethui_kicks_';
            const payload = JSON.stringify({
                count: newCount,
                history: newHistory,
                date: todayKey
            });
            localStorage.setItem(`${prefix}${todayKey}`, payload);
            localStorage.setItem(`pethui_kicks_${todayKey}`, payload); // fallback

            // Update weekly history state
            setWeeklyHistory(prev => prev.map(item => item.isToday ? { ...item, count: newCount } : item));
        }
    };

    const handleKick = () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const newCount = count + 1;
        const newHistory = [timeStr, ...history].slice(0, 50);
        
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

    // Tính toán biểu đồ cột 7 ngày
    const maxBarCount = Math.max(12, ...weeklyHistory.map(d => d.count));
    const targetGoal = 10;

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

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => setShowChart(!showChart)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            showChart ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title="Bật/Tắt biểu đồ theo dõi"
                    >
                        <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                    </button>
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200/60" title="Đang theo dõi">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </span>
                </div>
            </div>

            {/* Counter Interaction Area */}
            <div className="bg-[#861949]/5 rounded-2xl p-4 flex items-center justify-between gap-3 border border-[#861949]/15">
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
                                <span className="text-teal-700 font-bold">Đạt chuẩn! Bé rất năng động</span>
                            </>
                        ) : kickStatus.count > 0 ? (
                            <>
                                <span className="material-symbols-outlined text-[16px] text-[#861949]">favorite</span>
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
                    className="h-13 px-4 rounded-full bg-[#861949] hover:bg-[#6c123a] text-white font-headline font-bold text-sm flex items-center gap-2 shadow-md shadow-[#861949]/20 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                    <span className="material-symbols-outlined text-xl">touch_app</span>
                    <span>Bé vừa đạp!</span>
                </button>
            </div>

            {/* Visualizer Chart: Biểu đồ 7 ngày cử động thai */}
            {showChart && weeklyHistory.length > 0 && (
                <div className="bg-[#fff9fa] rounded-2xl p-4 border border-pink-100/70 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-700 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-[#861949]">insights</span>
                            Biểu đồ cử động 7 ngày gần nhất
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-teal-500 inline-block"></span>
                                ≥10 đạt chuẩn
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-0.5 bg-rose-400 border-b border-dashed inline-block"></span>
                                Mốc chuẩn
                            </span>
                        </div>
                    </div>

                    {/* Chart Bars */}
                    <div className="relative pt-6 pb-2">
                        {/* Target line (10 kicks) */}
                        <div 
                            className="absolute left-0 right-0 border-b border-dashed border-rose-300 pointer-events-none z-10 flex items-center justify-end"
                            style={{ bottom: `${Math.round((targetGoal / maxBarCount) * 88 + 26)}px` }}
                        >
                            <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1 rounded-sm mr-1">
                                10 lần
                            </span>
                        </div>

                        <div className="grid grid-cols-7 gap-2 items-end h-28 px-1">
                            {weeklyHistory.map((day) => {
                                const heightPercent = Math.min(100, Math.max(8, Math.round((day.count / maxBarCount) * 100)));
                                const isGoalMet = day.count >= 10;
                                return (
                                    <div key={day.date} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                                        {/* Value Label */}
                                        <span className={`text-[10px] font-black transition-all ${
                                            day.isToday ? 'text-purple-900 scale-110' : 'text-gray-500'
                                        }`}>
                                            {day.count}
                                        </span>

                                        {/* Bar */}
                                        <div className="w-full bg-gray-100/80 rounded-t-lg h-22 flex items-end overflow-hidden p-0.5">
                                            <div 
                                                style={{ height: `${heightPercent}%` }}
                                                className={`w-full rounded-t-md transition-all duration-500 ${
                                                    day.isToday
                                                        ? isGoalMet
                                                            ? 'bg-teal-500 shadow-xs'
                                                            : 'bg-[#861949] shadow-xs'
                                                        : isGoalMet
                                                            ? 'bg-teal-400/80'
                                                            : day.count > 0 ? 'bg-[#861949]/40' : 'bg-gray-200'
                                                }`}
                                            ></div>
                                        </div>

                                        {/* Date Label */}
                                        <span className={`text-[9px] font-bold truncate ${
                                            day.isToday ? 'text-[#861949] font-black' : 'text-gray-400'
                                        }`}>
                                            {day.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Recent kicks history tag list & reset */}
            {history.length > 0 && (
                <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0">Lần đạp gần nhất:</span>
                        {history.slice(0, 5).map((time, idx) => (
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

