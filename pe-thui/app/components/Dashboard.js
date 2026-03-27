'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { calculateAge, predictAdultHeight, assessWeight, assessHeight } from '../lib/calculations';
import AddRecordModal from './AddRecordModal';
import EditProfileModal from './EditProfileModal';
import EditRecordModal from './EditRecordModal';
import GrowthCharts from './GrowthCharts';
import InfoModal from './InfoModal';
import VaccinePreview from './health/VaccinePreview';
import TeethingPreview from './health/TeethingPreview';
import VaccineList from './health/VaccineList';
import TeethingChart from './health/TeethingChart';
import BottomNav from './layout/BottomNav';
import DevelopmentSkillsSection from './DevelopmentSkillsSection';

export default function Dashboard({ profile, code }) {
    const router = useRouter();
    const [records, setRecords] = useState([]);
    const [vaccineRecords, setVaccineRecords] = useState([]);
    const [teethingRecords, setTeethingRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [view, setView] = useState('home'); // home, growth, health, teething

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const t = Date.now();
            const [growthRes, vaccineRes, teethRes] = await Promise.all([
                fetch(`/api/growth?code=${code}&t=${t}`, { cache: 'no-store' }),
                fetch(`/api/vaccines?code=${code}&t=${t}`, { cache: 'no-store' }),
                fetch(`/api/teeth?code=${code}&t=${t}`, { cache: 'no-store' })
            ]);

            const [growthJson, vaccineJson, teethJson] = await Promise.all([
                growthRes.json(),
                vaccineRes.json(),
                teethRes.json()
            ]);

            if (growthJson.success) {
                setRecords(growthJson.data.sort((a, b) => {
                    if (b.ageMonths !== a.ageMonths) return b.ageMonths - a.ageMonths;
                    return b.id - a.id;
                }));
            }
            if (vaccineJson.success) setVaccineRecords(vaccineJson.data);
            if (teethJson.success) setTeethingRecords(teethJson.data);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, [view]);


    const ageInfo = calculateAge(profile.dob);
    const latest = records[0];

    const daysToBirthday = ((dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (today > nextBirthday) nextBirthday.setFullYear(today.getFullYear() + 1);
        const diffTime = nextBirthday - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    })(profile.dob);

    const renderView = () => {
        switch (view) {
            case 'growth':
                return <GrowthCharts records={records} profile={profile} onBack={() => setView('home')} />;
            case 'health':
                return <VaccineList dob={profile.dob} records={vaccineRecords} code={code} onSave={fetchAllData} />;
            case 'teething':
                return <TeethingChart dob={profile.dob} records={teethingRecords} code={code} onSave={fetchAllData} />;
            case 'home':
            default:
                return (
                    <HomeView 
                        profile={profile} 
                        records={records} 
                        ageInfo={ageInfo} 
                        daysToBirthday={daysToBirthday} 
                        latest={latest} 
                        setView={setView} 
                        teethingRecords={teethingRecords} 
                        vaccineRecords={vaccineRecords} 
                        setShowEditProfile={setShowEditProfile}
                        code={code}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24 relative">
            {/* Global Floating Buttons */}
            {view === 'home' && (
                <div className="absolute top-6 right-6 z-50 flex gap-2">
                    <button onClick={() => setShowInfo(true)} className="w-10 h-10 flex items-center justify-center bg-white text-gray-400 hover:text-primary rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 border border-gray-100">
                        <span className="material-symbols-outlined text-xl">help</span>
                    </button>
                    <button onClick={() => setShowEditProfile(true)} className="w-10 h-10 flex items-center justify-center bg-white text-gray-400 hover:text-primary rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 border border-gray-100">
                        <span className="material-symbols-outlined text-xl">settings</span>
                    </button>
                </div>
            )}

            <div className="pt-8">
                <div className="w-full max-w-lg px-4 space-y-8 mx-auto">
                    {renderView()}
                </div>
            </div>
            {view !== 'teething' && view !== 'health' && (
                <button 
                    onClick={() => setShowAdd(true)}
                    className="fixed bottom-32 right-6 w-16 h-16 bg-soft-gradient text-on-primary rounded-full shadow-[0_20px_40px_rgba(165,51,97,0.4)] flex items-center justify-center z-[100] active:scale-90 transition-all border-4 border-white hover:bottom-34"
                >
                    <span className="material-symbols-outlined text-3xl">add</span>
                </button>
            )}

            <BottomNav view={view} setView={setView} />

            {showAdd && <AddRecordModal profile={profile} code={code} onClose={() => setShowAdd(false)} onSave={fetchAllData} />}
            {showEditProfile && <EditProfileModal profile={profile} code={code} onClose={() => setShowEditProfile(false)} onSave={(newCode) => { if (newCode && newCode !== code) { router.push(`/${newCode}`); } else { window.location.reload(); } }} />}
            {editingRecord && <EditRecordModal profile={profile} code={code} record={editingRecord} onClose={() => setEditingRecord(null)} onSave={fetchAllData} />}
            {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
        </div>
    );
}

function HomeView({ profile, records, ageInfo, daysToBirthday, latest, setView, teethingRecords, vaccineRecords, code }) {
    const latestWeightRecord = records.find(r => r.weight > 0);
    const latestHeightRecord = records.find(r => r.height > 0);

    const weightStatus = latestWeightRecord ? assessWeight(latestWeightRecord.weight, latestWeightRecord.ageMonths) : null;
    const heightStatus = latestHeightRecord ? assessHeight(latestHeightRecord.height, latestHeightRecord.ageMonths) : null;

    return (
        <main className="pb-30 md:pb-12 space-y-8">
            {/* New Bento Profile Card */}
            <section className="relative mt-[4.5rem] px-2">
                <div className="bg-[#fffbf0] rounded-[2rem] p-5 pt-16 relative shadow-sm border-[3px] border-dashed border-primary/30">
                    
                    {/* Cloudy Overlap Avatar */}
                    <div className="absolute -top-[3.5rem] left-1/2 -translate-x-1/2 flex items-center justify-center">
                        <div className="w-36 h-20 bg-white absolute bottom-[-15px] rounded-full blur-[2px] opacity-80 z-0"></div>
                        <div className="relative z-10 w-28 h-28 rounded-full border-[6px] border-white overflow-hidden shadow-sm bg-surface-container-lowest flex shrink-0">
                            {profile.avatar ? (
                                <img alt="Baby profile" className="w-full h-full object-cover" src={profile.avatar} />
                            ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-4xl">👶</div>
                            )}
                        </div>
                    </div>
                    
                    {/* Cute floating emojis */}
                    <span className="absolute top-6 left-4 text-xl opacity-60">🌜</span>
                    <span className="absolute top-16 right-4 text-xl opacity-60 text-yellow-500">⭐</span>
                    <span className="absolute top-1/2 left-4 text-xl opacity-60 -translate-y-1/2">✨</span>
                    <span className="absolute bottom-4 right-4 text-2xl opacity-80">🐌</span>

                    <div className="relative z-10 flex flex-col items-center text-center gap-0.5">
                        <div className="flex items-center justify-center gap-2">
                            <h1 className="font-headline text-[26px] font-extrabold text-on-surface leading-tight">{profile.name}</h1>
                            {profile.gender === 'female' ? (
                                <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-sm">
                                    <span className="material-symbols-outlined text-[12px]">female</span>
                                </div>
                            ) : (
                                <div className="w-5 h-5 bg-secondary text-white rounded-full flex items-center justify-center shadow-sm">
                                    <span className="material-symbols-outlined text-[12px]">male</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-2 space-y-1 text-sm font-medium text-on-surface-variant/80">
                            <p>Ngày sinh: {new Date(profile.dob).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p>Tuổi: {ageInfo.text}</p>
                        </div>

                        <div className="mt-4 bg-[#fff8e1] border border-[#ffe082]/60 px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-3">
                            <span className="text-2xl">🎂</span>
                            <div className="text-left">
                                <p className="text-[8px] font-black tracking-widest uppercase text-[#fb8c00]">Sắp đến sinh nhật</p>
                                <p className="font-bold text-[#f57c00] text-sm leading-tight">Còn <span className="text-[#e65100] font-black">{daysToBirthday}</span> ngày nữa</p>
                            </div>
                        </div>

                        <div className="mt-4 bg-white border border-primary/10 px-5 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                            <span className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Mã code:</span>
                            <span className="font-black text-primary text-[13px] uppercase tracking-wider">{code}</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="font-headline text-xl font-extrabold text-primary flex items-center gap-2 px-2">
                    <span className="material-symbols-outlined text-lg">dashboard</span>
                    Tổng quan
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    {/* Weight Card */}
                    <div onClick={() => setView('growth')} className="bg-white rounded-[2.5rem] p-5 flex flex-col items-center justify-center gap-2 shadow-sm border border-outline-variant/20 relative cursor-pointer overflow-hidden transition-transform active:scale-95 text-center min-h-[170px]">
                        <span className="material-symbols-outlined text-secondary mb-1 z-10" style={{ fontSize: '32px' }}>weight</span>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest z-10">Cân nặng</span>
                        <div className="flex items-baseline gap-1 z-10 mt-1">
                            <span className="text-[28px] font-black font-headline text-[#334155] tracking-tighter shadow-sm-text">{latestWeightRecord ? latestWeightRecord.weight : '--'}</span>
                            <span className="text-sm font-bold text-[#94a3b8]">kg</span>
                        </div>
                        <div className="mt-2 text-[10px] font-bold z-10">
                            {weightStatus ? (
                                <span className={`px-4 py-1.5 rounded-full ${weightStatus.bg.replace('50', '100')} ${weightStatus.color.replace('500', '600')}`}>
                                    {weightStatus.status}
                                </span>
                            ) : (
                                <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-400">Chưa có dữ liệu</span>
                            )}
                        </div>
                    </div>

                    {/* Height Card */}
                    <div onClick={() => setView('growth')} className="bg-white rounded-[2.5rem] p-5 flex flex-col items-center justify-center gap-2 shadow-sm border border-outline-variant/20 relative cursor-pointer overflow-hidden transition-transform active:scale-95 text-center min-h-[170px]">
                        <span className="material-symbols-outlined text-primary mb-1 z-10" style={{ fontSize: '32px' }}>height</span>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest z-10">Chiều cao</span>
                        <div className="flex items-baseline gap-1 z-10 mt-1">
                            <span className="text-[28px] font-black font-headline text-[#334155] tracking-tighter shadow-sm-text">{latestHeightRecord ? latestHeightRecord.height : '--'}</span>
                            <span className="text-sm font-bold text-[#94a3b8]">cm</span>
                        </div>
                        <div className="mt-2 text-[10px] font-bold z-10">
                            {heightStatus ? (
                                <span className={`px-4 py-1.5 rounded-full ${heightStatus.bg.replace('50', '100')} ${heightStatus.color.replace('500', '600')}`}>
                                    {heightStatus.status}
                                </span>
                            ) : (
                                <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-400">Chưa có dữ liệu</span>
                            )}
                        </div>
                    </div>

                    <div onClick={() => setView('teething')} className="flex flex-col cursor-pointer transition-transform active:scale-95">
                        <TeethingPreview records={teethingRecords} />
                    </div>
                    <div onClick={() => setView('health')} className="flex flex-col cursor-pointer transition-transform active:scale-95">
                        <VaccinePreview records={vaccineRecords} dob={profile.dob} />
                    </div>
                </div>
            </section>

            <DevelopmentSkillsSection ageMonths={ageInfo.totalMonths} ageDays={ageInfo.days} />
        </main>
    );
}

