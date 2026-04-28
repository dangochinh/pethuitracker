'use client';

import { useState } from 'react';
import { TEETH } from '../../lib/data/teeth';

export default function TeethingChart({ dob, records, code, onSave }) {
    const [selectedTooth, setSelectedTooth] = useState(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [saving, setSaving] = useState(false);
    const [isUnticking, setIsUnticking] = useState(false);

    const sproutedTeeth = new Set(records.map(r => r.toothId));
    const uniqueSproutedCount = sproutedTeeth.size;

    const handleToothClick = (tooth) => {
        const isSprouted = sproutedTeeth.has(tooth.id);
        setSelectedTooth(tooth);
        setIsUnticking(isSprouted);
        if (isSprouted) {
            const record = records.find(r => r.toothId === tooth.id);
            if (record) setDate(record.date || new Date().toISOString().split('T')[0]);
        } else {
            setDate(new Date().toISOString().split('T')[0]);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('/api/teeth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, toothId: selectedTooth.id, date })
            });
            onSave();
            setSelectedTooth(null);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            await fetch(`/api/teeth?code=${code}&toothId=${selectedTooth.id}`, {
                method: 'DELETE'
            });
            onSave();
            setSelectedTooth(null);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const toothPosMap = {
        'uci-l': 'u1-l', 'uci-r': 'u1-r', 'uli-l': 'u2-l', 'uli-r': 'u2-r',
        'uc-l': 'u3-l', 'uc-r': 'u3-r', 'ufm-l': 'u4-l', 'ufm-r': 'u4-r',
        'usm-l': 'u5-l', 'usm-r': 'u5-r',
        'lci-l': 'u1-l', 'lci-r': 'u1-r', 'lli-l': 'u2-l', 'lli-r': 'u2-r',
        'lc-l': 'u3-l', 'lc-r': 'u3-r', 'lfm-l': 'u4-l', 'lfm-r': 'u4-r',
        'lsm-l': 'u5-l', 'lsm-r': 'u5-r'
    };

    const toothColorMap = {
        'central': 'bg-tooth-red',
        'lateral': 'bg-tooth-orange',
        'canine': 'bg-tooth-green',
        'molar1': 'bg-tooth-blue',
        'molar2': 'bg-tooth-purple'
    };

    const renderJaw = (teeth, title, isLower = false) => (
        <div className="space-y-4">
            <div className={`dental-arch ${isLower ? 'tooth-lower rotate-180' : ''}`}>
                <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold text-outline-variant/30 uppercase tracking-[0.2em] pointer-events-none ${isLower ? 'rotate-180' : ''}`}>
                    {title}
                </div>
                {teeth.map(tooth => {
                    const isSprouted = sproutedTeeth.has(tooth.id);
                    const posClass = toothPosMap[tooth.id];
                    const colorClass = toothColorMap[tooth.group];
                    
                    return (
                        <button 
                            key={tooth.id}
                            onClick={() => handleToothClick(tooth)}
                            className={`tooth-btn ${posClass} ${colorClass} ${isSprouted ? 'tooth-erupted' : 'opacity-80'}`}
                        />
                    );
                })}
            </div>
        </div>
    );

    // Group history by jaw
    const historyByJaw = records.reduce((acc, record) => {
        const tooth = TEETH.find(t => t.id === record.toothId);
        if (!tooth) return acc;
        const jawKey = tooth.jaw === 'upper' ? 'HÀM TRÊN' : 'HÀM DƯỚI';
        if (!acc[jawKey]) acc[jawKey] = [];
        // Only keep the most recent record if duplicates exist for same tooth
        if (!acc[jawKey].find(r => r.toothId === record.toothId)) {
            acc[jawKey].push({ ...record, tooth });
        }
        return acc;
    }, {});

    return (
        <div className="space-y-12 py-4">
            <section className="bg-surface-container/40 rounded-[2.5rem] p-8 shadow-sm border border-surface-container">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold font-headline text-primary mb-1">Biểu đồ mọc răng</h2>
                    <p className="text-xs text-on-surface-variant italic opacity-80">Chạm vào răng để đánh dấu ngày mọc của bé</p>
                </div>

                <div className="flex flex-col items-center">
                    {renderJaw(TEETH.filter(t => t.jaw === 'upper'), 'HÀM TRÊN')}
                    <div className="h-10"></div>
                    {renderJaw(TEETH.filter(t => t.jaw === 'lower'), 'HÀM DƯỚI', true)}
                </div>

                {/* Legend */}
                <div className="mt-12 flex flex-wrap justify-center gap-x-4 gap-y-3">
                    {[
                        { color: 'bg-tooth-red', label: 'Cửa giữa' },
                        { color: 'bg-tooth-orange', label: 'Cửa bên' },
                        { color: 'bg-tooth-green', label: 'Răng nanh' },
                        { color: 'bg-tooth-blue', label: 'Hàm 1' },
                        { color: 'bg-tooth-purple', label: 'Hàm 2' }
                    ].map(item => (
                        <div key={item.label} className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-outline-variant/20">
                            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                            <span className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider">{item.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* History Section */}
            <section className="space-y-8">
                <div className="flex justify-between items-baseline px-2">
                    <h3 className="text-2xl font-extrabold font-headline text-primary">Lịch sử mọc răng</h3>
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{uniqueSproutedCount} Răng Đã Mọc</span>
                </div>

                {Object.entries(historyByJaw).length === 0 ? (
                    <div className="text-center py-10 bg-surface-container/20 rounded-[2rem] border border-dashed border-outline-variant/50">
                        <p className="text-sm text-on-surface-variant italic opacity-50">Chưa có lịch sử mọc răng</p>
                    </div>
                ) : (
                    Object.entries(historyByJaw).map(([jaw, items]) => (
                        <div key={jaw} className="space-y-4">
                            <div className="flex items-center gap-3 px-2">
                                <div className="h-[2px] w-6 bg-secondary/30 rounded-full"></div>
                                <h4 className="font-headline font-black text-secondary/60 text-[10px] uppercase tracking-[0.2em]">{jaw}</h4>
                            </div>
                            <div className="grid gap-3">
                                {items.sort((a,b) => new Date(b.date) - new Date(a.date)).map((record, i) => {
                                    const tooth = record.tooth;
                                    const colorClass = toothColorMap[tooth?.group] || 'bg-tooth-red';
                                    return (
                                        <div 
                                            key={i} 
                                            onClick={() => handleToothClick(tooth)}
                                            className="group bg-white p-5 rounded-3xl flex items-center gap-5 border border-surface-container shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                                        >
                                            <div className={`w-12 h-12 rounded-2xl ${colorClass} bg-opacity-30 flex items-center justify-center font-black text-on-primary-fixed-variant text-lg`}>
                                                {tooth?.group === 'canine' ? 'N' : tooth?.group?.includes('molar') ? 'C' : 'G'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-on-surface text-base truncate">{tooth?.vnName}</h4>
                                                <p className="text-xs text-on-surface-variant font-medium mt-0.5 opacity-70">
                                                    {record.date ? `Mọc ngày ${new Date(record.date).toLocaleDateString('vi-VN')}` : 'Chưa rõ ngày mọc'}
                                                </p>
                                            </div>
                                            <div className="text-outline-variant/30 group-hover:text-primary transition-colors">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M9 18l6-6-6-6" />
                                                </svg>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}

                {/* Teething Comfort Tip */}
                <div className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10 flex items-center gap-5">
                    <div className="bg-primary/10 p-3.5 rounded-2xl text-primary flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
                            <path d="M9 18h6" />
                            <path d="M10 22h4" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-primary text-sm mb-0.5 font-headline">Mẹo giảm khó chịu mọc răng</h4>
                        <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed opacity-80">
                            Thử dùng vòng ngậm nướu ướp lạnh (không đông đá) hoặc khăn sạch, ẩm để làm dịu nướu cho bé nhé.
                        </p>
                    </div>
                </div>
            </section>


            {/* Tooth Log Modal */}
            {selectedTooth && (
                <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-surface p-8 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl border-t sm:border border-outline-variant/30 animate-in slide-in-from-bottom duration-500">
                        <h3 className="text-xl font-black font-headline text-primary mb-1 uppercase tracking-tight">Răng {selectedTooth.vnName}</h3>
                        <p className="text-[10px] text-on-surface-variant font-bold mb-6 opacity-60 uppercase tracking-widest">
                            {selectedTooth.jaw === 'upper' ? 'Hàm trên' : 'Hàm dưới'}
                        </p>
                        
                        <div className="space-y-6">
                            {isUnticking ? (
                                <div className="space-y-4">
                                    <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/30">
                                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Ngày đã mọc</p>
                                        <p className="font-black text-on-surface text-base">
                                            {date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa rõ'}
                                        </p>
                                    </div>
                                    <p className="text-xs text-on-surface-variant font-bold leading-relaxed px-1">
                                        Bạn có muốn xóa lịch sử mọc của răng này không?
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Ngày mọc</label>
                                    <input
                                        type="date"
                                        className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-on-surface"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                            )}
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setSelectedTooth(null)}
                                    className="flex-1 bg-surface-container text-on-surface-variant font-bold rounded-2xl py-4 uppercase tracking-widest text-[10px]"
                                >
                                    Đóng
                                </button>
                                {isUnticking ? (
                                    <button 
                                        onClick={handleDelete}
                                        disabled={saving}
                                        className="flex-[2] bg-error text-white font-black rounded-2xl py-4 shadow-lg shadow-error/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-widest text-[10px]"
                                    >
                                        {saving ? 'Đang xóa...' : 'Xóa ghi chú'}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-[2] bg-soft-gradient text-white font-black rounded-2xl py-4 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-widest text-[10px]"
                                    >
                                        {saving ? 'Đang lưu...' : 'Lưu Ngay'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
