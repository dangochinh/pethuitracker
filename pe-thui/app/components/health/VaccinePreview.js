'use client';

import { VACCINES } from '../../lib/data/vaccines';

export default function VaccinePreview({ records, dob }) {
    const completedIds = new Set(records.filter(r => r.date).map(r => r.vaccineId));
    const completedCount = completedIds.size;
    const totalCount = VACCINES.length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    return (
        <div className="bento-card bg-primary-fixed/30 flex-1">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <span className="material-symbols-outlined text-xl">medical_services</span>
                </div>
            </div>
            <div className="space-y-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Tiêm chủng</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black font-headline text-primary">{percentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary transition-all duration-1000" 
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                <p className="text-[9px] font-bold text-on-surface-variant/60">{completedCount}/{totalCount} mũi đã tiêm</p>
            </div>
        </div>
    );
}
