'use client';

import { useState } from 'react';
import { calculatePregnancyWeeks } from '../lib/pregnancy-utils';
import { FaCheckCircle, FaRegCircle, FaHospitalUser, FaFileMedical } from 'react-icons/fa';

export default function PregnancyCheckups({ profile, code }) {
    // Basic standard checkup schedule in Vietnam
    const standardCheckups = [
        {
            id: 1,
            weeks: '5 - 8 tuần',
            title: 'Khám thai lần đầu',
            description: 'Siêu âm xác định vị trí thai, tuổi thai, nhịp tim thai.',
            important: false,
            tests: ['Siêu âm 2D', 'Khám phụ khoa']
        },
        {
            id: 2,
            weeks: '11 - 13 tuần 6 ngày',
            title: 'Đo độ mờ da gáy (Rất quan trọng)',
            description: 'Sàng lọc nguy cơ dị tật bẩm sinh (Hội chứng Down, Patau, Edwards).',
            important: true,
            tests: ['Siêu âm 4D', 'Double Test', 'NIPT (tùy chọn)']
        },
        {
            id: 3,
            weeks: '15 - 20 tuần',
            title: 'Khám thai định kỳ & Triple Test',
            description: 'Làm xét nghiệm Triple Test nếu chưa làm Double Test/NIPT.',
            important: false,
            tests: ['Siêu âm 2D', 'Triple Test']
        },
        {
            id: 4,
            weeks: '20 - 24 tuần',
            title: 'Khảo sát hình thái thai nhi (Rất quan trọng)',
            description: 'Siêu âm 4D chi tiết các cơ quan: tim, não, tay chân, hở hàm ếch...',
            important: true,
            tests: ['Siêu âm 4D hình thái']
        },
        {
            id: 5,
            weeks: '24 - 28 tuần',
            title: 'Tầm soát tiểu đường thai kỳ',
            description: 'Nghiệm pháp dung nạp đường huyết để phát hiện tiểu đường thai kỳ.',
            important: true,
            tests: ['Dung nạp đường huyết', 'Tiêm uốn ván (Mũi 1)']
        },
        {
            id: 6,
            weeks: '28 - 32 tuần',
            title: 'Đánh giá sự phát triển của thai',
            description: 'Kiểm tra ngôi thai, lượng nước ối, vị trí nhau thai.',
            important: false,
            tests: ['Siêu âm 2D/3D', 'Tiêm uốn ván (Mũi 2)']
        },
        {
            id: 7,
            weeks: '32 - 34 tuần',
            title: 'Khảo sát hình thái quý 3',
            description: 'Phát hiện các bất thường xuất hiện muộn ở tim, não.',
            important: true,
            tests: ['Siêu âm 4D', 'Xét nghiệm máu/nước tiểu']
        },
        {
            id: 8,
            weeks: '35 - 37 tuần',
            title: 'Kiểm tra khung chậu & Non-stress test',
            description: 'Đánh giá sức khoẻ thai nhi, dự kiến phương pháp sinh.',
            important: false,
            tests: ['Siêu âm 2D', 'Non-stress test (NST)', 'Đo Monitor']
        },
        {
            id: 9,
            weeks: '38 - 40 tuần',
            title: 'Khám thai mỗi tuần',
            description: 'Sẵn sàng chào đón bé yêu. Bác sĩ theo dõi sát tim thai, cơn gò.',
            important: true,
            tests: ['Siêu âm 2D', 'Đo Monitor', 'Khám trong']
        }
    ];

    const currentStats = calculatePregnancyWeeks(profile.estimatedDueDate);
    const currentWeek = currentStats.weeks;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center px-1">
                <h2 className="font-headline text-2xl font-bold text-[#861949] flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl text-[#861949]">medical_services</span>
                    Sổ Khám Thai Định Kỳ
                </h2>
                <div className="bg-[#861949]/10 text-[#861949] border border-[#861949]/20 px-3.5 py-1 rounded-full text-xs font-bold shadow-sm">
                    Mẹ đang tuần {currentWeek}
                </div>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[1.15rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-[#861949]/15">
                {standardCheckups.map((checkup, idx) => {
                    const match = checkup.weeks.match(/(\d+)/g);
                    const minW = parseInt(match[0]);
                    const maxW = match.length > 1 ? parseInt(match[1]) : minW;
                    
                    let status = 'future';
                    if (currentWeek > maxW) status = 'past';
                    else if (currentWeek >= minW && currentWeek <= maxW) status = 'current';

                    return (
                        <div key={checkup.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            {/* Icon */}
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 transition-all ${
                                status === 'past' ? 'bg-emerald-50 text-emerald-600 ring-2 ring-emerald-200' : 
                                status === 'current' ? 'bg-[#861949] text-white shadow-[#861949]/30 ring-4 ring-[#861949]/20' : 
                                'bg-stone-100 text-stone-300 ring-1 ring-stone-200'
                            }`}>
                                {status === 'past' ? <FaCheckCircle size={18} /> : 
                                 status === 'current' ? <span className="material-symbols-outlined text-lg animate-pulse">adjust</span> : 
                                 <FaRegCircle size={18} />}
                            </div>

                            {/* Card */}
                            <div className={`w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white/85 backdrop-blur-sm border transition-all hover:shadow-md ml-4 md:ml-0 relative ${
                                status === 'current' ? 'border-[#861949]/30 shadow-md ring-1 ring-[#861949]/15' : 'border-[#861949]/10 shadow-sm'
                            }`}>
                                <div className={`border-l-4 ${checkup.important ? 'border-[#861949]' : 'border-[#006972]/40'} pl-3 py-0.5`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[11px] font-black tracking-widest uppercase ${status === 'current' ? 'text-[#861949]' : 'text-stone-400'}`}>
                                            Tuần {checkup.weeks}
                                        </span>
                                        {checkup.important && (
                                            <span className="text-[9px] font-black bg-[#861949]/10 text-[#861949] border border-[#861949]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                Quan trọng
                                            </span>
                                        )}
                                    </div>
                                    <h3 className={`font-headline text-base font-bold ${status === 'current' ? 'text-stone-900' : 'text-stone-700'}`}>
                                        {checkup.title}
                                    </h3>
                                    <p className="text-xs text-stone-600 mt-1 font-normal leading-relaxed">
                                        {checkup.description}
                                    </p>
                                    
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {checkup.tests.map(test => (
                                            <span key={test} className="inline-flex items-center gap-1 text-[10px] font-medium bg-[#006972]/5 border border-[#006972]/15 text-[#006972] px-2.5 py-1 rounded-lg">
                                                <FaFileMedical className="text-[#006972]/70" /> {test}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="pb-8 text-center px-6">
                <p className="text-[11px] text-stone-400 font-medium">
                    Lưu ý: Lịch khám mang tính chuẩn y khoa tham khảo. Mẹ hãy luôn tuân thủ chỉ định của Bác sĩ trực tiếp theo dõi nhé!
                </p>
            </div>
        </div>
    );
}
