import { useState } from 'react';

/**
 * ChangeCodeModal — hiện sau khi tạo hồ sơ thành công.
 * Cho phép user đặt mã tùy chỉnh dễ nhớ thay vì mã tự sinh phức tạp.
 *
 * Props:
 *   autoCode  — mã tự sinh (VD: PEPE010124.0326)
 *   profile   — { name, gender, dob, avatar }
 *   onComplete(finalCode) — gọi khi xong (cả đổi lẫn bỏ qua)
 */
export default function ChangeCodeModal({ autoCode, profile, onComplete }) {
    const [newCode, setNewCode] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    /** Giống formatCode ở trang login: loại dấu, chỉ giữ alphanum + dấu chấm */
    const formatCode = (str) => {
        const noAccents = str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
        return noAccents.replace(/[^a-zA-Z0-9.]/g, '').toUpperCase().slice(0, 20);
    };

    const handleChange = (e) => {
        setError('');
        setNewCode(formatCode(e.target.value));
    };

    const isValid = newCode.trim().length >= 3;

    const handleSave = async () => {
        if (!isValid) return;
        setError('');

        // Nếu user nhập đúng autoCode thì bỏ qua bước rename
        if (newCode === autoCode) {
            onComplete(autoCode);
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: newCode,
                    oldCode: autoCode,
                    name: profile.name,
                    gender: profile.gender,
                    dob: profile.dob,
                    avatar: profile.avatar || '',
                }),
            });
            const json = await res.json();
            if (!json.success) {
                setError(json.error || 'Có lỗi xảy ra, vui lòng thử lại.');
                return;
            }
            onComplete(newCode);
        } catch {
            setError('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = () => onComplete(autoCode);

    return (
        /* Overlay */
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={handleSkip}
            />

            {/* Sheet / Card */}
            <div className="relative z-10 w-full max-w-sm mx-4 mb-6 sm:mb-0 bg-white rounded-[2rem] shadow-2xl p-7 animate-in slide-in-from-bottom-4 fade-in duration-300">

                {/* Icon */}
                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl shadow-sm border-4 border-white">
                    🔑
                </div>

                <h2 className="text-xl font-black text-gray-800 text-center mb-1">
                    Đặt mã dễ nhớ cho bé!
                </h2>
                <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
                    Mã tự sinh khá dài. Bạn có thể đặt lại thành tên bé hoặc bất cứ thứ gì dễ nhớ hơn nhé&nbsp;🎀
                </p>

                {/* Mã hiện tại */}
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl px-4 py-3 mb-5 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                        Mã hiện tại (tự sinh)
                    </p>
                    <p className="font-black text-base text-gray-400 tracking-widest break-all">
                        {autoCode}
                    </p>
                </div>

                {/* Input mã mới */}
                <div className="relative mb-2">
                    <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4
                                   focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300
                                   transition-all font-black text-center text-lg uppercase tracking-widest
                                   placeholder-gray-300 placeholder:font-normal placeholder:tracking-normal
                                   placeholder:text-base focus:placeholder-transparent"
                        placeholder="VD: PEPE, BONGBONG..."
                        value={newCode}
                        onChange={handleChange}
                        maxLength={20}
                        autoFocus
                    />
                    {/* Độ dài counter */}
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 pointer-events-none">
                        {newCode.length}/20
                    </span>
                </div>

                {/* Hint min length */}
                {newCode.length > 0 && newCode.length < 3 && !error && (
                    <p className="text-xs text-amber-500 font-semibold text-center mb-2">
                        Mã cần ít nhất 3 ký tự
                    </p>
                )}

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-3
                                    text-sm font-medium flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                        <span className="text-base leading-none mt-px">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Nút Lưu mã mới */}
                <button
                    onClick={handleSave}
                    disabled={!isValid || saving}
                    className="w-full cute-button-primary py-4 text-lg mt-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                    {saving ? 'Đang lưu...' : '✨ Lưu mã mới'}
                </button>

                {/* Nút Bỏ qua */}
                <button
                    onClick={handleSkip}
                    disabled={saving}
                    className="w-full mt-3 py-2 text-sm font-semibold text-gray-400 hover:text-gray-600
                               transition-colors disabled:opacity-40"
                >
                    Bỏ qua, dùng mã tự sinh
                </button>
            </div>
        </div>
    );
}
