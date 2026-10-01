'use client';

import { useState } from 'react';
import { FaUserCircle, FaBaby } from 'react-icons/fa';

export default function AuthFlow({ onLoginSuccess }) {
    const [mode, setMode] = useState('login'); // 'login' | 'register' | 'legacy'
    const [phone, setPhone] = useState('');
    const [pin, setPin] = useState('');
    const [name, setName] = useState('');
    const [legacyCode, setLegacyCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
            const body = mode === 'login' ? { phone, pin } : { phone, pin, name };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (data.success) {
                // Save to local storage
                localStorage.setItem('pe_thui_user', JSON.stringify(data.user));
                onLoginSuccess(data.user);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLegacy = (e) => {
        e.preventDefault();
        if (legacyCode) {
            window.location.href = `/${legacyCode}`;
        }
    };

    if (mode === 'legacy') {
        return (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                <form onSubmit={handleLegacy} className="space-y-4">
                    <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all font-medium text-center uppercase tracking-widest"
                        placeholder="Nhập mã của bé..."
                        value={legacyCode}
                        onChange={(e) => setLegacyCode(e.target.value.toUpperCase())}
                    />
                    <button type="submit" disabled={!legacyCode} className="w-full cute-button-primary py-4 text-lg">
                        Vào trang trực tiếp
                    </button>
                    <button type="button" onClick={() => setMode('login')} className="w-full text-sm font-bold text-gray-500 mt-2">
                        Quay lại Đăng nhập
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-full">
                <button 
                    onClick={() => setMode('login')}
                    className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${mode === 'login' ? 'bg-white shadow text-pink-500' : 'text-gray-500'}`}
                >
                    Đăng Nhập
                </button>
                <button 
                    onClick={() => setMode('register')}
                    className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${mode === 'register' ? 'bg-white shadow text-pink-500' : 'text-gray-500'}`}
                >
                    Đăng Ký
                </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm font-bold rounded-xl text-center">{error}</div>}

            <form onSubmit={handleAuth} className="space-y-4">
                {mode === 'register' && (
                    <input
                        type="text"
                        required
                        placeholder="Tên của bạn (VD: Mẹ Thúy)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all font-medium"
                    />
                )}
                
                <input
                    type="tel"
                    required
                    placeholder="Số điện thoại"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all font-medium"
                />

                <input
                    type="password"
                    required
                    placeholder="Mã PIN (VD: 1234)"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all font-medium tracking-widest text-center"
                    maxLength={6}
                />

                <button
                    type="submit"
                    disabled={loading || !phone || !pin}
                    className="w-full cute-button-primary py-4 text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : null}
                    {mode === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
                </button>
            </form>

            <div className="mt-8 relative flex items-center justify-center">
                <div className="border-t border-gray-200 w-full absolute"></div>
                <span className="bg-white px-4 text-xs font-bold text-gray-400 relative z-10 uppercase tracking-wider">Hoặc</span>
            </div>

            <button
                onClick={() => setMode('legacy')}
                className="w-full mt-6 py-4 rounded-2xl font-bold border-2 border-pink-200 text-pink-500 hover:bg-pink-50 transition-all shadow-sm active:scale-95"
            >
                Truy cập nhanh bằng Mã Bé
            </button>
        </div>
    );
}
