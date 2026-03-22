'use client';

import { useState } from 'react';

export default function EditProfileModal({ profile, code, onClose, onSave }) {
    const [newCode, setNewCode] = useState(code || '');
    const [name, setName] = useState(profile.name || '');
    const [gender, setGender] = useState(profile.gender || 'female');
    const [dob, setDob] = useState(profile.dob || '');
    const [avatarUrl, setAvatarUrl] = useState(profile.avatar || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const formatCode = (str) => {
        const noAccents = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
        const alphanumeric = noAccents.replace(/[^a-zA-Z0-9]/g, '');
        return alphanumeric.toUpperCase().slice(0, 30);
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
                body: JSON.stringify({ code: newCode, oldCode: code, name, gender, dob, avatar: avatarUrl })
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
            <div className="w-full max-w-lg bg-surface p-8 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl border-t sm:border border-outline-variant/30 animate-in slide-in-from-bottom duration-500 overflow-y-auto max-h-[95dvh]">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black font-headline text-primary tracking-tight uppercase">Thông Tin Bé</h2>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-all">
                        <span className="material-symbols-outlined text-on-surface-variant">close</span>
                    </button>
                </div>

                {error && (
                    <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-2xl mb-6 text-xs font-bold flex items-center gap-3">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Mã Code Access</label>
                            <input
                                type="text"
                                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary uppercase tracking-widest"
                                placeholder="VD: BINH-MINH"
                                value={newCode}
                                onChange={(e) => setNewCode(formatCode(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Tên của bé</label>
                            <input
                                type="text"
                                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-on-surface"
                                placeholder="VD: Pepe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Avatar URL</label>
                        <input
                            type="text"
                            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-on-surface text-xs"
                            placeholder="Link ảnh (Imgur...)"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Giới tính</label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setGender('male')}
                                className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 border-2 transition-all ${gender === 'male' ? 'border-secondary bg-secondary/10 text-secondary font-black' : 'border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant/50'}`}
                            >
                                <span className="material-symbols-outlined fill-current">male</span>
                                <span className="text-sm uppercase tracking-wide">Bé Trai</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setGender('female')}
                                className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 border-2 transition-all ${gender === 'female' ? 'border-primary bg-primary/10 text-primary font-black' : 'border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant/50'}`}
                            >
                                <span className="material-symbols-outlined fill-current">female</span>
                                <span className="text-sm uppercase tracking-wide">Bé Gái</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Ngày sinh</label>
                        <input
                            type="date"
                            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-on-surface"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-soft-gradient text-white font-black rounded-2xl py-5 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4 uppercase tracking-widest"
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
