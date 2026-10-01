'use client';

import { useState, useEffect, useRef } from 'react';
import { compressImage } from '../lib/image-utils';

export default function PhotoJournal({ code }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);

    const fetchJournal = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/journal?code=${code}&t=${Date.now()}`, { cache: 'no-store' });
            const json = await res.json();
            if (json.success) {
                setEntries(json.data);
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
        if (!confirm('Bạn có chắc muốn xoá kỷ niệm này?')) return;
        try {
            await fetch(`/api/journal?code=${code}&id=${id}`, { method: 'DELETE' });
            fetchJournal();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="text-center py-10 opacity-50 font-bold">Đang tải kỷ niệm...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <h2 className="font-headline text-xl font-extrabold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">photo_library</span>
                    Kỷ niệm
                </h2>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full font-bold text-xs hover:bg-primary/20 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                    Thêm
                </button>
            </div>

            {entries.length === 0 ? (
                <div className="text-center py-12 px-6 bg-surface-container-lowest border-2 border-dashed border-outline-variant/30 rounded-[2.5rem]">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">📸</span>
                    </div>
                    <h3 className="font-headline font-bold text-on-surface mb-2">Chưa có kỷ niệm nào</h3>
                    <p className="text-sm text-on-surface-variant/80">Lưu lại những khoảnh khắc đáng yêu của bé để làm kỷ niệm nhé!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {entries.map(entry => (
                        <div key={entry.id} className="bg-white border border-outline-variant/20 rounded-[2rem] overflow-hidden shadow-sm relative">
                            {/* Actions */}
                            <button
                                onClick={() => handleDelete(entry.id)}
                                className="absolute top-4 right-4 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-md z-10 hover:bg-red-500 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>

                            {/* Photos */}
                            {entry.photos && entry.photos.length > 0 && (
                                <div className={`grid gap-0.5 ${entry.photos.length === 1 ? 'grid-cols-1' : entry.photos.length === 2 ? 'grid-cols-2' : entry.photos.length >= 3 ? 'grid-cols-2 grid-rows-2' : ''}`}>
                                    {entry.photos.map((photo, i) => (
                                        <div key={i} className={`relative bg-gray-100 ${entry.photos.length === 3 && i === 0 ? 'row-span-2' : ''}`}>
                                            <img
                                                src={photo}
                                                alt="Memory"
                                                className="w-full h-full object-cover max-h-[400px] min-h-[200px]"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-on-surface-variant/70 uppercase tracking-widest">
                                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                    {new Date(entry.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                {entry.caption && (
                                    <p className="text-on-surface text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{entry.caption}</p>
                                )}
                                {entry.tags && entry.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {entry.tags.map((tag, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-surface-container text-on-surface-variant text-[11px] font-bold rounded-full">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAdd && <AddJournalModal code={code} onClose={() => setShowAdd(false)} onSave={fetchJournal} />}
        </div>
    );
}

function AddJournalModal({ code, onClose, onSave }) {
    const [photos, setPhotos] = useState([]);
    const [caption, setCaption] = useState('');
    const [tags, setTags] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [saving, setSaving] = useState(false);
    const [milestone, setMilestone] = useState('');
    const fileInputRef = useRef(null);

    const presetMilestones = [
        'Lần đầu biết lẫy',
        'Lần đầu biết bò',
        'Chiếc răng đầu tiên',
        'Bước đi đầu tiên',
        'Tiếng gọi "Mẹ" / "Ba"',
        'Lần đầu ăn dặm'
    ];

    const handlePhotoSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        // Limit to 4 photos max per entry for now
        const allowedFiles = files.slice(0, 4 - photos.length);
        if (files.length > allowedFiles.length) {
            alert('Bạn chỉ có thể đăng tối đa 4 ảnh cho mỗi bài viết.');
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
        if (!caption.trim() && photos.length === 0 && !milestone) {
            alert('Vui lòng thêm nội dung, ảnh, hoặc chọn cột mốc!');
            return;
        }
        setSaving(true);
        try {
            const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
            if (milestone) tagArray.push(milestone.replace(/\s+/g, '_'));
            
            await fetch('/api/journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    date: new Date(date).toISOString(),
                    caption: milestone && !caption ? `🎉 Bé đạt cột mốc: ${milestone}` : caption,
                    photos,
                    tags: tagArray,
                    type: milestone ? 'milestone' : 'memory',
                    milestoneId: milestone || null
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
            <div className="w-full max-w-md bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border-t sm:border border-outline-variant/30 animate-in slide-in-from-bottom duration-500 max-h-[90dvh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-6 pt-6 pb-3">
                    <h2 className="text-lg font-black font-headline text-on-surface">Thêm Kỷ Niệm</h2>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-all">
                        <span className="material-symbols-outlined text-on-surface-variant text-xl">close</span>
                    </button>
                </div>
                
                {/* Content */}
                <div className="overflow-y-auto flex-1 px-6 pb-6 space-y-4">
                    {/* Photos Grid */}
                    {photos.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                            {photos.map((p, i) => (
                                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-outline-variant/20">
                                    <img src={p} alt="" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removePhoto(i)}
                                        className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                            ))}
                            {photos.length < 4 && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-2xl border-2 border-dashed border-primary/30 text-primary flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors"
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
                            className="w-full h-32 rounded-[2rem] border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-2 bg-primary/5 text-primary cursor-pointer active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                            <span className="font-bold text-sm">Chọn ảnh đính kèm</span>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handlePhotoSelect}
                    />

                    <div>
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1 block mb-1">Ngày diễn ra</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1 block mb-1">Kể lại kỷ niệm...</label>
                        <textarea
                            placeholder="Hôm nay bé đã làm gì vui?"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            rows={4}
                            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1 block mb-1">Nhãn (cách nhau dấu phẩy)</label>
                        <input
                            type="text"
                            placeholder="VD: lật, cười_to, đi_chơi..."
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1 block mb-2">Đạt cột mốc quan trọng?</label>
                        <div className="flex flex-wrap gap-2">
                            {presetMilestones.map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMilestone(milestone === m ? '' : m)}
                                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${
                                        milestone === m 
                                            ? 'bg-amber-100 border-amber-300 text-amber-800' 
                                            : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant/70 hover:bg-surface-container'
                                    }`}
                                >
                                    {milestone === m && '⭐ '} {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full mt-2 py-3.5 bg-primary text-on-primary rounded-2xl font-bold text-sm shadow-lg disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-base">check</span>
                        )}
                        {saving ? 'Đang lưu...' : 'Lưu kỷ niệm'}
                    </button>
                </div>
            </div>
        </div>
    );
}
