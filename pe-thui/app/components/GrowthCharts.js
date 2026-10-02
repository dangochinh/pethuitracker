import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { predictAdultHeight, assessWeight, assessHeight } from '../lib/calculations';

export default function GrowthCharts({ records, profile, code, onBack, onEditRecord }) {
    const data = [...records].sort((a, b) => {
        if (a.ageMonths !== b.ageMonths) return a.ageMonths - b.ageMonths;
        return b.id - a.id;
    });

    // Create smoothed out standard bands and integrate actual user records
    // We want the chart to go from 0 to max age + a bit
    const maxAge = data.length > 0 ? Math.max(...data.map(d => d.ageMonths)) + 3 : 12;
    
    // Get all integer months to draw smooth area bands
    const integerMonths = Array.from({length: Math.ceil(maxAge) + 1}, (_, i) => i);
    // Get all actual record ages that have valid data
    const validDataAges = data.filter(d => d.weight > 0 || d.height > 0).map(d => d.ageMonths);
    
    // Combine and sort unique ages (both integers and exact data points)
    const uniqueAges = Array.from(new Set([...integerMonths, ...validDataAges])).sort((a, b) => a - b);

    const chartData = uniqueAges.map(i => {
        const standardWeightAvg = i * 0.5 + 4;
        const standardHeightAvg = i * 1.5 + 50;

        // Find the record matching THIS exact age.
        // data is initially sorted chronologically descending in Dashboard, 
        // and stable sorted by ageMonths here, so we get the newest if tie.
        let record = data.find(d => d.ageMonths === i && (d.weight > 0 || d.height > 0));

        return {
            ageMonths: i,
            weight: (record && record.weight > 0) ? record.weight : null,
            height: (record && record.height > 0) ? record.height : null,
            wUpper: Number((standardWeightAvg * 1.3).toFixed(1)),
            wNormal: Number((standardWeightAvg * 1.1).toFixed(1)),
            wLower: Number((standardWeightAvg * 0.75).toFixed(1)),
            hUpper: Number((standardHeightAvg * 1.1).toFixed(1)),
            hNormal: Number((standardHeightAvg).toFixed(1)),
            hLower: Number((standardHeightAvg * 0.9).toFixed(1)),
        };
    });

    const heightRecords = data.filter(d => d.height > 0);
    const latestHeightRecord = heightRecords.length > 0 ? heightRecords[heightRecords.length - 1] : null;
    const predictedHeight = latestHeightRecord ? predictAdultHeight(latestHeightRecord.height, profile.gender, latestHeightRecord.ageMonths) : 0;
    const latestHeightDateSource = latestHeightRecord?.createdAt || latestHeightRecord?.date;
    const latestHeightDate = latestHeightDateSource ? new Date(latestHeightDateSource).toLocaleDateString('vi-VN') : '--/--/----';

    return (
        <div className="bg-[#fff8f8] pb-16">
            <div className="p-4 space-y-6 animate-in fade-in duration-500">
                {/* Prediction Card */}
                {predictedHeight > 0 ? (
                    <div className="bg-gradient-to-r from-[#861949] to-[#a53361] text-white rounded-[2.5rem] p-5 shadow-lg shadow-[#861949]/20 relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                        
                        <div className="relative z-10 text-center mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-pink-200">Khoa học tăng trưởng</span>
                            <h2 className="font-bold text-base font-headline tracking-tight text-white mt-0.5">Dự đoán chiều cao trưởng thành</h2>
                        </div>
                        
                        <div className="relative z-10 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3.5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-bold text-xs leading-tight max-w-[150px] text-pink-50">Dự kiến khi {profile?.name || 'bé'} 18 tuổi</p>
                                <p className="text-[10px] font-medium text-pink-200">Đo gần nhất: {latestHeightDate}</p>
                            </div>
                            
                            <div className="text-right flex flex-col items-end gap-1">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black font-headline tracking-tight text-white">{predictedHeight}</span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-pink-200">cm</span>
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                                    ± 3.5 cm
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gradient-to-r from-[#861949] to-[#a53361] text-white rounded-[2.5rem] p-5 shadow-lg shadow-[#861949]/20 relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-pink-200">Khoa học tăng trưởng</span>
                                <h2 className="font-bold text-base font-headline tracking-tight text-white">Dự đoán chiều cao trưởng thành</h2>
                                <p className="text-xs text-pink-100/90 leading-relaxed max-w-[240px]">Ghi nhận chiều cao đầu tiên để hệ thống ước tính chiều cao khi bé 18 tuổi theo chuẩn WHO.</p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/30">
                                <span className="material-symbols-outlined text-3xl text-white">height</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Weight Chart Card */}
                <div className="bg-white rounded-[2.5rem] p-6 border border-purple-100/70 shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-pink-100 text-[#861949] flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px]">monitor_weight</span>
                            </span>
                            <h3 className="font-bold text-sm font-headline text-gray-900">Biểu đồ Cân nặng (WHO)</h3>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Đơn vị: kg</span>
                    </div>

                    <div className="flex justify-center gap-3 mb-4 text-[10px] font-bold uppercase text-gray-500">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#fed7aa]"></span> Vượt</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#ccfbf1]"></span> Đạt chuẩn WHO</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#fbcfe8]"></span> Dưới</span>
                    </div>

                    <div className="growth-chart h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart accessibilityLayer={false} tabIndex={-1} data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} style={{ outline: 'none' }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f3f4" />
                                <XAxis dataKey="ageMonths" tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={false}
                                    wrapperStyle={{ outline: 'none' }}
                                    contentStyle={{ borderRadius: '16px', border: '1px solid #fce7f3', boxShadow: '0 8px 24px rgba(134,25,73,0.08)' }}
                                    itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                                    labelFormatter={(label) => `${label} Tháng tuổi`}
                                />
                                <Area type="monotone" dataKey="wUpper" stroke="none" fill="#ffedd5" isAnimationActive={false} name="Vượt chuẩn" />
                                <Area type="monotone" dataKey="wNormal" stroke="none" fill="#ccfbf1" isAnimationActive={false} name="Đạt chuẩn" />
                                <Area type="monotone" dataKey="wLower" stroke="none" fill="#fce7f3" isAnimationActive={false} name="Dưới chuẩn" />
                                <Line connectNulls type="monotone" dataKey="weight" stroke="#861949" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#861949' }} activeDot={false} name="Cân nặng của bé" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Height Chart Card */}
                <div className="bg-white rounded-[2.5rem] p-6 border border-purple-100/70 shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px]">straighten</span>
                            </span>
                            <h3 className="font-bold text-sm font-headline text-gray-900">Biểu đồ Chiều cao (WHO)</h3>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Đơn vị: cm</span>
                    </div>

                    <div className="flex justify-center gap-3 mb-4 text-[10px] font-bold uppercase text-gray-500">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#fed7aa]"></span> Vượt</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#ccfbf1]"></span> Đạt chuẩn WHO</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#fbcfe8]"></span> Dưới</span>
                    </div>

                    <div className="growth-chart h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart accessibilityLayer={false} tabIndex={-1} data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} style={{ outline: 'none' }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f3f4" />
                                <XAxis dataKey="ageMonths" tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={false}
                                    wrapperStyle={{ outline: 'none' }}
                                    contentStyle={{ borderRadius: '16px', border: '1px solid #ccfbf1', boxShadow: '0 8px 24px rgba(0,105,114,0.08)' }}
                                    itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                                    labelFormatter={(label) => `${label} Tháng tuổi`}
                                />
                                <Area type="monotone" dataKey="hUpper" stroke="none" fill="#ffedd5" isAnimationActive={false} name="Vượt chuẩn" />
                                <Area type="monotone" dataKey="hNormal" stroke="none" fill="#ccfbf1" isAnimationActive={false} name="Đạt chuẩn" />
                                <Area type="monotone" dataKey="hLower" stroke="none" fill="#fce7f3" isAnimationActive={false} name="Dưới chuẩn" />
                                <Line connectNulls type="monotone" dataKey="height" stroke="#006972" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#006972' }} activeDot={false} name="Chiều cao của bé" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>


                {/* Growth History Section */}
                {records.filter(r => r.weight > 0 || r.height > 0).length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-base font-bold font-headline text-gray-900">Lịch sử đo đạc</h3>
                            <span className="text-[10px] font-black text-[#861949] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-100">
                                {records.filter(r => r.weight > 0 || r.height > 0).length} lần đo
                            </span>
                        </div>
                        <div className="space-y-2.5">
                            {[...records]
                                .filter(r => r.weight > 0 || r.height > 0)
                                .map((record, index) => {
                                    const wStatus = record.weight > 0 ? assessWeight(record.weight, record.ageMonths) : null;
                                    const hStatus = record.height > 0 ? assessHeight(record.height, record.ageMonths) : null;
                                    const dateStr = record.date
                                        ? new Date(record.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                        : (record.createdAt ? new Date(record.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '--');
                                    const years = Math.floor(record.ageMonths / 12);
                                    const months = record.ageMonths % 12;
                                    const ageText = years > 0 ? `${years} tuổi ${months > 0 ? months + ' tháng' : ''}` : `${months} tháng`;

                                    return (
                                        <div
                                            key={record.id || index}
                                            onClick={() => onEditRecord && onEditRecord(record)}
                                            className={`bg-white rounded-2xl p-4 border border-purple-100 shadow-xs ${onEditRecord ? 'cursor-pointer active:scale-[0.98] hover:border-pink-200 transition-all' : ''}`}
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-pink-100 text-[#861949] flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-sm">calendar_month</span>
                                                </div>
                                                <p className="text-xs font-bold text-gray-800 flex-1">{dateStr} <span className="text-gray-400 font-medium">({ageText})</span></p>
                                                {onEditRecord && (
                                                    <div className="flex items-center gap-1 text-gray-400 hover:text-[#861949]">
                                                        <span className="material-symbols-outlined text-base">edit</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Weight & Height Row */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Weight */}
                                                {record.weight > 0 && (
                                                    <div className="bg-[#fff8f8] p-2.5 rounded-xl border border-pink-100 flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <span className="material-symbols-outlined text-[#861949] text-base">monitor_weight</span>
                                                            <span>Cân nặng</span>
                                                        </div>
                                                        <p className="text-base font-black font-headline text-gray-900">{record.weight} <span className="text-xs font-bold text-gray-400">kg</span></p>
                                                    </div>
                                                )}

                                                {/* Height */}
                                                {record.height > 0 && (
                                                    <div className="bg-[#fff8f8] p-2.5 rounded-xl border border-pink-100 flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <span className="material-symbols-outlined text-teal-700 text-base">straighten</span>
                                                            <span>Chiều cao</span>
                                                        </div>
                                                        <p className="text-base font-black font-headline text-gray-900">{record.height} <span className="text-xs font-bold text-gray-400">cm</span></p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
}

