// Được thay thế từ VaccineList1.js
'use client';

import { useEffect, useRef, useState } from 'react';
import { VACCINES } from '../../lib/data/vaccines';

export default function VaccineList({ dob, records, code, onSave }) {
    const [savingId, setSavingId] = useState(null);
    const summaryHeaderScrollRef = useRef(null);
    const summaryBodyScrollRef = useRef(null);
    const [schedulingVaccine, setSchedulingVaccine] = useState(null);
    const [scheduledDate, setScheduledDate] = useState('');
    const [untickVaccine, setUntickVaccine] = useState(null);

    // Custom Vaccine State
    const [showAddCustom, setShowAddCustom] = useState(false);
    const [customName, setCustomName] = useState('');
    const [customDisease, setCustomDisease] = useState('');
    const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
    const [savingCustom, setSavingCustom] = useState(false);

    // Filter UI State
    const [hideCompleted, setHideCompleted] = useState(true);

    // Parse custom vaccines from records
    const validRecords = records.filter(r => r.vaccineId);
    const customVaccines = validRecords
        .filter(r => r.vaccineId.startsWith('custom-'))
        .map(r => {
            try {
                const noteObj = JSON.parse(r.note || '{}');
                return {
                    id: r.vaccineId,
                    name: noteObj.name || 'Mũi dịch vụ',
                    disease: noteObj.disease || 'Khác',
                    recommendedAge: 999,
                    category: 'Mũi tiêm dịch vụ ngoài'
                };
            } catch (e) { return null; }
        }).filter(Boolean);

    // Filter duplicates if any (just in case)
    const uniqueCustomVaccines = customVaccines.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    const ALL_VACCINES = [...VACCINES, ...uniqueCustomVaccines];

    const completedIds = new Set(validRecords.filter(r => r.date).map(r => r.vaccineId));
    const scheduledRecords = validRecords.reduce((acc, r) => {
        if (r.scheduledDate) acc[r.vaccineId] = r.scheduledDate;
        return acc;
    }, {});

    const totalCount = ALL_VACCINES.length;
    const completedCount = completedIds.size;
    const percentage = Math.round((completedCount / totalCount) * 100);

    const calculateStatus = (v) => {
        if (completedIds.has(v.id)) return 'COMPLETED';
        const birthDate = new Date(dob);
        const today = new Date();
        const diffMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
        
        if (diffMonths > v.recommendedAge + 1) return 'OVERDUE';
        if (diffMonths >= v.recommendedAge) return 'UPCOMING';
        return 'SCHEDULED';
    };

    const getCountdown = (vId) => {
        const dateStr = scheduledRecords[vId];
        if (!dateStr) return null;
        const target = new Date(dateStr);
        const today = new Date();
        today.setHours(0,0,0,0);
        const diffTime = target - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleToggle = async (vaccine) => {
        if (completedIds.has(vaccine.id)) {
            // Uncheck logic
            setUntickVaccine(vaccine);
            return;
        }
        
        // If not completed, show scheduling primary action
        setSchedulingVaccine(vaccine);
        setScheduledDate(scheduledRecords[vaccine.id] || new Date().toISOString().split('T')[0]);
    };

    const handleConfirmUntick = async () => {
        if (!untickVaccine) return;
        setSavingId(untickVaccine.id);
        try {
            await fetch(`/api/vaccines?code=${code}&vaccineId=${untickVaccine.id}`, {
                method: 'DELETE'
            });
            onSave();
            setUntickVaccine(null);
        } catch (e) {
            console.error(e);
        } finally {
            setSavingId(null);
        }
    };

    const handleSaveDate = async (type) => {
        if (!schedulingVaccine) return;
        setSavingId(schedulingVaccine.id);
        const vId = schedulingVaccine.id;
        const payload = {
            code,
            vaccineId: vId,
            date: type === 'COMPLETE' ? new Date().toISOString().split('T')[0] : '',
            scheduledDate: type === 'SCHEDULE' ? scheduledDate : (scheduledRecords[vId] || ''),
            note: ''
        };

        try {
            await fetch('/api/vaccines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            onSave();
            setSchedulingVaccine(null);
        } catch (e) {
            console.error(e);
        } finally {
            setSavingId(null);
        }
    };

    const handleSaveCustom = async () => {
        if (!customName.trim()) return;
        setSavingCustom(true);
        const vId = `custom-${Date.now()}`;
        const noteData = JSON.stringify({ name: customName, disease: customDisease || 'Khác', category: 'Mũi tiêm dịch vụ ngoài' });
        
        try {
            await fetch('/api/vaccines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    vaccineId: vId,
                    date: customDate,
                    scheduledDate: '',
                    note: noteData
                })
            });
            onSave();
            setShowAddCustom(false);
            setCustomName('');
            setCustomDisease('');
        } catch (e) {
            console.error(e);
        } finally {
            setSavingCustom(false);
        }
    };

    const upcoming = ALL_VACCINES.filter(v => !completedIds.has(v.id))
        .sort((a, b) => {
            const aDate = scheduledRecords[a.id];
            const bDate = scheduledRecords[b.id];
            // Both have scheduled dates: sort by date (nearest first)
            if (aDate && bDate) return new Date(aDate) - new Date(bDate);
            // One has scheduled date: it comes first
            if (aDate) return -1;
            if (bDate) return 1;
            // Neither has scheduled date: sort by recommendedAge
            return a.recommendedAge - b.recommendedAge;
        })
        .slice(0, 2);

    const groups = ALL_VACCINES.reduce((acc, v) => {
        const cat = v.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(v);
        return acc;
    }, {});

    const ageIntervals = [
        { label: 'Sơ sinh', val: 0 },
        { label: '2 TH', val: 2 },
        { label: '3 TH', val: 3 },
        { label: '4 TH', val: 4 },
        { label: '6 TH', val: 6 },
        { label: '9 TH', val: 9 },
        { label: '12 TH', val: 12 },
        { label: '18 TH', val: 18 },
        { label: '2 tuổi', val: 24 },
        { label: '3 tuổi', val: 36 },
        { label: '4-8 T', val: 48 }
    ];

    const rowConfigs = [
        { label: 'Lao', prefix: 'bcg' },
        { label: 'Viêm gan B', prefix: 'hepb' },
        { label: '6 trong 1 / DPT', prefix: ['6in1', 'dpt'] },
        { label: 'Phế cầu', prefix: 'pneumo' },
        { label: 'Rota virus', prefix: 'rota' },
        { label: 'Não mô cầu B', prefix: 'meningo-b' },
        { label: 'Não mô cầu BC', prefix: 'meningo-bc' },
        { label: 'Cúm mùa', prefix: 'flu' },
        { label: 'Não mô cầu ACYW', prefix: 'meningo-acyw' },
        { label: 'Viêm não Nhật Bản', prefix: 'je' },
        { label: 'Sởi, Quai bị, Rubella', prefix: 'mmr' },
        { label: 'Thủy đậu', prefix: 'chickenpox' },
        { label: 'Viêm gan A', prefix: 'hepa' },
        { label: 'Thương hàn / Tả', prefix: ['typhoid', 'tả'] },
        { label: 'Sốt xuất huyết', prefix: 'dengue' }
    ];

    const summaryGridTemplate = '180px repeat(11, minmax(72px, 1fr))';

    useEffect(() => {
        const headerEl = summaryHeaderScrollRef.current;
        const bodyEl = summaryBodyScrollRef.current;

        if (!headerEl || !bodyEl) return;

        let syncSource = null;
        let rafId = null;

        const releaseSyncLock = () => {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
            rafId = requestAnimationFrame(() => {
                syncSource = null;
                rafId = null;
            });
        };

        const syncHeaderToBody = () => {
            if (syncSource === 'body') {
                return;
            }
            syncSource = 'header';
            if (bodyEl.scrollLeft !== headerEl.scrollLeft) {
                bodyEl.scrollLeft = headerEl.scrollLeft;
            }
            releaseSyncLock();
        };

        const syncBodyToHeader = () => {
            if (syncSource === 'header') {
                return;
            }
            syncSource = 'body';
            if (headerEl.scrollLeft !== bodyEl.scrollLeft) {
                headerEl.scrollLeft = bodyEl.scrollLeft;
            }
            releaseSyncLock();
        };

        // Align both tracks on mount/re-render.
        headerEl.scrollLeft = bodyEl.scrollLeft;
        headerEl.addEventListener('scroll', syncHeaderToBody);
        bodyEl.addEventListener('scroll', syncBodyToHeader);

        return () => {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
            headerEl.removeEventListener('scroll', syncHeaderToBody);
            bodyEl.removeEventListener('scroll', syncBodyToHeader);
        };
    }, []);

    const renderSummaryTable = () => (
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-[0px_20px_40px_rgba(165,51,97,0.08)] overflow-hidden">
            <div ref={summaryBodyScrollRef} className="-mx-2 overflow-x-auto summary-body-scroll px-2">
                <div className="min-w-max bg-surface-container-lowest">
                    <div className="bg-surface-container-lowest">
                        {rowConfigs.map((row, index) => (
                            <div
                                key={row.label}
                                className={`grid hover:bg-surface-container-low/50 transition-colors ${index === 0 ? '' : 'border-t border-surface-container'}`}
                                style={{ gridTemplateColumns: summaryGridTemplate }}
                            >
                                <div className="sticky left-0 z-20 bg-surface-container-lowest px-6 py-4 font-medium text-on-surface shadow-[8px_0_16px_rgba(255,248,248,0.95)]">
                                    {row.label}
                                </div>
                                {ageIntervals.map(age => {
                                    const vAtAge = ALL_VACCINES.find(v => {
                                        const matchesPrefix = Array.isArray(row.prefix)
                                            ? row.prefix.some(p => v.id.startsWith(p))
                                            : v.id.startsWith(row.prefix);
                                        return matchesPrefix && v.recommendedAge === age.val;
                                    });

                                    if (!vAtAge) return <div key={age.val} className="px-4 py-4"></div>;

                                    const isDone = completedIds.has(vAtAge.id);
                                    const countdown = getCountdown(vAtAge.id);
                                    const status = calculateStatus(vAtAge);

                                    return (
                                        <div key={age.val} className="flex items-center justify-center px-4 py-4">
                                            <button
                                                type="button"
                                                onClick={() => handleToggle(vAtAge)}
                                                className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105 ${
                                                    isDone
                                                        ? 'text-primary'
                                                        : countdown !== null || status === 'UPCOMING'
                                                          ? 'text-secondary'
                                                          : 'text-outline'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${isDone ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24` }}>
                                                    {isDone ? 'check_circle' : 'radio_button_unchecked'}
                                                </span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    /*

    // Filter UI State
    const [hideCompleted, setHideCompleted] = useState(true);

    // Parse custom vaccines from records
    const validRecords = records.filter(r => r.vaccineId);
    const customVaccines = validRecords
        .filter(r => r.vaccineId.startsWith('custom-'))
        .map(r => {
            try {
                const noteObj = JSON.parse(r.note || '{}');
                return {
                    id: r.vaccineId,
                    name: noteObj.name || 'Mũi dịch vụ',
                    disease: noteObj.disease || 'Khác',
                    recommendedAge: 999,
                    category: 'Mũi tiêm dịch vụ ngoài'
                };
            } catch (e) { return null; }
        }).filter(Boolean);

    // Filter duplicates if any (just in case)
    const uniqueCustomVaccines = customVaccines.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    const ALL_VACCINES = [...VACCINES, ...uniqueCustomVaccines];

    const completedIds = new Set(validRecords.filter(r => r.date).map(r => r.vaccineId));
    const scheduledRecords = validRecords.reduce((acc, r) => {
        if (r.scheduledDate) acc[r.vaccineId] = r.scheduledDate;
        return acc;
    }, {});

    const totalCount = ALL_VACCINES.length;
    const completedCount = completedIds.size;
    const percentage = Math.round((completedCount / totalCount) * 100);

    const calculateStatus = (v) => {
        if (completedIds.has(v.id)) return 'COMPLETED';
        const birthDate = new Date(dob);
        const today = new Date();
        const diffMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
        
        if (diffMonths > v.recommendedAge + 1) return 'OVERDUE';
        if (diffMonths >= v.recommendedAge) return 'UPCOMING';
        return 'SCHEDULED';
    };

    const getCountdown = (vId) => {
        const dateStr = scheduledRecords[vId];
        if (!dateStr) return null;
        const target = new Date(dateStr);
        const today = new Date();
        today.setHours(0,0,0,0);
        const diffTime = target - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleToggle = async (vaccine) => {
        if (completedIds.has(vaccine.id)) {
            // Uncheck logic
            setUntickVaccine(vaccine);
            return;
        }
        
        // If not completed, show scheduling primary action
        setSchedulingVaccine(vaccine);
        setScheduledDate(scheduledRecords[vaccine.id] || new Date().toISOString().split('T')[0]);
    };

    const handleConfirmUntick = async () => {
        if (!untickVaccine) return;
        setSavingId(untickVaccine.id);
        try {
            await fetch(`/api/vaccines?code=${code}&vaccineId=${untickVaccine.id}`, {
                method: 'DELETE'
            });
            onSave();
            setUntickVaccine(null);
        } catch (e) {
            console.error(e);
        } finally {
            setSavingId(null);
        }
    };

    const handleSaveDate = async (type) => {
        if (!schedulingVaccine) return;
        setSavingId(schedulingVaccine.id);
        const vId = schedulingVaccine.id;
        const payload = {
            code,
            vaccineId: vId,
            date: type === 'COMPLETE' ? new Date().toISOString().split('T')[0] : '',
            scheduledDate: type === 'SCHEDULE' ? scheduledDate : (scheduledRecords[vId] || ''),
            note: ''
        };

        try {
            await fetch('/api/vaccines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            onSave();
            setSchedulingVaccine(null);
        } catch (e) {
            console.error(e);
        } finally {
            setSavingId(null);
        }
    };

    const handleSaveCustom = async () => {
        if (!customName.trim()) return;
        setSavingCustom(true);
        const vId = `custom-${Date.now()}`;
        const noteData = JSON.stringify({ name: customName, disease: customDisease || 'Khác', category: 'Mũi tiêm dịch vụ ngoài' });
        
        try {
            await fetch('/api/vaccines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    vaccineId: vId,
                    date: customDate,
                    scheduledDate: '',
                    note: noteData
                })
            });
            onSave();
            setShowAddCustom(false);
            setCustomName('');
            setCustomDisease('');
        } catch (e) {
            console.error(e);
        } finally {
            setSavingCustom(false);
        }
    };

    const upcoming = ALL_VACCINES.filter(v => !completedIds.has(v.id))
        .sort((a, b) => a.recommendedAge - b.recommendedAge)
        .slice(0, 2);

    const groups = ALL_VACCINES.reduce((acc, v) => {
        const cat = v.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(v);
        return acc;
    }, {});

    // Table mapping data
    const ageIntervals = [
        { label: 'Sơ sinh', val: 0 },
        { label: '2 th', val: 2 },
        { label: '3 th', val: 3 },
        { label: '4 th', val: 4 },
        { label: '6 th', val: 6 },
        { label: '9 th', val: 9 },
        { label: '12 th', val: 12 },
        { label: '18 th', val: 18 },
        { label: '2 tuổi', val: 24 },
        { label: '3 tuổi', val: 36 },
        { label: '4-8 T', val: 48 }
    ];

    const rowConfigs = [
        { label: 'Lao', prefix: 'bcg' },
        { label: 'Viêm gan B', prefix: 'hepb' },
        { label: '6 trong 1 / DPT', prefix: ['6in1', 'dpt'] },
        { label: 'Phế cầu', prefix: 'pneumo' },
        { label: 'Rota virus', prefix: 'rota' },
        { label: 'Não mô cầu B', prefix: 'meningo-b' },
        { label: 'Não mô cầu BC', prefix: 'meningo-bc' },
        { label: 'Cúm mùa', prefix: 'flu' },
        { label: 'Não mô cầu ACYW', prefix: 'meningo-acyw' },
        { label: 'Viêm não Nhật Bản', prefix: 'je' },
        { label: 'Sởi, Quai bị, Rubella', prefix: 'mmr' },
        { label: 'Thủy đậu', prefix: 'chickenpox' },
        { label: 'Viêm gan A', prefix: 'hepa' },
        { label: 'Thương hàn / Tả', prefix: ['typhoid', 'tả'] },
        { label: 'Sốt xuất huyết', prefix: 'dengue' }
    ];

    */

    return (
        <div className="space-y-10 pb-8">
            {/* 1. Progress Hero */}
            <section className="relative bg-soft-gradient p-8 rounded-[2.5rem] text-white overflow-hidden shadow-lg shadow-primary/20">
                <div className="relative z-10 flex justify-between items-center">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black opacity-70 uppercase tracking-[0.2em] mb-1">Tiến độ tiêm chủng</p>
                        <h2 className="text-4xl font-black font-headline leading-tight">{completedCount} of {totalCount}</h2>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">
                            Lộ trình bảo vệ bé đến 8 tuổi
                        </p>
                    </div>
                    <div className="w-24 h-24 relative flex items-center justify-center scale-110">
                        <svg className="w-full h-full -rotate-90">
                            <circle className="opacity-20" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                            <circle 
                                className="stroke-white transition-all duration-1000 ease-out" 
                                cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" 
                                strokeDasharray={2 * Math.PI * 40} 
                                strokeDashoffset={2 * Math.PI * 40 * (1 - percentage / 100)} 
                                strokeLinecap="round" strokeWidth="8"
                            ></circle>
                        </svg>
                        <span className="absolute text-base font-black font-headline">{percentage}%</span>
                    </div>
                </div>
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            </section>

            {/* 2. Upcoming Reminders */}
            <section className="space-y-5">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-headline font-extrabold text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">event_upcoming</span>
                        Nhắc lịch sắp tới
                    </h3>
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{upcoming.length} mũi tiếp theo</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {upcoming.map((v, i) => {
                        const countdown = getCountdown(v.id);
                        return (
                            <div key={v.id} onClick={() => handleToggle(v)} className="bg-white p-5 rounded-[2.5rem] border border-outline-variant/20 flex flex-col justify-between h-40 shadow-sm relative overflow-hidden group active:scale-[0.98] transition-all cursor-pointer hover:shadow-md">
                                <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <span className="material-symbols-outlined text-[100px]">vaccines</span>
                                </div>
                                <div className="relative z-10">
                                    <h4 className="font-headline font-black text-on-surface text-sm leading-tight mb-1 line-clamp-2">{v.name}</h4>
                                    <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-1">Lứa tuổi: {v.category}</p>
                                </div>
                                <div className={`relative z-10 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] ${i === 0 ? 'text-primary' : 'text-secondary'}`}>
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    {countdown !== null ? `Còn ${countdown} ngày` : calculateStatus(v) === 'OVERDUE' ? 'Trễ lịch tiêm' : 'Đến kỳ tiêm'}
                                </div>
                            </div>
                        );
                    })}
                    {upcoming.length === 0 && (
                        <div className="col-span-2 py-10 text-center bg-surface-container/20 rounded-[2.5rem] border border-dashed border-outline-variant/50">
                            <p className="text-xs text-on-surface-variant font-medium italic opacity-50">Đã hoàn thành tất cả các mũi tiêm</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="space-y-0 pb-0">
                <div className="sticky top-0 z-50 bg-[#fff8f8] px-2 pt-2 pb-1 backdrop-blur-none">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-headline font-black text-primary">Bảng tổng hợp</h3>
                        </div>

                        <div ref={summaryHeaderScrollRef} className="-mx-2 overflow-x-auto summary-header-scroll px-2">
                            <div className="min-w-max">
                                <div className="grid bg-surface-container-low text-on-surface-variant shadow-sm rounded-t-[2rem]" style={{ gridTemplateColumns: summaryGridTemplate }}>
                                    <div className="sticky left-0 z-50 bg-surface-container-low px-6 py-4 text-left font-headline font-black text-primary rounded-tl-[2rem]">
                                        Vaccine
                                    </div>
                                    {ageIntervals.map(age => (
                                        <div key={age.val} className="px-3 py-4 text-center font-headline text-xs font-black whitespace-nowrap">
                                            {age.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="-mt-px">
                    {renderSummaryTable()}
                </div>
            </section>

            {/* 4. Detailed Schedule */}
            <section className="space-y-8">
                <div className="sticky top-[-1px] z-40 bg-white/95 backdrop-blur-md pb-4 pt-4 -mx-4 px-6 rounded-b-2xl border-b border-primary/10 shadow-sm flex justify-between items-center transition-all duration-300">
                    <h3 className="text-xl font-headline font-black text-primary">Chi tiết mũi tiêm</h3>
                    <button 
                        onClick={() => setHideCompleted(!hideCompleted)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low text-primary text-[11px] font-bold hover:bg-surface-container transition-colors shadow-sm active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[14px]">
                            {hideCompleted ? 'visibility' : 'visibility_off'}
                        </span>
                        {hideCompleted ? 'Hiện đã tiêm' : 'Ẩn đã tiêm'}
                    </button>
                </div>

                {Object.entries(groups).map(([cat, vaccines]) => {
                    const filteredList = hideCompleted ? vaccines.filter(v => !completedIds.has(v.id)) : [...vaccines];
                    // Sort by scheduled date (nearest first) within each category
                    const displayList = filteredList.sort((a, b) => {
                        const aDate = scheduledRecords[a.id];
                        const bDate = scheduledRecords[b.id];
                        // Both have scheduled dates: nearest first
                        if (aDate && bDate) return new Date(aDate) - new Date(bDate);
                        // One has scheduled date: it comes first
                        if (aDate) return -1;
                        if (bDate) return 1;
                        // Neither: keep default order
                        return 0;
                    });
                    if (displayList.length === 0) return null;

                    return (
                    <div key={cat} className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                            <div className="h-[2px] w-6 bg-primary/20 rounded-full"></div>
                            <h4 className="font-headline font-black text-on-surface-variant/40 text-[10px] uppercase tracking-[0.2em]">{cat}</h4>
                        </div>
                        <div className="space-y-3">
                            {displayList.map(v => {
                                const status = calculateStatus(v);
                                const isCompleted = status === 'COMPLETED';
                                const isOverdue = status === 'OVERDUE';
                                const countdown = getCountdown(v.id);
                                const isSaving = savingId === v.id;
                                
                                return (
                                    <div key={v.id} onClick={() => handleToggle(v)} className={`group relative flex items-center gap-5 bg-white p-5 rounded-3xl border transition-all active:scale-[0.98] cursor-pointer ${isOverdue ? 'border-l-4 border-l-error border-y-surface-variant/50 border-r-surface-variant/50' : 'border-outline-variant/20 shadow-sm'} ${isCompleted ? 'bg-secondary/5' : ''}`}>
                                        <div className="relative flex items-center justify-center shrink-0">
                                            {isSaving ? <div className="w-7 h-7 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div> : (
                                                <div className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${isCompleted ? 'bg-primary border-primary' : countdown !== null ? 'bg-secondary border-secondary' : 'bg-transparent border-outline/40'}`}>
                                                    {isCompleted ? <span className="material-symbols-outlined text-white text-sm">done</span> : countdown !== null ? <span className="material-symbols-outlined text-white text-xs">event</span> : null}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <h5 className={`font-bold text-on-surface text-base truncate ${isCompleted ? 'opacity-30' : ''}`}>{v.name}</h5>
                                                <span className={`shrink-0 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm leading-none ${isCompleted ? 'bg-primary/10 text-primary' : countdown !== null ? 'bg-secondary/10 text-secondary' : isOverdue ? 'bg-error/10 text-error' : status === 'UPCOMING' ? 'bg-secondary/10 text-secondary' : 'bg-surface-container text-on-surface-variant/30'}`}>
                                                    {isCompleted ? 'Đã tiêm' : countdown !== null ? `Còn ${countdown} ngày` : isOverdue ? 'Trễ lịch' : status === 'UPCOMING' ? 'Đến lịch' : 'Sắp tới'}
                                                </span>
                                            </div>
                                            <p className={`text-[11px] text-on-surface-variant font-medium mt-1 opacity-60 truncate ${isCompleted ? 'opacity-20' : ''}`}>{v.disease} • {v.category}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    );
                })}
                
                <div className="px-2 pt-4">
                    <button 
                        onClick={() => setShowAddCustom(true)}
                        className="w-full bg-surface-container-low border border-dashed border-outline-variant/40 text-primary font-bold py-4 rounded-[2rem] hover:bg-surface-container transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-xl">add_circle</span>
                        Thêm mũi tiêm dịch vụ / mũi ngoài
                    </button>
                </div>
            </section>

            {/* Scheduling Modal */}
            {schedulingVaccine && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-headline font-black text-on-surface leading-tight">{schedulingVaccine.name}</h3>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{schedulingVaccine.category}</p>
                                </div>
                                <button onClick={() => setSchedulingVaccine(null)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest px-1">Hẹn ngày tiêm</label>
                                    <input 
                                        type="date" 
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        className="w-full bg-surface-container/50 border-none rounded-2xl p-4 font-bold text-on-surface focus:ring-2 focus:ring-secondary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 pt-2">
                                <button 
                                    onClick={() => handleSaveDate('COMPLETE')}
                                    className="bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[11px]"
                                >
                                    <span className="material-symbols-outlined text-lg">done_all</span>
                                    Đã tiêm xong
                                </button>
                                <button 
                                    onClick={() => handleSaveDate('SCHEDULE')}
                                    className="bg-secondary text-white font-black py-4 rounded-2xl shadow-xl shadow-secondary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[11px]"
                                >
                                    <span className="material-symbols-outlined text-lg">calendar_today</span>
                                    Lưu ngày hẹn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Untick Confirmation Custom Modal */}
            {untickVaccine && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-surface w-full max-w-sm p-8 rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 text-center relative">
                        <div className="w-20 h-20 bg-error-container text-on-error-container rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-[6px] border-white relative z-10 -mt-16">
                            <span className="material-symbols-outlined text-4xl">vaccines</span>
                        </div>
                        <h3 className="text-xl font-headline font-black text-on-surface mb-2">Hủy đánh dấu?</h3>
                        <p className="text-sm font-medium text-on-surface-variant/80 mb-8 px-2 leading-relaxed">
                            Bạn có chắc chắn muốn hủy trạng thái đã tiêm của vắc xin <strong className="text-on-surface">{untickVaccine.name}</strong> không?
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setUntickVaccine(null)}
                                className="flex-1 py-4 font-extrabold rounded-2xl bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-all uppercase tracking-widest text-[11px]"
                            >
                                Đóng
                            </button>
                            <button 
                                onClick={handleConfirmUntick} disabled={savingId === untickVaccine.id}
                                className="flex-1 flex items-center justify-center py-4 font-extrabold rounded-2xl bg-error text-on-error shadow-lg shadow-error/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-widest text-[11px]"
                            >
                                {savingId === untickVaccine.id ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    'Đồng ý xóa'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Custom Vaccine Modal */}
            {showAddCustom && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-surface w-full max-w-sm p-8 rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-headline font-black text-primary">Thêm mũi dịch vụ</h3>
                            <button onClick={() => setShowAddCustom(false)} className="w-10 h-10 flex items-center justify-center bg-surface-container rounded-full hover:bg-surface-container-high transition-all">
                                <span className="material-symbols-outlined text-on-surface-variant">close</span>
                            </button>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest px-1">Tên Vắc xin <span className="text-error">*</span></label>
                                <input 
                                    type="text" 
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    placeholder="VD: Phế cầu, Viêm não..."
                                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest px-1">Phòng bệnh</label>
                                <input 
                                    type="text" 
                                    value={customDisease}
                                    onChange={(e) => setCustomDisease(e.target.value)}
                                    placeholder="Theo chỉ định bác sĩ"
                                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest px-1">Ngày tiêm</label>
                                <input 
                                    type="date" 
                                    value={customDate}
                                    onChange={(e) => setCustomDate(e.target.value)}
                                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveCustom} disabled={savingCustom || !customName.trim()}
                            className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[11px] disabled:opacity-50 disabled:shadow-none"
                        >
                            {savingCustom ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">add_circle</span>
                                    Lưu mũi tiêm
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

