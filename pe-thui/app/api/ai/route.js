import { getFeedings, getSleeps, getDiapers } from '../../lib/db';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        if (!code) return NextResponse.json({ success: false, error: 'Code required' }, { status: 400 });

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ success: false, error: 'Missing GEMINI_API_KEY environment variable.' }, { status: 500 });
        }

        // Fetch recent data (e.g. past 3 days)
        const d = new Date();
        d.setDate(d.getDate() - 3);
        const sinceDate = d.toISOString();

        const [feedings, sleeps, diapers] = await Promise.all([
            getFeedings(code),
            getSleeps(code),
            getDiapers(code)
        ]);

        // We only take the most recent data to avoid huge context sizes
        const recentFeedings = feedings.filter(f => f.startTime > sinceDate).slice(0, 20);
        const recentSleeps = sleeps.filter(s => s.startTime > sinceDate).slice(0, 10);
        const recentDiapers = diapers.filter(d => d.time > sinceDate).slice(0, 15);

        const prompt = `
Bạn là một chuyên gia nhi khoa và bác sĩ tư vấn chăm sóc trẻ sơ sinh vui vẻ, thân thiện. 
Dưới đây là dữ liệu sinh hoạt của một em bé trong 3 ngày qua (bú, ngủ, tã):

- BÚ: ${JSON.stringify(recentFeedings)}
- NGỦ: ${JSON.stringify(recentSleeps)}
- TÃ: ${JSON.stringify(recentDiapers)}

Hãy phân tích dữ liệu này và đưa ra 3-4 nhận xét/lời khuyên (insights) thật ngắn gọn, dễ hiểu, theo ngôn ngữ tiếng Việt thân mật dành cho mẹ bỉm sữa.
Vd: "Bé có vẻ đang thức đêm hơi nhiều, mẹ thử...", "Lượng tã ướt của bé rất tốt, mẹ cứ yên tâm nhé!". 
Trả về dưới dạng một chuỗi văn bản (markdown), có thể dùng emoji cho sinh động, không dài dòng giải thích.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return NextResponse.json({ success: true, insight: response.text });
    } catch (err) {
        console.error('API Error in /api/ai:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
