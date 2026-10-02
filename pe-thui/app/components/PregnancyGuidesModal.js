'use client';

import React, { useState, useMemo } from 'react';
import { ALL_WEEKS_ADVICE, THAI_GIAO_GUIDES, EASY_METHOD_GUIDES } from '../lib/data/pregnancy-guides';
import { getFruitMap } from '../lib/pregnancy-utils';

export default function PregnancyGuidesModal({ isOpen, onClose, currentWeek = 0, initialTab = 'weeks' }) {
    const [activeTab, setActiveTab] = useState(initialTab); // 'weeks' | 'thaigiao' | 'easy'
    const [selectedTrimesterFilter, setSelectedTrimesterFilter] = useState('all'); // 'all' | '1' | '2' | '3'
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedWeek, setExpandedWeek] = useState(currentWeek);

    const fruitMap = useMemo(() => getFruitMap(), []);

    const allWeeksList = useMemo(() => {
        return Object.values(ALL_WEEKS_ADVICE).sort((a, b) => a.week - b.week);
    }, []);

    const filteredWeeks = useMemo(() => {
        return allWeeksList.filter((item) => {
            const w = item.week;
            // Filter by trimester
            if (selectedTrimesterFilter === '1' && (w < 0 || w > 12)) return false;
            if (selectedTrimesterFilter === '2' && (w < 13 || w > 26)) return false;
            if (selectedTrimesterFilter === '3' && (w < 27 || w > 42)) return false;

            // Filter by search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchTitle = item.title?.toLowerCase().includes(q);
                const matchDev = item.babyDevelopment?.toLowerCase().includes(q);
                const matchDiet = item.diet?.toLowerCase().includes(q);
                const matchWarning = item.warning?.toLowerCase().includes(q);
                const matchThaiGiao = item.thaiGiaoTip?.toLowerCase().includes(q);
                const matchWeekNum = String(item.week) === q || `tuần ${item.week}`.includes(q);
                return matchTitle || matchDev || matchDiet || matchWarning || matchThaiGiao || matchWeekNum;
            }

            return true;
        });
    }, [allWeeksList, selectedTrimesterFilter, searchQuery]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div 
                className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-purple-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-[#861949] p-4 sm:p-5 text-white flex items-center justify-between shrink-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                            <span className="material-symbols-outlined text-2xl text-white">menu_book</span>
                        </div>
                        <div>
                            <h3 className="font-headline font-black text-lg sm:text-xl text-white tracking-tight flex items-center gap-1.5">
                                Cẩm Nang Thai Kỳ & Bí Kíp Mẹ Bầu
                            </h3>
                            <p className="text-white/80 text-xs font-medium">
                                Lời khuyên 42 tuần • Thai giáo khoa học • Phương pháp EASY
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                        title="Đóng cẩm nang"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Main Tabs Navigation */}
                <div className="flex items-center bg-purple-50/70 p-1.5 border-b border-purple-100 shrink-0 gap-1.5">
                    <button
                        onClick={() => setActiveTab('weeks')}
                        className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            activeTab === 'weeks'
                                ? 'bg-white text-purple-900 shadow-sm border border-purple-200/60'
                                : 'text-gray-600 hover:text-purple-700 hover:bg-white/50'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                        <span>42 Tuần Thai Kỳ</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('thaigiao')}
                        className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            activeTab === 'thaigiao'
                                ? 'bg-white text-purple-900 shadow-sm border border-purple-200/60'
                                : 'text-gray-600 hover:text-purple-700 hover:bg-white/50'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">psychology</span>
                        <span>Bí Kíp Thai Giáo</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('easy')}
                        className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            activeTab === 'easy'
                                ? 'bg-white text-purple-900 shadow-sm border border-purple-200/60'
                                : 'text-gray-600 hover:text-purple-700 hover:bg-white/50'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">child_care</span>
                        <span>Phương Pháp EASY</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-gray-50/50 space-y-4">
                    {/* TAB 1: 42 TUẦN THAI KỲ */}
                    {activeTab === 'weeks' && (
                        <div className="space-y-4">
                            {/* Search & Filter Bar */}
                            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                                <div className="relative flex-1">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                                        search
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Tìm theo tuần, canxi, dinh dưỡng, siêu âm..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-white border border-gray-200 focus:outline-hidden focus:border-purple-500 shadow-xs"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {/* Trimester Filter Pills */}
                                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shrink-0">
                                    <button
                                        onClick={() => setSelectedTrimesterFilter('all')}
                                        className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                                            selectedTrimesterFilter === 'all'
                                                ? 'bg-purple-600 text-white shadow-xs'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        Tất cả
                                    </button>
                                    <button
                                        onClick={() => setSelectedTrimesterFilter('1')}
                                        className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                                            selectedTrimesterFilter === '1'
                                                ? 'bg-purple-600 text-white shadow-xs'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        T1 (0-12w)
                                    </button>
                                    <button
                                        onClick={() => setSelectedTrimesterFilter('2')}
                                        className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                                            selectedTrimesterFilter === '2'
                                                ? 'bg-purple-600 text-white shadow-xs'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        T2 (13-26w)
                                    </button>
                                    <button
                                        onClick={() => setSelectedTrimesterFilter('3')}
                                        className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                                            selectedTrimesterFilter === '3'
                                                ? 'bg-purple-600 text-white shadow-xs'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        T3 (27-42w)
                                    </button>
                                </div>
                            </div>

                            {/* Jump to current week button */}
                            {currentWeek >= 0 && currentWeek <= 42 && (
                                <div className="flex items-center justify-between px-3 py-2 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-800">
                                    <span className="font-semibold flex items-center gap-1.5">
                                        <span>🤰 Mẹ đang ở tuần thứ <strong>{currentWeek}</strong></span>
                                    </span>
                                    <button
                                        onClick={() => setExpandedWeek(currentWeek)}
                                        className="font-bold underline text-purple-700 hover:text-purple-900 cursor-pointer"
                                    >
                                        Mở tuần {currentWeek} ngay →
                                    </button>
                                </div>
                            )}

                            {/* Weeks List */}
                            <div className="space-y-3">
                                {filteredWeeks.length === 0 ? (
                                    <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-sm text-gray-500 font-medium">Không tìm thấy lời khuyên phù hợp với từ khóa.</p>
                                    </div>
                                ) : (
                                    filteredWeeks.map((item) => {
                                        const fruit = fruitMap[item.week] || fruitMap[0];
                                        const isExpanded = expandedWeek === item.week;
                                        const isCurrent = currentWeek === item.week;

                                        return (
                                            <div
                                                key={item.week}
                                                className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-xs ${
                                                    isCurrent
                                                        ? 'border-purple-300 ring-2 ring-purple-100'
                                                        : 'border-gray-200/80 hover:border-purple-200'
                                                }`}
                                            >
                                                {/* Week Header Banner */}
                                                <button
                                                    onClick={() => setExpandedWeek(isExpanded ? null : item.week)}
                                                    className="w-full text-left p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-gray-50/60 transition-colors cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100/60 flex items-center justify-center text-xl shrink-0">
                                                            {fruit.emoji}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-headline font-bold text-sm sm:text-base text-gray-900">
                                                                    Tuần {item.week}
                                                                </span>
                                                                {isCurrent && (
                                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white">
                                                                        Tuần hiện tại
                                                                    </span>
                                                                )}
                                                                <span className="text-xs text-gray-500 hidden sm:inline">
                                                                    ({fruit.name})
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                                                                {item.title}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <div className="text-right hidden sm:block">
                                                            <span className="text-[11px] font-semibold text-gray-500 block">
                                                                {fruit.weight > 0 ? `~${fruit.weight >= 1000 ? (fruit.weight/1000).toFixed(1) + 'kg' : fruit.weight + 'g'}` : 'Mầm phôi'}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 block">
                                                                {fruit.length > 0 ? `~${fruit.length}cm` : '--'}
                                                            </span>
                                                        </div>
                                                        <span className="material-symbols-outlined text-gray-400 transition-transform duration-200">
                                                            {isExpanded ? 'expand_less' : 'expand_more'}
                                                        </span>
                                                    </div>
                                                </button>

                                                {/* Expandable Details */}
                                                {isExpanded && (
                                                    <div className="p-4 pt-1 border-t border-gray-100 bg-purple-50/20 space-y-3 animate-fadeIn">
                                                        {/* Fruit & Baby metrics badge */}
                                                        <div className="p-2.5 rounded-xl bg-purple-100/50 flex items-center justify-between text-xs text-purple-900">
                                                            <span className="font-medium">
                                                                Kích thước tương đương: <strong>{fruit.name} {fruit.emoji}</strong>
                                                            </span>
                                                            <span className="font-bold">
                                                                {fruit.weight > 0 ? `Cân nặng: ~${fruit.weight >= 1000 ? (fruit.weight/1000).toFixed(1) + 'kg' : fruit.weight + 'g'}` : ''} 
                                                                {fruit.length > 0 ? ` • Dài: ~${fruit.length}cm` : ''}
                                                            </span>
                                                        </div>

                                                        {/* Baby Development */}
                                                        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 flex gap-2.5 items-start">
                                                            <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-0.5">
                                                                child_care
                                                            </span>
                                                            <div>
                                                                <span className="font-bold block text-blue-900 mb-0.5">
                                                                    Sự phát triển của bé:
                                                                </span>
                                                                <p className="leading-relaxed">{item.babyDevelopment}</p>
                                                            </div>
                                                        </div>

                                                        {/* Diet Advice */}
                                                        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-950 flex gap-2.5 items-start">
                                                            <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
                                                                nutrition
                                                            </span>
                                                            <div>
                                                                <span className="font-bold block text-emerald-900 mb-0.5">
                                                                    Dinh dưỡng khuyên dùng:
                                                                </span>
                                                                <p className="leading-relaxed">{item.diet}</p>
                                                            </div>
                                                        </div>

                                                        {/* Thai Giao Tip */}
                                                        <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-950 flex gap-2.5 items-start">
                                                            <span className="material-symbols-outlined text-purple-600 text-[18px] shrink-0 mt-0.5">
                                                                psychology
                                                            </span>
                                                            <div>
                                                                <span className="font-bold block text-purple-900 mb-0.5">
                                                                    Gợi ý Thai Giáo tuần này:
                                                                </span>
                                                                <p className="leading-relaxed">{item.thaiGiaoTip}</p>
                                                            </div>
                                                        </div>

                                                        {/* Medical Warning */}
                                                        <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 text-xs text-rose-950 flex gap-2.5 items-start">
                                                            <span className="material-symbols-outlined text-rose-600 text-[18px] shrink-0 mt-0.5">
                                                                warning
                                                            </span>
                                                            <div>
                                                                <span className="font-bold block text-rose-900 mb-0.5">
                                                                    Cảnh báo y tế & Khám thai:
                                                                </span>
                                                                <p className="leading-relaxed">{item.warning}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: BÍ KÍP THAI GIÁO */}
                    {activeTab === 'thaigiao' && (
                        <div className="space-y-4">
                            {/* Intro Banner */}
                            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-2xl text-white shadow-sm flex items-start gap-3">
                                <span className="text-3xl">🧠</span>
                                <div>
                                    <h4 className="font-headline font-bold text-base text-white">
                                        Thai Giáo Khoa Học: Tình Yêu & Trí Tuệ
                                    </h4>
                                    <p className="text-xs text-purple-100 mt-1 leading-relaxed">
                                        Thai giáo không phải ép con học sớm, mà là đánh thức các giác quan, nuôi dưỡng cảm xúc hạnh phúc và tạo cầu nối thiêng liêng giữa con và ba mẹ.
                                    </p>
                                </div>
                            </div>

                            {/* Guides List */}
                            <div className="space-y-3.5">
                                {THAI_GIAO_GUIDES.map((guide) => (
                                    <div
                                        key={guide.id}
                                        className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-4 sm:p-5 text-left space-y-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${guide.color} text-white flex items-center justify-center shadow-xs shrink-0`}>
                                                <span className="material-symbols-outlined text-xl">{guide.icon}</span>
                                            </div>
                                            <div>
                                                <h5 className="font-headline font-bold text-sm sm:text-base text-gray-900">
                                                    {guide.title}
                                                </h5>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {guide.summary}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2.5 pt-2 border-t border-gray-100">
                                            {guide.content.map((sec, idx) => (
                                                <div key={idx} className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                                                    <span className="font-bold text-xs text-purple-900 block mb-1">
                                                        {sec.heading}
                                                    </span>
                                                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                                                        {sec.details}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: PHƯƠNG PHÁP EASY */}
                    {activeTab === 'easy' && (
                        <div className="space-y-4">
                            {/* Intro Banner */}
                            <div className="bg-gradient-to-r from-pink-600 to-[#861949] p-4 rounded-2xl text-white shadow-sm flex items-start gap-3">
                                <span className="text-3xl">🍼</span>
                                <div>
                                    <h4 className="font-headline font-bold text-base text-white">
                                        Phương Pháp EASY: Con Tự Lập - Mẹ Nhàn Tênh
                                    </h4>
                                    <p className="text-xs text-pink-100 mt-1 leading-relaxed">
                                        Trang bị kiến thức EASY ngay từ thai kỳ giúp mẹ không bị sốc tâm lý hay trầm cảm sau sinh, hiểu đúng tiếng khóc và sinh lý giấc ngủ của con.
                                    </p>
                                </div>
                            </div>

                            {/* Easy Core Guides */}
                            <div className="space-y-3.5">
                                {EASY_METHOD_GUIDES.map((guide) => (
                                    <div
                                        key={guide.id}
                                        className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-4 sm:p-5 text-left space-y-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${guide.color} text-white flex items-center justify-center shadow-xs shrink-0`}>
                                                <span className="material-symbols-outlined text-xl">{guide.icon}</span>
                                            </div>
                                            <div>
                                                <h5 className="font-headline font-bold text-sm sm:text-base text-gray-900">
                                                    {guide.title}
                                                </h5>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {guide.summary}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2.5 pt-2 border-t border-gray-100">
                                            {guide.content.map((sec, idx) => (
                                                <div key={idx} className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                                                    <span className="font-bold text-xs text-pink-900 block mb-1">
                                                        {sec.heading}
                                                    </span>
                                                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                                                        {sec.details}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3.5 sm:p-4 bg-white border-t border-gray-100 flex items-center justify-between shrink-0">
                    <span className="text-xs text-gray-500">
                        Kiến thức tham khảo theo hướng dẫn y khoa sản nhi & EASY Baby Whisperer.
                    </span>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                        Đã hiểu
                    </button>
                </div>
            </div>
        </div>
    );
}
