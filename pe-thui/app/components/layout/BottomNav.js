// Được thay thế từ BottomNav1.js
'use client';

export default function BottomNav({ view, setView }) {
    const navItems = [
        { id: 'home', label: 'Trang chủ', icon: 'home' },
        { id: 'teething', label: 'Mọc răng', icon: 'dentistry' },
        { id: 'health', label: 'Tiêm chủng', icon: 'medical_services' },
        { id: 'growth', label: 'Phát triển', icon: 'trending_up' },
    ];

    return (
        <nav className="fixed bottom-0 w-full max-w-lg left-1/2 -translate-x-1/2 z-50 flex justify-around items-center px-4 pt-4 pb-[15px] backdrop-blur-2xl bg-white/80 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-white/20">

            {navItems.map(item => (
                <button 
                    key={item.id}
                    onClick={() => setView(item.id)} 
                    className={`flex flex-col items-center gap-1 transition-all flex-1 outline-none ${view === item.id ? 'text-primary' : 'text-secondary/50'}`}
                >

                    <div className={`${view === item.id ? 'bg-primary-fixed' : ''} px-5 py-2 rounded-2xl transition-all`}>
                        <span 
                            className="material-symbols-outlined" 
                            style={view === item.id ? {fontVariationSettings: "'FILL' 1"} : {}}
                        >
                            {item.icon}
                        </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                </button>
            ))}
        </nav>
    );
}
