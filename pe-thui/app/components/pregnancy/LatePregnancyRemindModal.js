'use client';

export default function LatePregnancyRemindModal({ 
    weeks, 
    daysRemaining, 
    onClose, 
    onOpenLaborSigns, 
    onOpenConvertBaby 
}) {
    const handleDismissToday = () => {
        if (typeof window !== 'undefined') {
            const todayStr = new Date().toISOString().slice(0, 10);
            localStorage.setItem('pethui_late_pregnancy_dismissed', todayStr);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div 
                className="bg-white rounded-[2.5rem] w-full max-w-md p-6 sm:p-7 shadow-2xl border border-pink-100 flex flex-col gap-4 text-left relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background decorative soft glow */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-pink-100/60 rounded-full blur-2xl pointer-events-none"></div>

                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all cursor-pointer active:scale-90 z-10"
                    title="Đóng"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 pr-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#861949]/10 text-[#861949] border border-[#861949]/15 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-2xl">notifications_active</span>
                    </div>
                    <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#861949] bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200/50">
                            Tuần cuối thai kỳ
                        </span>
                        <h3 className="font-headline font-black text-lg text-gray-900 mt-0.5 leading-tight">
                            Mẹ Đã Sẵn Sàng Đón Bé Chưa?
                        </h3>
                    </div>
                </div>

                {/* Status snippet */}
                <div className="bg-[#fff8f8] rounded-2xl p-3.5 border border-pink-100 flex items-center justify-between text-xs">
                    <div>
                        <span className="text-gray-400 block text-[10px] font-bold uppercase">Tiến trình</span>
                        <span className="font-extrabold text-[#861949] text-sm">Tuần {weeks}</span>
                    </div>
                    <div className="h-6 w-[1px] bg-pink-200"></div>
                    <div>
                        <span className="text-gray-400 block text-[10px] font-bold uppercase">Ngày dự sinh</span>
                        <span className="font-bold text-gray-700">
                            {daysRemaining <= 0 ? 'Hôm nay hoặc đã quá ngày' : `Còn khoảng ${daysRemaining} ngày`}
                        </span>
                    </div>
                </div>

                {/* Checklist Reminders */}
                <div className="space-y-2.5">
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                        Giai đoạn này bé có thể chào đời bất kỳ lúc nào. Ba mẹ hãy lưu ý 3 việc quan trọng sau:
                    </p>

                    <div className="space-y-2">
                        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                            <span className="material-symbols-outlined text-[#006972] text-[20px] shrink-0 mt-0.5">luggage</span>
                            <div className="text-xs">
                                <p className="font-bold text-gray-800">1. Giỏ đồ đi sinh & Hồ sơ viện</p>
                                <p className="text-gray-500 text-[11px] mt-0.5">Đặt giỏ đồ ở nơi dễ lấy nhất kèm CMND/CCCD, BHYT, sổ khám thai.</p>
                            </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                            <span className="material-symbols-outlined text-[#861949] text-[20px] shrink-0 mt-0.5">timer</span>
                            <div className="text-xs">
                                <p className="font-bold text-gray-800">2. Nắm chắc Quy tắc 5-1-1 & Vỡ ối</p>
                                <p className="text-gray-500 text-[11px] mt-0.5">Gò 5 phút/cơn, kéo dài 1 phút trong 1 giờ liên tục hoặc rỉ ối &rarr; Đến viện ngay!</p>
                            </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                            <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">celebration</span>
                            <div className="text-xs">
                                <p className="font-bold text-gray-800">3. Chuyển đổi hồ sơ khi bé cất tiếng khóc</p>
                                <p className="text-gray-500 text-[11px] mt-0.5">Ghi lại ngày giờ sinh và số đo để lưu giữ kỷ niệm đầu đời của con.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            if (onOpenLaborSigns) onOpenLaborSigns();
                        }}
                        className="w-full py-3 px-4 rounded-2xl bg-[#006972] hover:bg-[#00555d] text-white font-headline font-bold text-xs shadow-md shadow-[#006972]/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[18px]">medical_services</span>
                        <span>Xem Dấu Hiệu Chuyển Dạ Y Khoa</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            if (onOpenConvertBaby) onOpenConvertBaby();
                        }}
                        className="w-full py-3 px-4 rounded-2xl bg-[#861949] hover:bg-[#6c123a] text-white font-headline font-bold text-xs shadow-md shadow-[#861949]/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[18px]">celebration</span>
                        <span>🎉 Bé Đã Chào Đời? Chuyển Sang Hồ Sơ Em Bé</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleDismissToday}
                        className="w-full py-2 rounded-xl text-gray-400 hover:text-gray-700 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                        Đã sẵn sàng (Không nhắc lại hôm nay)
                    </button>
                </div>
            </div>
        </div>
    );
}
