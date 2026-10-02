'use client';

import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { 
    generateDayCarousel, 
    aggregateDailyStats, 
    mergeTimelineEvents, 
    getStandardMilestones, 
    calculateMilestoneProgress 
} from '../../lib/journal-utils';
import { formatBabyAge } from '../../lib/baby-utils';
import MilestoneCelebrationCard from './MilestoneCelebrationCard';

export default function JournalMilestonesView({ profile, code }) {
    const todayStr = dayjs().format('YYYY-MM-DD');
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [activeTab, setActiveTab] = useState('daily'); // 'daily' or 'milestones'
    
    // Dữ liệu hoạt động & nhật ký
    const [feedings, setFeedings] = useState([]);
    const [sleeps, setSleeps] = useState([]);
    const [diapers, setDiapers] = useState([]);
    const [journalEntries, setJournalEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal thêm mới
    const [showAddModal, setShowAddModal] = useState(false);
    const [entryType, setEntryType] = useState('milk'); // 'milk', 'food', 'sleep', 'milestone'
    const [entryTime, setEntryTime] = useState(dayjs().format('HH:mm'));
    const [entryNote, setEntryNote] = useState('');
    const [entryAmount, setEntryAmount] = useState('180');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Trạng thái các cột mốc đã đạt (lưu trữ localStorage)
    const [checkedMilestones, setCheckedMilestones] = useState({});

    const babyAge = formatBabyAge(profile?.dob);
    const dayCarousel = generateDayCarousel(selectedDate, 3);
    const milestonesData = getStandardMilestones(babyAge.totalMonths);
    const progress = calculateMilestoneProgress(milestonesData.categories, checkedMilestones);

    // Tải dữ liệu từ LocalStorage cho cột mốc
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`pethui_milestones_${code}`);
            if (saved) {
                try {
                    setCheckedMilestones(JSON.parse(saved));
                } catch (e) {}
            }
        }
    }, [code]);

    const toggleMilestone = (id) => {
        setCheckedMilestones(prev => {
            const currentVal = prev[id] !== undefined ? prev[id] : true;
            const next = { ...prev, [id]: !currentVal };
            if (typeof window !== 'undefined') {
                localStorage.setItem(`pethui_milestones_${code}`, JSON.stringify(next));
            }
            return next;
        });
    };

    // Tải dữ liệu các hoạt động trong ngày được chọn
    const fetchDataForDate = async (targetDate) => {
        try {
            setLoading(true);
            const t = Date.now();
            const [feedRes, sleepRes, diaperRes, journalRes] = await Promise.all([
                fetch(`/api/feedings?code=${code}&date=${targetDate}&t=${t}`, { cache: 'no-store' }),
                fetch(`/api/sleeps?code=${code}&date=${targetDate}&t=${t}`, { cache: 'no-store' }),
                fetch(`/api/diapers?code=${code}&date=${targetDate}&t=${t}`, { cache: 'no-store' }),
                fetch(`/api/journal?code=${code}&t=${t}`, { cache: 'no-store' }),
            ]);

            const [feedJson, sleepJson, diaperJson, journalJson] = await Promise.all([
                feedRes.json(), sleepRes.json(), diaperRes.json(), journalRes.json()
            ]);

            if (feedJson.success) setFeedings(feedJson.data || []);
            if (sleepJson.success) setSleeps(sleepJson.data || []);
            if (diaperJson.success) setDiapers(diaperJson.data || []);
            if (journalJson.success) {
                // Lọc journal của ngày này hoặc lấy hết nếu là cột mốc
                const list = (journalJson.data || []).filter(j => {
                    const jDate = j.date ? j.date.slice(0, 10) : '';
                    return jDate === targetDate || j.type === 'milestone';
                });
                setJournalEntries(list);
            }
        } catch (e) {
            console.error('Failed to fetch journal data', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (code && selectedDate) {
            fetchDataForDate(selectedDate);
        }
    }, [code, selectedDate]);

    // Xử lý thêm ghi chú nhanh
    const handleSaveEntry = async (e) => {
        e.preventDefault();
        if (!entryNote.trim() && entryType === 'milestone') return;
        setIsSubmitting(true);
        try {
            if (entryType === 'milk') {
                await fetch('/api/feedings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        date: selectedDate,
                        time: entryTime,
                        amount: Number(entryAmount) || 120,
                        type: 'bottle',
                        notes: entryNote.trim()
                    })
                });
            } else if (entryType === 'sleep') {
                const nowIso = new Date().toISOString();
                await fetch('/api/sleeps', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        date: selectedDate,
                        startTime: `${selectedDate}T${entryTime}:00`,
                        endTime: nowIso,
                        notes: entryNote.trim()
                    })
                });
            } else {
                await fetch('/api/journal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        date: selectedDate,
                        caption: entryNote.trim() || 'Cột mốc phát triển mới của bé! ✨',
                        type: entryType === 'milestone' ? 'milestone' : 'memory',
                        tags: [entryType]
                    })
                });
            }
            setShowAddModal(false);
            setEntryNote('');
            fetchDataForDate(selectedDate);
        } catch (err) {
            console.error('Error adding entry', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const stats = aggregateDailyStats(feedings, sleeps, diapers, journalEntries);
    const timeline = mergeTimelineEvents(feedings, sleeps, diapers, journalEntries);

    // Mẫu cột mốc đặc biệt để hiển thị nếu chưa có ảnh
    const sampleMilestone = timeline.find(t => t.category === 'milestone') || {
        id: 'sample_m1',
        title: `${profile?.name || 'Pe Thúi'} tự đứng bám vịn & vỗ tay!`,
        subtitle: 'Hôm nay con vịn thành ghế sofa đứng vững suốt 20 giây, miệng cười tít mắt rồi tự vỗ tay hoan hô trước sự reo mừng của cả nhà!',
        time: '16:00',
        period: '16:00 CHIỀU',
        emotion: 'Cả nhà vỡ òa hạnh phúc ❤️',
        photos: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAWmeKNN6sF_SBWYogtFUPdI1-6ehRcnTZVe3KrcP1SD2Wu10sOA7NjM24LvXvx5LRXd-xvWjt8MK1zpwfeblqAIWbuHBqqO9V_BB7bZyuEIfO-CVG5VXGWPqldkYGoDzC8pkEPF6IpJ4lzPJg5ZYzrrGnOj21fzk0x42AuTLzuB16U6ag2gJkQ8MUop851ffDl8HF8uw3w05JuHwR46gqShwALE7Ws0uowjIay_DdvArCJX25uvWroXQ']
    };

    return (
        <div className="flex flex-col w-full space-y-6 text-left pb-24">
            {/* Header Switcher: Daily Logs vs Milestones */}
            <div className="flex items-center justify-between bg-purple-100/50 p-1 rounded-full shadow-xs border border-purple-200/40">
                <button 
                    type="button"
                    onClick={() => setActiveTab('daily')}
                    className={`flex-1 py-2.5 px-4 rounded-full font-headline font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'daily'
                            ? 'bg-white text-[#861949] shadow-sm'
                            : 'text-gray-500 hover:text-[#861949]'
                    }`}
                >
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span>Nhật ký ngày</span>
                </button>
                <button 
                    type="button"
                    onClick={() => setActiveTab('milestones')}
                    className={`flex-1 py-2.5 px-4 rounded-full font-headline font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'milestones'
                            ? 'bg-white text-[#861949] shadow-sm'
                            : 'text-gray-500 hover:text-[#861949]'
                    }`}
                >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Cột mốc {milestonesData.ageRange}</span>
                </button>
            </div>

            {/* VIEW 1: DAILY TIMELINE LOGS */}
            {activeTab === 'daily' && (
                <div className="flex flex-col space-y-5">
                    {/* Horizontal Day Scroller / Mini Calendar Carousel */}
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <span className="font-headline font-bold text-sm text-gray-900">
                                Tháng {dayjs(selectedDate).format('M, YYYY')}
                            </span>
                            <span className="text-[10px] uppercase px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-extrabold border border-teal-200/50">
                                {babyAge.formatted}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
                            {dayCarousel.map(day => (
                                <button
                                    key={day.dateString}
                                    type="button"
                                    onClick={() => !day.isFuture && setSelectedDate(day.dateString)}
                                    disabled={day.isFuture}
                                    className={`flex flex-col items-center justify-center min-w-[56px] h-20 rounded-2xl p-2 transition-all cursor-pointer flex-shrink-0 border ${
                                        day.isSelected
                                            ? 'bg-[#861949] text-white shadow-md border-[#861949]'
                                            : day.isFuture
                                                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-50'
                                                : 'bg-white text-gray-700 hover:bg-pink-50/50 border-purple-100/70'
                                    }`}
                                >
                                    <span className="text-[11px] font-semibold">{day.label}</span>
                                    <span className="font-headline text-lg font-black mt-0.5">{day.dayNumber}</span>
                                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
                                        day.isSelected 
                                            ? 'bg-white animate-pulse' 
                                            : day.isFuture 
                                                ? 'bg-transparent' 
                                                : 'bg-pink-300'
                                    }`}></div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Daily Quick Summary Pills */}
                    <div className="grid grid-cols-4 gap-2">
                        <div className="bg-white p-2.5 rounded-2xl flex flex-col items-center text-center shadow-xs border border-pink-100">
                            <span className="material-symbols-outlined text-[#861949] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                water_drop
                            </span>
                            <span className="font-headline text-base font-black text-gray-900 mt-1">
                                {stats.milkDisplay}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">Sữa ấm</span>
                        </div>

                        <div className="bg-white p-2.5 rounded-2xl flex flex-col items-center text-center shadow-xs border border-teal-100">
                            <span className="material-symbols-outlined text-teal-700 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                bedtime
                            </span>
                            <span className="font-headline text-base font-black text-gray-900 mt-1">
                                {stats.sleepDisplay}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">Ngủ ngày</span>
                        </div>

                        <div className="bg-white p-2.5 rounded-2xl flex flex-col items-center text-center shadow-xs border border-amber-100">
                            <span className="material-symbols-outlined text-amber-700 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                restaurant
                            </span>
                            <span className="font-headline text-base font-black text-gray-900 mt-1">
                                {stats.diaperCount > 0 ? `${stats.diaperCount} lần` : '0 lần'}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">Thay tã</span>
                        </div>

                        <div className="bg-white p-2.5 rounded-2xl flex flex-col items-center text-center shadow-xs border border-purple-100">
                            <span className="material-symbols-outlined text-[#861949] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                auto_awesome
                            </span>
                            <span className="font-headline text-base font-black text-gray-900 mt-1">
                                {stats.milestoneDisplay}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">Cột mốc</span>
                        </div>
                    </div>

                    {/* Timeline Stream */}
                    <div className="relative pl-6 space-y-4 pt-2">
                        {/* Decorative Organic Track Line */}
                        <div className="absolute left-2.5 top-3 bottom-4 w-0.5 bg-gradient-to-b from-[#861949] via-pink-200 to-teal-200 rounded-full"></div>

                        {timeline.length === 0 ? (
                            <div className="bg-white rounded-2xl p-6 text-center border border-purple-100 ml-2 shadow-xs">
                                <span className="text-3xl block mb-2">📝</span>
                                <p className="text-xs text-gray-500">Chưa có nhật ký hoạt động nào trong ngày {selectedDate}.</p>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(true)}
                                    className="mt-3 px-4 py-2 rounded-full bg-pink-50 text-[#861949] font-bold text-xs hover:bg-pink-100 transition-colors cursor-pointer"
                                >
                                    + Ghi nhận hoạt động đầu tiên
                                </button>
                            </div>
                        ) : (
                            timeline.map((item) => (
                                <div key={item.id} className="relative flex items-start group">
                                    {/* Timeline Marker Icon */}
                                    <div className={`absolute -left-[23px] top-2 w-6 h-6 rounded-full flex items-center justify-center shadow-xs ring-4 ring-[#fff8f8] ${
                                        item.category === 'feed'
                                            ? 'bg-pink-100 text-[#861949]'
                                            : item.category === 'sleep'
                                                ? 'bg-teal-100 text-teal-800'
                                                : item.category === 'diaper'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-[#861949] text-white animate-bounce'
                                    }`}>
                                        <span className="material-symbols-outlined text-[14px]">
                                            {item.icon}
                                        </span>
                                    </div>

                                    {/* Content Card */}
                                    {item.category === 'milestone' ? (
                                        <div className="w-full ml-2">
                                            <MilestoneCelebrationCard milestone={item} ageText={babyAge.formatted} />
                                        </div>
                                    ) : (
                                        <div className="w-full bg-white p-4 rounded-2xl shadow-xs border border-pink-100/70 flex flex-col space-y-1 ml-2 transition-all hover:shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-[#861949] uppercase font-bold tracking-wider">
                                                    {item.period}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[#861949] text-[10px] font-bold border border-purple-100">
                                                    {item.badge}
                                                </span>
                                            </div>
                                            <h3 className="font-headline font-bold text-sm text-gray-900">
                                                {item.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-medium">
                                                {item.subtitle}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}

                        {/* Always showcase a milestone card preview if no milestone yet today */}
                        {!timeline.some(t => t.category === 'milestone') && (
                            <div className="relative flex items-start group pt-2">
                                <div className="absolute -left-[23px] top-4 w-6 h-6 rounded-full bg-[#861949] flex items-center justify-center text-white shadow-xs ring-4 ring-[#fff8f8] animate-bounce">
                                    <span className="material-symbols-outlined text-[14px]">star</span>
                                </div>
                                <div className="w-full ml-2">
                                    <MilestoneCelebrationCard milestone={sampleMilestone} ageText={babyAge.formatted} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* VIEW 2: DEVELOPMENTAL MILESTONES CHECKLIST */}
            {activeTab === 'milestones' && (
                <div className="flex flex-col space-y-4">
                    {/* Milestone Category Overview Banner */}
                    <div className="bg-gradient-to-r from-pink-100/80 via-purple-50 to-pink-50 p-4.5 rounded-[2rem] flex items-center gap-3.5 shadow-xs border border-pink-200/60">
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#861949] shadow-xs shrink-0">
                            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                emoji_events
                            </span>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <h3 className="font-headline font-bold text-base text-[#861949]">
                                {milestonesData.stageTitle}
                            </h3>
                            <p className="text-xs text-gray-600 mt-0.5">
                                {progress.summaryText}
                            </p>
                            {/* Progress Bar */}
                            <div className="w-full bg-white h-2 rounded-full mt-2 overflow-hidden border border-pink-100">
                                <div 
                                    className="bg-gradient-to-r from-[#861949] to-pink-500 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${progress.percent}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Milestone Categories */}
                    {milestonesData.categories.map(cat => (
                        <div key={cat.id} className="bg-white p-4.5 rounded-[2rem] shadow-xs border border-purple-100/80 flex flex-col space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-pink-100 text-[#861949] flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[18px]">
                                            {cat.icon}
                                        </span>
                                    </div>
                                    <h4 className="font-headline font-bold text-sm text-gray-900">
                                        {cat.name}
                                    </h4>
                                </div>
                                <span className="text-[10px] uppercase px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold">
                                    {cat.items.filter(i => (checkedMilestones[i.id] !== undefined ? checkedMilestones[i.id] : i.defaultChecked)).length} / {cat.items.length} Hoàn thành
                                </span>
                            </div>

                            <div className="space-y-2 pt-1">
                                {cat.items.map(item => {
                                    const isDone = checkedMilestones[item.id] !== undefined 
                                        ? checkedMilestones[item.id] 
                                        : item.defaultChecked;
                                    return (
                                        <div 
                                            key={item.id}
                                            onClick={() => toggleMilestone(item.id)}
                                            className={`flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer border ${
                                                isDone 
                                                    ? 'bg-pink-50/40 border-pink-100' 
                                                    : 'bg-gray-50/60 border-gray-100 hover:bg-gray-100/60'
                                            }`}
                                        >
                                            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                                isDone 
                                                    ? 'bg-[#861949] text-white shadow-xs' 
                                                    : 'border-2 border-gray-300 bg-white'
                                            }`}>
                                                {isDone && <span className="material-symbols-outlined text-[14px]">check</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className={`text-xs font-semibold block ${isDone ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {item.title}
                                                </span>
                                                <span className="text-[11px] text-gray-500 block mt-0.5">
                                                    {item.subtitle}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Floating Action Pill: Ghi nhật ký mới */}
            <div className="sticky bottom-20 pt-2 z-30 flex justify-center">
                <button 
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#861949] to-[#a53361] text-white font-headline font-bold text-xs shadow-[0_8px_28px_rgba(134,25,73,0.32)] active:scale-95 transition-all cursor-pointer hover:shadow-lg"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Ghi nhật ký mới</span>
                </button>
            </div>

            {/* Modal: Thêm nhật ký mới */}
            {showAddModal && (
                <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-6 max-w-md mx-auto w-full shadow-2xl flex flex-col space-y-4 max-h-[85vh] overflow-y-auto border border-purple-100/60 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                            <div>
                                <span className="text-[10px] text-[#861949] font-bold uppercase tracking-wider">Thêm hoạt động</span>
                                <h3 className="font-headline font-bold text-lg text-gray-900">Nhật ký cho {profile?.name || 'Bé'}</h3>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        {/* Quick Category Picker */}
                        <div className="grid grid-cols-4 gap-2">
                            <button 
                                type="button"
                                onClick={() => setEntryType('milk')}
                                className={`flex flex-col items-center p-2.5 rounded-2xl transition-all cursor-pointer border ${
                                    entryType === 'milk'
                                        ? 'bg-pink-100 text-[#861949] border-[#861949] font-bold'
                                        : 'bg-gray-50 text-gray-600 border-gray-100'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[22px]">baby_changing_station</span>
                                <span className="text-[11px] mt-1">Bú sữa</span>
                            </button>

                            <button 
                                type="button"
                                onClick={() => setEntryType('food')}
                                className={`flex flex-col items-center p-2.5 rounded-2xl transition-all cursor-pointer border ${
                                    entryType === 'food'
                                        ? 'bg-amber-100 text-amber-900 border-amber-600 font-bold'
                                        : 'bg-gray-50 text-gray-600 border-gray-100'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[22px]">restaurant</span>
                                <span className="text-[11px] mt-1">Ăn dặm</span>
                            </button>

                            <button 
                                type="button"
                                onClick={() => setEntryType('sleep')}
                                className={`flex flex-col items-center p-2.5 rounded-2xl transition-all cursor-pointer border ${
                                    entryType === 'sleep'
                                        ? 'bg-teal-100 text-teal-900 border-teal-600 font-bold'
                                        : 'bg-gray-50 text-gray-600 border-gray-100'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[22px]">bedtime</span>
                                <span className="text-[11px] mt-1">Giấc ngủ</span>
                            </button>

                            <button 
                                type="button"
                                onClick={() => setEntryType('milestone')}
                                className={`flex flex-col items-center p-2.5 rounded-2xl transition-all cursor-pointer border ${
                                    entryType === 'milestone'
                                        ? 'bg-[#861949] text-white border-[#861949] font-bold'
                                        : 'bg-gray-50 text-gray-600 border-gray-100'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[22px]">verified</span>
                                <span className="text-[11px] mt-1">Cột mốc</span>
                            </button>
                        </div>

                        {/* Form Fields */}
                        <form onSubmit={handleSaveEntry} className="space-y-3 pt-1">
                            <div className="flex gap-2">
                                <div className="flex-1 flex flex-col space-y-1">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase">Thời gian</label>
                                    <input 
                                        type="time" 
                                        value={entryTime}
                                        onChange={(e) => setEntryTime(e.target.value)}
                                        className="w-full bg-gray-50 text-gray-900 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-purple-400"
                                    />
                                </div>
                                {entryType === 'milk' && (
                                    <div className="w-1/2 flex flex-col space-y-1">
                                        <label className="text-[10px] text-gray-500 font-bold uppercase">Lượng sữa (ml)</label>
                                        <input 
                                            type="number" 
                                            value={entryAmount}
                                            onChange={(e) => setEntryAmount(e.target.value)}
                                            className="w-full bg-gray-50 text-gray-900 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-purple-400"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col space-y-1">
                                <label className="text-[10px] text-gray-500 font-bold uppercase">Ghi chú yêu thương</label>
                                <textarea 
                                    rows="3"
                                    value={entryNote}
                                    onChange={(e) => setEntryNote(e.target.value)}
                                    placeholder="Ghi lại hành động đáng yêu, món ăn, thời gian ngủ hoặc biểu cảm của con hôm nay..."
                                    className="w-full bg-gray-50 text-gray-900 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-purple-400"
                                ></textarea>
                            </div>

                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3.5 rounded-full bg-[#861949] hover:bg-[#a53361] text-white font-headline font-bold text-xs transition-all active:scale-95 shadow-md cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? 'Đang lưu...' : `Lưu kỷ niệm ${profile?.name || 'Pe Thúi'}`}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
