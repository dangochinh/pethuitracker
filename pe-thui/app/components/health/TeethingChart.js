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
        <div className="space-y-6 pb-20">
            {/* Header / Arch Card */}
            <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-purple-100/70 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-pink-100 text-[#861949] flex items-center justify-center shadow-xs">
                            <span className="material-symbols-outlined text-[22px]">sentiment_satisfied</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-black font-headline text-gray-900 leading-tight">Sơ đồ mọc răng sữa</h2>
                            <p className="text-xs text-gray-500 font-medium">Chạm vào răng để ghi nhận ngày mọc của bé</p>
                        </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-pink-100 text-[#861949] font-black text-xs uppercase tracking-wider">
                        {uniqueSproutedCount}/20 Răng
                    </span>
                </div>

                <div className="flex flex-col items-center bg-[#fff8f8] rounded-2xl p-6 border border-pink-100/60">
                    {renderJaw(TEETH.filter(t => t.jaw === 'upper'), 'HÀM TRÊN')}
                    <div className="w-48 border-t-2 border-dashed border-pink-200 my-4"></div>
                    {renderJaw(TEETH.filter(t => t.jaw === 'lower'), 'HÀM DƯỚI', true)}
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {[
                        { color: 'bg-tooth-red', label: 'Cửa giữa' },
                        { color: 'bg-tooth-orange', label: 'Cửa bên' },
                        { color: 'bg-tooth-green', label: 'Răng nanh' },
                        { color: 'bg-tooth-blue', label: 'Hàm 1' },
                        { color: 'bg-tooth-purple', label: 'Hàm 2' }
                    ].map(item => (
                        <div key={item.label} className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full shadow-xs border border-purple-100">
                            <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{item.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* History Section */}
            <section className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-base font-bold font-headline text-gray-900">Lịch sử mọc răng</h3>
                    <span className="text-[10px] font-black text-[#861949] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-100">
                        {uniqueSproutedCount} Răng Đã Mọc
                    </span>
                </div>

                {Object.entries(historyByJaw).length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-3xl border border-dashed border-purple-200">
                        <p className="text-xs text-gray-400 italic">Chưa có lịch sử mọc răng nào được ghi nhận</p>
                    </div>
                ) : (
                    Object.entries(historyByJaw).map(([jaw, items]) => (
                        <div key={jaw} className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <div className="h-1 w-4 bg-[#861949] rounded-full"></div>
                                <h4 className="font-headline font-bold text-gray-700 text-xs uppercase tracking-wider">{jaw}</h4>
                            </div>
                            <div className="grid gap-2.5">
                                {items.sort((a,b) => new Date(b.date) - new Date(a.date)).map((record, i) => {
                                    const tooth = record.tooth;
                                    const colorClass = toothColorMap[tooth?.group] || 'bg-tooth-red';
                                    return (
                                        <div 
                                            key={i} 
                                            onClick={() => handleToothClick(tooth)}
                                            className="bg-white p-4 rounded-2xl flex items-center gap-4 border border-purple-100 shadow-xs active:scale-[0.98] transition-all cursor-pointer hover:border-pink-200"
                                        >
                                            <div className={`w-10 h-10 rounded-xl ${colorClass} bg-opacity-25 flex items-center justify-center font-bold text-[#861949] text-base shadow-xs`}>
                                                {tooth?.group === 'canine' ? 'N' : tooth?.group?.includes('molar') ? 'C' : 'G'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 text-sm truncate">{tooth?.vnName}</h4>
                                                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                                                    {record.date ? `Mọc ngày ${new Date(record.date).toLocaleDateString('vi-VN')}` : 'Chưa rõ ngày mọc'}
                                                </p>
                                            </div>
                                            <span className="material-symbols-outlined text-gray-300 text-lg">chevron_right</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}

                {/* Teething Comfort Tip */}
                <div className="bg-[#fff8f8] rounded-2xl p-4 border border-pink-100 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#861949] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-xl">lightbulb</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-[#861949] text-xs mb-0.5 font-headline">Mẹo giảm khó chịu mọc răng</h4>
                        <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                            Thử dùng vòng ngậm nướu ướp lạnh (không đông đá) hoặc khăn sạch, ẩm mát để làm dịu nướu cho bé nhé.
                        </p>
                    </div>
                </div>
            </section>

            {/* Tooth Log Modal */}
            {selectedTooth && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-white p-6 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border-t sm:border border-purple-100 animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold font-headline text-gray-900 tracking-tight">Răng {selectedTooth.vnName}</h3>
                                <p className="text-xs text-[#861949] font-bold uppercase tracking-wider mt-0.5">
                                    {selectedTooth.jaw === 'upper' ? 'Hàm trên' : 'Hàm dưới'}
                                </p>
                            </div>
                            <button onClick={() => setSelectedTooth(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all text-gray-500">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {isUnticking ? (
                                <div className="space-y-3">
                                    <div className="bg-[#fff8f8] p-3.5 rounded-2xl border border-pink-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ngày đã mọc</p>
                                        <p className="font-black text-gray-900 text-sm">
                                            {date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa rõ'}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-600 font-medium px-1">
                                        Bạn có chắc chắn muốn xóa ghi nhận mọc của răng này không?
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-600 ml-1">Ngày mọc của răng</label>
                                    <input
                                        type="date"
                                        className="w-full bg-[#fff8f8] border border-pink-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#861949]/30 transition-all font-bold text-gray-800"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                            )}
                            
                            {isUnticking ? (
                                <button 
                                    onClick={handleDelete}
                                    disabled={saving}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl py-4 shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 mt-2 text-xs uppercase tracking-wider"
                                >
                                    {saving ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-base">delete</span>
                                            <span>Xóa ghi chú</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button 
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full bg-gradient-to-r from-[#861949] to-[#a53361] text-white font-bold rounded-2xl py-4 shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 mt-2 text-xs uppercase tracking-wider"
                                >
                                    {saving ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-base">check</span>
                                            <span>Lưu Ngày Mọc</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
