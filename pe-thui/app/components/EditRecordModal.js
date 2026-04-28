'use client';

import { useState } from 'react';

export default function EditRecordModal({ onClose, onSave, profile, code, record }) {
    const [date, setDate] = useState(record.date || new Date().toISOString().split('T')[0]);
    const [weight, setWeight] = useState(record.weight || '');
    const [height, setHeight] = useState(record.height || '');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!weight || !height || !date) {
            setError('Vui lòng nhập đủ thông tin!');
            return;
        }

        setSaving(true);
        try {
            const start = new Date(profile.dob);
            const end = new Date(date);
            const ageMonths = Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));

            await fetch('/api/growth', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: record.id,
                    code,
                    date,
                    ageMonths,
                    weight: parseFloat(weight),
                    height: parseFloat(height)
                })
            });
            onSave();
            onClose();
        } catch (e) {
            setError('Lỗi kết nối đến máy chủ. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        setError('');
        try {
            const res = await fetch(`/api/growth?code=${code}&id=${record.id}`, {
                method: 'DELETE'
            });
            const json = await res.json();
            if (json.success) {
                onSave();
                onClose();
            } else {
                setError('Lỗi khi xóa bản ghi.');
            }
        } catch (e) {
            setError('Lỗi kết nối đến máy chủ. Vui lòng thử lại.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-surface p-8 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl border-t sm:border border-outline-variant/30 animate-in slide-in-from-bottom duration-500">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black font-headline text-primary tracking-tight">SỬA CHỈ SỐ</h2>
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

                {showConfirmDelete ? (
                    <div className="text-center py-4 animate-in fade-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>delete_forever</span>
                        </div>
                        <h3 className="font-black text-on-surface mb-2 text-lg">Xóa bản ghi này?</h3>
                        <p className="text-sm text-on-surface-variant/70 mb-8 px-2 leading-relaxed font-medium">
                            Bạn có chắc chắn muốn xóa bản ghi cân đo ngày <strong className="text-on-surface">{new Date(record.date).toLocaleDateString('vi-VN')}</strong> không? Dữ liệu bị xóa không thể khôi phục.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmDelete(false)}
                                disabled={deleting}
                                className="flex-1 py-4 rounded-2xl font-bold border-2 border-outline-variant/40 text-on-surface-variant hover:bg-surface-container transition-all active:scale-95"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 py-4 rounded-2xl font-extrabold bg-error text-white shadow-lg shadow-error/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-widest text-[11px] flex items-center justify-center"
                            >
                                {deleting ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    'Vâng, Xóa đi!'
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Ngày đo</label>
                            <input
                                type="date"
                                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-on-surface"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Cân nặng (kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-on-surface"
                                    placeholder="VD: 8.5"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Chiều cao (cm)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-on-surface"
                                    placeholder="VD: 72.5"
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
                                    <span>Lưu Thay Đổi</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowConfirmDelete(true)}
                            className="w-full py-3 font-bold text-error/60 hover:text-error border-2 border-transparent hover:border-error/10 bg-transparent hover:bg-error/5 rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                            Xóa bản ghi này
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
