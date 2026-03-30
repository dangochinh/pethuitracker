'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileSetup from './components/ProfileSetup';
import InfoModal from './components/InfoModal';
import { FaBaby } from 'react-icons/fa';
import packageJson from '../package.json';

export default function Home() {
  const APP_VERSION = packageJson.version;
  const [code, setCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const cardRef = useRef(null);
  const router = useRouter();

  // PWA auto-login: if user has a saved code, redirect straight to their profile.
  // Skipped when user explicitly chose "Về trang chủ" (sessionStorage flag).
  // sessionStorage clears on app close, so next cold open auto-redirects again.
  useEffect(() => {
    if (sessionStorage.getItem('pe_thui_logout')) {
      sessionStorage.removeItem('pe_thui_logout');
      return;
    }
    const savedCode = localStorage.getItem('pe_thui_last_code');
    if (savedCode) {
      setRedirecting(true);
      router.replace(`/${savedCode}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Intercept the back button ONLY while a modal / sub-view is open.
  // When the login screen is idle we leave back-navigation untouched so the
  // user can still exit the browser tab / return to the previous URL normally.
  useEffect(() => {
    const isGuardNeeded = showInfo || isCreating;
    if (!isGuardNeeded) return;

    history.pushState({ __loginGuard: true }, '');

    const handle = () => {
      if (showInfo)    { setShowInfo(false);    return; }
      if (isCreating) { setIsCreating(false); return; }
    };

    window.addEventListener('popstate', handle);
    return () => window.removeEventListener('popstate', handle);
  }, [showInfo, isCreating]);

  const handleFocus = () => {
    setIsFocused(true);
    // Wait for keyboard to start appearing
    setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const formatCode = (str) => {
    const noAccents = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
    const alphanumeric = noAccents.replace(/[^a-zA-Z0-9.]/g, '');
    return alphanumeric.toUpperCase().slice(0, 30);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (code) {
      router.push(`/${code}`);
    }
  };

  // Show a minimal loading screen while the auto-redirect is in flight so the
  // login form never flashes before the profile page appears.
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
    return <ProfileSetup onComplete={(newCode) => router.push(`/${newCode}`)} />;
  }

  return (
    <div className="min-h-screen bg-pink-50 relative flex flex-col justify-center overflow-x-hidden overflow-y-auto login-scroll">
      {/* Scrollable container for keyboard accessibility */}
      <div className={`flex-1 w-full flex flex-col items-center justify-center p-6 py-12 ${isFocused ? 'pb-[24vh]' : 'pb-8'} md:pb-12`}>
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <div ref={cardRef} className="cute-card w-full max-w-sm p-8 text-center relative z-10 bg-white/90 backdrop-blur-xl shadow-xl transition-all duration-500">
          <div className="w-24 h-24 bg-pink-100 rounded-full mx-auto flex items-center justify-center mb-6 border-4 border-white shadow-sm text-pink-300">
            <FaBaby size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">Pe Thúi Tracker</h1>
          <p className="text-gray-500 text-sm mb-8 font-medium">Lưu giữ hành trình khôn lớn</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all font-medium text-center uppercase tracking-widest placeholder-gray-400 placeholder:normal-case placeholder:tracking-normal focus:placeholder-transparent"
                placeholder="Nhập mã của bé..."
                value={code}
                onFocus={handleFocus}
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
            className="w-full mt-6 py-4 rounded-2xl font-bold border-2 border-pink-200 text-pink-500 hover:bg-pink-50 transition-all shadow-sm active:scale-95"
          >
            Tạo hồ sơ mới
          </button>
        </div>

        <p className="mt-6 text-[10px] text-primary/50 font-bold tracking-wide relative z-10 text-center">
          From Pe Thui Tracker with ❤️ | ver {APP_VERSION}
        </p>
      </div>

      {/* Info Button - Bottom Right */}
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
