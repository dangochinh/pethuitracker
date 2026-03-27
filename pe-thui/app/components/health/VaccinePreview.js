'use client';

import { VACCINES } from '../../lib/data/vaccines';

export default function VaccinePreview({ records, dob }) {
    const completedIds = new Set(records.filter(r => r.date).map(r => r.vaccineId));
    const completedCount = completedIds.size;
    const totalCount = VACCINES.length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    return (
        <div className="bento-card bg-surface-container-lowest flex-1 min-h-[170px] flex flex-col justify-center items-center text-center">
            <div className="flex justify-center items-start mb-4">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>medical_services</span>
            </div>
            <div className="space-y-2 text-center flex flex-col items-center">
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
