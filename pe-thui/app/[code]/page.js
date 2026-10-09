'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaBaby } from 'react-icons/fa6';
import Dashboard from '../components/Dashboard';

export default function ProfilePage() {
    const params = useParams();
    const router = useRouter();
    const code = params.code;

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!code) return;

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/profile?code=${code}`);
                const json = await res.json();
                if (json.success && json.data) {
                    setProfile(json.data);
                    // Remember this code so the PWA can auto-login next time.
                    localStorage.setItem('pe_thui_last_code', code);
                    try {
                        const stored = localStorage.getItem('pe_thui_babies');
                        let codes = stored ? JSON.parse(stored) : [];
                        if (!codes.includes(code)) {
                            codes.unshift(code);
                            localStorage.setItem('pe_thui_babies', JSON.stringify(codes));
                        }
                    } catch (e) {}
                } else {
                    setError(true);
                }
            } catch (e) {
                console.error(e);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [code]);

    if (loading) {
        return (
            <div className="max-w-md mx-auto min-h-screen shadow-2xl flex flex-col items-center justify-center bg-pink-50">
                <div className="animate-bounce">
                    <FaBaby size={60} className="text-pink-400" />
                </div>
                <p className="mt-4 text-pink-400 font-bold tracking-wide">Đang tải hồ sơ bé...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="max-w-md mx-auto min-h-screen shadow-2xl flex flex-col items-center justify-center bg-pink-50 p-6">
                <div className="cute-card max-w-sm w-full p-8 text-center bg-white backdrop-blur-xl">
                    <div className="text-5xl mb-4">😢</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy mã bé!</h2>
                    <p className="text-gray-500 text-sm mb-6">Mã <b>{code}</b> không tồn tại hoặc bạn nhập sai.</p>
                    <button onClick={() => {
                        localStorage.removeItem('pe_thui_last_code');
                        sessionStorage.setItem('pe_thui_logout', 'true');
                        router.push('/');
                    }} className="w-full cute-button-primary py-3">
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto min-h-screen shadow-2xl bg-background relative">
            <Dashboard profile={profile} code={code} />
        </div>
    );
}
