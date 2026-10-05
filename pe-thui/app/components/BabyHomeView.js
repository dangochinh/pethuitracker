'use client';

import { useState, useMemo } from 'react';
import { 
    formatBabyAge, 
    getDaysUntilNextBirthday,
    getLatestActivitiesSummary, 
    getTeethingArchData, 
    getUpcomingVaccination, 
    getKeepsakeMilestone 
} from '../lib/baby-utils';
import { assessWeight, assessHeight } from '../lib/calculations';
import NotificationBanner from './NotificationBanner';

export default function BabyHomeView({
    profile,
    code,
    records = [],
    feedings = [],
    sleeps = [],
    diapers = [],
    teethingRecords = [],
    vaccineRecords = [],
    setView,
    setShowEditProfile,
    setShowShare,
    onFeed,
    onSleep,
    onDiaper,
    onMeasure,
    onQuickMarkVaccine
}) {
    const [copied, setCopied] = useState(false);
    const [chartMetric, setChartMetric] = useState('weight'); // 'weight' or 'height'
    const [justMarkedVaccine, setJustMarkedVaccine] = useState(false);

    // Tính toán số liệu
    const ageInfo = formatBabyAge(profile?.dob);
    const nextBirthday = getDaysUntilNextBirthday(profile?.dob);
    const latestWeightRecord = records.find(r => r.weight > 0);
    const latestHeightRecord = records.find(r => r.height > 0);
    const weightStatus = latestWeightRecord ? assessWeight(latestWeightRecord.weight, latestWeightRecord.ageMonths) : null;
    const heightStatus = latestHeightRecord ? assessHeight(latestHeightRecord.height, latestHeightRecord.ageMonths) : null;

    // Dữ liệu biểu đồ tăng trưởng động (6 điểm gần nhất hoặc chuẩn mốc tháng)
    const growthChartData = useMemo(() => {
        const isWeight = chartMetric === 'weight';
        const validList = [...records]
            .filter(r => (isWeight ? r.weight > 0 : r.height > 0))
            .sort((a, b) => (a.ageMonths ?? 0) - (b.ageMonths ?? 0));

        let dataPoints = [];
        if (validList.length >= 2) {
            // Đảm bảo luôn xuất phát từ mốc sơ sinh (0 tháng)
            const firstRec = validList[0];
            const lastRec = validList[validList.length - 1];

            let selectedList = [];
            if (validList.length <= 6) {
                selectedList = [...validList];
            } else {
                // Lấy mốc đầu, mốc cuối và 4 mốc trung gian phân bố đều
                const middle = validList.slice(1, -1);
                const step = middle.length / 4;
                const sampled = [0, 1, 2, 3].map(i => middle[Math.floor(i * step)]);
                selectedList = [firstRec, ...sampled, lastRec];
            }

            // Nếu bản ghi đầu tiên chưa phải 0 tháng (ví dụ bắt đầu đo từ 2-3 tháng),
            // bổ sung mốc chuẩn sơ sinh T0 (0 tháng) ở điểm xuất phát
            if ((selectedList[0].ageMonths ?? 0) > 0) {
                selectedList.unshift({
                    ageMonths: 0,
                    weight: 3.3,
                    height: 50,
                    isPlaceholder: true
                });
                if (selectedList.length > 7) {
                    selectedList.splice(1, 1);
                }
            }

            dataPoints = selectedList.map((r, idx, arr) => ({
                label: r.ageMonths === 0 ? 'T0' : (idx === arr.length - 1 ? 'Hiện tại' : `T${r.ageMonths}`),
                ageMonths: r.ageMonths ?? idx,
                val: Number(isWeight ? r.weight : r.height),
                date: r.date
            }));
        } else if (validList.length === 1) {
            const single = validList[0];
            const currentVal = Number(isWeight ? single.weight : single.height);
            const currentAge = single.ageMonths ?? 6;
            dataPoints = [
                { label: 'T0', ageMonths: 0, val: isWeight ? 3.3 : 50 },
                { label: `T${Math.max(1, Math.round(currentAge * 0.4))}`, ageMonths: Math.round(currentAge * 0.4), val: Number((currentVal * 0.7).toFixed(1)) },
                { label: `T${Math.max(2, Math.round(currentAge * 0.7))}`, ageMonths: Math.round(currentAge * 0.7), val: Number((currentVal * 0.88).toFixed(1)) },
                { label: 'Hiện tại', ageMonths: currentAge, val: currentVal, date: single.date }
            ];
        } else {
            // Mẫu tham chiếu mặc định chuẩn WHO (bắt đầu từ mốc sơ sinh T0)
            dataPoints = isWeight 
                ? [
                    { label: 'T0', ageMonths: 0, val: 3.3 },
                    { label: 'T2', ageMonths: 2, val: 5.6 },
                    { label: 'T4', ageMonths: 4, val: 7.0 },
                    { label: 'T6', ageMonths: 6, val: 7.9 },
                    { label: 'T9', ageMonths: 9, val: 8.9 },
                    { label: 'Hiện tại', ageMonths: 12, val: 9.6 }
                ]
                : [
                    { label: 'T0', ageMonths: 0, val: 50 },
                    { label: 'T2', ageMonths: 2, val: 58 },
                    { label: 'T4', ageMonths: 4, val: 64 },
                    { label: 'T6', ageMonths: 6, val: 68 },
                    { label: 'T9', ageMonths: 9, val: 72 },
                    { label: 'Hiện tại', ageMonths: 12, val: 76 }
                ];
        }

        // Tạo dải WHO chuẩn tương ứng với từng điểm ageMonths
        const n = dataPoints.length;
        const xCoords = n === 1 ? [170] : dataPoints.map((_, i) => Math.round(20 + i * (300 / (n - 1))));

        // Min & Max bounds cho scale Y
        const values = dataPoints.map(d => d.val);
        const whoMedians = dataPoints.map(d => (isWeight ? d.ageMonths * 0.5 + 4 : d.ageMonths * 1.5 + 50));
        const whoUppers = whoMedians.map(m => (isWeight ? m * 1.25 : m * 1.08));
        const whoLowers = whoMedians.map(m => (isWeight ? m * 0.78 : m * 0.92));

        const minVal = Math.min(...values, ...whoLowers) * 0.9;
        const maxVal = Math.max(...values, ...whoUppers) * 1.1;
        const range = Math.max(maxVal - minVal, 1);

        const getY = (val) => Math.round(108 - ((val - minVal) / range) * 88);

        const babyPoints = dataPoints.map((d, i) => ({
            ...d,
            x: xCoords[i],
            y: getY(d.val)
        }));

        const whoPoints = dataPoints.map((d, i) => ({
            x: xCoords[i],
            yP50: getY(whoMedians[i]),
            yUpper: getY(whoUppers[i]),
            yLower: getY(whoLowers[i])
        }));

        // SVG Paths & Polygons
        const babyPathD = babyPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        const babyAreaPoints = [
            ...babyPoints.map(p => `${p.x},${p.y}`),
            `${babyPoints[babyPoints.length - 1].x},116`,
            `${babyPoints[0].x},116`
        ].join(' ');

        const whoBandPoints = [
            ...whoPoints.map(p => `${p.x},${p.yUpper}`),
            ...[...whoPoints].reverse().map(p => `${p.x},${p.yLower}`)
        ].join(' ');

        const whoP50D = whoPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yP50}`).join(' ');

        const latestPoint = babyPoints[babyPoints.length - 1];

        return {
            isWeight,
            unit: isWeight ? 'kg' : 'cm',
            themeColor: isWeight ? '#861949' : '#006972',
            lightColor: isWeight ? '#ffd9e2' : '#ccfbf1',
            status: isWeight ? (weightStatus?.status || 'Đạt chuẩn') : (heightStatus?.status || 'Đạt chuẩn'),
            latestVal: latestPoint.val,
            babyPoints,
            babyPathD,
            babyAreaPoints,
            whoBandPoints,
            whoP50D
        };
    }, [chartMetric, records, weightStatus, heightStatus]);

    const { latestFeed, latestSleep, latestDiaper } = getLatestActivitiesSummary(feedings, sleeps, diapers);
    const teethingData = getTeethingArchData(teethingRecords);
    const upcomingVaccine = getUpcomingVaccination(profile?.dob, vaccineRecords);
    const keepsake = getKeepsakeMilestone(ageInfo.totalMonths, profile?.name || 'Bé');

    // Chép mã code
    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Failed to copy code', e);
        }
    };

    // Đánh dấu nhanh tiêm chủng
    const handleVaccineDone = async () => {
        if (!upcomingVaccine) return;
        setJustMarkedVaccine(true);
        if (onQuickMarkVaccine) {
            await onQuickMarkVaccine(upcomingVaccine.vaccine.id);
        }
        setTimeout(() => setJustMarkedVaccine(false), 2500);
    };

    const avatarSrc = profile?.avatar || '/baby-stitch.png';

    return (
        <div className="flex flex-col w-full space-y-6 text-left pb-16">
            <NotificationBanner code={code} />

            {/* HERO PROFILE CARD: THE TACTILE KEEPSAKE */}
            <div className="relative bg-white rounded-[2.5rem] p-6 pt-16 shadow-[0_4px_24px_rgba(165,51,97,0.08)] mt-14 border border-purple-100/60">
                {/* Playful Background Accents */}
                <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full bg-pink-100/50 blur-2xl pointer-events-none"></div>
                <div className="absolute -left-3 bottom-0 w-24 h-24 rounded-full bg-teal-50/70 blur-xl pointer-events-none"></div>

                <div className="relative flex flex-col items-center text-center">
                    {/* Floating Profile Orb with Rosewood Bezel */}
                    <div 
                        onClick={() => setShowEditProfile?.(true)}
                        className="relative -mt-24 mb-3 group cursor-pointer"
                        title="Chỉnh sửa hồ sơ bé"
                    >
                        <div className="w-24 h-24 rounded-full p-1 bg-white shadow-[0_12px_30px_rgba(165,51,97,0.22)] flex items-center justify-center transition-transform active:scale-95 duration-200">
                            <img 
                                className="w-full h-full rounded-full object-cover" 
                                alt={profile?.name || 'Bé Yêu'} 
                                src={avatarSrc}
                                onError={(e) => { e.currentTarget.src = '/baby-default.png'; }}
                            />
                        </div>
                        <div className="absolute bottom-0 right-1 w-7 h-7 rounded-full bg-[#861949] text-white flex items-center justify-center shadow-md">
                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        </div>
                    </div>

                    {/* Baby Identity & Status */}
                    <div className="flex items-center gap-1.5">
                        <h2 className="font-headline font-bold text-2xl text-gray-900">{profile?.name || 'Bé yêu'}</h2>
                        <span className="material-symbols-outlined text-[#861949] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-gray-600">{ageInfo.formatted}</span>
                        {nextBirthday && (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                <span 
                                    className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold border transition-colors ${
                                        nextBirthday.daysUntil === 0
                                            ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                                            : nextBirthday.daysUntil <= 30
                                                ? 'bg-rose-50 text-[#861949] border-rose-200'
                                                : 'bg-teal-50 text-teal-700 border-teal-200/50'
                                    }`}
                                    title={nextBirthday.label}
                                >
                                    <span>🎂</span>
                                    <span>
                                        {nextBirthday.daysUntil === 0 
                                            ? `Hôm nay sinh nhật tròn ${nextBirthday.nextAge} tuổi!` 
                                            : `Còn ${nextBirthday.daysUntil} ngày`}
                                    </span>
                                </span>
                            </>
                        )}
                    </div>

                    {/* Share Code Pill */}
                    <div className="mt-3">
                        <button 
                            onClick={handleCopyCode}
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50/80 hover:bg-purple-100/70 text-gray-700 transition-all active:scale-95 border border-purple-200/40 shadow-xs cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[15px] text-[#861949]">tag</span>
                            <span className="text-xs font-bold text-[#861949]">Mã bé: <span>#{code}</span></span>
                            <span className="material-symbols-outlined text-[15px] text-[#861949]">
                                {copied ? 'check' : 'content_copy'}
                            </span>
                        </button>
                    </div>

                    {/* Core Metrics Row (Linen Wells) */}
                    <div className="grid grid-cols-2 gap-3 w-full mt-5">
                        <div 
                            onClick={() => setView?.('growth')}
                            className="bg-[#fff8f8] rounded-2xl p-3.5 flex flex-col items-center justify-center border border-pink-100/70 cursor-pointer hover:bg-pink-50/50 transition-colors"
                        >
                            <div className="flex items-center gap-1 text-gray-500">
                                <span className="material-symbols-outlined text-[16px] text-[#861949]">monitor_weight</span>
                                <span className="text-xs font-semibold">Cân nặng</span>
                            </div>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="font-headline text-2xl font-black text-gray-900">
                                    {latestWeightRecord ? latestWeightRecord.weight : '--'}
                                </span>
                                <span className="text-xs font-bold text-gray-500">kg</span>
                            </div>
                            <span className="text-[10px] text-teal-700 font-bold mt-1 flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[12px]">trending_up</span>
                                {weightStatus?.status || 'Đạt chuẩn'}
                            </span>
                        </div>

                        <div 
                            onClick={() => setView?.('growth')}
                            className="bg-[#fff8f8] rounded-2xl p-3.5 flex flex-col items-center justify-center border border-pink-100/70 cursor-pointer hover:bg-pink-50/50 transition-colors"
                        >
                            <div className="flex items-center gap-1 text-gray-500">
                                <span className="material-symbols-outlined text-[16px] text-teal-600">straighten</span>
                                <span className="text-xs font-semibold">Chiều cao</span>
                            </div>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="font-headline text-2xl font-black text-gray-900">
                                    {latestHeightRecord ? latestHeightRecord.height : '--'}
                                </span>
                                <span className="text-xs font-bold text-gray-500">cm</span>
                            </div>
                            <span className="text-[10px] text-teal-700 font-bold mt-1 flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                {heightStatus?.status || 'Đạt chuẩn'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* QUICK STATS TRACKER (3 RECENT ACTIVITY TILES) */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                    <span className="font-headline font-bold text-sm text-gray-800">Nhật ký hôm nay</span>
                    <span className="text-xs text-gray-400">Cập nhật tức thì</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                    {/* Feed Tile */}
                    <div 
                        onClick={onFeed}
                        className="bg-white rounded-2xl p-3.5 flex flex-col justify-between shadow-xs border border-pink-100/80 active:scale-95 transition-transform cursor-pointer hover:shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-full bg-pink-100 text-[#861949] flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px]">baby_changing_station</span>
                            </div>
                            <span className="w-2 h-2 rounded-full bg-[#861949] animate-pulse"></span>
                        </div>
                        <div className="mt-3">
                            <span className="text-xs text-gray-500 block">Cữ sữa</span>
                            <span className="font-headline text-base font-black text-gray-900 block leading-tight">
                                {latestFeed ? latestFeed.amount : 'Chưa ghi'}
                            </span>
                            <span className="text-[10px] text-[#861949] font-bold mt-1 block truncate">
                                {latestFeed?.time ? `Lúc ${latestFeed.time}` : '+ Thêm ngay'}
                            </span>
                        </div>
                    </div>

                    {/* Sleep Tile */}
                    <div 
                        onClick={onSleep}
                        className="bg-white rounded-2xl p-3.5 flex flex-col justify-between shadow-xs border border-teal-100/80 active:scale-95 transition-transform cursor-pointer hover:shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px]">bedtime</span>
                            </div>
                            {latestSleep?.isSleeping && (
                                <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping"></span>
                            )}
                        </div>
                        <div className="mt-3">
                            <span className="text-xs text-gray-500 block">Giấc ngủ</span>
                            <span className="font-headline text-base font-black text-gray-900 block leading-tight">
                                {latestSleep ? latestSleep.durationText : 'Chưa ghi'}
                            </span>
                            <span className="text-[10px] text-teal-700 font-bold mt-1 block truncate">
                                {latestSleep ? latestSleep.note : '+ Bắt đầu ngủ'}
                            </span>
                        </div>
                    </div>

                    {/* Diaper Tile */}
                    <div 
                        onClick={onDiaper}
                        className="bg-white rounded-2xl p-3.5 flex flex-col justify-between shadow-xs border border-amber-100/80 active:scale-95 transition-transform cursor-pointer hover:shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px]">water_drop</span>
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-xs text-gray-500 block">Thay tã</span>
                            <span className="font-headline text-base font-black text-gray-900 block leading-tight">
                                {latestDiaper ? latestDiaper.label : 'Chưa ghi'}
                            </span>
                            <span className="text-[10px] text-amber-800 font-bold mt-1 block truncate">
                                {latestDiaper?.time ? `Lúc ${latestDiaper.time}` : '+ Thay tã'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* INTERACTIVE TEETHING ARCH PREVIEW */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-purple-100/70 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-pink-100 text-[#861949] flex items-center justify-center shadow-xs">
                            <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                        </div>
                        <div>
                            <h3 className="font-headline font-bold text-sm text-gray-900">Sơ đồ mọc răng</h3>
                            <p className="text-xs text-gray-500">Đã mọc {teethingData.sproutedCount}/{teethingData.totalCount} chiếc răng sữa</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setView?.('teething')}
                        type="button"
                        className="w-8 h-8 rounded-full bg-purple-50 text-gray-600 hover:text-[#861949] flex items-center justify-center transition-colors active:scale-90 cursor-pointer"
                        title="Xem chi tiết sơ đồ răng"
                    >
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    </button>
                </div>

                {/* Teething Miniature Visualizer */}
                <div className="bg-[#fff8f8] rounded-2xl p-4 flex flex-col items-center border border-pink-100/50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                        Hàm trên ({teethingData.upperEruptedCount} răng đã mọc)
                    </span>
                    
                    {/* Upper Jaw Arc */}
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                        {teethingData.upperJaw.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setView?.('teething')}
                                title={`${t.vnName} ${t.erupted ? '(Đã mọc)' : '(Chưa mọc)'}`}
                                className={`w-6 h-7 rounded-t-lg transition-transform active:scale-95 flex items-center justify-center text-xs font-bold ${
                                    t.erupted 
                                        ? 'bg-[#ffd9e2] text-[#861949] shadow-xs' 
                                        : 'bg-gray-200/50 text-gray-300'
                                }`}
                            >
                                {t.erupted ? '🦷' : '·'}
                            </button>
                        ))}
                    </div>

                    {/* Jaw Separation Stitched Line */}
                    <div className="w-48 border-t-2 border-dashed border-pink-200 my-1"></div>

                    {/* Lower Jaw Arc */}
                    <div className="flex items-center justify-center gap-1.5 mt-2 mb-1">
                        {teethingData.lowerJaw.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setView?.('teething')}
                                title={`${t.vnName} ${t.erupted ? '(Đã mọc)' : '(Chưa mọc)'}`}
                                className={`w-6 h-7 rounded-b-lg transition-transform active:scale-95 flex items-center justify-center text-xs font-bold ${
                                    t.erupted 
                                        ? 'bg-[#ffd9e2] text-[#861949] shadow-xs' 
                                        : 'bg-gray-200/50 text-gray-300'
                                }`}
                            >
                                {t.erupted ? '🦷' : '·'}
                            </button>
                        ))}
                    </div>

                    <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                        Hàm dưới ({teethingData.lowerEruptedCount} răng đã mọc)
                    </span>
                </div>

                {/* Recent Tooth Eruption Badge Callout */}
                {teethingData.mostRecentTooth && (
                    <div className="mt-3 p-3 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#861949] text-[18px]">celebration</span>
                            <span className="text-xs text-gray-800">
                                Răng mới nhất: <strong>{teethingData.mostRecentTooth.name}</strong>
                            </span>
                        </div>
                        {teethingData.mostRecentTooth.date && (
                            <span className="text-[10px] text-gray-500 font-medium">
                                {new Date(teethingData.mostRecentTooth.date).toLocaleDateString('vi-VN')}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* GROWTH CHART WIDGET: 6-MONTH WHO PERCENTILES */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-purple-100/70 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-xs">
                            <span className="material-symbols-outlined text-[20px]">query_stats</span>
                        </div>
                        <div>
                            <h3 className="font-headline font-bold text-sm text-gray-900">Đường cong tăng trưởng</h3>
                            <p className="text-xs text-gray-500">Theo chuẩn tăng trưởng WHO</p>
                        </div>
                    </div>

                    {/* Toggle Metrics Buttons */}
                    <div className="inline-flex p-0.5 rounded-full bg-gray-100 border border-gray-200">
                        <button 
                            type="button"
                            onClick={() => setChartMetric('weight')}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                chartMetric === 'weight'
                                    ? 'bg-[#861949] text-white shadow-xs'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            Cân nặng
                        </button>
                        <button 
                            type="button"
                            onClick={() => setChartMetric('height')}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                chartMetric === 'height'
                                    ? 'bg-teal-700 text-white shadow-xs'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            Chiều cao
                        </button>
                    </div>
                </div>

                {/* Inline Lightweight SVG Chart Container */}
                <div className="relative w-full bg-[#fff8f8] rounded-2xl p-4 flex flex-col justify-end border border-pink-100/60 overflow-hidden">
                    {/* Embedded animation styles */}
                    <style>{`
                        @keyframes drawGrowthPath {
                            0% {
                                stroke-dashoffset: 600;
                                opacity: 0.2;
                            }
                            100% {
                                stroke-dashoffset: 0;
                                opacity: 1;
                            }
                        }
                        @keyframes fadeInGrowthArea {
                            0% {
                                opacity: 0;
                                transform: translateY(6px);
                            }
                            100% {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        @keyframes popGrowthPoint {
                            0% {
                                transform: scale(0);
                                opacity: 0;
                            }
                            70% {
                                transform: scale(1.3);
                                opacity: 1;
                            }
                            100% {
                                transform: scale(1);
                                opacity: 1;
                            }
                        }
                        .animate-growth-line {
                            stroke-dasharray: 600;
                            stroke-dashoffset: 600;
                            animation: drawGrowthPath 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                        }
                        .animate-growth-area {
                            animation: fadeInGrowthArea 0.7s ease-out 0.2s forwards;
                        }
                        .animate-growth-point {
                            transform-origin: center;
                            animation: popGrowthPoint 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                        }
                    `}</style>

                    <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-1.5">
                            <span 
                                className="text-xs font-bold px-2 py-0.5 rounded-full transition-colors duration-300"
                                style={{
                                    backgroundColor: growthChartData.lightColor,
                                    color: growthChartData.themeColor
                                }}
                            >
                                Gần nhất: {growthChartData.latestVal} {growthChartData.unit}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <span className="w-2.5 h-1 rounded-full bg-teal-600"></span>
                                <span className="text-[10px] text-gray-500 font-medium">WHO P50</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span 
                                    className="w-2.5 h-2 rounded-full transition-colors duration-300" 
                                    style={{ backgroundColor: growthChartData.themeColor }}
                                ></span>
                                <span 
                                    className="text-[10px] font-bold transition-colors duration-300"
                                    style={{ color: growthChartData.themeColor }}
                                >
                                    {profile?.name || 'Bé'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* SVG Chart with key to re-trigger drawing animation on toggle */}
                    <svg 
                        key={chartMetric} 
                        className="w-full h-28 overflow-visible" 
                        preserveAspectRatio="none" 
                        viewBox="0 0 340 120"
                    >
                        <defs>
                            <linearGradient id={`growthGradient-${chartMetric}`} x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor={growthChartData.themeColor} stopOpacity="0.25" />
                                <stop offset="100%" stopColor={growthChartData.themeColor} stopOpacity="0.0" />
                            </linearGradient>
                        </defs>

                        {/* WHO Standard Band P15-P85 */}
                        <polygon 
                            fill="#a1eff9" 
                            fillOpacity="0.22" 
                            points={growthChartData.whoBandPoints} 
                            className="transition-all duration-500"
                        />

                        {/* WHO Median P50 Line */}
                        <path 
                            d={growthChartData.whoP50D} 
                            fill="none" 
                            opacity="0.65" 
                            stroke="#006972" 
                            strokeDasharray="3,3" 
                            strokeWidth="1.5" 
                            className="transition-all duration-500"
                        />

                        {/* Baby Growth Area Fill */}
                        <polygon 
                            fill={`url(#growthGradient-${chartMetric})`} 
                            points={growthChartData.babyAreaPoints} 
                            className="animate-growth-area opacity-0"
                        />

                        {/* Animated Baby Trajectory Line */}
                        <path 
                            d={growthChartData.babyPathD} 
                            fill="none" 
                            stroke={growthChartData.themeColor} 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            strokeWidth="3" 
                            className="animate-growth-line"
                        />

                        {/* Staggered Animated Data Points */}
                        {growthChartData.babyPoints.map((pt, idx) => {
                            const isLast = idx === growthChartData.babyPoints.length - 1;
                            const delay = (0.2 + idx * 0.1).toFixed(2);
                            return (
                                <g key={`${chartMetric}-${idx}`} style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}>
                                    {isLast && (
                                        <circle 
                                            cx={pt.x} 
                                            cy={pt.y} 
                                            fill={growthChartData.lightColor} 
                                            r="8" 
                                            className="animate-ping" 
                                            opacity="0.75" 
                                        />
                                    )}
                                    <circle 
                                        cx={pt.x} 
                                        cy={pt.y} 
                                        fill={growthChartData.themeColor} 
                                        r={isLast ? "4.5" : "3"}
                                        className="animate-growth-point opacity-0"
                                        style={{ animationDelay: `${delay}s` }}
                                    />
                                </g>
                            );
                        })}
                    </svg>

                    <div className="flex justify-between items-center px-1 pt-2 border-t border-pink-100/40 text-[10px] text-gray-400 font-bold uppercase">
                        {growthChartData.babyPoints.map((pt, idx) => (
                            <span 
                                key={idx} 
                                className={idx === growthChartData.babyPoints.length - 1 ? 'font-black' : ''}
                                style={idx === growthChartData.babyPoints.length - 1 ? { color: growthChartData.themeColor } : {}}
                            >
                                {pt.label}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-1 px-1">
                    <span className="flex items-center gap-1 font-medium">
                        <span 
                            className="material-symbols-outlined text-[16px] transition-colors duration-300" 
                            style={{ color: growthChartData.themeColor }}
                        >
                            health_and_safety
                        </span>
                        <span>{growthChartData.status} theo chuẩn WHO</span>
                    </span>
                    <button 
                        onClick={() => setView?.('growth')}
                        type="button"
                        className="font-bold hover:underline cursor-pointer transition-colors duration-300"
                        style={{ color: growthChartData.themeColor }}
                    >
                        Xem báo cáo chi tiết →
                    </button>
                </div>
            </div>

            {/* UPCOMING VACCINATION REMINDER CARD */}
            {upcomingVaccine && (
                <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-purple-100/70 relative overflow-hidden">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-[#861949] flex items-center justify-center shrink-0 shadow-xs">
                                <span className="material-symbols-outlined text-[24px]">vaccines</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold border border-red-200/60 bg-red-50 text-red-700`}>
                                        {upcomingVaccine.urgency}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {upcomingVaccine.daysUntilDue > 0 
                                            ? `Còn ${upcomingVaccine.daysUntilDue} ngày` 
                                            : 'Đã đến hạn'}
                                    </span>
                                </div>
                                <h4 className="font-headline font-bold text-base text-gray-900 mt-1">
                                    {upcomingVaccine.vaccine.name}
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {upcomingVaccine.vaccine.disease} ({upcomingVaccine.recommendedAgeText})
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons row */}
                    <div className="grid grid-cols-2 gap-2.5 mt-4">
                        <button 
                            type="button"
                            onClick={() => setView?.('health')}
                            className="w-full py-2.5 px-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-headline font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                            <span>Sổ tiêm chủng</span>
                        </button>
                        <button 
                            type="button"
                            onClick={handleVaccineDone}
                            className={`w-full py-2.5 px-3 rounded-full font-headline font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-white shadow-xs ${
                                justMarkedVaccine 
                                    ? 'bg-teal-600' 
                                    : 'bg-[#861949] hover:bg-[#a53361]'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">
                                {justMarkedVaccine ? 'done_all' : 'check_circle'}
                            </span>
                            <span>{justMarkedVaccine ? 'Đã ghi nhận!' : 'Đã tiêm'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* FLOATING QUICK LOG ACTION DOCK (4 FAST LOG BUTTONS) */}
            <div className="bg-[#fff8f8] rounded-[2rem] p-4 border border-pink-100/70 shadow-xs">
                <div className="flex items-center justify-between mb-3 px-1">
                    <span className="font-headline font-bold text-sm text-gray-800">Ghi nhanh cữ hoạt động</span>
                    <span className="material-symbols-outlined text-[#861949] text-[20px]">add_circle</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    <button 
                        type="button"
                        onClick={onFeed}
                        className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white hover:bg-pink-50 transition-colors active:scale-90 group shadow-xs cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-full bg-pink-100 text-[#861949] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-[20px]">water_bottle</span>
                        </div>
                        <span className="text-[11px] text-gray-700 font-bold">Cữ sữa</span>
                    </button>

                    <button 
                        type="button"
                        onClick={onSleep}
                        className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white hover:bg-teal-50 transition-colors active:scale-90 group shadow-xs cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-[20px]">nights_stay</span>
                        </div>
                        <span className="text-[11px] text-gray-700 font-bold">Giấc ngủ</span>
                    </button>

                    <button 
                        type="button"
                        onClick={onDiaper}
                        className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white hover:bg-amber-50 transition-colors active:scale-90 group shadow-xs cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-[20px]">cleaning_services</span>
                        </div>
                        <span className="text-[11px] text-gray-700 font-bold">Thay tã</span>
                    </button>

                    <button 
                        type="button"
                        onClick={onMeasure}
                        className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white hover:bg-purple-50 transition-colors active:scale-90 group shadow-xs cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-[#861949] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-[20px]">straighten</span>
                        </div>
                        <span className="text-[11px] text-gray-700 font-bold">Đo bé</span>
                    </button>
                </div>
            </div>

            {/* SWEET KEEPSAKE NOTE BANNER */}
            <div className="bg-white rounded-[2rem] p-4 border-[2px] border-dashed border-pink-200/80 flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-[#861949] shrink-0">
                    <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
                </div>
                <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-gray-800 block truncate">
                        {keepsake.title}
                    </span>
                    <span className="text-xs text-gray-500 block line-clamp-2 mt-0.5">
                        {keepsake.message}
                    </span>
                </div>
            </div>
        </div>
    );
}
