'use client';

import { useState, useEffect } from 'react';
import { calculatePregnancyWeeks } from '../lib/pregnancy-utils';

export default function PregnancyHomeView({ profile }) {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (profile.estimatedDueDate) {
            setStats(calculatePregnancyWeeks(profile.estimatedDueDate));
        }
    }, [profile.estimatedDueDate]);

    if (!stats) return <div className="text-center py-10 opacity-50 font-bold">Đang tải dữ liệu thai kỳ...</div>;

    const percentage = Math.min(100, Math.max(0, (stats.totalDaysPassed / 280) * 100));

    return (
        <div className="space-y-6">
            <section className="bg-gradient-to-br from-purple-100 to-pink-50 rounded-[2.5rem] p-6 shadow-sm border border-purple-200/50 text-center relative overflow-hidden">
                {/* Decorative */}
                <div className="absolute -top-4 -right-4 text-6xl opacity-10 blur-[2px]">🤰</div>
                <div className="absolute -bottom-4 -left-4 text-6xl opacity-10 blur-[2px]">✨</div>
                
                <h2 className="text-purple-800 font-headline font-black text-2xl mb-1">Mẹ đang ở tuần {stats.weeks}</h2>
                <p className="text-purple-600/80 font-bold text-sm">Ngày thứ {stats.days} của thai kỳ</p>

                {/* Progress bar */}
                <div className="mt-6 mb-4">
                    <div className="flex justify-between text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">
                        <span>Bắt đầu</span>
                        <span>Dự sinh: {new Date(profile.estimatedDueDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="h-4 bg-white/50 rounded-full overflow-hidden border border-white">
                        <div 
                            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full shadow-inner"
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white shadow-sm">
                        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Thời gian còn lại</p>
                        <p className="text-2xl font-black text-purple-900">{stats.daysRemaining} <span className="text-sm font-bold text-purple-600">ngày</span></p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white shadow-sm">
                        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Tam cá nguyệt</p>
                        <p className="text-2xl font-black text-purple-900">{stats.trimester}</p>
                    </div>
                </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-outline-variant/20 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center text-5xl mb-4 border-4 border-purple-100 shadow-inner">
                    {stats.fruitEmoji}
                </div>
                <h3 className="font-headline font-bold text-lg text-gray-800 mb-2">Bé yêu lớn chừng nào?</h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">
                    Tuần này, em bé của mẹ có kích thước tương đương một <strong className="text-purple-600">{stats.fruitName}</strong>.
                    Trọng lượng khoảng <strong className="text-purple-600">{stats.estimatedWeight}g</strong> và dài khoảng <strong className="text-purple-600">{stats.estimatedLength}cm</strong>.
                </p>
            </section>
        </div>
    );
}
