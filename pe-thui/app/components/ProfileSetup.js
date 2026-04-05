import { useState } from 'react';
import { FaBaby, FaMars, FaVenus } from 'react-icons/fa6';
import ChangeCodeModal from './ChangeCodeModal';

export default function ProfileSetup({ onComplete }) {
    const [name, setName] = useState('');
    const [gender, setGender] = useState('female');
    const [dob, setDob] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showChangeCode, setShowChangeCode] = useState(false);
    const [successCode, setSuccessCode] = useState(null);

    const removeAccents = (str) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
    };

    const generateCode = () => {
        // e.g "tên bé là sóc" -> "SOC" -> "SOC010126.0226"
        const cleanName = removeAccents(name.trim()).replace(/\s+/g, '').toUpperCase();
        const [year, month, day] = dob.split('-');
        const yy = year.slice(-2);

        const today = new Date();
        const loginM = String(today.getMonth() + 1).padStart(2, '0');
        const loginY = String(today.getFullYear()).slice(-2);

        return `${cleanName}${day}${month}${yy}.${loginM}${loginY}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!name || !dob) {
            setError('Vui lòng nhập đủ thông tin!');
            return;
        }

        setSaving(true);
        try {
            const newCode = generateCode();
            await fetch('/api/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: newCode, name, gender, dob, avatar: avatarUrl })
            });
            setSuccessCode(newCode);
        } catch (e) {
            setError('Lỗi kết nối đến máy chủ. Vui lòng thử lại.');
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-pink-50 flex flex-col justify-center items-center p-6 relative">
            {/* Decorative blobs */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

            <div className="cute-card w-full max-w-sm p-8 text-center relative z-10 bg-white/90 backdrop-blur-xl">
                <div className="w-24 h-24 bg-pink-100 rounded-full mx-auto flex items-center justify-center mb-4 border-4 border-white shadow-sm overflow-hidden text-pink-300">
                    <FaBaby size={40} />
                </div>
                {successCode ? (
                    <div className="py-6 animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">Tạo hồ sơ thành công!</h2>
                        <p className="text-gray-500 mb-6 font-medium px-4">Hãy lưu lại mã dưới đây để đăng nhập vào những lần sau nhé.</p>

                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 mb-8">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Mã của bé</p>
                            <p className="text-2xl font-black text-pink-500 tracking-widest break-all">{successCode}</p>
                        </div>

                        <button
                            onClick={() => setShowChangeCode(true)}
                            className="w-full cute-button-primary py-4 text-lg"
                        >
                            Vào Trang Của Bé
                        </button>
                    </div>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-gray-800 mb-6 tracking-tight">Hồ Sơ Của Con</h1>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm font-medium flex items-start gap-2 animate-in fade-in slide-in-from-top-2 text-left">
                                <span className="text-lg leading-none mt-px">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 text-left">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">Tên của bé</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all font-medium"
                                    placeholder="VD: Pepe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">Avatar URL (Tùy chọn)</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all font-medium"
                                    placeholder="Link ảnh (Imgur...)"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2">Giới tính</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setGender('male')}
                                        className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 border-2 transition-all ${gender === 'male' ? 'border-blue-400 bg-blue-50 text-blue-600 font-bold shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                    >
                                        <FaMars size={18} /> Bé Trai
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setGender('female')}
                                        className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 border-2 transition-all ${gender === 'female' ? 'border-pink-400 bg-pink-50 text-pink-600 font-bold shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                    >
                                        <FaVenus size={18} /> Bé Gái
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">Ngày sinh</label>
                                <input
                                    type="date"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all font-medium text-gray-600"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full cute-button-primary mt-8 py-4 text-lg"
                            >
                                {saving ? 'Đang lưu...' : 'Tiếp Tục'}
                            </button>
                        </form>
                    </>
                )}
            </div>

            {/* Pop-up đổi mã sau khi tạo hồ sơ lần đầu */}
            {showChangeCode && successCode && (
                <ChangeCodeModal
                    autoCode={successCode}
                    profile={{ name, gender, dob, avatar: avatarUrl }}
                    onComplete={(finalCode) => onComplete(finalCode)}
                />
            )}
        </div>
    );
}
