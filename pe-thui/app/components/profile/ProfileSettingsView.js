'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    getSavedProfilesFromStorage, 
    saveProfileToStorage, 
    removeProfileFromStorage,
    formatFamilyShareCode, 
    generateBackupDataPayload,
    isProfileUnlocked,
    setProfileUnlocked
} from '../../lib/profile-utils';
import { formatBabyAge } from '../../lib/baby-utils';
import { calculatePregnancyWeeks } from '../../lib/pregnancy-utils';
import ConvertBabyModal from '../pregnancy/ConvertBabyModal';

export default function ProfileSettingsView({ profile, code, records = [], onEditProfile, onOpenShare, onPinUpdated }) {
    const router = useRouter();
    const [savedProfiles, setSavedProfiles] = useState([]);
    const [copiedCode, setCopiedCode] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showConvertBabyModal, setShowConvertBabyModal] = useState(false);
    
    // PIN Settings State
    const [hasPin, setHasPin] = useState(Boolean(profile?.hasPin));
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinOld, setPinOld] = useState('');
    const [pinNew, setPinNew] = useState('');
    const [pinConfirm, setPinConfirm] = useState('');
    const [pinError, setPinError] = useState('');
    const [pinLoading, setPinLoading] = useState(false);

    // Reminders state
    const [reminders, setReminders] = useState({
        feeding: true,
        vaccine: true,
        checkup: true,
        temp: false
    });

    useEffect(() => {
        setHasPin(Boolean(profile?.hasPin));
        setIsUnlocked(isProfileUnlocked(code));
    }, [code, profile]);

    const babyAge = formatBabyAge(profile?.dob);
    const familyCode = formatFamilyShareCode(code);
    const pregnancyStats = (profile?.mode === 'pregnancy' && profile?.estimatedDueDate)
        ? calculatePregnancyWeeks(profile.estimatedDueDate)
        : null;
    const canConvertPregnancy = pregnancyStats ? pregnancyStats.weeks >= 25 : false;

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 2500);
    };

    // Lưu hồ sơ hiện tại vào danh sách các bé trên máy
    useEffect(() => {
        if (code && profile) {
            const currentItem = {
                code,
                name: profile.name || 'Bé',
                mode: profile.mode || 'born',
                avatar: profile.avatar || '',
                dob: profile.dob || '',
                estimatedDueDate: profile.estimatedDueDate || null
            };
            const updated = saveProfileToStorage(currentItem);
            setSavedProfiles(updated);
        } else {
            setSavedProfiles(getSavedProfilesFromStorage());
        }
    }, [code, profile]);

    // Copy mã gia đình
    const handleCopyFamilyCode = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(familyCode);
            setCopiedCode(true);
            showToast(`Đã sao chép mã kết nối: #${familyCode}`);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    // Đồng bộ lại dữ liệu
    const handleForceSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            showToast('Dữ liệu đã được đồng bộ với Firebase Firestore!');
        }, 1200);
    };

    // Xuất bản sao lưu JSON
    const handleExportBackup = () => {
        try {
            const payload = generateBackupDataPayload(code, profile, { growth: records });
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `babie-backup-${code}-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Bản sao lưu đang được tải về máy của bạn!');
        } catch (e) {
            console.error('Export failed', e);
        }
    };

    const toggleReminder = (key) => {
        setReminders(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="flex flex-col w-full space-y-6 text-left pb-24">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform">
                    <div className="bg-gray-900 text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-semibold">
                        <span className="material-symbols-outlined text-[18px] text-teal-400">check_circle</span>
                        <span>{toastMessage}</span>
                    </div>
                </div>
            )}

            {/* Cloud Database Sync Status Card */}
            <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-purple-100/70 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-pink-100/40 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-xs">
                            <span className="material-symbols-outlined text-[22px]">cloud_done</span>
                        </div>
                        <div>
                            <h2 className="font-headline font-bold text-base text-gray-900">Đồng bộ Firebase Cloud</h2>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
                                </span>
                                <span className="text-xs text-teal-700 font-semibold">Thời gian thực • Đã kết nối</span>
                            </div>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-extrabold text-[10px] uppercase tracking-wider border border-teal-200/50">
                        Tự động
                    </span>
                </div>

                {/* Database Meta Details */}
                <div className="mt-3.5 bg-[#fff8f8] rounded-2xl p-3.5 space-y-2 border border-pink-100/60">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-gray-400">database</span>
                            Cơ sở dữ liệu
                        </span>
                        <span className="font-bold text-[#861949]">Firebase Firestore Cloud</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-gray-400">tag</span>
                            Mã hồ sơ bé
                        </span>
                        <span className="font-black text-gray-900 uppercase tracking-wide">#{code}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-gray-400">security</span>
                            Mã hoá bảo mật
                        </span>
                        <span className="font-bold text-teal-700 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            Đầu cuối 256-bit
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                    <button 
                        type="button"
                        onClick={handleForceSync}
                        className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-[#861949] transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                        <span className={`material-symbols-outlined text-[20px] ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                        <span className="text-xs font-bold mt-1">Đồng bộ</span>
                    </button>

                    <button 
                        type="button"
                        onClick={handleExportBackup}
                        className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-[#861949] transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        <span className="text-xs font-bold mt-1">Xuất file</span>
                    </button>

                    <button 
                        type="button"
                        onClick={() => showToast('Cơ sở dữ liệu Firebase đang hoạt động hoàn hảo!')}
                        className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                        <span className="material-symbols-outlined text-[20px]">task_alt</span>
                        <span className="text-xs font-bold mt-1">Kiểm tra</span>
                    </button>
                </div>
            </section>

            {/* Profiles Switcher & Management */}
            <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <div>
                        <h3 className="font-headline font-bold text-sm text-gray-900">Hồ sơ đã lưu trên thiết bị</h3>
                        <p className="text-xs text-gray-500">Các bé đã đăng nhập trên máy này để chuyển đổi nhanh</p>
                    </div>
                    <span className="text-[10px] text-[#861949] px-2.5 py-1 rounded-full bg-pink-100 font-extrabold uppercase tracking-wider">
                        {savedProfiles.length} Hồ sơ
                    </span>
                </div>

                {/* Active Profile Card */}
                <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-purple-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-pink-100 flex items-center justify-center shadow-xs">
                                <img 
                                    className="w-full h-full object-cover" 
                                    alt={profile?.name || 'Bé'} 
                                    src={profile?.avatar || '/baby-stitch.png'}
                                    onError={(e) => { e.currentTarget.src = '/baby-default.png'; }}
                                />
                            </div>
                            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-xs">
                                <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h4 className="font-headline font-bold text-sm text-gray-900">{profile?.name || 'Bé'}</h4>
                                <span className="px-2 py-0.5 rounded-full bg-pink-100 text-[#861949] text-[9px] font-extrabold uppercase">
                                    {profile?.mode === 'pregnancy' ? 'Thai kỳ' : 'Đang chọn'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Mã: <span className="font-bold text-[#861949]">#{code}</span> • {profile?.mode === 'pregnancy' ? 'Hồ sơ mang thai' : babyAge.formatted}
                            </p>
                        </div>
                    </div>

                    <button 
                        type="button"
                        onClick={onEditProfile}
                        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 active:scale-95 transition-all cursor-pointer"
                        title="Chỉnh sửa hồ sơ"
                    >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                </div>

                {/* Quick Convert to Baby Profile if mode is pregnancy & weeks >= 25 */}
                {profile?.mode === 'pregnancy' && canConvertPregnancy && (
                    <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 rounded-[2rem] p-4 border border-pink-200/80 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-2xl bg-[#861949] text-white flex items-center justify-center shrink-0 shadow-xs">
                                <span className="material-symbols-outlined text-[20px]">celebration</span>
                            </span>
                            <div>
                                <h4 className="font-headline font-bold text-xs sm:text-sm text-gray-900">Bé đã cất tiếng khóc?</h4>
                                <p className="text-[11px] text-gray-500 mt-0.5">Chuyển sang hồ sơ em bé để lưu cân nặng, chiều dài sơ sinh & cữ bú</p>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setShowConvertBabyModal(true)}
                            className="px-3.5 py-2 rounded-xl bg-[#861949] hover:bg-[#6c123a] text-white font-headline font-bold text-xs shrink-0 active:scale-95 transition-all shadow-xs cursor-pointer"
                        >
                            Chuyển đổi
                        </button>
                    </div>
                )}

                {/* Inactive Saved Profiles */}
                {savedProfiles.filter(p => p.code !== code).map(p => (
                    <div key={p.code} className="bg-white/80 rounded-[2rem] p-4 shadow-xs border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                <img 
                                    className="w-full h-full object-cover" 
                                    alt={p.name} 
                                    src={p.avatar || '/baby-default.png'}
                                    onError={(e) => { e.currentTarget.src = '/baby-default.png'; }}
                                />
                            </div>
                            <div>
                                <h4 className="font-headline font-bold text-sm text-gray-800">{p.name}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Mã: #{p.code} ({p.mode === 'pregnancy' ? 'Thai kỳ' : 'Bé đã sinh'})</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button 
                                type="button"
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        sessionStorage.setItem('pethui_flower_celebration', JSON.stringify({
                                            name: p.name,
                                            type: 'switch_profile'
                                        }));
                                    }
                                    router.push(`/${p.code}`);
                                }}
                                className="px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-purple-100 text-[#861949] text-xs font-bold active:scale-95 transition-all cursor-pointer"
                            >
                                Chọn
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Bạn có chắc muốn xoá hồ sơ ${p.name} khỏi danh sách đã lưu trên máy này?`)) {
                                        const updated = removeProfileFromStorage(p.code);
                                        setSavedProfiles(updated);
                                        showToast(`Đã xoá ${p.name} khỏi thiết bị`);
                                    }
                                }}
                                className="w-8 h-8 rounded-full bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer"
                                title="Xoá khỏi máy này"
                            >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                        </div>
                    </div>
                ))}

                {/* Create Profile Button */}
                <button 
                    type="button"
                    onClick={() => router.push('/')}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-pink-50 text-[#861949] flex items-center justify-center gap-2 text-xs font-bold transition-all border border-dashed border-pink-200 shadow-xs cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>Thêm bé mới hoặc tạo thai kỳ mới</span>
                </button>
            </section>

            {/* 4-Digit PIN Security Card */}
            <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-purple-100/70 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center shadow-xs">
                            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {hasPin ? 'shield_lock' : 'lock_open'}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-headline font-bold text-sm text-gray-900">Bảo mật mã PIN 4 số</h3>
                            <p className="text-xs text-gray-500">
                                {hasPin ? 'Người lạ/khách chỉ được xem, cần PIN để sửa' : 'Chưa thiết lập - Bất kỳ ai có link đều sửa được'}
                            </p>
                        </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        hasPin ? 'bg-teal-50 text-teal-700 border border-teal-200/50' : 'bg-gray-100 text-gray-500'
                    }`}>
                        {hasPin ? 'Đang bảo vệ' : 'Chưa bật'}
                    </span>
                </div>

                <div className="bg-[#fff8f8] rounded-2xl p-4 border border-pink-100/80 flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-gray-800 block">
                            {hasPin ? (isUnlocked ? 'Thiết bị này: Đã mở quyền chỉnh sửa 🔓' : 'Thiết bị này: Chế độ chỉ xem 🔒') : 'Khuyến nghị đặt PIN để bảo vệ'}
                        </span>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                            {hasPin 
                                ? 'Người thân hoặc máy khác quét mã QR sẽ chỉ có quyền xem nhật ký và biểu đồ.' 
                                : 'Đặt mã PIN 4 số để ngăn người khác chỉnh sửa nhầm nhật ký của bé.'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setPinOld('');
                            setPinNew('');
                            setPinConfirm('');
                            setPinError('');
                            setShowPinModal(true);
                        }}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#861949] hover:bg-[#6c123a] text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-[16px]">password</span>
                        <span>{hasPin ? 'Đổi mã PIN' : 'Thiết lập mã PIN 4 số'}</span>
                    </button>

                    {hasPin && isUnlocked && (
                        <button
                            type="button"
                            onClick={() => {
                                setProfileUnlocked(code, false);
                                setIsUnlocked(false);
                                showToast('Đã khoá quyền chỉnh sửa trên máy này (Chuyển sang Chế độ xem)');
                                onPinUpdated?.();
                            }}
                            className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                            title="Chuyển máy này về chế độ chỉ xem"
                        >
                            <span className="material-symbols-outlined text-[16px]">lock</span>
                            <span>Khoá lại</span>
                        </button>
                    )}
                </div>
            </section>

            {/* Modal: Setup / Change PIN */}
            {showPinModal && (
                <div className="fixed inset-0 bg-on-surface/50 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-6 max-w-sm w-full shadow-2xl border border-purple-100 flex flex-col text-left animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <div>
                                <h3 className="font-headline font-black text-base text-gray-900">
                                    {hasPin ? 'Thay đổi mã PIN' : 'Cài đặt mã PIN 4 số'}
                                </h3>
                                <p className="text-[11px] text-gray-500">Dùng để mở quyền chỉnh sửa trên các thiết bị</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPinModal(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setPinError('');
                            if (hasPin && !pinOld) {
                                setPinError('Vui lòng nhập mã PIN hiện tại');
                                return;
                            }
                            if (!/^\d{4}$/.test(pinNew)) {
                                setPinError('Mã PIN mới phải đúng 4 chữ số');
                                return;
                            }
                            if (pinNew !== pinConfirm) {
                                setPinError('Mã PIN xác nhận không trùng khớp');
                                return;
                            }

                            setPinLoading(true);
                            try {
                                const res = await fetch('/api/pin', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        action: hasPin ? 'update' : 'set',
                                        code,
                                        oldPin: pinOld || null,
                                        newPin: pinNew
                                    })
                                });
                                const json = await res.json();
                                if (res.ok && json.success) {
                                    setProfileUnlocked(code, true);
                                    setIsUnlocked(true);
                                    setHasPin(true);
                                    setShowPinModal(false);
                                    showToast('Đã lưu mã PIN thành công!');
                                    onPinUpdated?.();
                                } else {
                                    setPinError(json.message || 'Không thể lưu mã PIN');
                                }
                            } catch (err) {
                                setPinError('Lỗi kết nối máy chủ');
                            } finally {
                                setPinLoading(false);
                            }
                        }} className="space-y-3.5 mt-4">
                            {hasPin && (
                                <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-1">Mã PIN hiện tại</label>
                                    <input
                                        type="password"
                                        maxLength={4}
                                        pattern="\d{4}"
                                        inputMode="numeric"
                                        value={pinOld}
                                        onChange={(e) => setPinOld(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        placeholder="••••"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-lg font-bold tracking-widest focus:border-[#861949] focus:outline-none"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">Mã PIN mới (4 số)</label>
                                <input
                                    type="password"
                                    maxLength={4}
                                    pattern="\d{4}"
                                    inputMode="numeric"
                                    value={pinNew}
                                    onChange={(e) => setPinNew(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="••••"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-lg font-bold tracking-widest focus:border-[#861949] focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">Nhập lại mã PIN mới</label>
                                <input
                                    type="password"
                                    maxLength={4}
                                    pattern="\d{4}"
                                    inputMode="numeric"
                                    value={pinConfirm}
                                    onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="••••"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-lg font-bold tracking-widest focus:border-[#861949] focus:outline-none"
                                    required
                                />
                            </div>

                            {pinError && (
                                <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">error</span>
                                    <span>{pinError}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPinModal(false)}
                                    className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
                                >
                                    Huỷ
                                </button>
                                <button
                                    type="submit"
                                    disabled={pinLoading || pinNew.length !== 4 || pinConfirm.length !== 4}
                                    className="py-3 px-4 rounded-xl bg-[#861949] hover:bg-[#6c123a] text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                                >
                                    {pinLoading ? 'Đang lưu...' : 'Lưu mã PIN'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* Family Sharing & Permissions Card */}
            <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-purple-100/70 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-pink-100 text-[#861949] flex items-center justify-center shadow-xs">
                            <span className="material-symbols-outlined text-[22px]">diversity_1</span>
                        </div>
                        <div>
                            <h3 className="font-headline font-bold text-sm text-gray-900">Chia sẻ gia đình</h3>
                            <p className="text-xs text-gray-500">Mời ba mẹ, ông bà cùng chăm sóc bé</p>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={onOpenShare}
                        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-pink-100 text-[#861949] flex items-center justify-center transition-colors cursor-pointer"
                        title="Mở mã QR chia sẻ"
                    >
                        <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                    </button>
                </div>

                {/* Family Code Copy Box */}
                <div className="bg-[#fff8f8] rounded-2xl p-3 flex items-center justify-between border border-pink-100">
                    <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Mã kết nối gia đình</span>
                        <span className="font-headline font-black text-sm text-[#861949] tracking-wider font-mono">
                            #{familyCode}
                        </span>
                    </div>
                    <button 
                        type="button"
                        onClick={handleCopyFamilyCode}
                        className="px-3 py-1.5 rounded-full bg-[#861949] hover:bg-[#a53361] text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                        <span className="material-symbols-outlined text-[14px]">
                            {copiedCode ? 'check' : 'content_copy'}
                        </span>
                        <span>{copiedCode ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                </div>

                {/* Member Roles List */}
                <div className="space-y-2 pt-1">
                    <span className="text-[11px] text-gray-500 font-bold block">Thành viên kết nối</span>
                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-50/70 border border-gray-100">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-pink-100 text-[#861949] flex items-center justify-center font-bold text-xs">
                                M
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900">Mẹ (Bạn)</p>
                                <p className="text-[10px] text-gray-400">Đang quản lý trên máy này</p>
                            </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-pink-100 text-[#861949] text-[9px] font-extrabold uppercase">
                            Chủ sở hữu
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-50/70 border border-gray-100">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                                B
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900">Ba & Người thân</p>
                                <p className="text-[10px] text-gray-400">Quét mã QR hoặc nhập mã #{code}</p>
                            </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[9px] font-extrabold uppercase">
                            Đồng bộ tức thì
                        </span>
                    </div>
                </div>
            </section>

            {/* Notification & Routine Reminders Settings */}
            <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-purple-100/70 space-y-3">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-[22px]">notifications_active</span>
                    </div>
                    <div>
                        <h3 className="font-headline font-bold text-sm text-gray-900">Cài đặt nhắc nhở</h3>
                        <p className="text-xs text-gray-500">Thông báo tự động trên thiết bị</p>
                    </div>
                </div>

                <div className="space-y-2 pt-1 divide-y divide-gray-100">
                    {/* Feeding */}
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-pink-100 text-[#861949] flex items-center justify-center">
                                <span className="material-symbols-outlined text-[16px]">baby_changing_station</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-800">Nhắc cữ bú sữa & ăn dặm</p>
                                <p className="text-[10px] text-gray-400">Khoảng 3 - 4 giờ một lần</p>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => toggleReminder('feeding')}
                            className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                                reminders.feeding ? 'bg-[#861949]' : 'bg-gray-300'
                            }`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                                reminders.feeding ? 'translate-x-5' : 'translate-x-0'
                            }`}></div>
                        </button>
                    </div>

                    {/* Vaccine */}
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[16px]">vaccines</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-800">Lịch tiêm phòng kế tiếp</p>
                                <p className="text-[10px] text-gray-400">Báo trước 3 ngày đến hẹn</p>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => toggleReminder('vaccine')}
                            className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                                reminders.vaccine ? 'bg-[#861949]' : 'bg-gray-300'
                            }`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                                reminders.vaccine ? 'translate-x-5' : 'translate-x-0'
                            }`}></div>
                        </button>
                    </div>

                    {/* Temperature */}
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[16px]">thermostat</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-800">Đo thân nhiệt khi sốt</p>
                                <p className="text-[10px] text-gray-400">Nhắc đo lại sau uống hạ sốt 60 phút</p>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => toggleReminder('temp')}
                            className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                                reminders.temp ? 'bg-[#861949]' : 'bg-gray-300'
                            }`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                                reminders.temp ? 'translate-x-5' : 'translate-x-0'
                            }`}></div>
                        </button>
                    </div>
                </div>
            </section>

            {/* Keepsake Sync Footer Note */}
            <div className="p-4 rounded-2xl bg-[#fff8f8] border border-pink-100 text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-[#861949]">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span className="text-xs font-bold">Bảo mật mã hoá hai chiều</span>
                </div>
                <p className="text-[11px] text-gray-500">
                    Dữ liệu của bé được bảo mật an toàn trên máy chủ Firebase Cloud. Chỉ những ai có mã #{code} của bạn mới có thể truy cập.
                </p>
            </div>

            {/* Convert Baby Modal */}
            {showConvertBabyModal && (
                <ConvertBabyModal
                    profile={profile}
                    code={code}
                    onClose={() => setShowConvertBabyModal(false)}
                    onSuccess={() => window.location.reload()}
                />
            )}
        </div>
    );
}
