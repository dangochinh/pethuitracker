'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
    calculateNextNapSweetSpot, 
    WAKE_WINDOWS_BY_AGE 
} from '../lib/sleep-prediction-utils';

export default function SweetSpotCard({ profile, sleeps = [], activeSleep = null, onSleep }) {
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const [showWakeWindowGuide, setShowWakeWindowGuide] = useState(false);

    // Cập nhật đồng hồ đếm ngược mỗi 30 giây
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const prediction = useMemo(() => {
        return calculateNextNapSweetSpot({
            dob: profile?.dob,
            sleeps,
            activeSleep,
            now: currentTime
        });
    }, [profile?.dob, sleeps, activeSleep, currentTime]);

    return (
        <div className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-indigo-100/80 relative overflow-hidden transition-all">
            {/* Background Ambient Glows */}
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-indigo-50/70 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-pink-50/70 blur-2xl pointer-events-none" />

            {/* Header: Title + PRO Badge + Info Button */}
            <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            bedtime
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-headline font-black text-sm text-gray-900 tracking-tight">
                                SweetSpot® Dự đoán giờ ngủ
                            </h3>
                            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                                PRO
                            </span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                            Chuẩn y khoa Wake Window • {prediction.wakeWindow.label}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowWakeWindowGuide(true)}
                    className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                    title="Xem bảng thời gian thức chuẩn theo độ tuổi"
                >
                    <span className="material-symbols-outlined text-[17px]">help</span>
                </button>
            </div>

            {/* Main Content Body */}
            {prediction.isSleeping ? (
                /* 1. Trạng thái bé đang ngủ */
                <div className="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100 flex flex-col items-center text-center">
                    <div className="relative mb-2">
                        <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl border-2 border-indigo-200">
                            💤
                        </div>
                        <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white animate-ping" />
                        <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white" />
                    </div>

                    <span className="text-xs font-bold text-indigo-800 uppercase tracking-widest mb-0.5">
                        Bé đang ngủ ngoan
                    </span>
                    <span className="font-headline font-black text-2xl text-indigo-950">
                        {prediction.durationText}
                    </span>
                    <p className="text-xs text-indigo-700/80 mt-1 max-w-xs">
                        {prediction.subtitle}
                    </p>

                    <button
                        type="button"
                        onClick={onSleep}
                        className="mt-3.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-headline font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
                        <span>Đánh dấu bé thức dậy</span>
                    </button>
                </div>
            ) : !prediction.hasData ? (
                /* 2. Trạng thái chưa có dữ liệu thức dậy */
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center flex flex-col items-center">
                    <span className="text-3xl mb-2">⏱️</span>
                    <h4 className="font-headline font-bold text-sm text-gray-800">
                        {prediction.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                        {prediction.subtitle}
                    </p>
                    <button
                        type="button"
                        onClick={onSleep}
                        className="mt-3 px-4 py-2 rounded-xl bg-[#861949] hover:bg-[#6c123a] text-white font-headline font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        <span>Ghi nhận giấc ngủ gần nhất</span>
                    </button>
                </div>
            ) : (
                /* 3. Trạng thái bé đang thức: Đếm ngược SweetSpot */
                <div className="flex flex-col gap-3">
                    {/* Time Target Banner */}
                    <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 rounded-2xl p-3.5 border border-indigo-100 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-base">{prediction.napType.icon}</span>
                                <span className="text-xs font-bold text-gray-600">
                                    {prediction.napType.name}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="font-headline font-black text-2xl text-gray-900">
                                    {prediction.sweetSpotFormatted}
                                </span>
                                <span className="text-xs font-semibold text-gray-500">
                                    (SweetSpot)
                                </span>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs ${prediction.badgeColor}`}>
                                {prediction.badgeText}
                            </span>
                            <p className="text-[11px] font-bold text-gray-700 mt-1">
                                {prediction.minutesRemaining > 0 
                                    ? `Còn ${prediction.minutesRemaining} phút`
                                    : prediction.minutesRemaining === 0 
                                        ? 'Ngay lúc này!'
                                        : `Quá ${Math.abs(prediction.minutesRemaining)} phút`
                                }
                            </p>
                        </div>
                    </div>

                    {/* Wake Window Progress Bar */}
                    <div className="px-1">
                        <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 mb-1">
                            <span>Đã thức: <strong className="text-gray-800 font-bold">{prediction.awakeText}</strong></span>
                            <span>Wake window: <strong className="text-gray-800 font-bold">{prediction.wakeWindow.sweetSpotMinutes} phút</strong></span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
                            <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                    prediction.status === 'overtired' 
                                        ? 'bg-rose-500' 
                                        : prediction.status === 'sweet_spot'
                                            ? 'bg-[#861949]'
                                            : prediction.status === 'wind_down'
                                                ? 'bg-amber-500'
                                                : 'bg-indigo-500'
                                }`}
                                style={{ width: `${prediction.progressPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Doctor Pediatric Guidance */}
                    <div className="bg-white rounded-2xl p-3 border border-pink-100 text-xs text-gray-700 flex items-start gap-2 shadow-2xs">
                        <span className="material-symbols-outlined text-[17px] text-[#861949] shrink-0 mt-0.5">
                            tips_and_updates
                        </span>
                        <div className="leading-relaxed">
                            <p className="font-semibold text-gray-900 mb-0.5">
                                Hướng dẫn phụ huynh:
                            </p>
                            <p className="text-gray-600">
                                {prediction.guidance}
                            </p>
                        </div>
                    </div>

                    {/* Quick Action Button */}
                    <div className="flex items-center gap-2 pt-0.5">
                        <button
                            type="button"
                            onClick={onSleep}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-[#861949] hover:bg-[#6c123a] text-white font-headline font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[16px]">bedtime</span>
                            <span>Đặt bé ngủ ngay</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Wake Windows Reference Modal */}
            {showWakeWindowGuide && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2rem] p-6 shadow-2xl max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h4 className="font-headline font-black text-base text-gray-900">
                                    Bảng thời gian thức (Wake Windows)
                                </h4>
                                <p className="text-xs text-gray-500">Chuẩn nhi khoa quốc tế theo từng độ tuổi</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowWakeWindowGuide(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        <div className="overflow-y-auto py-3 space-y-2.5 my-2 flex-1 pr-1 text-xs">
                            {WAKE_WINDOWS_BY_AGE.map((item, idx) => {
                                const isCurrentAge = item.minMonths <= calculateAgeMonths(profile?.dob, currentTime) &&
                                                     item.maxMonths > calculateAgeMonths(profile?.dob, currentTime);

                                return (
                                    <div 
                                        key={idx}
                                        className={`p-3 rounded-2xl border transition-all ${
                                            isCurrentAge 
                                                ? 'bg-pink-50/80 border-[#861949]/30 ring-1 ring-[#861949]/20' 
                                                : 'bg-gray-50/70 border-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-gray-900 flex items-center gap-1">
                                                {item.label}
                                                {isCurrentAge && (
                                                    <span className="text-[10px] bg-[#861949] text-white px-1.5 py-0.2 rounded-full font-bold">
                                                        Tuổi của bé
                                                    </span>
                                                )}
                                            </span>
                                            <span className="font-black text-[#861949]">
                                                {item.minMinutes} - {item.maxMinutes} phút
                                            </span>
                                        </div>
                                        <div className="text-gray-500 flex justify-between text-[11px] mb-1">
                                            <span>SweetSpot: <strong>{item.sweetSpotMinutes}p</strong></span>
                                            <span>Số cữ: <strong>{item.napsPerDay}</strong></span>
                                        </div>
                                        <p className="text-gray-600 text-[11px] leading-relaxed">
                                            {item.tip}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowWakeWindowGuide(false)}
                            className="w-full py-3 rounded-2xl bg-gray-900 text-white font-headline font-bold text-xs mt-2 cursor-pointer active:scale-95 transition-all"
                        >
                            Đã hiểu
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function calculateAgeMonths(dob, refDate) {
    if (!dob) return 6;
    const diff = new Date(refDate) - new Date(dob);
    return Math.max(0, diff / (1000 * 60 * 60 * 24 * 30.4375));
}
