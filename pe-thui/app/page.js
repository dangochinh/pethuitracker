'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InfoModal from './components/InfoModal';
import AuthFlow from './components/AuthFlow';
import UserDashboard from './components/UserDashboard';
import { FaBaby } from 'react-icons/fa';
import packageJson from '../package.json';

export default function Home() {
  const APP_VERSION = packageJson.version;
  const [showInfo, setShowInfo] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [user, setUser] = useState(null);
  const cardRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (sessionStorage.getItem('pe_thui_logout')) {
      sessionStorage.removeItem('pe_thui_logout');
      return;
    }

    const savedUser = localStorage.getItem('pe_thui_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('pe_thui_user');
      }
    } else {
      // Legacy redirect
      const savedCode = localStorage.getItem('pe_thui_last_code');
      if (savedCode) {
        setRedirecting(true);
        router.replace(`/${savedCode}`);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('pe_thui_user');
    setUser(null);
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

  return (
    <div className="min-h-screen bg-pink-50 relative flex flex-col justify-center overflow-x-hidden overflow-y-auto login-scroll">
      <div className="flex-1 w-full flex flex-col items-center justify-center p-6 py-12 pb-[10vh] md:pb-12">
        <div className="absolute top-0 left-0 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <div ref={cardRef} className="cute-card w-full max-w-sm p-8 text-center relative z-10 bg-white/90 backdrop-blur-xl shadow-xl transition-all duration-500">
          <div className="w-24 h-24 bg-pink-100 rounded-full mx-auto flex items-center justify-center mb-6 border-4 border-white shadow-sm text-pink-300">
            <FaBaby size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">Pe Thúi Tracker</h1>
          <p className="text-gray-500 text-sm mb-8 font-medium">Lưu giữ hành trình khôn lớn</p>

          {user ? (
            <UserDashboard user={user} onLogout={handleLogout} />
          ) : (
            <AuthFlow onLoginSuccess={(u) => setUser(u)} />
          )}

        </div>

        <p className="mt-6 text-[10px] text-primary/50 font-bold tracking-wide relative z-10 text-center">
          From Pe Thui Tracker with ❤️ | ver {APP_VERSION}
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
