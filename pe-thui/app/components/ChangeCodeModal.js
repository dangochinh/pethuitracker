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
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            {/* Sheet / Card */}
            <div className="w-full max-w-md bg-surface p-8 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl border-t sm:border border-outline-variant/30 animate-in slide-in-from-bottom duration-500">

                {/* Icon */}
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>key</span>
                </div>

                <h2 className="text-xl font-black font-headline text-on-surface text-center mb-1">
                    Đặt mã dễ nhớ cho bé!
                </h2>
                <p className="text-sm text-on-surface-variant/70 text-center mb-6 leading-relaxed font-medium">
                    Mã tự sinh khá dài. Bạn có thể đặt lại thành tên bé hoặc bất cứ thứ gì dễ nhớ hơn nhé&nbsp;🎀
                </p>

                {/* Mã hiện tại */}
                <div className="bg-surface-container-lowest border border-dashed border-outline-variant/40 rounded-2xl px-4 py-3 mb-5 text-center">
                    <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest mb-0.5">
                        Mã hiện tại (tự sinh)
                    </p>
                    <p className="font-black text-base text-on-surface-variant/40 tracking-widest break-all">
                        {autoCode}
                    </p>
                </div>

                {/* Input mã mới */}
                <div className="relative mb-2">
                    <input
                        type="text"
                        className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-2xl px-5 py-4
                                   focus:outline-none focus:ring-2 focus:ring-primary/20
                                   transition-all font-black text-center text-lg uppercase tracking-widest
                                   text-on-surface placeholder-on-surface-variant/30 placeholder:font-normal
                                   placeholder:tracking-normal placeholder:text-base focus:placeholder-transparent"
                        placeholder="VD: PEPE, BONGBONG..."
                        value={newCode}
                        onChange={handleChange}
                        maxLength={20}
                        autoFocus
                    />
                    {/* Độ dài counter */}
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant/30 pointer-events-none">
                        {newCode.length}/20
                    </span>
                </div>

                {/* Hint min length */}
                {newCode.length > 0 && newCode.length < 3 && !error && (
                    <p className="text-xs text-primary/70 font-semibold text-center mb-2">
                        Mã cần ít nhất 3 ký tự
                    </p>
                )}

                {/* Error message */}
                {error && (
                    <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-2xl mb-3
                                    text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Nút Lưu mã mới */}
                <button
                    onClick={handleSave}
                    disabled={!isValid || saving}
                    className="w-full bg-soft-gradient text-white font-black rounded-2xl py-5 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2 uppercase tracking-widest"
                >
                    {saving ? (
                        <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">check_circle</span>
                            <span>Lưu mã mới</span>
                        </>
                    )}
                </button>

                {/* Nút Bỏ qua */}
                <button
                    onClick={handleSkip}
                    disabled={saving}
                    className="w-full mt-3 py-2 text-sm font-semibold text-on-surface-variant/50 hover:text-on-surface-variant
                               transition-colors disabled:opacity-40"
                >
                    Bỏ qua, dùng mã tự sinh
                </button>
            </div>
        </div>
    );
}
