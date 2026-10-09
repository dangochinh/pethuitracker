'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InfoModal from './components/InfoModal';
import ProfileSetup from './components/ProfileSetup';
import { FaBaby, FaPlus, FaTimes } from 'react-icons/fa';
import packageJson from '../package.json';

export default function Home() {
  const APP_VERSION = packageJson.version;
  const [showInfo, setShowInfo] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [code, setCode] = useState('');
  const [savedBabies, setSavedBabies] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  
  const cardRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // 1. If user explicitly chose "Về trang chủ", stay on home page and skip auto-redirect
    if (sessionStorage.getItem('pe_thui_logout')) {
      sessionStorage.removeItem('pe_thui_logout');
      loadBabies();
      return;
    }

    // 2. PWA auto-login: redirect straight to saved baby profile on cold open
    let savedCode = null;
    try {
      savedCode = localStorage.getItem('pe_thui_last_code');
      if (!savedCode) {
        const stored = localStorage.getItem('pe_thui_babies');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            savedCode = parsed[0];
          }
        }
      }
      if (!savedCode) {
        const pethuiProfiles = localStorage.getItem('pethui_saved_profiles');
        if (pethuiProfiles) {
          const parsed = JSON.parse(pethuiProfiles);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.code) {
            savedCode = parsed[0].code;
          }
        }
      }
    } catch (e) {}

    if (savedCode) {
      setRedirecting(true);
      router.replace(`/${savedCode}`);
      return;
    }

    // 3. First-time or new user: load saved babies list
    loadBabies();
  }, [router]);

  // Load saved baby codes from local storage
  const loadBabies = async () => {
    let codes = [];
    try {
      const stored = localStorage.getItem('pe_thui_babies');
      if (stored) codes = JSON.parse(stored);
    } catch (e) {
      const legacy = localStorage.getItem('pe_thui_last_code');
      if (legacy) codes = [legacy];
    }

    if (!codes || codes.length === 0) {
      try {
        const pethuiProfiles = localStorage.getItem('pethui_saved_profiles');
        if (pethuiProfiles) {
          const parsed = JSON.parse(pethuiProfiles);
          if (Array.isArray(parsed)) {
            codes = parsed.map(p => p.code).filter(Boolean);
          }
        }
      } catch (e) {}
    }

    if (codes.length === 0) return;

    // Fetch profile details for saved babies
    const results = [];
    for (const c of codes) {
      try {
        const res = await fetch(`/api/profile?code=${c}`);
        if (res.ok) {
          const data = await res.json();
          const profileData = data.data || data.profile;
          if (data.success && profileData) {
            results.push({ code: c, ...profileData });
          }
        }
      } catch(e) {}
    }
    setSavedBabies(results);
  };

  // Intercept the back button when a modal is open so it closes the modal instead of exiting
  useEffect(() => {
    const isGuardNeeded = showInfo || isCreating;
    if (!isGuardNeeded) return;

    history.pushState({ __loginGuard: true }, '');

    const handle = () => {
      if (showInfo) { setShowInfo(false); return; }
      if (isCreating) { setIsCreating(false); return; }
    };

    window.addEventListener('popstate', handle);
    return () => window.removeEventListener('popstate', handle);
  }, [showInfo, isCreating]);

  const formatCode = (str) => {
    const noAccents = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
    const alphanumeric = noAccents.replace(/[^a-zA-Z0-9.]/g, '');
    return alphanumeric.toUpperCase().slice(0, 30);
  };

  const handleEnterCode = (e) => {
    e.preventDefault();
    if (code) {
      saveCodeAndRedirect(code);
    }
  };

  const saveCodeAndRedirect = (c) => {
    try {
      const stored = localStorage.getItem('pe_thui_babies');
      let codes = stored ? JSON.parse(stored) : [];
      codes = [c, ...codes.filter(item => item !== c)];
      localStorage.setItem('pe_thui_babies', JSON.stringify(codes));
      localStorage.setItem('pe_thui_last_code', c);
    } catch (e) {}
    router.push(`/${c}`);
  };

  const handleRemoveSaved = (e, c) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc muốn xoá bé này khỏi danh sách truy cập nhanh?')) return;
    const newBabies = savedBabies.filter(b => b.code !== c);
    setSavedBabies(newBabies);
    localStorage.setItem('pe_thui_babies', JSON.stringify(newBabies.map(b => b.code)));
    try {
      const lastCode = localStorage.getItem('pe_thui_last_code');
      if (lastCode === c) {
        if (newBabies.length > 0) {
          localStorage.setItem('pe_thui_last_code', newBabies[0].code);
        } else {
          localStorage.removeItem('pe_thui_last_code');
        }
      }
    } catch (e) {}
  };

  if (redirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50">
        <div className="animate-bounce">
          <FaBaby size={52} className="text-pink-300" />
        </div>
        <p className="mt-4 text-pink-400 font-bold tracking-wide">Đang tải hồ sơ bé...</p>
      </div>
    );
  }

  if (isCreating) {
    return <ProfileSetup onComplete={(newCode) => saveCodeAndRedirect(newCode)} />;
  }

  return (
    <div className="min-h-screen max-w-md mx-auto shadow-2xl bg-pink-50 relative flex flex-col justify-center overflow-x-hidden overflow-y-auto login-scroll">
      <div className={`flex-1 w-full flex flex-col items-center justify-center p-6 py-12 ${isFocused ? 'pb-[24vh]' : 'pb-8'} md:pb-12`}>
        <div className="absolute top-0 left-0 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <div ref={cardRef} className="cute-card w-full max-w-sm p-8 text-center relative z-10 bg-white/90 backdrop-blur-xl shadow-xl transition-all duration-500">
          <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-5 p-1 bg-white shadow-md border-2 border-pink-100 overflow-hidden">
            <img src="/logo-stitch.png" alt="Babie Tracker Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">Babie Tracker</h1>

          <p className="text-gray-500 text-sm mb-8 font-medium">Lưu giữ hành trình khôn lớn</p>

          {/* List of previously saved babies */}
          {savedBabies.length > 0 && (
            <div className="mb-6 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-left px-1">Truy cập nhanh</p>
              {savedBabies.map(baby => (
                <button
                    key={baby.code}
                    onClick={() => saveCodeAndRedirect(baby.code)}
                    className="w-full bg-white border border-gray-100 shadow-sm p-3 rounded-2xl flex items-center gap-3 hover:border-pink-200 hover:shadow-md transition-all active:scale-95 text-left relative group"
                >
                    {baby.avatar ? (
                        <img src={baby.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover border-2 border-pink-100" />
                    ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center text-pink-400 border-2 border-white shadow-sm shrink-0">
                            <FaBaby size={20} />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-base truncate">{baby.name}</h3>
                        <p className="text-[11px] text-gray-500 font-medium truncate">Mã: {baby.code}</p>
                    </div>
                    
                    <div 
                      onClick={(e) => handleRemoveSaved(e, baby.code)}
                      className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                    >
                      <FaTimes />
                    </div>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleEnterCode} className="space-y-4">
            <div className="relative group">
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all font-medium text-center uppercase tracking-widest placeholder-gray-400 placeholder:normal-case placeholder:tracking-normal focus:placeholder-transparent"
                placeholder={savedBabies.length > 0 ? "Nhập mã bé khác..." : "Nhập mã của bé..."}
                value={code}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => setCode(formatCode(e.target.value))}
              />
            </div>
            <button
              type="submit"
              disabled={!code}
              onMouseDown={(e) => e.preventDefault()}
              className="w-full cute-button-primary py-4 text-lg disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
            >
              Vào trang / Tra cứu
            </button>
          </form>

          <div className="mt-8 relative flex items-center justify-center">
            <div className="border-t border-gray-200 w-full absolute"></div>
            <span className="bg-white px-4 text-xs font-bold text-gray-400 relative z-10 uppercase tracking-wider">Hoặc</span>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="w-full mt-6 py-4 rounded-2xl font-bold border-2 border-pink-200 text-pink-500 hover:bg-pink-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
          >
            <FaPlus /> Tạo hồ sơ mới
          </button>

          <a
            href="/landing"
            className="w-full mt-3 py-3 rounded-2xl font-bold bg-pink-50/70 hover:bg-pink-100/80 text-[#861949] text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-pink-200/60 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            <span>Khám phá tính năng Babie Tracker</span>
          </a>
        </div>

        <p className="mt-6 text-[10px] text-primary/50 font-bold tracking-wide relative z-10 text-center">
          From Babie Tracker with ❤️ | ver {APP_VERSION}
        </p>
      </div>

      <button
        onClick={() => setShowInfo(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-pink-500 transition-all active:scale-90 z-[90] border border-pink-50"
      >
        <span className="material-symbols-outlined text-[24px]">help</span>
      </button>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
  );
}
