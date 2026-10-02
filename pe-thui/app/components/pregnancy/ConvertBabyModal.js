'use client';

import { useState } from 'react';
import { saveProfileToStorage } from '../../lib/profile-utils';

export default function ConvertBabyModal({ profile, code, onClose, onSuccess }) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const [name, setName] = useState(profile?.name || '');
    const [gender, setGender] = useState(profile?.gender || 'boy');
    const [dob, setDob] = useState(todayStr);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) {
            setError('Vui lòng nhập tên bé yêu');
            return;
        }
        if (!dob) {
            setError('Vui lòng chọn ngày bé chào đời');
            return;
        }

        try {
            setLoading(true);

            // 1. Cập nhật hồ sơ bé sang mode 'born'
            const profilePayload = {
                code,
                name: name.trim(),
                gender,
                dob,
                mode: 'born',
                avatar: profile?.avatar || '',
                telegramChatId: profile?.telegramChatId || '',
                estimatedDueDate: profile?.estimatedDueDate || null
            };

            const profileRes = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profilePayload)
            });

            const profileJson = await profileRes.json();
            if (!profileRes.ok || !profileJson.success) {
                throw new Error(profileJson.error || 'Không thể cập nhật hồ sơ');
            }

            // 2. Nếu có nhập cân nặng hoặc chiều cao lúc sinh, lưu mốc tăng trưởng đầu đời (ageMonths = 0)
            const numWeight = parseFloat(weight);
            const numHeight = parseFloat(height);

            if ((!isNaN(numWeight) && numWeight > 0) || (!isNaN(numHeight) && numHeight > 0)) {
                await fetch('/api/growth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        date: dob,
                        ageMonths: 0,
                        weight: !isNaN(numWeight) ? numWeight : 0,
                        height: !isNaN(numHeight) ? numHeight : 0,
                        type: 'baby_growth',
                        note: 'Chỉ số khi mới chào đời 🎉'
                    })
                });
            }

            // 3. Cập nhật danh sách lưu cục bộ
            saveProfileToStorage({
                code,
                name: name.trim(),
                mode: 'born',
                avatar: profile?.avatar || '',
                dob,
                estimatedDueDate: profile?.estimatedDueDate || null
            });

            if (onSuccess) {
                onSuccess();
            } else {
                window.location.reload();
            }
        } catch (err) {
            console.error('Error converting profile:', err);
            setError(err.message || 'Đã xảy ra lỗi khi chuyển đổi hồ sơ.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div 
                className="bg-white rounded-[2.5rem] w-full max-w-md p-6 sm:p-8 shadow-2xl border border-pink-100 flex flex-col gap-5 max-h-[92vh] overflow-y-auto text-left relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-5 right-5 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all cursor-pointer active:scale-90"
                    title="Đóng"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>

                {/* Header with celebration banner */}
                <div className="flex flex-col items-center text-center pt-2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-100 to-amber-100 flex items-center justify-center text-3xl mb-3 shadow-inner border-2 border-white animate-bounce">
                        🎉
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#861949] bg-pink-50 px-3.5 py-1 rounded-full border border-pink-200/60 mb-2">
                        Thiên Thần Nhỏ Chào Đời
                    </span>
                    <h3 className="font-headline font-black text-2xl text-gray-900">
                        Chúc Mừng Gia Đình!
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                        Chuyển đổi hồ sơ từ thai kỳ sang em bé để bắt đầu theo dõi cữ bú, giấc ngủ, tiêm chủng và biểu đồ phát triển WHO.
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Form Inputs */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tên bé */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            Tên hoặc biệt danh của bé <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="VD: Bé Bơ, Nguyễn An Nhiên..."
                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#861949]/30 focus:border-[#861949] text-sm font-semibold transition-all"
                        />
                    </div>

                    {/* Giới tính */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            Giới tính <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setGender('boy')}
                                className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                                    gender === 'boy'
                                        ? 'bg-[#006972] text-white border-[#006972] shadow-md shadow-[#006972]/20'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <span className="text-base">👦</span>
                                <span>Bé Trai</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setGender('girl')}
                                className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                                    gender === 'girl'
                                        ? 'bg-[#861949] text-white border-[#861949] shadow-md shadow-[#861949]/20'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <span className="text-base">👧</span>
                                <span>Bé Gái</span>
                            </button>
                        </div>
                    </div>

                    {/* Ngày sinh thực tế */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            Ngày sinh thực tế <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="date"
                            required
                            max={todayStr}
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#861949]/30 focus:border-[#861949] text-sm font-semibold transition-all"
                        />
                    </div>

                    {/* Số đo sơ sinh */}
                    <div className="bg-[#fff8f8] p-3.5 rounded-2xl border border-pink-100/70 space-y-3">
                        <span className="text-[11px] font-bold text-[#861949] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">straighten</span>
                            Số đo lúc chào đời (Tuỳ chọn)
                        </span>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] text-gray-500 mb-1">Cân nặng (kg)</label>
                                <input
                                    type="number"
                                    step="0.05"
                                    min="0.5"
                                    max="8"
                                    placeholder="VD: 3.2"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#861949]/30 text-sm font-bold text-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] text-gray-500 mb-1">Chiều dài (cm)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="20"
                                    max="70"
                                    placeholder="VD: 50"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#861949]/30 text-sm font-bold text-gray-800"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-col gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-[#861949] hover:bg-[#6c123a] text-white font-headline font-bold text-sm shadow-lg shadow-[#861949]/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                    <span>Đang cập nhật hồ sơ...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">celebration</span>
                                    <span>Xác Nhận Bé Đã Chào Đời</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-2.5 rounded-2xl text-gray-500 hover:text-gray-800 font-bold text-xs transition-colors cursor-pointer"
                        >
                            Để sau (Vẫn đang mang thai)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
