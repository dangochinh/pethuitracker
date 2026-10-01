import { getFirestore } from '../app/lib/firestore.js';

async function migrateAvatars() {
    console.log('--- BẮT ĐẦU CHUYỂN ĐỔI AVATAR SANG DATABASE (BASE64) ---');
    const db = getFirestore();
    const snapshot = await db.collection('babies').get();

    for (const doc of snapshot.docs) {
        const baby = doc.data();
        const code = doc.id;
        const avatar = baby.avatar || '';

        console.log(`\nKiểm tra bé [${code}] - "${baby.name}":`);

        if (!avatar) {
            console.log('  -> Không có avatar. Bỏ qua.');
            continue;
        }

        if (avatar.startsWith('data:image/')) {
            console.log(`  -> Đã lưu dưới dạng Base64 data URI (${avatar.length} ký tự). Bỏ qua.`);
            continue;
        }

        if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
            console.log(`  -> Tìm thấy URL: ${avatar}`);
            try {
                const res = await fetch(avatar, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (!res.ok) {
                    throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
                }

                const arrayBuffer = await res.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                let mimeType = res.headers.get('content-type') || 'image/jpeg';
                // Clean up mimeType if it includes charset
                mimeType = mimeType.split(';')[0].trim();

                const base64Str = buffer.toString('base64');
                const dataUri = `data:${mimeType};base64,${base64Str}`;

                console.log(`  -> Tải thành công: ${(buffer.length / 1024).toFixed(1)} KB (${mimeType})`);
                console.log(`  -> Chuyển thành Data URI (${dataUri.length} chars). Đang lưu vào DB...`);

                await db.collection('babies').doc(code).update({
                    avatar: dataUri,
                    updatedAt: new Date(),
                });

                console.log(`  -> [HOÀN TẤT] Đã lưu avatar trực tiếp vào DB cho bé [${code}]!`);
            } catch (err) {
                console.error(`  -> [LỖI] Không thể tải avatar từ URL: ${err.message}`);
            }
        } else {
            console.log(`  -> Avatar giá trị không hợp lệ: "${avatar}". Reset về rỗng.`);
            await db.collection('babies').doc(code).update({
                avatar: '',
                updatedAt: new Date(),
            });
        }
    }

    console.log('\n--- TẤT CẢ HOÀN TẤT ---');
}

migrateAvatars()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Migration failed:', err);
        process.exit(1);
    });
