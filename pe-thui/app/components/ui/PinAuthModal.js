'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * PinAuthModal: Hộp thoại nhập mã PIN 4 số
 * - Dùng khi khách bấm vào các nút thêm / sửa / xoá để mở khoá quyền chỉnh sửa
 * - Tự động focus và nhảy sang ô kế tiếp khi gõ
 */
export default function PinAuthModal({ code, babyName, onSuccess, onClose }) {
    const [digits, setDigits] = useState(['', '', '', '']);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    useEffect(() => {
        // Tự động focus vào ô đầu tiên
        inputRefs[0]?.current?.focus();
    }, []);

    const handleChange = (index, value) => {
        const val = value.replace(/\D/g, '').slice(-1);
        const newDigits = [...digits];
        newDigits[index] = val;
        setDigits(newDigits);
        setErrorMsg('');

        if (val && index < 3) {
            inputRefs[index + 1]?.current?.focus();
        }

        // Nếu đã đủ 4 số thì tự submit
        if (val && index === 3 && newDigits.every(d => d !== '')) {
            handleSubmitPin(newDigits.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs[index - 1]?.current?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
        if (!pasted) return;
        const newDigits = ['', '', '', ''];
        for (let i = 0; i < pasted.length; i++) {
            newDigits[i] = pasted[i];
        }
        setDigits(newDigits);
        if (pasted.length === 4) {
            handleSubmitPin(pasted);
        } else {
            inputRefs[pasted.length]?.current?.focus();
        }
    };

    const handleSubmitPin = async (pinString) => {
        const pinToVerify = pinString || digits.join('');
        if (pinToVerify.length !== 4) {
            setErrorMsg('Vui lòng nhập đủ 4 chữ số');
            return;
        }

        setLoading(true);
        setErrorMsg('');

        try {
            const res = await fetch('/api/pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'verify',
                    code,
                    pin: pinToVerify
                })
            });

            const json = await res.json();
            if (res.ok && json.success) {
                onSuccess?.();
            } else {
                setErrorMsg(json.message || 'Mã PIN không đúng, vui lòng thử lại');
                setDigits(['', '', '', '']);
                inputRefs[0]?.current?.focus();
            }
        } catch (err) {
            setErrorMsg('Lỗi kết nối máy chủ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-on-surface/50 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] p-6 max-w-sm w-full shadow-2xl border border-purple-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-pink-100 text-[#861949] flex items-center justify-center mb-3 shadow-inner">
                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                </div>

                <h3 className="font-headline font-black text-lg text-gray-900">Mã PIN bảo vệ</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
                    Hồ sơ của <strong>{babyName || 'Bé'}</strong> đang ở chế độ xem. Nhập PIN 4 số của ba mẹ để mở quyền chỉnh sửa.
                </p>

                {/* 4 Pin Inputs */}
                <div className="flex gap-3 my-5" onPaste={handlePaste}>
                    {digits.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={inputRefs[idx]}
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            disabled={loading}
                            className="w-12 h-14 text-center text-2xl font-black text-gray-800 bg-gray-50 border-2 border-pink-200/80 rounded-2xl focus:border-[#861949] focus:bg-white focus:outline-none transition-all shadow-inner"
                        />
                    ))}
                </div>

                {errorMsg && (
                    <div className="mb-3 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-1 animate-in fade-in">
                        <span className="material-symbols-outlined text-[16px]">error</span>
                        <span>{errorMsg}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2.5 w-full mt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                        Để sau (Chỉ xem)
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSubmitPin()}
                        disabled={loading || digits.join('').length !== 4}
                        className="py-3 px-4 rounded-xl bg-[#861949] hover:bg-[#6c123a] text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1"
                    >
                        {loading ? (
                            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[16px]">lock_open</span>
                                <span>Mở khoá</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
