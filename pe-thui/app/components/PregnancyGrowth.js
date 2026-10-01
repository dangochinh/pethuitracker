'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculatePregnancyWeeks } from '../lib/pregnancy-utils';

export default function PregnancyGrowth({ code, profile }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [currentStats, setCurrentStats] = useState(null);

    const fetchHealth = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/growth?code=${code}&type=mother_weight&t=${Date.now()}`, { cache: 'no-store' });
            const json = await res.json();
            if (json.success) {
                // filter mother weight
                const sorted = json.data.filter(d => d.type === 'mother_weight').sort((a, b) => new Date(a.date) - new Date(b.date));
                setEntries(sorted);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile.estimatedDueDate) {
            setCurrentStats(calculatePregnancyWeeks(profile.estimatedDueDate));
        }
        fetchHealth();
    }, [code, profile.estimatedDueDate]);

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc muốn xoá bản ghi này?')) return;
        try {
            await fetch(`/api/growth?code=${code}&id=${id}`, { method: 'DELETE' });
            fetchHealth();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="animate-bounce text-4xl mb-3">⚖️</div>
                <p className="text-purple-600 font-bold tracking-wide animate-pulse">Đang tải hồ sơ...</p>
            </div>
        );
    }

    const initialWeight = entries.length > 0 ? entries[0].weight : 0;
    const currentWeight = entries.length > 0 ? entries[entries.length - 1].weight : 0;
    const gained = currentWeight - initialWeight;

    // Chart Data for Recharts
    const chartData = entries.map(e => ({
        name: e.gestationalAge || new Date(e.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        weight: e.weight
    }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 rounded-xl shadow-lg">
                    <p className="text-gray-500 text-xs font-bold mb-1">{label}</p>
                    <p className="text-purple-600 font-black text-sm">{payload[0].value} kg</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <h2 className="font-headline text-xl font-extrabold text-purple-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">monitor_weight</span>
                    Sức khoẻ của Mẹ
                </h2>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-bold text-xs hover:bg-purple-200 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Thêm
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-1">Cân nặng hiện tại</span>
                    <span className="text-2xl font-black text-purple-700">{currentWeight ? `${currentWeight} kg` : '--'}</span>
                </div>
                <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400 mb-1">Đã tăng</span>
                    <span className="text-2xl font-black text-pink-600">{gained > 0 ? `+${gained.toFixed(1)} kg` : '--'}</span>
                </div>
            </div>

            {entries.length > 1 && (
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} domain={['auto', 'auto']} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="weight" name="Cân nặng" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-gray-700">Lịch sử cân nặng</h3>
                </div>
                {entries.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-400 font-medium">Chưa có dữ liệu.</div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {entries.slice().reverse().map(e => (
                            <div key={e.id} className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-800 text-lg">{e.weight} kg</p>
                                    <div className="flex gap-2 text-xs text-gray-500 font-medium mt-1">
                                        <span>{new Date(e.date).toLocaleDateString('vi-VN')}</span>
                                        {e.gestationalAge && <span className="bg-purple-100 text-purple-700 px-1.5 rounded uppercase font-bold">{e.gestationalAge}</span>}
                                    </div>
                                    {e.note && <p className="text-xs text-gray-400 mt-1">{e.note}</p>}
                                </div>
                                <button onClick={() => handleDelete(e.id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showAdd && (
                <AddMotherWeightModal 
                    code={code} 
                    currentWeek={currentStats?.weeks} 
                    onClose={() => setShowAdd(false)} 
                    onSave={fetchHealth} 
                />
            )}
        </div>
    );
}

function AddMotherWeightModal({ code, currentWeek, onClose, onSave }) {
    const [weight, setWeight] = useState('');
    const [gestationalAge, setGestationalAge] = useState(currentWeek ? `${currentWeek}w` : '');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!weight) {
            alert('Vui lòng nhập cân nặng!');
            return;
        }
        setSaving(true);
        try {
            await fetch('/api/growth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    type: 'mother_weight',
                    date: new Date(date).toISOString(),
                    weight: Number(weight),
                    gestationalAge,
                    note
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
            <div className="w-full max-w-sm bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border-t sm:border border-purple-100 animate-in slide-in-from-bottom duration-500 max-h-[90dvh] flex flex-col p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-black font-headline text-purple-900">Ghi Cân Nặng</h2>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all">
                        <span className="material-symbols-outlined text-gray-500 text-xl">close</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-1">Ngày ghi</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-1">Cân nặng (kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="VD: 55.5"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="w-full bg-purple-50 border border-purple-200 text-purple-700 rounded-2xl px-4 py-3 text-lg font-black focus:outline-none focus:ring-2 focus:ring-purple-300"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-1">Tuần thai</label>
                            <input
                                type="text"
                                placeholder="VD: 12w"
                                value={gestationalAge}
                                onChange={(e) => setGestationalAge(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-200 uppercase"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-1">Ghi chú thêm</label>
                        <input
                            type="text"
                            placeholder="Ốm nghén, thèm ăn..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full mt-4 py-4 bg-purple-600 text-white rounded-2xl font-bold text-base shadow-lg disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined">check</span>
                        )}
                        {saving ? 'Đang lưu...' : 'Lưu thông tin'}
                    </button>
                </div>
            </div>
        </div>
    );
}
