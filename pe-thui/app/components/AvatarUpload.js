'use client';

import { useState, useRef } from 'react';
import { compressAndCropImage } from '../lib/image-utils';

export default function AvatarUpload({ value, onChange, disabled = false }) {
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset file input so user can re-select the same file if needed
        e.target.value = '';

        setError('');
        setLoading(true);

        try {
            const dataUri = await compressAndCropImage(file, 400, 0.85);
            onChange(dataUri);
        } catch (err) {
            console.error('Error processing avatar image:', err);
            setError(err.message || 'Không thể xử lý ảnh này.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        setError('');
        onChange('');
    };

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1 block">
                Ảnh đại diện (Avatar)
            </label>

            <div className="flex items-center gap-4 bg-surface-container-lowest/70 p-3.5 rounded-2xl border border-outline-variant/30">
                {/* Circular Preview with Camera Badge */}
                <div
                    onClick={() => !disabled && !loading && fileInputRef.current?.click()}
                    className={`relative w-20 h-20 shrink-0 rounded-full border-2 border-primary/20 shadow-sm overflow-hidden flex items-center justify-center bg-surface-container-high transition-transform ${
                        disabled || loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95 group'
                    }`}
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center text-primary">
                            <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                        </div>
                    ) : value ? (
                        <img
                            src={value}
                            alt="Avatar preview"
                            className="w-full h-full object-cover rounded-full"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary/60">
                            <span className="material-symbols-outlined text-3xl">child_care</span>
                        </div>
                    )}

                    {/* Camera Badge */}
                    {!loading && !disabled && (
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md border-2 border-surface group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                            <span className="material-symbols-outlined text-[13px]">photo_camera</span>
                        </div>
                    )}
                </div>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={disabled || loading}
                />

                {/* Actions & Instructions */}
                <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled || loading}
                            className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-sm">
                                {value ? 'sync' : 'upload'}
                            </span>
                            <span>{value ? 'Đổi ảnh khác' : 'Tải ảnh lên'}</span>
                        </button>

                        {value && !disabled && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="px-2.5 py-1.5 bg-error/10 hover:bg-error/20 text-error font-bold text-xs rounded-xl transition-all flex items-center gap-1 active:scale-95"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                                <span>Xoá</span>
                            </button>
                        )}
                    </div>

                    <p className="text-[10px] text-on-surface-variant/60 leading-tight">
                        Chọn ảnh từ máy (JPG, PNG, WEBP). Ảnh được tối ưu tự động và lưu an toàn vào cơ sở dữ liệu.
                    </p>

                    {error && (
                        <p className="text-[10px] text-error font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">warning</span>
                            <span>{error}</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
