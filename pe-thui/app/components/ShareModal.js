'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function ShareModal({ code, onClose }) {
    const [copied, setCopied] = useState(false);
    
    // In production, this would be your actual domain
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/${code}` : `https://pethui.com/${code}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Failed to copy', e);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Babie Tracker',
                    text: 'Cùng xem hồ sơ của bé nhé!',
                    url: shareUrl,
                });
            } catch (e) {
                console.error('Error sharing', e);
            }
        } else {
            handleCopy();
        }
    };

    return (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border-t sm:border border-gray-100 animate-in slide-in-from-bottom duration-500 max-h-[90dvh] flex flex-col p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-black font-headline text-gray-800">Chia sẻ hồ sơ bé</h2>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all">
                        <span className="material-symbols-outlined text-gray-500 text-xl">close</span>
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center mb-6 space-y-4">
                    <div className="p-4 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center">
                        <QRCodeSVG 
                            value={shareUrl} 
                            size={180}
                            bgColor={"#ffffff"}
                            fgColor={"#374151"}
                            level={"Q"}
                            marginSize={0}
                        />
                    </div>
                    <p className="text-sm text-gray-500 font-medium text-center">
                        Đưa mã QR này cho Ông/Bà dùng camera điện thoại quét để truy cập ngay.
                    </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-6">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Mã của bé (Nếu cần nhập thủ công)</p>
                    <p className="text-2xl font-black text-pink-500 tracking-widest text-center">{code}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleCopy}
                        className="py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">
                            {copied ? 'check' : 'content_copy'}
                        </span>
                        {copied ? 'Đã copy!' : 'Copy Link'}
                    </button>
                    
                    <button
                        onClick={handleShare}
                        className="py-4 cute-button-primary rounded-2xl font-bold text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">share</span>
                        Gửi qua Zalo
                    </button>
                </div>
            </div>
        </div>
    );
}
