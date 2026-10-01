'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileSetup from './ProfileSetup';
import { FaBaby, FaPlus, FaSignOutAlt } from 'react-icons/fa';

export default function UserDashboard({ user, onLogout }) {
    const router = useRouter();
    const [babies, setBabies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [linkingCode, setLinkingCode] = useState('');
    const [isLinking, setIsLinking] = useState(false);

    useEffect(() => {
        // Fetch full baby profiles based on user.babies codes
        const fetchBabies = async () => {
            if (!user.babies || user.babies.length === 0) {
                setLoading(false);
                return;
            }
            try {
                const results = [];
                for (const code of user.babies) {
                    const res = await fetch(`/api/profile?code=${code}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.success && data.profile) {
                            results.push({ code, ...data.profile });
                        }
                    }
                }
                setBabies(results);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchBabies();
    }, [user.babies]);

    const handleCreateComplete = async (newCode) => {
        // Automatically link this baby to the user
        try {
            const res = await fetch('/api/auth/add-baby', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: user.phone, code: newCode })
            });
            const data = await res.json();
            if (data.success) {
                // update local storage
                const updatedUser = { ...user, babies: data.babies };
                localStorage.setItem('pe_thui_user', JSON.stringify(updatedUser));
                router.push(`/${newCode}`);
            }
        } catch (e) {
            console.error(e);
            router.push(`/${newCode}`);
        }
    };

    const handleLinkBaby = async (e) => {
        e.preventDefault();
        if (!linkingCode) return;
        
        setIsLinking(true);
        try {
            const res = await fetch('/api/auth/add-baby', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: user.phone, code: linkingCode })
            });
            const data = await res.json();
            if (data.success) {
                const updatedUser = { ...user, babies: data.babies };
                localStorage.setItem('pe_thui_user', JSON.stringify(updatedUser));
                window.location.reload();
            } else {
                alert(data.error);
            }
        } catch (e) {
            alert('Lỗi kết nối');
        } finally {
            setIsLinking(false);
        }
    };

    if (isCreating) {
        return <ProfileSetup onComplete={handleCreateComplete} />;
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300 text-left">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Xin chào, {user.name}!</h2>
                    <p className="text-xs text-gray-500 font-medium">Chọn bé để bắt đầu theo dõi</p>
                </div>
                <button 
                    onClick={onLogout}
                    className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                >
                    <FaSignOutAlt />
                </button>
            </div>

            {loading ? (
                <div className="py-10 text-center flex flex-col items-center">
                    <span className="material-symbols-outlined animate-spin text-3xl text-pink-300">progress_activity</span>
                    <span className="text-sm text-gray-400 font-bold mt-2">Đang tải hồ sơ...</span>
                </div>
            ) : babies.length === 0 ? (
                <div className="bg-pink-50/50 rounded-[2rem] p-6 text-center border-2 border-dashed border-pink-200 mb-6">
                    <div className="w-16 h-16 bg-pink-100 text-pink-400 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FaBaby size={28} />
                    </div>
                    <h3 className="font-bold text-gray-700 mb-1">Chưa có hồ sơ bé nào</h3>
                    <p className="text-xs text-gray-500 mb-4">Tạo hồ sơ mới hoặc liên kết với mã đã có.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 mb-6">
                    {babies.map((baby) => (
                        <button
                            key={baby.code}
                            onClick={() => router.push(`/${baby.code}`)}
                            className="bg-white border border-gray-100 shadow-sm p-4 rounded-2xl flex items-center gap-4 hover:border-pink-200 hover:shadow-md transition-all active:scale-95 text-left"
                        >
                            {baby.avatar ? (
                                <img src={baby.avatar} alt="avatar" className="w-14 h-14 rounded-full object-cover border-2 border-pink-100" />
                            ) : (
                                <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center text-pink-400 border-2 border-white shadow-sm">
                                    <FaBaby size={24} />
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">{baby.name}</h3>
                                <p className="text-xs text-gray-500 font-medium">Mã: {baby.code}</p>
                            </div>
                            <span className="material-symbols-outlined ml-auto text-pink-300">chevron_right</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="space-y-3">
                <button
                    onClick={() => setIsCreating(true)}
                    className="w-full cute-button-primary py-3.5 text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                    <FaPlus /> Tạo hồ sơ mới
                </button>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2 text-center">Hoặc liên kết mã đã có</p>
                    <form onSubmit={handleLinkBaby} className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Nhập mã bé..." 
                            value={linkingCode}
                            onChange={(e) => setLinkingCode(e.target.value.toUpperCase())}
                            className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-pink-200 focus:outline-none"
                        />
                        <button 
                            type="submit" 
                            disabled={!linkingCode || isLinking}
                            className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-transform whitespace-nowrap"
                        >
                            {isLinking ? 'Đang...' : 'Liên kết'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
