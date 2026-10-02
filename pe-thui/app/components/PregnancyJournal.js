'use client';

import { useState, useEffect, useRef } from 'react';
import { compressImage } from '../lib/image-utils';

export default function PregnancyJournal({ code }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setPreviewImage(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const fetchJournal = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/journal?code=${code}&type=ultrasound&t=${Date.now()}`, { cache: 'no-store' });
            const json = await res.json();
            if (json.success) {
                // Filter only ultrasound entries
                setEntries(json.data.filter(e => e.type === 'ultrasound' || e.isUltrasound));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJournal();
    }, [code]);

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc muốn xoá kết quả siêu âm này?')) return;
        try {
            await fetch(`/api/journal?code=${code}&id=${id}`, { method: 'DELETE' });
            fetchJournal();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="animate-bounce text-4xl mb-3">📸</div>
                <p className="text-purple-600 font-bold tracking-wide animate-pulse">Đang tải nhật ký...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <h2 className="font-headline text-xl font-extrabold text-purple-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">image_search</span>
                    Hồ sơ Siêu âm
                </h2>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-bold text-xs hover:bg-purple-200 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                    Thêm
                </button>
            </div>

            {entries.length === 0 ? (
                <div className="text-center py-12 px-6 bg-purple-50/50 border-2 border-dashed border-purple-200 rounded-[2.5rem]">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-500">
                        <span className="material-symbols-outlined text-3xl">medical_information</span>
                    </div>
                    <h3 className="font-headline font-bold text-purple-900 mb-2">Chưa có kết quả siêu âm</h3>
                    <p className="text-sm text-purple-600/80">Lưu lại hình ảnh siêu âm và chỉ số của bé qua các tuần thai nhé!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {entries.map(entry => (
                        <div key={entry.id} className="bg-white border border-purple-100 rounded-[2rem] overflow-hidden shadow-sm relative">
                            {/* Actions */}
                            <button
                                onClick={() => handleDelete(entry.id)}
                                className="absolute top-4 right-4 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-md z-10 hover:bg-red-500 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>

                            {/* Photos */}
                            {entry.photos && entry.photos.length > 0 && (
                                <div className={`grid gap-0.5 ${entry.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                    {entry.photos.map((photo, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => setPreviewImage(photo)}
                                            className="relative bg-gray-900 cursor-pointer group overflow-hidden"
                                        >
                                            <img
                                                src={photo}
                                                alt="Ultrasound"
                                                className="w-full h-full object-cover max-h-[300px] min-h-[200px] group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                <span className="material-symbols-outlined text-white text-2xl bg-black/50 p-2 rounded-full backdrop-blur-sm shadow-md">zoom_in</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-widest">
                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                        {new Date(entry.date).toLocaleDateString('vi-VN')}
                                    </div>
                                    {entry.gestationalAge && (
                                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                                            {entry.gestationalAge}
                                        </span>
                                    )}
                                </div>
                                
                                {/* Metrics */}
                                {(entry.fetalWeight || entry.heartRate) && (
                                    <div className="flex gap-2 mb-3">
                                        {entry.fetalWeight && (
                                            <div className="bg-blue-50 border border-blue-100 text-blue-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 flex-1">
                                                <span className="material-symbols-outlined text-[16px] text-blue-500">scale</span>
                                                <div>
                                                    <p className="text-[9px] font-bold uppercase tracking-wider text-blue-400">Cân nặng</p>
                                                    <p className="text-sm font-black">{entry.fetalWeight}g</p>
                                                </div>
                                            </div>
                                        )}
                                        {entry.heartRate && (
                                            <div className="bg-rose-50 border border-rose-100 text-rose-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 flex-1">
                                                <span className="material-symbols-outlined text-[16px] text-rose-500">favorite</span>
                                                <div>
                                                    <p className="text-[9px] font-bold uppercase tracking-wider text-rose-400">Tim thai</p>
                                                    <p className="text-sm font-black">{entry.heartRate} bpm</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {entry.caption && (
                                    <p className="text-gray-700 text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{entry.caption}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAdd && <AddUltrasoundModal code={code} onClose={() => setShowAdd(false)} onSave={fetchJournal} />}

            {/* Image Preview Lightbox Modal */}
            {previewImage && (
                <div 
                    className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-5 right-5 w-11 h-11 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 z-10"
                        title="Đóng (ESC)"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                    <div 
                        className="relative max-w-full max-h-[88vh] flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={previewImage}
                            alt="Ultrasound preview"
                            className="max-w-full max-h-[88vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 select-none"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function AddUltrasoundModal({ code, onClose, onSave }) {
    const [photos, setPhotos] = useState([]);
    const [caption, setCaption] = useState('');
    const [gestationalAge, setGestationalAge] = useState('');
    const [fetalWeight, setFetalWeight] = useState('');
    const [heartRate, setHeartRate] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    const handlePhotoSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const allowedFiles = files.slice(0, 2 - photos.length);
        if (files.length > allowedFiles.length) {
            alert('Tối đa 2 ảnh siêu âm mỗi lần.');
        }

        try {
            const base64s = await Promise.all(allowedFiles.map(f => compressImage(f)));
            setPhotos(prev => [...prev, ...base64s]);
        } catch (err) {
            alert(err.message);
        }
    };

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (photos.length === 0 && !fetalWeight && !heartRate && !caption.trim()) {
            alert('Vui lòng thêm ảnh hoặc thông số siêu âm!');
            return;
        }
        setSaving(true);
        try {
            await fetch('/api/journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    date: new Date(date).toISOString(),
                    caption,
                    photos,
                    fetalWeight: fetalWeight ? Number(fetalWeight) : null,
                    heartRate: heartRate ? Number(heartRate) : null,
                    gestationalAge,
                    type: 'ultrasound',
                    isUltrasound: true
                }),
            });
            onSave?.();
            onClose();
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border-t sm:border border-purple-100 animate-in slide-in-from-bottom duration-500 max-h-[90dvh] flex flex-col">
                <div className="flex justify-between items-center px-6 pt-6 pb-3">
                    <h2 className="text-lg font-black font-headline text-purple-900">Lưu Siêu Âm</h2>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all">
                        <span className="material-symbols-outlined text-gray-500 text-xl">close</span>
                    </button>
                </div>
                
                <div className="overflow-y-auto flex-1 px-6 pb-6 space-y-4">
                    {/* Photos Grid */}
                    {photos.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                            {photos.map((p, i) => (
                                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-900">
                                    <img src={p} alt="" className="w-full h-full object-cover opacity-90" />
                                    <button
                                        onClick={() => removePhoto(i)}
                                        className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                            ))}
                            {photos.length < 2 && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-2xl border-2 border-dashed border-purple-300 text-purple-500 flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                                    <span className="text-xs font-bold mt-1">Thêm ảnh</span>
                                </button>
                            )}
                        </div>
                    )}

                    {photos.length === 0 && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-24 rounded-[2rem] border-2 border-dashed border-purple-300 flex flex-col items-center justify-center gap-2 bg-purple-50 text-purple-600 cursor-pointer active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-3xl">upload_file</span>
                            <span className="font-bold text-sm">Tải lên ảnh siêu âm</span>
                        </div>
                    )}
                    <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={handlePhotoSelect} />

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-1">Ngày khám</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-200"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-1">Tuổi thai (VD: 12w3d)</label>
                            <input
                                type="text"
                                placeholder="Tùy chọn"
                                value={gestationalAge}
                                onChange={(e) => setGestationalAge(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-200"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-1">Cân nặng bé (gram)</label>
                            <input
                                type="number"
                                placeholder="VD: 1500"
                                value={fetalWeight}
                                onChange={(e) => setFetalWeight(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-200"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-1">Tim thai (bpm)</label>
                            <input
                                type="number"
                                placeholder="VD: 140"
                                value={heartRate}
                                onChange={(e) => setHeartRate(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-200"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-1">Ghi chú bác sĩ dặn</label>
                        <textarea
                            placeholder="Tình trạng nước ối, nhau thai..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            rows={3}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none"
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full mt-2 py-3.5 bg-purple-600 text-white rounded-2xl font-bold text-sm shadow-lg disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-base">check</span>
                        )}
                        {saving ? 'Đang lưu...' : 'Lưu kết quả'}
                    </button>
                </div>
            </div>
        </div>
    );
}
