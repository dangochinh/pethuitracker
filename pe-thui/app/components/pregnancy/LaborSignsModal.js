'use client';

import { useState } from 'react';
import { getLaborSignsGuide } from '../../lib/pregnancy-utils';

export default function LaborSignsModal({ onClose, onOpenHospitalBag }) {
    const guides = getLaborSignsGuide();
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'early', 'active', 'emergency'
    const [expandedItem, setExpandedItem] = useState('contractions_511');

    const filteredSections = activeTab === 'all' 
        ? guides 
        : guides.filter(g => g.category === activeTab);

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div 
                className="bg-white rounded-[2.5rem] w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-pink-100 flex flex-col gap-4 max-h-[90vh] text-left relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-5 right-5 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all cursor-pointer active:scale-90 z-10"
                    title="Đóng"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>

                {/* Header */}
                <div className="flex items-center gap-3.5 pr-10">
                    <div className="w-12 h-12 rounded-2xl bg-[#861949]/10 text-[#861949] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-2xl">medical_services</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-headline font-black text-lg text-gray-900 leading-tight">
                                Cẩm Nang Dấu Hiệu Chuyển Dạ
                            </h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Hướng dẫn nhận biết chuẩn y khoa cho mẹ bầu
                        </p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
                    <button
                        type="button"
                        onClick={() => setActiveTab('all')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            activeTab === 'all'
                                ? 'bg-gray-900 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Tất cả dấu hiệu
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('early')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                            activeTab === 'early'
                                ? 'bg-[#006972] text-white shadow-xs'
                                : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                        }`}
                    >
                        <span>Sắp sinh</span>
                        <span className="text-[10px] opacity-80">(Theo dõi)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('active')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                            activeTab === 'active'
                                ? 'bg-[#861949] text-white shadow-xs'
                                : 'bg-pink-50 text-[#861949] hover:bg-pink-100'
                        }`}
                    >
                        <span>Chuyển dạ</span>
                        <span className="text-[10px] opacity-80">(Đến viện)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('emergency')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                            activeTab === 'emergency'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                    >
                        <span>Cấp cứu</span>
                        <span className="text-[10px] opacity-80">(115)</span>
                    </button>
                </div>

                {/* Content List with Accordions */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {filteredSections.map((sec) => (
                        <div key={sec.category} className="space-y-2.5">
                            {/* Section Header */}
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${sec.badgeColor}`}>
                                    {sec.badge}
                                </span>
                                <span className="text-xs font-bold text-gray-700">
                                    {sec.categoryName}
                                </span>
                            </div>

                            <p className="text-[11px] text-gray-500 leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                {sec.description}
                            </p>

                            {/* Section Items */}
                            <div className="space-y-2">
                                {sec.items.map((item) => {
                                    const isExpanded = expandedItem === item.id;
                                    return (
                                        <div
                                            key={item.id}
                                            className={`rounded-2xl border transition-all overflow-hidden ${
                                                isExpanded
                                                    ? 'bg-[#fff8f8] border-pink-200 shadow-xs'
                                                    : 'bg-white border-gray-100 hover:border-pink-100'
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                                className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                                        sec.category === 'emergency'
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : sec.category === 'active'
                                                            ? 'bg-pink-100 text-[#861949]'
                                                            : 'bg-teal-50 text-teal-700'
                                                    }`}>
                                                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                                                    </span>
                                                    <div>
                                                        <h4 className="font-headline font-bold text-xs sm:text-sm text-gray-900">
                                                            {item.title}
                                                        </h4>
                                                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                                                            {item.summary}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`material-symbols-outlined text-gray-400 text-lg transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                                    expand_more
                                                </span>
                                            </button>

                                            {isExpanded && (
                                                <div className="px-4 pb-3.5 pt-1 text-xs text-gray-700 border-t border-pink-100/60 leading-relaxed bg-white/70">
                                                    <p className="font-semibold text-gray-800 mb-1">{item.summary}</p>
                                                    <p className="text-gray-600">{item.detail}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Rule 5-1-1 Highlight Box */}
                    <div className="bg-[#861949]/5 rounded-2xl p-4 border border-[#861949]/15 flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#861949] text-2xl shrink-0">timer</span>
                        <div className="text-xs">
                            <h5 className="font-bold text-[#861949] mb-1">Mẹo nhớ nhanh: Quy tắc chuyển dạ 5 - 1 - 1</h5>
                            <p className="text-gray-700 leading-relaxed">
                                Cứ <strong>5 phút</strong> đau 1 cơn gò &bull; Mỗi cơn kéo dài <strong>1 phút</strong> &bull; Đau đều đặn liên tục trong <strong>1 giờ</strong> &rarr; Đến ngay bệnh viện sản!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Link if needed */}
                {onOpenHospitalBag && (
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between shrink-0">
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onOpenHospitalBag();
                            }}
                            className="text-xs font-bold text-[#861949] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[16px]">luggage</span>
                            <span>Xem Giỏ Đồ Đi Sinh →</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
