'use client';

import { TEETH } from '../../lib/data/teeth';

export default function TeethingPreview({ records }) {
    const sproutedTeeth = new Set(records.map(r => r.toothId));
    const sproutedCount = sproutedTeeth.size;
    const totalCount = TEETH.length;

    return (
        <div className="bento-card bg-secondary-fixed/20 flex-1">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-secondary/10 p-2 rounded-xl text-secondary">
                    <span className="material-symbols-outlined text-xl">child_care</span>
                </div>
            </div>
            <div className="space-y-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Mọc răng</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black font-headline text-secondary">{sproutedCount}</span>
                    <span className="text-[10px] font-bold text-secondary/60">/ {totalCount}</span>
                </div>
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1 flex-1 rounded-full ${i < (sproutedCount / totalCount * 5) ? 'bg-secondary' : 'bg-surface-container'}`}
                        ></div>
                    ))}
                </div>
                <p className="text-[9px] font-bold text-on-surface-variant/60">Răng đã nhú</p>
            </div>
        </div>
    );
}
