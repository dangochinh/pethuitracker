'use client';

import { useState } from 'react';

export default function MilestoneCelebrationCard({ milestone, ageText = '10M 14D', onShare }) {
    const [copied, setCopied] = useState(false);

    if (!milestone) return null;

    const handleShare = () => {
        if (onShare) {
            onShare(milestone);
            return;
        }
        if (navigator.share) {
            navigator.share({
                title: milestone.title || 'Cột mốc mới của bé',
                text: `${milestone.title}: ${milestone.subtitle || milestone.detail || ''}`,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(`${milestone.title} - ${milestone.subtitle || ''}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const photoUrl = milestone.photos?.[0] || milestone.photo || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWmeKNN6sF_SBWYogtFUPdI1-6ehRcnTZVe3KrcP1SD2Wu10sOA7NjM24LvXvx5LRXd-xvWjt8MK1zpwfeblqAIWbuHBqqO9V_BB7bZyuEIfO-CVG5VXGWPqldkYGoDzC8pkEPF6IpJ4lzPJg5ZYzrrGnOj21fzk0x42AuTLzuB16U6ag2gJkQ8MUop851ffDl8HF8uw3w05JuHwR46gqShwALE7Ws0uowjIay_DdvArCJX25uvWroXQ';

    return (
        <div className="w-full bg-gradient-to-br from-white via-pink-50/30 to-purple-50/40 p-4.5 rounded-[2rem] shadow-sm border border-pink-100 flex flex-col space-y-3 relative overflow-hidden text-left">
            {/* Header info & Share button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#861949] uppercase font-black tracking-wider">
                        {milestone.time || '16:00'} {milestone.period?.split(' ')?.[1] || 'CHIỀU'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#861949] text-white text-[10px] font-extrabold uppercase tracking-wide shadow-xs">
                        Cột Mốc Mới! 🎉
                    </span>
                </div>
                <button 
                    onClick={handleShare}
                    type="button"
                    title="Chia sẻ cột mốc"
                    className="w-8 h-8 rounded-full bg-white hover:bg-pink-50 flex items-center justify-center text-[#861949] active:scale-90 transition-transform shadow-xs cursor-pointer border border-pink-100"
                >
                    <span className="material-symbols-outlined text-[16px]">
                        {copied ? 'check' : 'share'}
                    </span>
                </button>
            </div>

            {/* Title & Description */}
            <div>
                <h3 className="font-headline font-bold text-base text-[#861949] leading-snug">
                    {milestone.title || 'Pe Thúi tự đứng bám vịn & vỗ tay!'}
                </h3>
                <p className="text-xs text-gray-700 leading-relaxed mt-1 font-medium">
                    {milestone.subtitle || milestone.detail || 'Hôm nay con vịn thành ghế sofa đứng vững suốt 20 giây, miệng cười tít mắt rồi tự vỗ tay hoan hô trước sự reo mừng của cả nhà!'}
                </p>
            </div>

            {/* Milestone Keepsake Photo */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-pink-100/50 shadow-inner">
                <img 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                    alt={milestone.title || 'Khoảnh khắc cột mốc'} 
                    src={photoUrl} 
                    onError={(e) => { e.currentTarget.src = '/baby-default.png'; }}
                />
                
                {/* Frosted Glass Caption Overlay */}
                <div className="absolute bottom-2 left-2 right-2 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center justify-between shadow-xs border border-white/60">
                    <span className="text-[11px] text-[#861949] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            favorite
                        </span>
                        <span>{milestone.emotion || 'Cả nhà vỡ òa hạnh phúc ❤️'}</span>
                    </span>
                    <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider">
                        {ageText}
                    </span>
                </div>
            </div>
        </div>
    );
}
