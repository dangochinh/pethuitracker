/**
 * Reads an image File from user input, center-crops it to a square,
 * resizes to maxDimension x maxDimension, and exports as a compressed data URI.
 *
 * @param {File} file
 * @param {number} maxDimension (default: 400px)
 * @param {number} quality (default: 0.85)
 * @returns {Promise<string>} Base64 Data URI (e.g. data:image/webp;base64,...)
 */
export async function compressAndCropImage(file, maxDimension = 400, quality = 0.85) {
    if (!file) throw new Error('Không tìm thấy tệp ảnh.');
    if (!file.type.startsWith('image/')) {
        throw new Error('Vui lòng chọn tệp hình ảnh (JPG, PNG, WEBP, GIF...).');
    }

    // Limit raw upload size before processing to 15MB to prevent memory exhaustion on mobile
    if (file.size > 15 * 1024 * 1024) {
        throw new Error('Tệp ảnh quá lớn (vui lòng chọn ảnh dưới 15MB).');
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Lỗi khi đọc file ảnh.'));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('Không thể tải hoặc xử lý tệp ảnh này.'));
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = maxDimension;
                    canvas.height = maxDimension;
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        return reject(new Error('Không thể khởi tạo bộ xử lý đồ họa (Canvas context).'));
                    }

                    // Center-crop to 1:1 aspect ratio
                    const minSide = Math.min(img.width, img.height);
                    const sx = (img.width - minSide) / 2;
                    const sy = (img.height - minSide) / 2;

                    // High quality smoothing
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, maxDimension, maxDimension);

                    // Prefer webp, fallback to jpeg
                    let dataUrl = canvas.toDataURL('image/webp', quality);
                    if (!dataUrl || !dataUrl.startsWith('data:image/webp')) {
                        dataUrl = canvas.toDataURL('image/jpeg', quality);
                    }

                    resolve(dataUrl);
                } catch (err) {
                    reject(err);
                }
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Reads an image File, resizes to maxDimension on its longest edge while preserving aspect ratio,
 * and exports as a compressed data URI. Used for general photo uploads.
 *
 * @param {File} file
 * @param {number} maxDimension (default: 800px)
 * @param {number} quality (default: 0.80)
 * @returns {Promise<string>} Base64 Data URI
 */
export async function compressImage(file, maxDimension = 800, quality = 0.80) {
    if (!file) throw new Error('Không tìm thấy tệp ảnh.');
    if (!file.type.startsWith('image/')) {
        throw new Error('Vui lòng chọn tệp hình ảnh.');
    }

    if (file.size > 20 * 1024 * 1024) {
        throw new Error('Tệp ảnh quá lớn (vui lòng chọn ảnh dưới 20MB).');
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Lỗi khi đọc file ảnh.'));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('Không thể tải hoặc xử lý tệp ảnh này.'));
            img.onload = () => {
                try {
                    let width = img.width;
                    let height = img.height;

                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = Math.round((height * maxDimension) / width);
                            width = maxDimension;
                        } else {
                            width = Math.round((width * maxDimension) / height);
                            height = maxDimension;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');

                    if (!ctx) return reject(new Error('Canvas context not available.'));

                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    ctx.drawImage(img, 0, 0, width, height);

                    let dataUrl = canvas.toDataURL('image/webp', quality);
                    if (!dataUrl || !dataUrl.startsWith('data:image/webp')) {
                        dataUrl = canvas.toDataURL('image/jpeg', quality);
                    }

                    resolve(dataUrl);
                } catch (err) {
                    reject(err);
                }
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}
