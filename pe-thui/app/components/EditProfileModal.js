'use client';

import { useState, useEffect } from 'react';
import TelegramLinkSection from './TelegramLinkSection';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function EditProfileModal({ profile, code, onClose, onSave }) {
    const [newCode, setNewCode] = useState(code || '');
    const [name, setName] = useState(profile.name || '');
    const [gender, setGender] = useState(profile.gender || 'female');
    const [dob, setDob] = useState(profile.dob || '');
    const [avatarUrl, setAvatarUrl] = useState(profile.avatar || '');
    const [telegramChatId] = useState(profile.telegramChatId || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Notification settings
    const [notiEnabled, setNotiEnabled] = useState(false);
    const [notiMethod, setNotiMethod] = useState('app'); // 'app' | 'telegram'
    const [pushStatus, setPushStatus] = useState('unknown'); // unknown, subscribed, not_subscribed

    useEffect(() => {
        // Check current noti state
        const hasTelegram = !!profile.telegramChatId;

        // Quick sync check: if browser permission is granted, likely subscribed
        const hasPermission = typeof Notification !== 'undefined' && Notification.permission === 'granted';

        if (hasTelegram) {
            setNotiEnabled(true);
            setNotiMethod('telegram');
        } else if (hasPermission) {
            // User granted permission (e.g. via banner) — show enabled immediately
            setNotiEnabled(true);
            setNotiMethod('app');
        }

        // Async check for actual push subscription
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(reg => {
                reg.pushManager.getSubscription().then(sub => {
                    if (sub) {
                        setPushStatus('subscribed');
                        if (!hasTelegram) {
                            setNotiEnabled(true);
                            setNotiMethod('app');
                        }
                    } else {
                        setPushStatus('not_subscribed');
                        // If permission granted but no sub, still show enabled so user can subscribe in modal
                        if (hasPermission && !hasTelegram) {
                            setNotiEnabled(true);
                            setNotiMethod('app');
                        }
                    }
                });
            }).catch(() => setPushStatus('not_subscribed'));
        } else {
            setPushStatus('not_subscribed');
        }
    }, [profile.telegramChatId]);

    const formatCode = (str) => {
        const noAccents = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
        const alphanumeric = noAccents.replace(/[^a-zA-Z0-9]/g, '');
        return alphanumeric.toUpperCase().slice(0, 30);
    };

    const handleToggleNoti = async (enabled) => {
        setNotiEnabled(enabled);
        if (!enabled) {
            // If turning off, unsubscribe push + clear telegram
            if (pushStatus === 'subscribed' && 'serviceWorker' in navigator) {
                try {
                    const reg = await navigator.serviceWorker.ready;
                    const sub = await reg.pushManager.getSubscription();
                    if (sub) {
                        await sub.unsubscribe();
                        await fetch(`/api/notifications/subscribe?code=${code}&endpoint=${encodeURIComponent(sub.endpoint)}`, { method: 'DELETE' });
                        setPushStatus('not_subscribed');
                    }
                } catch (e) { console.error(e); }
            }
        }
    };

    const handleSubscribePush = async () => {
        try {
            if (!('Notification' in window)) return;

            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return;

            const reg = await navigator.serviceWorker.ready;
            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
            });

            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, subscription: subscription.toJSON() })
            });

            setPushStatus('subscribed');
            localStorage.setItem('pe_thui_noti_dismissed', '1');
        } catch (err) {
            console.error('Push subscribe error:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!name || !dob || !newCode) {
            setError('Vui lòng nhập đủ thông tin!');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: newCode, oldCode: code, name, gender, dob, avatar: avatarUrl, telegramChatId })
            });

            const json = await res.json();
            if (!json.success) {
                setError(json.error || 'Đã có lỗi xảy ra.');
                return;
            }

            onSave(newCode);
        } catch (e) {
            setError('Không thể kết nối đến máy chủ.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-surface p-6 sm:p-8 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl border-t sm:border border-outline-variant/30 animate-in slide-in-from-bottom duration-500 overflow-y-auto max-h-[95dvh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black font-headline text-primary tracking-tight uppercase">Cài Đặt</h2>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-all">
                        <span className="material-symbols-outlined text-on-surface-variant">close</span>
                    </button>
                </div>

                {error && (
                    <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-2xl mb-5 text-xs font-bold flex items-center gap-3">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ===== SECTION 1: THÔNG TIN BÉ ===== */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-lg">child_care</span>
                            </div>
                            <h3 className="text-[11px] font-black text-on-surface uppercase tracking-widest">Thông tin bé</h3>
                        </div>

                        <div className="bg-surface-container-lowest/50 rounded-[1.5rem] p-5 space-y-5 border border-outline-variant/20">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Mã Code</label>
                                    <input
                                        type="text"
                                        className="w-full bg-surface border border-outline-variant/50 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary uppercase tracking-widest text-sm"
                                        placeholder="VD: BINH-MINH"
                                        value={newCode}
                                        onChange={(e) => setNewCode(formatCode(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Tên của bé</label>
                                    <input
                                        type="text"
                                        className="w-full bg-surface border border-outline-variant/50 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-on-surface text-sm"
                                        placeholder="VD: Pepe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Avatar URL</label>
                                <input
                                    type="text"
                                    className="w-full bg-surface border border-outline-variant/50 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-on-surface text-xs"
                                    placeholder="Link ảnh (Imgur...)"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Giới tính</label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setGender('male')}
                                        className={`flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 border-2 transition-all ${gender === 'male' ? 'border-secondary bg-secondary/10 text-secondary font-black' : 'border-outline-variant/30 bg-surface text-on-surface-variant/50'}`}
                                    >
                                        <span className="material-symbols-outlined fill-current text-xl">male</span>
                                        <span className="text-xs uppercase tracking-wide">Bé Trai</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setGender('female')}
                                        className={`flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 border-2 transition-all ${gender === 'female' ? 'border-primary bg-primary/10 text-primary font-black' : 'border-outline-variant/30 bg-surface text-on-surface-variant/50'}`}
                                    >
                                        <span className="material-symbols-outlined fill-current text-xl">female</span>
                                        <span className="text-xs uppercase tracking-wide">Bé Gái</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Ngày sinh</label>
                                <input
                                    type="date"
                                    className="w-full bg-surface border border-outline-variant/50 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-on-surface text-sm"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ===== SECTION 2: THIẾT LẬP CHUNG ===== */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-8 h-8 bg-secondary/10 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-secondary text-lg">settings</span>
                            </div>
                            <h3 className="text-[11px] font-black text-on-surface uppercase tracking-widest">Thiết lập chung</h3>
                        </div>

                        <div className="bg-surface-container-lowest/50 rounded-[1.5rem] p-5 space-y-5 border border-outline-variant/20">
                            {/* Toggle thông báo */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-secondary text-xl">notifications</span>
                                    <div>
                                        <p className="text-sm font-bold text-on-surface">Nhắc lịch tiêm</p>
                                        <p className="text-[10px] text-on-surface-variant/60">Nhắc nhở trước ngày tiêm chủng</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleToggleNoti(!notiEnabled)}
                                    className={`relative w-12 h-7 rounded-full transition-all duration-300 ${notiEnabled ? 'bg-secondary' : 'bg-outline-variant/30'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${notiEnabled ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                </button>
                            </div>

                            {/* Chọn phương thức */}
                            {notiEnabled && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Phương thức nhận thông báo</p>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setNotiMethod('app')}
                                            className={`flex-1 py-3 rounded-2xl flex flex-col items-center gap-1.5 border-2 transition-all ${notiMethod === 'app' ? 'border-secondary bg-secondary/10 text-secondary' : 'border-outline-variant/20 bg-surface text-on-surface-variant/50'}`}
                                        >
                                            <span className="material-symbols-outlined text-xl">phone_iphone</span>
                                            <span className="text-[10px] font-black uppercase tracking-wider">App</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNotiMethod('telegram')}
                                            className={`flex-1 py-3 rounded-2xl flex flex-col items-center gap-1.5 border-2 transition-all ${notiMethod === 'telegram' ? 'border-[#0088cc] bg-[#0088cc]/10 text-[#0088cc]' : 'border-outline-variant/20 bg-surface text-on-surface-variant/50'}`}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                            </svg>
                                            <span className="text-[10px] font-black uppercase tracking-wider">Telegram</span>
                                        </button>
                                    </div>

                                    {/* App notification status */}
                                    {notiMethod === 'app' && (
                                        <div className="animate-in fade-in duration-200">
                                            {pushStatus === 'subscribed' ? (
                                                <div className="bg-green-50 border border-green-200 rounded-2xl p-3.5 flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                                                    <div>
                                                        <p className="text-xs font-bold text-green-800">Đã bật thông báo qua App</p>
                                                        <p className="text-[10px] text-green-600/60">Bạn sẽ nhận push notification trên thiết bị này</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handleSubscribePush}
                                                    className="w-full bg-secondary text-white text-[11px] font-black uppercase tracking-widest py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-sm">notifications_active</span>
                                                    Bật thông báo App
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Telegram section */}
                                    {notiMethod === 'telegram' && (
                                        <div className="animate-in fade-in duration-200">
                                            <TelegramLinkSection code={code} telegramChatId={telegramChatId} onSave={onSave} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-soft-gradient text-white font-black rounded-2xl py-5 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-widest"
                    >
                        {saving ? (
                            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">how_to_reg</span>
                                <span>Cập Nhật Thông Tin</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
