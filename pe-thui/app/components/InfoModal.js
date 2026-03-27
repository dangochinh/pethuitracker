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
                    <li>Nếu bé mới, hãy tạo <strong>hồ sơ mới</strong> (tên, ngày sinh, giới tính, ảnh) ngay tại màn hình khởi tạo.</li>
                    <li>Muốn truy cập dễ nhớ hơn: vào <strong>Cài đặt</strong> → đổi <strong>Mã Code</strong> → lưu lại và dùng mã mới.</li>
                    <li>Biểu đồ chuẩn WHO tự động cập nhật khi mẹ tải dữ liệu lên.</li>
                    <li>Sổ tiêm chủng và mọc răng nhắc lịch thông minh.</li>
                </ul>
            )
        },
        {
            id: 'release',
            title: 'Nhật ký cập nhật',
            icon: 'history',
            iconColor: 'text-tertiary',
            bg: 'bg-tertiary-container',
            content: (
                <div className="space-y-4 mt-2">
                    <div className="border-l-2 border-primary pl-4 py-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">v1.3.0 - 25/03/2026</p>
                        <p className="text-sm font-bold">Tối ưu hóa giao diện & Trải nghiệm</p>
                        <ul className="text-xs mt-1 space-y-1 opacity-80">
                            <li>• Tinh chỉnh vị trí nút Thêm (+) tối ưu cho di động.</li>
                            <li>• Tự động ẩn nút chức năng trên Tab Tiêm chủng & Mọc răng.</li>
                            <li>• Cải thiện hiển thị biểu đồ và đồng bộ hóa giao diện.</li>
                        </ul>
                    </div>
                    <div className="border-l-2 border-primary/20 pl-4 py-1 opacity-60">
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">v1.2.0 - 22/03/2026</p>
                        <p className="text-sm">Redesign toàn diện Dashboard. Nâng cấp sổ tiêm chủng và sổ mọc răng.</p>
                    </div>
                    <div className="border-l-2 border-outline-variant/30 pl-4 py-1 opacity-40">
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">v1.0.0 - 20/02/2026</p>
                        <p className="text-sm">Ra mắt phiên bản đầu tiên theo chuẩn WHO.</p>
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
                <div className="mt-2">
                    <p className="text-sm mb-4 font-medium italic opacity-80">Nếu app hữu ích, mời chú một ly cafe nha! ☕</p>
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-2 inline-block rounded-2xl border border-primary/10 shadow-sm">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ACB:12342467:DANG%20NGOC%20CHINH" alt="QR Donate" className="w-24 h-24" />
                        </div>
                        <div>
                            <p className="text-sm font-black tracking-tight text-primary">Đặng Ngọc Chính</p>
                            <p className="text-[10px] font-bold text-on-surface-variant/60">STK: 12342467</p>
                            <p className="text-[10px] uppercase font-bold text-on-surface-variant/40">Ngân hàng ACB</p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white p-8 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl border-t sm:border border-outline-variant/10 relative flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-500">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <h2 className="text-2xl font-black font-headline text-primary tracking-tighter">THÔNG TIN ✨</h2>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary-container text-primary hover:scale-105 transition-all active:scale-95">
                        <span className="material-symbols-outlined font-black">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto space-y-10 pr-2 custom-scrollbar">
                    {sections.map((section) => (
                        <div key={section.id} className="relative">
                            <div className="flex items-center gap-4 mb-3">
                                <div className={`w-10 h-10 rounded-2xl ${section.bg} ${section.iconColor} flex items-center justify-center shadow-sm`}>
                                    <span className="material-symbols-outlined text-lg">{section.icon}</span>
                                </div>
                                <h3 className="font-extrabold text-on-surface uppercase tracking-[2px] text-[11px]">{section.title}</h3>
                            </div>
                            <div className="text-[13px] text-on-surface font-medium leading-[1.6] pl-14">
                                {section.content}
                            </div>
                        </div>
                    ))}
                    <div className="pt-8 pb-10 text-center shrink-0 border-t border-dashed border-outline-variant/30">
                        <p className="text-[10px] text-primary/40 font-black tracking-[3px] uppercase">From Pe Thúi Tracker with ❤️</p>
                        <p className="text-[8px] text-on-surface-variant/30 uppercase mt-2">© 2026 All Rights Reserved</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
