'use client';

export default function InfoModal({ onClose }) {
    const sections = [
        {
            id: 'about',
            title: 'Giới thiệu',
            icon: 'info',
            iconColor: 'text-primary',
            bg: 'bg-primary-container',
            content: 'Pe Thúi Tracker là ứng dụng cá nhân hóa giúp ba mẹ theo dõi hành trình khôn lớn của bé yêu. Giao diện tối giản, sinh động và dữ liệu được đồng bộ an toàn qua Mã Code.'
        },
        {
            id: 'guide',
            title: 'Hướng dẫn nhanh',
            icon: 'menu_book',
            iconColor: 'text-secondary',
            bg: 'bg-secondary-container',
            content: (
                <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>Nhập đúng <strong>Mã Code</strong> để xem hồ sơ của bé.</li>
                    <li>Biểu đồ chuẩn WHO tự động cập nhật khi mẹ tải dữ liệu lên.</li>
                    <li>Sổ tiêm chủng và mọc răng nhắc lịch thông minh.</li>
                </ul>
            )
        },
        {
            id: 'release',
            title: 'Nhật ký cập nhật',
            icon: 'update',
            iconColor: 'text-tertiary',
            bg: 'bg-tertiary-container',
            content: (
                <div className="space-y-3 mt-1">
                    <div className="border-l-2 border-primary/20 pl-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">v1.2.0 - 22/03/2026</p>
                        <p className="text-sm">Redesign toàn diện Dashboard. Nâng cấp sổ tiêm chủng và sổ mọc răng.</p>
                    </div>
                    <div className="border-l-2 border-outline-variant/30 pl-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">v1.0.0 - 20/02/2026</p>
                        <p className="text-sm opacity-60">Ra mắt phiên bản đầu tiên theo chuẩn WHO.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'donate',
            title: 'Ủng hộ tác giả',
            icon: 'favorite',
            iconColor: 'text-error',
            bg: 'bg-error-container',
            content: (
                <div className="text-center mt-2">
                    <p className="text-sm mb-3 font-medium">Nếu app hữu ích, mời chú một ly cafe nha! ☕</p>
                    <div className="bg-white p-2 inline-block rounded-2xl border border-outline-variant/30 shadow-sm mb-2">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=STB:12342467:DANG%20NGOC%20CHINH" alt="QR Donate" className="w-28 h-28" />
                    </div>
                    <p className="text-[10px] font-black tracking-widest text-on-surface-variant/70 mt-1">Đặng Ngọc Chính</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">STK: 12342467 • Sacombank</p>
                </div>
            )
        }
    ];

    return (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-surface p-8 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl border-t sm:border border-outline-variant/30 relative flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-500">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h2 className="text-2xl font-black font-headline text-primary tracking-tight">THÔNG TIN ✨</h2>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-all">
                        <span className="material-symbols-outlined text-on-surface-variant">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                    {sections.map((section) => (
                        <div key={section.id} className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/20 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-8 h-8 rounded-full ${section.bg} ${section.iconColor} flex items-center justify-center`}>
                                    <span className="material-symbols-outlined text-sm">{section.icon}</span>
                                </div>
                                <h3 className="font-black text-on-surface uppercase tracking-wider text-xs">{section.title}</h3>
                            </div>
                            <div className="text-sm text-on-surface-variant font-medium leading-relaxed pl-11">
                                {section.content}
                            </div>
                        </div>
                    ))}
                    <div className="pt-2 pb-6 text-center shrink-0">
                        <p className="text-[10px] text-on-surface-variant/40 font-black tracking-widest uppercase">From Pe Thúi Tracker with ❤️</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
