'use client';

import { useState } from 'react';
import packageJson from '../../package.json';

export default function InfoModal({ onClose }) {
    const APP_VERSION = packageJson.version;
    const [isQrZoomOpen, setIsQrZoomOpen] = useState(false);

    const sections = [
        {
            id: 'about',
            title: 'Giới thiệu',
            icon: 'info',
            iconColor: 'text-primary',
            bg: 'bg-primary-container',
            content: (
                <div className="space-y-2">
                    <p>
                        Pe Thúi Tracker là ứng dụng cá nhân hóa giúp ba mẹ theo dõi hành trình khôn lớn của bé yêu.
                        Giao diện nhẹ nhàng, dễ dùng và tối ưu cho mobile.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Biểu đồ tăng trưởng theo chuẩn WHO cho cân nặng và chiều cao.</li>
                        <li>Sổ tiêm chủng và mọc răng với các mốc theo độ tuổi.</li>
                        <li>Timeline kỹ năng phát triển, tự focus đúng độ tuổi hiện tại.</li>
                        <li>Mã code cá nhân hóa giúp truy cập hồ sơ nhanh và đồng bộ.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'guide',
            title: 'Hướng dẫn nhanh',
            icon: 'menu_book',
            iconColor: 'text-secondary',
            bg: 'bg-secondary-container',
            content: (
                <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Nhập đúng <strong>Mã Code</strong> để xem hồ sơ của bé.</li>
                    <li>Nếu bé mới, hãy tạo <strong>hồ sơ mới</strong> ngay tại màn hình khởi tạo.</li>
                    <li>Muốn truy cập dễ nhớ hơn: vào <strong>Cài đặt</strong>, đổi <strong>Mã Code</strong> rồi lưu lại.</li>
                    <li>Biểu đồ chuẩn WHO tự động cập nhật khi có dữ liệu mới.</li>
                    <li>Sổ tiêm chủng và mọc răng có nhắc lịch trực quan, dễ theo dõi.</li>
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
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">v{APP_VERSION} - 27/03/2026</p>
                        <p className="text-sm font-bold">Tinh chỉnh giao diện và trải nghiệm</p>
                        <ul className="text-xs mt-1 space-y-1 opacity-80">
                            <li>• Làm mượt điều hướng tab và đồng bộ cuộn về đầu trang khi chuyển màn hình.</li>
                            <li>• Tối ưu lại các thẻ tổng quan, icon, khoảng cách và cách hiển thị trên mobile.</li>
                            <li>• Đồng bộ thêm ngôn ngữ, nhãn hiển thị và một số chi tiết giao diện trong ứng dụng.</li>
                        </ul>
                    </div>
                    <div className="border-l-2 border-primary/20 pl-4 py-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">v1.3.2 - 27/03/2026</p>
                        <p className="text-sm">Thêm timeline kỹ năng phát triển theo độ tuổi, tự động focus đúng độ tuổi hiện tại.</p>
                    </div>
                    <div className="border-l-2 border-primary/20 pl-4 py-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">v1.3.1 - 27/03/2026</p>
                        <p className="text-sm">Cập nhật phiên bản động, thêm QR donate phóng to và tinh chỉnh footer.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'homescreen',
            title: 'Thêm vào màn hình chính',
            icon: 'install_mobile',
            iconColor: 'text-success',
            bg: 'bg-success-container',
            content: (
                <div className="space-y-3 mt-1">
                    <p className="text-sm">
                        Thêm app vào màn hình chính để sử dụng nhanh chóng như ứng dụng native, không cần cài đặt!
                    </p>
                    <div className="space-y-2">
                        <div>
                            <p className="font-semibold text-sm text-success">iPhone/iPad:</p>
                            <p className="text-xs opacity-80">Nhấn biểu tượng Chia sẻ → Chọn "Thêm vào MH chính"</p>
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-success">Android:</p>
                            <p className="text-xs opacity-80">Nhấn menu 3 chấm → Chọn "Thêm vào Màn hình chính"</p>
                        </div>
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
                    <p className="text-sm mb-4 font-medium italic opacity-80">Nếu app hữu ích, mời tác giả ly cafe nha! ☕</p>
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-2 inline-block rounded-2xl border border-primary/10 shadow-sm">
                            <button
                                type="button"
                                onClick={() => setIsQrZoomOpen(true)}
                                className="block rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                                aria-label="Phóng to mã QR donate"
                            >
                                <img src="/donate-qr.jpg" alt="QR Donate ACB" className="w-24 h-24 object-cover rounded-xl" />
                            </button>
                            <p className="text-[9px] font-bold text-on-surface-variant/50 mt-1 text-center">Chạm để phóng to</p>
                        </div>
                        <div>
                            <p className="text-sm font-black tracking-tight text-primary">Đặng Ngọc Chinh</p>
                            <p className="text-[10px] font-bold text-on-surface-variant/60">STK: 12342467</p>
                            <p className="text-[10px] uppercase font-bold text-on-surface-variant/40">Ngân hàng ACB</p>
                            <p className="text-[10px] font-bold text-on-surface-variant/70 mt-1">MoMo: 0363839007</p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white p-8 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl border-t sm:border border-outline-variant/10 relative flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-500">
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <h2 className="text-2xl font-black font-headline text-primary tracking-tighter">THÔNG TIN ✨</h2>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-all">
                        <span className="material-symbols-outlined text-on-surface-variant">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-10 pr-2 custom-scrollbar">
                    {sections.map((section) => (
                        <div key={section.id} className="relative">
                            <div className="flex items-center gap-4 mb-3">
                                <div className={`w-10 h-10 rounded-2xl ${section.bg} ${section.iconColor} flex items-center justify-center shadow-sm`}>
                                    <span className="material-icons text-lg">{section.icon}</span>
                                </div>
                                <h3 className="font-extrabold text-on-surface uppercase tracking-[2px] text-[11px]">{section.title}</h3>
                            </div>
                            <div className="text-[13px] text-on-surface font-medium leading-[1.6] pl-[15px]">
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

            {isQrZoomOpen && (
                <div
                    className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200"
                    onClick={() => setIsQrZoomOpen(false)}
                >
                    <div
                        className="relative w-full max-w-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setIsQrZoomOpen(false)}
                            className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-white text-on-surface shadow-lg flex items-center justify-center"
                            aria-label="Đóng ảnh QR"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <img
                            src="/donate-qr.jpg"
                            alt="QR Donate ACB Zoom"
                            className="w-full rounded-2xl shadow-2xl border border-white/20"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
