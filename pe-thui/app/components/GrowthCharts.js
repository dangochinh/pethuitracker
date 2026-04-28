import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { predictAdultHeight, assessWeight, assessHeight } from '../lib/calculations';

export default function GrowthCharts({ records, profile, onBack }) {
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
        <div className="bg-[#fff5f8] pb-8">
            <div className="p-4 space-y-8 animate-in fade-in duration-500">
                {/* Prediction Card */}
                {predictedHeight > 0 && (
                    <div className="bg-[#00d4e3] text-white rounded-[2rem] p-4 shadow-lg shadow-cyan-500/20 relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                        
                        <div className="relative z-10 text-center mb-3 mt-1">
                            <h2 className="font-bold text-[13px] uppercase tracking-wider shadow-sm-text">Dự đoán chiều cao trưởng thành</h2>
                        </div>
                        
                        <div className="relative z-10 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3.5 flex items-center justify-between">
                            <div className="space-y-1.5">
                                <p className="font-extrabold text-sm leading-tight max-w-[140px] shadow-sm-text">Chiều cao dự kiến trưởng thành của bé</p>
                                <p className="text-[10px] font-medium opacity-90">Ngày đo: {latestHeightDate}</p>
                            </div>
                            
                            <div className="text-right flex flex-col items-end gap-1.5">
                                <div className="flex items-baseline gap-1 shadow-sm-text">
                                    <span className="text-[40px] leading-none font-black font-headline tracking-tighter">{predictedHeight}</span>
                                    <span className="text-sm font-bold uppercase tracking-widest opacity-90">cm</span>
                                </div>
                                <button className="bg-white text-[#00bcd4] font-black uppercase tracking-widest text-[10px] px-5 py-2 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-md mt-1">
                                    Tính lại
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="cute-card rounded-[2.5rem] p-6 bg-white border border-pink-100 shadow-sm">
                    <h2 className="text-center font-extrabold text-gray-800 mb-6 uppercase tracking-wider text-sm">BIỂU ĐỒ CÂN NẶNG</h2>
                    <div className="flex justify-center gap-4 mb-6 text-[10px] font-bold uppercase text-gray-500">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#ffe0b2]"></span> Vượt chuẩn</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#b2ebf2]"></span> Đạt chuẩn</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#f8bbd0]"></span> Dưới chuẩn</span>
                    </div>
                    <div className="growth-chart h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart accessibilityLayer={false} tabIndex={-1} data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} style={{ outline: 'none' }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="ageMonths" tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={false}
                                    wrapperStyle={{ outline: 'none' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                    labelFormatter={(label) => `${label} Tháng`}
                                />
                                <Area type="monotone" dataKey="wUpper" stroke="none" fill="#ffe0b2" isAnimationActive={false} name="Vượt chuẩn" />
                                <Area type="monotone" dataKey="wNormal" stroke="none" fill="#b2ebf2" isAnimationActive={false} name="Đạt chuẩn" />
                                <Area type="monotone" dataKey="wLower" stroke="none" fill="#f8bbd0" isAnimationActive={false} name="Dưới chuẩn" />
                                <Line connectNulls type="monotone" dataKey="weight" stroke="#00bcd4" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={false} name="Cân nặng của con" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="cute-card rounded-[2.5rem] p-6 bg-white border border-pink-100 shadow-sm">
                    <h2 className="text-center font-extrabold text-gray-800 mb-6 uppercase tracking-wider text-sm">BIỂU ĐỒ CHIỀU CAO</h2>
                    <div className="flex justify-center gap-4 mb-6 text-[10px] font-bold uppercase text-gray-500">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#ffe0b2]"></span> Vượt chuẩn</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#b2ebf2]"></span> Đạt chuẩn</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#f8bbd0]"></span> Dưới chuẩn</span>
                    </div>
                    <div className="growth-chart h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart accessibilityLayer={false} tabIndex={-1} data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} style={{ outline: 'none' }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="ageMonths" tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={false}
                                    wrapperStyle={{ outline: 'none' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                    labelFormatter={(label) => `${label} Tháng`}
                                />
                                <Area type="monotone" dataKey="hUpper" stroke="none" fill="#ffe0b2" isAnimationActive={false} name="Vượt chuẩn" />
                                <Area type="monotone" dataKey="hNormal" stroke="none" fill="#b2ebf2" isAnimationActive={false} name="Đạt chuẩn" />
                                <Area type="monotone" dataKey="hLower" stroke="none" fill="#f8bbd0" isAnimationActive={false} name="Dưới chuẩn" />
                                <Line connectNulls type="monotone" dataKey="height" stroke="#e91e63" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={false} name="Chiều cao của con" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Growth History Section */}
                {records.filter(r => r.weight > 0 || r.height > 0).length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-headline font-black text-primary">Lịch sử phát triển</h3>
                            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{records.filter(r => r.weight > 0 || r.height > 0).length} lần đo</span>
                        </div>
                        <div className="space-y-2">
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

                                    // Extract raw color hex from status for inline styling
                                    const getStatusColor = (status) => {
                                        if (!status) return '#9ca3af';
                                        if (status.status === 'Vượt chuẩn') return '#e65100';
                                        if (status.status === 'Dưới chuẩn') return '#c2185b';
                                        return '#00838f';
                                    };

                                    return (
                                        <div
                                            key={record.id || index}
                                            className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm"
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-primary text-sm">calendar_month</span>
                                                </div>
                                                <p className="text-xs font-bold text-on-surface">{dateStr} <span className="text-on-surface-variant/50 font-semibold">({ageText})</span></p>
                                            </div>

                                            {/* Weight & Height Row */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Weight */}
                                                {record.weight > 0 && (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-secondary text-base">weight</span>
                                                        <p className="text-lg font-black" style={{ color: getStatusColor(wStatus) }}>{record.weight} <span className="text-xs font-bold text-on-surface-variant/30">kg</span></p>
                                                    </div>
                                                )}

                                                {/* Height */}
                                                {record.height > 0 && (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-primary text-base">height</span>
                                                        <p className="text-lg font-black" style={{ color: getStatusColor(hStatus) }}>{record.height} <span className="text-xs font-bold text-on-surface-variant/30">cm</span></p>
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

