'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ——————————————————————————————————————————————
// QUICK ACTIONS BAR — 4 big one-tap buttons
// ——————————————————————————————————————————————
export function QuickActions({ onFeed, onSleep, onDiaper, onMeasure, activeSleep }) {
    return (
        <div className="grid grid-cols-4 gap-2.5">
            <QuickButton
                icon="🍼"
                label="Bú / Ăn"
                color="bg-amber-50 border-amber-200"
                textColor="text-amber-700"
                onClick={onFeed}
            />
            <QuickButton
                icon="😴"
                label={activeSleep ? "Đang ngủ" : "Ngủ"}
                color={activeSleep ? "bg-indigo-100 border-indigo-300" : "bg-indigo-50 border-indigo-200"}
                textColor="text-indigo-700"
                onClick={onSleep}
                pulse={!!activeSleep}
            />
            <QuickButton
                icon="👶"
                label="Tã"
                color="bg-emerald-50 border-emerald-200"
                textColor="text-emerald-700"
                onClick={onDiaper}
            />
            <QuickButton
                icon="📏"
                label="Đo"
                color="bg-rose-50 border-rose-200"
                textColor="text-rose-700"
                onClick={onMeasure}
            />
        </div>
    );
}

function QuickButton({ icon, label, color, textColor, onClick, pulse }) {
    return (
        <button
            onClick={onClick}
            className={`${color} border rounded-2xl p-3 flex flex-col items-center gap-1.5 transition-all active:scale-90 hover:shadow-md relative overflow-hidden`}
        >
            {pulse && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse" />
            )}
            <span className="text-2xl">{icon}</span>
            <span className={`text-[9px] font-black uppercase tracking-wider ${textColor}`}>{label}</span>
        </button>
    );
}

// ——————————————————————————————————————————————
// STATUS BAR — live summary of today's activities
// ——————————————————————————————————————————————
export function StatusBar({ feedings, sleeps, diapers }) {
    const lastFeed = feedings?.[0];
    const lastSleep = sleeps?.[0];
    const diaperCount = diapers?.length || 0;

    const [, forceUpdate] = useState(0);
    useEffect(() => {
        const i = setInterval(() => forceUpdate(v => v + 1), 60000); // update every minute
        return () => clearInterval(i);
    }, []);

    const timeAgo = (isoStr) => {
        if (!isoStr) return null;
        const diff = (Date.now() - new Date(isoStr).getTime()) / 60000; // minutes
        if (diff < 1) return 'Vừa xong';
        if (diff < 60) return `${Math.round(diff)} phút trước`;
        if (diff < 1440) return `${Math.round(diff / 60)} giờ trước`;
        return `${Math.round(diff / 1440)} ngày trước`;
    };

    // Calculate awake time since last sleep ended
    const getAwakeTime = () => {
        if (!sleeps?.length) return null;
        const lastEnd = sleeps[0]?.endTime;
        if (!lastEnd) return 'Đang ngủ 💤';
        const diff = (Date.now() - new Date(lastEnd).getTime()) / 60000;
        if (diff < 60) return `Thức: ${Math.round(diff)} phút`;
        return `Thức: ${Math.floor(diff / 60)}h${Math.round(diff % 60)}m`;
    };

    return (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {lastFeed && (
                <StatusChip icon="🍼" text={`Bú: ${timeAgo(lastFeed.startTime)}`} />
            )}
            {lastSleep && (
                <StatusChip icon="😴" text={getAwakeTime()} />
            )}
            <StatusChip icon="👶" text={`Tã: ${diaperCount} lần`} />
        </div>
    );
}

function StatusChip({ icon, text }) {
    return (
        <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-outline-variant/20 rounded-full px-3 py-1.5 shrink-0">
            <span className="text-sm">{icon}</span>
            <span className="text-[10px] font-bold text-on-surface-variant whitespace-nowrap">{text}</span>
        </div>
    );
}

// ——————————————————————————————————————————————
// ACTIVITY TIMELINE — chronological feed of today
// ——————————————————————————————————————————————
export function ActivityTimeline({ feedings, sleeps, diapers, onDeleteFeeding, onDeleteSleep, onDeleteDiaper }) {
    // Merge all events into a single sorted timeline
    const events = [];

    feedings?.forEach(f => events.push({
        id: `feed-${f.id}`,
        rawId: f.id,
        domain: 'feeding',
        time: f.startTime,
        icon: f.type === 'breast' ? '🤱' : f.type === 'solid' ? '🥣' : '🍼',
        title: f.type === 'breast' ? 'Bú mẹ' : f.type === 'solid' ? 'Ăn dặm' : 'Bú bình',
        detail: buildFeedDetail(f),
        color: 'border-l-amber-400',
    }));

    sleeps?.forEach(s => events.push({
        id: `sleep-${s.id}`,
        rawId: s.id,
        domain: 'sleep',
        time: s.startTime,
        icon: s.type === 'night' ? '🌙' : '😴',
        title: s.type === 'night' ? 'Ngủ đêm' : 'Ngủ ngắn',
        detail: buildSleepDetail(s),
        color: 'border-l-indigo-400',
    }));

    diapers?.forEach(d => events.push({
        id: `diaper-${d.id}`,
        rawId: d.id,
        domain: 'diaper',
        time: d.time,
        icon: d.type === 'wet' ? '💧' : d.type === 'dirty' ? '💩' : '🔄',
        title: d.type === 'wet' ? 'Tã ướt' : d.type === 'dirty' ? 'Tã bẩn' : 'Tã ướt + bẩn',
        detail: d.notes || '',
        color: 'border-l-emerald-400',
    }));

    // Sort descending (most recent first)
    events.sort((a, b) => new Date(b.time) - new Date(a.time));

    if (events.length === 0) {
        return (
            <div className="text-center py-8 opacity-60">
                <span className="text-4xl block mb-3">📝</span>
                <p className="text-sm font-medium text-on-surface-variant">Chưa có hoạt động nào hôm nay</p>
                <p className="text-xs text-on-surface-variant/60 mt-1">Bấm nút ở trên để bắt đầu ghi nhận!</p>
            </div>
        );
    }

    const handleDelete = (event) => {
        if (event.domain === 'feeding') onDeleteFeeding?.(event.rawId);
        if (event.domain === 'sleep') onDeleteSleep?.(event.rawId);
        if (event.domain === 'diaper') onDeleteDiaper?.(event.rawId);
    };

    return (
        <div className="space-y-0">
            {events.map((event, i) => (
                <TimelineItem key={event.id} event={event} isLast={i === events.length - 1} onDelete={() => handleDelete(event)} />
            ))}
        </div>
    );
}

function TimelineItem({ event, isLast, onDelete }) {
    const [showDelete, setShowDelete] = useState(false);
    const timeStr = new Date(event.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    return (
        <div
            className={`flex gap-3 pl-1 relative ${!isLast ? 'pb-4' : ''}`}
            onContextMenu={(e) => { e.preventDefault(); setShowDelete(v => !v); }}
        >
            {/* Time */}
            <div className="w-12 shrink-0 text-right">
                <span className="text-xs font-bold text-on-surface-variant/60">{timeStr}</span>
            </div>

            {/* Icon dot + line */}
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-outline-variant/20 flex items-center justify-center text-sm shadow-sm shrink-0 z-10">
                    {event.icon}
                </div>
                {!isLast && <div className="w-0.5 flex-1 bg-outline-variant/15 mt-0.5" />}
            </div>

            {/* Content */}
            <div className={`flex-1 bg-white rounded-2xl p-3 border border-outline-variant/15 border-l-[3px] ${event.color} shadow-sm`}>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-on-surface">{event.title}</span>
                    {showDelete && (
                        <button
                            onClick={onDelete}
                            className="text-error/70 hover:text-error text-[10px] font-bold flex items-center gap-0.5 transition-colors"
                        >
                            <span className="material-symbols-outlined text-xs">delete</span>
                            Xoá
                        </button>
                    )}
                </div>
                {event.detail && (
                    <p className="text-[11px] text-on-surface-variant/70 mt-0.5 leading-snug">{event.detail}</p>
                )}
            </div>
        </div>
    );
}

function buildFeedDetail(f) {
    const parts = [];
    if (f.type === 'breast') {
        if (f.side) parts.push(f.side === 'left' ? 'Bên trái' : 'Bên phải');
        if (f.duration > 0) {
            const m = Math.round(f.duration / 60);
            parts.push(`${m} phút`);
        }
    }
    if (f.type === 'bottle' && f.amount) parts.push(`${f.amount} ml`);
    if (f.notes) parts.push(f.notes);
    return parts.join(' · ');
}

function buildSleepDetail(s) {
    const parts = [];
    if (s.duration > 0) {
        const h = Math.floor(s.duration / 60);
        const m = s.duration % 60;
        parts.push(h > 0 ? `${h}h ${m}m` : `${m} phút`);
    } else if (!s.endTime) {
        parts.push('Đang ngủ...');
    }
    if (s.notes) parts.push(s.notes);
    return parts.join(' · ');
}

// ——————————————————————————————————————————————
// FEED MODAL — quick-add feeding entry
// ——————————————————————————————————————————————
export function FeedingModal({ code, onClose, onSave }) {
    const [tab, setTab] = useState('bottle'); // 'breast' | 'bottle' | 'solid'
    const [side, setSide] = useState('left');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    // Breastfeeding timer
    const [timerRunning, setTimerRunning] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const intervalRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        if (timerRunning) {
            startTimeRef.current = startTimeRef.current || new Date();
            intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [timerRunning]);

    const formatTimer = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const now = new Date();
            const record = {
                code,
                type: tab,
                startTime: startTimeRef.current?.toISOString() || now.toISOString(),
                endTime: now.toISOString(),
                duration: tab === 'breast' ? seconds : 0,
                side: tab === 'breast' ? side : null,
                amount: tab === 'bottle' ? (Number(amount) || null) : null,
                notes,
            };
            await fetch('/api/feedings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record),
            });
            onSave?.();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const presetAmounts = [60, 90, 120, 150, 180];

    return (
        <ModalSheet title="🍼 Ghi nhận bú / ăn" onClose={onClose}>
            {/* Tabs */}
            <div className="flex bg-surface-container-lowest rounded-2xl p-1 gap-1 border border-outline-variant/20">
                {[
                    { id: 'breast', icon: '🤱', label: 'Bú mẹ' },
                    { id: 'bottle', icon: '🍼', label: 'Bú bình' },
                    { id: 'solid', icon: '🥣', label: 'Ăn dặm' },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => { setTab(t.id); setTimerRunning(false); setSeconds(0); startTimeRef.current = null; }}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            tab === t.id ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant/60'
                        }`}
                    >
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Breast feeding timer */}
            {tab === 'breast' && (
                <div className="space-y-4 mt-4">
                    {/* Side selector */}
                    <div className="flex gap-3">
                        {['left', 'right'].map(s => (
                            <button
                                key={s}
                                onClick={() => setSide(s)}
                                className={`flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all ${
                                    side === s
                                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                                        : 'border-outline-variant/20 text-on-surface-variant/50'
                                }`}
                            >
                                {s === 'left' ? '← Trái' : 'Phải →'}
                            </button>
                        ))}
                    </div>

                    {/* Timer */}
                    <div className="text-center py-4">
                        <div className="text-5xl font-black font-headline text-on-surface tabular-nums tracking-tight">
                            {formatTimer(seconds)}
                        </div>
                        <div className="mt-4 flex justify-center gap-3">
                            <button
                                onClick={() => setTimerRunning(!timerRunning)}
                                className={`px-8 py-3 rounded-full font-bold text-sm transition-all active:scale-95 ${
                                    timerRunning
                                        ? 'bg-red-100 text-red-600 border-2 border-red-200'
                                        : 'bg-primary text-on-primary shadow-lg'
                                }`}
                            >
                                {timerRunning ? '⏸ Dừng' : seconds > 0 ? '▶ Tiếp' : '▶ Bắt đầu'}
                            </button>
                            {seconds > 0 && !timerRunning && (
                                <button
                                    onClick={() => { setSeconds(0); startTimeRef.current = null; }}
                                    className="px-4 py-3 rounded-full font-bold text-sm bg-surface-container text-on-surface-variant border border-outline-variant/20"
                                >
                                    ↺ Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottle */}
            {tab === 'bottle' && (
                <div className="space-y-4 mt-4">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1 block">Lượng sữa (ml)</label>
                    <div className="flex gap-2 flex-wrap">
                        {presetAmounts.map(a => (
                            <button
                                key={a}
                                onClick={() => setAmount(String(a))}
                                className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                                    amount === String(a)
                                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                                        : 'border-outline-variant/20 text-on-surface-variant/60 hover:bg-surface-container-lowest'
                                }`}
                            >
                                {a} ml
                            </button>
                        ))}
                    </div>
                    <input
                        type="number"
                        inputMode="numeric"
                        placeholder="Hoặc nhập số ml..."
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl px-4 py-3 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            )}

            {/* Solid food */}
            {tab === 'solid' && (
                <div className="space-y-3 mt-4">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1 block">Ghi chú (món ăn)</label>
                    <textarea
                        placeholder="VD: Cháo bí đỏ, rau dền..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                </div>
            )}

            {/* Save */}
            <button
                onClick={handleSave}
                disabled={saving || (tab === 'breast' && seconds === 0 && !timerRunning) || (tab === 'bottle' && !amount)}
                className="w-full mt-6 py-3.5 bg-primary text-on-primary rounded-2xl font-bold text-sm shadow-lg disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                {saving ? (
                    <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                ) : (
                    <span className="material-symbols-outlined text-base">check</span>
                )}
                {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
        </ModalSheet>
    );
}

// ——————————————————————————————————————————————
// SLEEP MODAL — start / stop sleep timer
// ——————————————————————————————————————————————
export function SleepModal({ code, activeSleep, onClose, onSave }) {
    const [type, setType] = useState('nap');
    const [saving, setSaving] = useState(false);

    const handleStartSleep = async () => {
        setSaving(true);
        try {
            const now = new Date();
            const sleepType = now.getHours() >= 19 || now.getHours() < 6 ? 'night' : 'nap';
            await fetch('/api/sleeps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    type: sleepType,
                    startTime: now.toISOString(),
                }),
            });
            onSave?.();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleStopSleep = async () => {
        if (!activeSleep) return;
        setSaving(true);
        try {
            const now = new Date();
            const start = new Date(activeSleep.startTime);
            const duration = Math.round((now - start) / 60000); // minutes
            await fetch('/api/sleeps', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    id: activeSleep.id,
                    endTime: now.toISOString(),
                    duration,
                }),
            });
            onSave?.();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // Live elapsed time for active sleep
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        if (!activeSleep) return;
        const calc = () => Math.round((Date.now() - new Date(activeSleep.startTime).getTime()) / 1000);
        setElapsed(calc());
        const i = setInterval(() => setElapsed(calc()), 1000);
        return () => clearInterval(i);
    }, [activeSleep]);

    const formatElapsed = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    return (
        <ModalSheet title={activeSleep ? "😴 Bé đang ngủ..." : "😴 Ghi nhận giấc ngủ"} onClose={onClose}>
            {activeSleep ? (
                /* Active sleep — show elapsed + stop button */
                <div className="text-center py-6 space-y-6">
                    <div className="relative">
                        <div className="w-32 h-32 mx-auto rounded-full bg-indigo-50 border-4 border-indigo-200 flex items-center justify-center">
                            <span className="text-5xl">💤</span>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-xs font-bold">
                            {activeSleep.type === 'night' ? '🌙 Ngủ đêm' : '☀️ Ngủ ngắn'}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs text-on-surface-variant/60 font-medium">Bắt đầu ngủ lúc</p>
                        <p className="text-sm font-bold text-on-surface">
                            {new Date(activeSleep.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>

                    <div className="text-5xl font-black font-headline text-indigo-700 tabular-nums">
                        {formatElapsed(elapsed)}
                    </div>

                    <button
                        onClick={handleStopSleep}
                        disabled={saving}
                        className="w-full py-3.5 bg-red-500 text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">stop_circle</span>
                        {saving ? 'Đang lưu...' : 'Bé thức dậy rồi!'}
                    </button>
                </div>
            ) : (
                /* No active sleep — start new */
                <div className="text-center py-6 space-y-6">
                    <div className="w-28 h-28 mx-auto rounded-full bg-indigo-50/50 border-2 border-dashed border-indigo-200 flex items-center justify-center">
                        <span className="text-4xl">😴</span>
                    </div>

                    <p className="text-sm text-on-surface-variant font-medium">
                        Bấm nút bên dưới khi bé bắt đầu ngủ
                    </p>

                    <button
                        onClick={handleStartSleep}
                        disabled={saving}
                        className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">bedtime</span>
                        {saving ? 'Đang lưu...' : 'Bé ngủ rồi 💤'}
                    </button>
                </div>
            )}
        </ModalSheet>
    );
}

// ——————————————————————————————————————————————
// DIAPER MODAL — quick 3-button diaper log
// ——————————————————————————————————————————————
export function DiaperModal({ code, onClose, onSave }) {
    const [saving, setSaving] = useState(false);

    const handleLog = async (type) => {
        setSaving(true);
        try {
            await fetch('/api/diapers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    time: new Date().toISOString(),
                    type,
                }),
            });
            onSave?.();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <ModalSheet title="👶 Ghi nhận thay tã" onClose={onClose}>
            <div className="grid grid-cols-3 gap-3 py-4">
                <DiaperButton
                    icon="💧"
                    label="Ướt"
                    sublabel="Tè"
                    color="bg-blue-50 border-blue-200 text-blue-700"
                    activeColor="hover:bg-blue-100"
                    onClick={() => handleLog('wet')}
                    disabled={saving}
                />
                <DiaperButton
                    icon="💩"
                    label="Bẩn"
                    sublabel="Ị"
                    color="bg-amber-50 border-amber-200 text-amber-700"
                    activeColor="hover:bg-amber-100"
                    onClick={() => handleLog('dirty')}
                    disabled={saving}
                />
                <DiaperButton
                    icon="🔄"
                    label="Cả hai"
                    sublabel="Tè + Ị"
                    color="bg-emerald-50 border-emerald-200 text-emerald-700"
                    activeColor="hover:bg-emerald-100"
                    onClick={() => handleLog('mixed')}
                    disabled={saving}
                />
            </div>
            <p className="text-center text-[10px] text-on-surface-variant/50 font-medium mt-2">
                Bấm 1 nút để ghi nhận nhanh • Nhấn giữ để xem lịch sử
            </p>
        </ModalSheet>
    );
}

function DiaperButton({ icon, label, sublabel, color, activeColor, onClick, disabled }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${color} border-2 rounded-2xl p-5 flex flex-col items-center gap-2 transition-all active:scale-90 ${activeColor} disabled:opacity-50`}
        >
            <span className="text-4xl">{icon}</span>
            <div>
                <span className="text-sm font-black block">{label}</span>
                <span className="text-[10px] font-medium opacity-60">{sublabel}</span>
            </div>
        </button>
    );
}

// ——————————————————————————————————————————————
// SHARED MODAL SHEET
// ——————————————————————————————————————————————
function ModalSheet({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border-t sm:border border-outline-variant/30 animate-in slide-in-from-bottom duration-500 max-h-[85dvh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-6 pt-6 pb-3">
                    <h2 className="text-lg font-black font-headline text-on-surface">{title}</h2>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-all">
                        <span className="material-symbols-outlined text-on-surface-variant text-xl">close</span>
                    </button>
                </div>
                {/* Content */}
                <div className="overflow-y-auto flex-1 px-6 pb-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
