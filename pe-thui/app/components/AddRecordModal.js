'use client';

import { useState } from 'react';

export default function AddRecordModal({ onClose, onSave, profile, code }) {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const start = new Date(profile.dob);
    const end = new Date(date);
    const ageMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(Math.max(0, ageMonths) / 12);
    const months = Math.max(0, ageMonths) % 12;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!weight || !height || !date) {
            setError('Vui lòng nhập đủ thông tin!');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/growth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code,
                    date,
                    ageMonths: Math.max(0, ageMonths),
                    weight: parseFloat(weight),
                    height: parseFloat(height)
                })
            });
            const json = await res.json();
            if (json.success) {
                onSave();
                onClose();
            } else setError(json.error || 'Có lỗi xảy ra');
        } catch (e) {
            setError('Lỗi kết nối đến máy chủ. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-surface p-8 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl border-t sm:border border-outline-variant/30 animate-in slide-in-from-bottom duration-500">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black font-headline text-primary tracking-tight">CẬP NHẬT CHỈ SỐ</h2>
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
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Ngày đo</label>
                        <input
                            type="date"
                            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-on-surface"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Cân nặng (kg)</label>
                            <input
                                type="number" step="0.1"
                                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-on-surface"
                                placeholder="VD: 10.1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Chiều cao (cm)</label>
                            <input
                                type="number" step="0.1"
                                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-on-surface"
                                placeholder="VD: 77"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-soft-gradient text-white font-extrabold rounded-2xl py-5 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4 uppercase tracking-widest"
                    >
                        {saving ? (
                            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">save</span>
                                <span>Lưu Kết Quả</span>
                            </>
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
}
