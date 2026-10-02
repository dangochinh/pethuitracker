'use client';

import { useState, useEffect, useMemo } from 'react';
import { saveProfileToStorage } from '../../lib/profile-utils';
import { calculateGestationalAgeAtDate } from '../../lib/pregnancy-utils';

export default function ConvertBabyModal({ profile, code, onClose, onSuccess, initialPreterm = false }) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const [name, setName] = useState(profile?.name || '');
    const [gender, setGender] = useState(profile?.gender || 'boy');
    const [dob, setDob] = useState(todayStr);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [headCircumference, setHeadCircumference] = useState('');
    const [isPreterm, setIsPreterm] = useState(initialPreterm);
    const [customGestationalAge, setCustomGestationalAge] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Tự động tính toán tuần thai tại thời điểm sinh nếu có ngày dự sinh (EDD)
    const gestationalStats = useMemo(() => {
        if (!profile?.estimatedDueDate || !dob) return null;
        return calculateGestationalAgeAtDate(profile.estimatedDueDate, dob);
    }, [profile?.estimatedDueDate, dob]);

    // Tự động gợi ý trạng thái sinh sớm nếu tính ra < 37 tuần
    useEffect(() => {
        if (gestationalStats) {
            if (gestationalStats.isPreterm) {
                setIsPreterm(true);
            }
            if (!customGestationalAge && gestationalStats.formatted) {
                setCustomGestationalAge(gestationalStats.formatted);
            }
        }
    }, [gestationalStats, customGestationalAge]);

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

            const birthAgeStr = isPreterm 
                ? (customGestationalAge.trim() || gestationalStats?.formatted || 'Sinh sớm')
                : (gestationalStats?.formatted || 'Đủ tháng');

            // 1. Cập nhật hồ sơ bé sang mode 'born'
            const profilePayload = {
                code,
                name: name.trim(),
                gender,
                dob,
                mode: 'born',
                isPreterm: !!isPreterm,
                birthGestationalAge: birthAgeStr,
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

            // 2. Lưu mốc tăng trưởng đầu đời (ageMonths = 0)
            const numWeight = parseFloat(weight);
            const numHeight = parseFloat(height);
            const numHead = parseFloat(headCircumference);

            const birthNote = note.trim() 
                ? note.trim() 
                : (isPreterm 
                    ? `Bé sinh sớm lúc ${birthAgeStr}. Cân nặng: ${weight || '--'} kg, Chiều dài: ${height || '--'} cm 🎉`
                    : `Chỉ số lúc chào đời (${birthAgeStr}). Cân nặng: ${weight || '--'} kg, Chiều dài: ${height || '--'} cm 🎉`);

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
                        headCircumference: !isNaN(numHead) ? numHead : 0,
                        type: 'baby_growth',
                        gestationalAge: birthAgeStr,
                        note: birthNote
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
                isPreterm: !!isPreterm,
                estimatedDueDate: profile?.estimatedDueDate || null
            });

            // 4. Đặt cờ kích hoạt hiệu ứng tung hoa chúc mừng
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('pethui_flower_celebration', JSON.stringify({
                    name: name.trim(),
                    type: 'baby_born'
                }));
            }

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
                className="bg-white rounded-[2.5rem] w-full max-w-md p-6 sm:p-8 shadow-2xl border border-pink-100 flex flex-col gap-4 max-h-[92vh] overflow-y-auto text-left relative"
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

                {/* Header */}
                <div className="flex flex-col items-center text-center pt-2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-100 via-amber-100 to-teal-50 flex items-center justify-center text-3xl mb-2.5 shadow-inner border-2 border-white animate-bounce">
                        🎉
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#861949] bg-pink-50 px-3.5 py-1 rounded-full border border-pink-200/60 mb-1.5">
                        Thiên Thần Nhỏ Chào Đời
                    </span>
                    <h3 className="font-headline font-black text-2xl text-gray-900 leading-tight">
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

                {/* Preterm / Sinh sớm Detection Banner */}
                {gestationalStats?.isPreterm && (
                    <div className="bg-amber-50/90 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">bolt</span>
                        <div>
                            <span className="font-bold block text-amber-950">Bé chào đời sớm hơn ngày dự sinh!</span>
                            <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                                Tuần thai lúc sinh: <strong>{gestationalStats.formatted}</strong> (sớm khoảng {gestationalStats.daysBeforeEdd} ngày so với ngày dự sinh). Hệ thống sẽ gắn nhãn sinh sớm để hỗ trợ theo dõi tuổi hiệu chỉnh.
                            </p>
                        </div>
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
                            placeholder="VD: Bé Bơ, Bé Gạo, Nguyễn An Nhiên..."
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

                    {/* Checkbox Sinh sớm / Sinh non */}
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2.5">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isPreterm}
                                onChange={(e) => setIsPreterm(e.target.checked)}
                                className="w-4 h-4 rounded text-[#861949] focus:ring-[#861949] border-gray-300 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                                <span>Bé sinh sớm / sinh non (trước tuần 37)</span>
                                <span className="text-[10px] text-amber-600 font-extrabold bg-amber-100 px-1.5 py-0.2 rounded-full">Preterm</span>
                            </span>
                        </label>

                        {isPreterm && (
                            <div className="pt-1 space-y-1.5 pl-6 border-t border-gray-200/60">
                                <label className="block text-[11px] font-semibold text-gray-600">
                                    Tuần thai lúc sinh (Gestational age)
                                </label>
                                <input
                                    type="text"
                                    placeholder="VD: 34 tuần 2 ngày hoặc Tuần 32"
                                    value={customGestationalAge}
                                    onChange={(e) => setCustomGestationalAge(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#861949]"
                                />
                            </div>
                        )}
                    </div>

                    {/* Số đo sơ sinh: Chiều dài, Cân nặng, Vòng đầu */}
                    <div className="bg-[#fff8f8] p-3.5 rounded-2xl border border-pink-100/70 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#861949] flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">straighten</span>
                                Số đo lúc chào đời (Cân nặng & Chiều dài)
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold">Khuyên dùng</span>
                        </div>

                        {/* Cân nặng & Chiều dài */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1">Cân nặng (kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.3"
                                    max="8"
                                    placeholder="VD: 2.35"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#861949]/30 text-sm font-bold text-gray-800"
                                />
                                {/* Quick chips */}
                                <div className="flex gap-1 mt-1.5 overflow-x-auto no-scrollbar">
                                    {['1.8', '2.2', '2.8', '3.2'].map((val) => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setWeight(val)}
                                            className="px-1.5 py-0.5 bg-white border border-pink-200/80 rounded-md text-[9px] text-gray-600 font-bold hover:bg-pink-100 transition-colors"
                                        >
                                            {val}kg
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1">Chiều dài (cm)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="20"
                                    max="70"
                                    placeholder="VD: 46.5"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#861949]/30 text-sm font-bold text-gray-800"
                                />
                                {/* Quick chips */}
                                <div className="flex gap-1 mt-1.5 overflow-x-auto no-scrollbar">
                                    {['42', '46', '48', '50'].map((val) => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setHeight(val)}
                                            className="px-1.5 py-0.5 bg-white border border-pink-200/80 rounded-md text-[9px] text-gray-600 font-bold hover:bg-pink-100 transition-colors"
                                        >
                                            {val}cm
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Vòng đầu sơ sinh & Ghi chú */}
                        <div className="pt-2 border-t border-pink-100/60 space-y-2">
                            <div>
                                <label className="block text-[11px] text-gray-600 mb-1">
                                    Vòng đầu sơ sinh (cm - tuỳ chọn)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="15"
                                    max="50"
                                    placeholder="VD: 32.5"
                                    value={headCircumference}
                                    onChange={(e) => setHeadCircumference(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-pink-200 focus:outline-none text-xs font-semibold text-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] text-gray-600 mb-1">
                                    Ghi chú tình trạng lúc sinh (tuỳ chọn)
                                </label>
                                <input
                                    type="text"
                                    placeholder="VD: Bé trộm vía khóc to, hồng hào, sinh sớm tuần 34..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-pink-200 focus:outline-none text-xs text-gray-800"
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
