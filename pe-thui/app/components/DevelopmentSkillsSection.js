'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

function pickNextFact(facts, previousFactId) {
    if (!facts.length) return null;
    if (facts.length === 1) return facts[0];

    const candidates = facts.filter((fact) => fact.id !== previousFactId);
    return candidates[Math.floor(Math.random() * candidates.length)] || facts[0];
}

function toSafeMonthNumber(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.round(n));
}

function formatAgeLabel(minMonths, maxMonths) {
    if (!Number.isFinite(minMonths) || !Number.isFinite(maxMonths)) return 'Đang xác định độ tuổi';
    if (minMonths === maxMonths) return `${minMonths} tháng`;
    return `${minMonths} - ${maxMonths} tháng`;
}

function normalizeSections(incomingSections = []) {
    return incomingSections
        .map((section) => {
            const min = toSafeMonthNumber(section.minAgeMonths);
            const max = toSafeMonthNumber(section.maxAgeMonths);
            if (min === null || max === null) return null;

            const minAgeMonths = Math.min(min, max);
            const maxAgeMonths = Math.max(min, max);

            return {
                ...section,
                minAgeMonths,
                maxAgeMonths,
                ageLabel: formatAgeLabel(minAgeMonths, maxAgeMonths),
                facts: Array.isArray(section.facts) ? section.facts : [],
            };
        })
        .filter(Boolean);
}

function getCurrentSectionIndex(sections, ageMonths, ageDays = 0) {
    if (!sections.length) return -1;

    const safeMonths = Number(ageMonths) || 0;
    const safeDays = Number(ageDays) || 0;
    const effectiveAgeMonths = safeMonths + Math.max(0, safeDays) / 31;

    const exactIndex = sections.findIndex((section, index) => {
        const isLast = index === sections.length - 1;
        return (
            effectiveAgeMonths >= section.minAgeMonths &&
            (effectiveAgeMonths < section.maxAgeMonths || (isLast && effectiveAgeMonths <= section.maxAgeMonths))
        );
    });
    if (exactIndex >= 0) return exactIndex;

    const previousSections = sections
        .map((section, index) => ({ section, index }))
        .filter(({ section }) => section.minAgeMonths <= effectiveAgeMonths);
    if (previousSections.length) return previousSections[previousSections.length - 1].index;

    return 0;
}

function getSectionStatusByIndex(index, activeIndex) {
    if (activeIndex < 0) return 'unknown';
    if (index < activeIndex) return 'past';
    if (index > activeIndex) return 'future';
    return 'current';
}

function shouldHideDescription(description, title) {
    const text = String(description || '').trim();
    if (!text) return true;
    if (/^-?\d+([.,]\d+)?$/.test(text)) return true;
    if (/^\d+\s*(?:-|–|~)\s*\d+$/.test(text)) return true;
    if (text.toLowerCase() === String(title || '').trim().toLowerCase()) return true;
    return false;
}

function iconForFact(fact) {
    const iconText = String(fact?.icon || '').trim();
    if (iconText) return iconText;
    return 'lightbulb';
}

function backgroundByIndex(index) {
    const palette = [
        'from-[#ffe9f2] to-[#fff8fb]',
        'from-[#eaf9ff] to-[#f6fcff]',
        'from-[#fff5e8] to-[#fffaf3]',
    ];
    return palette[index % palette.length];
}

function statusColor(status) {
    if (status === 'current') return 'bg-[#0f7f8a] text-white';
    if (status === 'past') return 'bg-[#f4deea] text-[#8f3562]';
    if (status === 'future') return 'bg-[#eceff3] text-[#475569]';
    return 'bg-[#eceff3] text-[#475569]';
}

function markerColor(status) {
    if (status === 'current') return 'bg-secondary';
    if (status === 'past') return 'bg-primary';
    return 'bg-outline-variant/70';
}

function cardTone(status) {
    if (status === 'current') return 'bg-[#ffe8f2] border-primary/25';
    if (status === 'past') return 'bg-[#f9f3f7] border-outline-variant/25';
    return 'bg-surface-container-low border-outline-variant/20';
}

function statusMetaColor(status) {
    if (status === 'current') return 'text-[#0f5f6a]';
    if (status === 'past') return 'text-[#8f3562]';
    if (status === 'future') return 'text-[#64748b]';
    return 'text-[#64748b]';
}

function statusLabel(status) {
    if (status === 'current') return 'Độ tuổi hiện tại';
    if (status === 'past') return 'Đã qua';
    if (status === 'future') return 'Sắp tới';
    return 'Chưa xác định';
}

export default function DevelopmentSkillsSection({ ageMonths, ageDays = 0 }) {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSectionIndex, setActiveSectionIndex] = useState(-1);
    const [currentFact, setCurrentFact] = useState(null);
    const [isFlipping, setIsFlipping] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);

    const currentSectionRefs = useRef({});
    const flipTimeoutRef = useRef(null);
    const flipIntervalRef = useRef(null);

    const activeSection = activeSectionIndex >= 0 ? sections[activeSectionIndex] : null;
    const activeFacts = useMemo(() => activeSection?.facts || [], [activeSection]);

    useEffect(() => {
        const fetchFacts = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/skills', { cache: 'no-store' });
                const json = await res.json();
                if (!json.success) throw new Error(json.error || 'Không thể tải dữ liệu kỹ năng');

                const incomingSections = normalizeSections(json.data?.sections || []);
                setSections(incomingSections);

                const sectionIndex = getCurrentSectionIndex(incomingSections, ageMonths, ageDays);
                setActiveSectionIndex(sectionIndex);

                if (sectionIndex >= 0) {
                    const facts = incomingSections[sectionIndex]?.facts || [];
                    setCurrentFact(facts[Math.floor(Math.random() * facts.length)] || null);
                } else {
                    setCurrentFact(null);
                }
            } catch (e) {
                console.error(e);
                setSections([]);
                setActiveSectionIndex(-1);
                setCurrentFact(null);
            } finally {
                setLoading(false);
            }
        };

        fetchFacts();
    }, [ageMonths, ageDays]);

    useEffect(() => {
        if (flipIntervalRef.current) clearInterval(flipIntervalRef.current);
        if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);

        if (!activeFacts.length) return undefined;

        flipIntervalRef.current = setInterval(() => {
            setIsFlipping(true);

            flipTimeoutRef.current = setTimeout(() => {
                setCurrentFact((prev) => pickNextFact(activeFacts, prev?.id));
                setIsFlipping(false);
            }, 380);
        }, 10000);

        return () => {
            if (flipIntervalRef.current) clearInterval(flipIntervalRef.current);
            if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
        };
    }, [activeFacts]);

    useEffect(() => {
        if (!showTimeline || !activeSection) return;
        const focusTarget = currentSectionRefs.current[activeSection.id];
        if (!focusTarget) return;

        const timer = setTimeout(() => {
            focusTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);

        return () => clearTimeout(timer);
    }, [showTimeline, activeSection]);

    const cardTitle = currentFact?.title || 'Đang cập nhật kỹ năng theo độ tuổi';
    const rawDescription =
        currentFact?.description ||
        'Hệ thống sẽ lấy ngẫu nhiên một fact trong đúng nhóm tuổi của bé và tự động đổi sau mỗi 10 giây.';
    const cardDescription = shouldHideDescription(rawDescription, cardTitle) ? '' : rawDescription;
    const cardIcon = iconForFact(currentFact);

    const modalSections = useMemo(() => sections, [sections]);

    return (
        <>
            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="font-headline text-xl font-extrabold text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">tips_and_updates</span>
                        Có thể bạn chưa biết
                    </h3>
                    <button
                        type="button"
                        onClick={() => setShowTimeline(true)}
                        className="text-secondary font-black text-sm tracking-[0.12em] uppercase"
                    >
                        Tất cả
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => setShowTimeline(true)}
                    className="group w-full rounded-[2rem] bg-white border border-primary/15 shadow-[0_12px_24px_rgba(165,51,97,0.08)] p-3 text-left transition-all active:scale-[0.995]"
                >
                    {loading ? (
                        <div className="h-[110px] animate-pulse rounded-[1.75rem] bg-surface-container-low"></div>
                    ) : (
                        <div className="relative [perspective:1200px]">
                            <div
                                className={`rounded-[1.6rem] p-4 flex items-center gap-4 border border-white/70 bg-gradient-to-br ${backgroundByIndex(activeSectionIndex >= 0 ? activeSectionIndex : 0)} transition-transform duration-700 [transform-style:preserve-3d] ${isFlipping ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
                                    }`}
                            >
                                <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/90 flex items-center justify-center shadow-sm border border-primary/10">
                                    <span className="material-symbols-outlined text-primary text-2xl">{cardIcon}</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[1.05rem] sm:text-[1.1rem] font-extrabold text-on-surface leading-snug">
                                        {cardTitle}
                                    </p>
                                    {cardDescription ? (
                                        <p className="text-sm text-on-surface-variant mt-1 leading-snug line-clamp-2">{cardDescription}</p>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    )}
                </button>
            </section>

            {showTimeline && (
                <div
                    className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300"
                    onClick={() => setShowTimeline(false)}
                >
                    <div
                        className="w-full max-w-md h-[88vh] sm:h-[82vh] bg-surface rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl border-t sm:border border-outline-variant/30 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-5 border-b border-outline-variant/20 shrink-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-black text-primary leading-none">Timeline kỹ năng</p>
                                    <p className="text-xs text-on-surface-variant mt-1">
                                        Tự động focus theo độ tuổi hiện tại của bé
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowTimeline(false)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-all"
                                >
                                    <span className="material-symbols-outlined text-on-surface-variant">close</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                            {modalSections.map((section, sectionIndex) => {
                                const status = getSectionStatusByIndex(sectionIndex, activeSectionIndex);

                                return (
                                    <div
                                        key={section.id}
                                        ref={(el) => {
                                            if (el) currentSectionRefs.current[section.id] = el;
                                        }}
                                        className="space-y-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wide ${statusColor(status)}`}
                                            >
                                                {section.ageLabel}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${statusMetaColor(status)}`}>
                                                {statusLabel(status)}
                                            </span>
                                            <div className="h-px flex-1 bg-outline-variant/25"></div>
                                        </div>

                                        <div className="relative pl-7">
                                            <div className="absolute left-[10px] top-0 bottom-0 border-l-2 border-dashed border-outline-variant/45"></div>
                                            <div className="space-y-4">
                                                {section.facts.map((fact) => (
                                                    <div key={fact.id} className="relative">
                                                        <span
                                                            className={`absolute -left-[23px] top-6 w-4 h-4 rounded-full border-2 border-white shadow-sm ${markerColor(status)}`}
                                                        ></span>
                                                        <article
                                                            className={`rounded-[1.75rem] p-4 border ${cardTone(status)}`}
                                                        >
                                                            <p className="text-base font-black text-on-surface leading-snug">
                                                                {fact.title}
                                                            </p>
                                                            {shouldHideDescription(fact.description, fact.title) ? null : (
                                                                <p className="mt-1.5 text-sm text-on-surface-variant leading-relaxed">
                                                                    {fact.description}
                                                                </p>
                                                            )}
                                                        </article>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {!modalSections.length && (
                                <div className="rounded-3xl border border-dashed border-outline-variant/40 p-6 text-center text-on-surface-variant">
                                    Chưa có dữ liệu kỹ năng trong sheet master.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
