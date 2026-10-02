'use client';

import { useEffect, useRef, useState } from 'react';

export default function FlowerCelebration({ 
    name = 'Bé Yêu', 
    type = 'baby_born', // 'baby_born' hoặc 'switch_profile'
    duration = 5500,
    onFinish 
}) {
    const canvasRef = useRef(null);
    const [showBanner, setShowBanner] = useState(true);

    useEffect(() => {
        // Haptic feedback nhẹ nhàng
        if (typeof window !== 'undefined' && window.navigator?.vibrate) {
            try { window.navigator.vibrate([40, 60, 40, 80, 50]); } catch (e) {}
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Bảng màu hoa & ruy băng chuẩn Stitch
        const colors = [
            '#861949', // Rosewood
            '#a53361', // Soft Crimson
            '#f472b6', // Sakura Pink
            '#fb7185', // Rose Pink
            '#fbcfe8', // Pale Sakura
            '#006972', // Deep Teal
            '#2dd4bf', // Mint Teal
            '#f59e0b', // Sunflower Gold
            '#fbbf24', // Warm Amber
            '#c084fc', // Lavender
            '#fff1f2'  // Snow White
        ];

        // Tạo danh sách các loại hạt (Petal, Flower, Heart, Star, Ribbon)
        const particles = [];
        const totalParticles = 120;

        // Hàm tạo 1 hạt hoa / pháo giấy
        const createParticle = (isInitialBlast = false) => {
            const side = Math.random() < 0.5 ? 'left' : 'right';
            const startX = isInitialBlast 
                ? (side === 'left' ? window.innerWidth * 0.15 : window.innerWidth * 0.85)
                : Math.random() * window.innerWidth;
            const startY = isInitialBlast ? window.innerHeight * 0.85 : -20;

            const speedY = isInitialBlast 
                ? -(Math.random() * 12 + 10) 
                : Math.random() * 2.5 + 1.2;
            const speedX = isInitialBlast
                ? (side === 'left' ? Math.random() * 8 + 2 : -(Math.random() * 8 + 2))
                : (Math.random() - 0.5) * 2;

            const types = ['petal', 'flower', 'heart', 'star', 'ribbon'];
            const chosenType = types[Math.floor(Math.random() * types.length)];

            return {
                x: startX,
                y: startY,
                vx: speedX,
                vy: speedY,
                gravity: isInitialBlast ? 0.35 : 0.05,
                friction: 0.985,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 12 + 10,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.08,
                tilt: Math.random() * Math.PI,
                tiltSpeed: Math.random() * 0.08 + 0.03,
                type: chosenType,
                opacity: 1,
                decay: Math.random() * 0.003 + 0.001
            };
        };

        // Bắn tung 80 hạt ban đầu từ 2 góc
        for (let i = 0; i < 80; i++) {
            particles.push(createParticle(true));
        }

        // Tạo thêm hạt rơi lả lướt từ trên xuống
        for (let i = 0; i < totalParticles - 80; i++) {
            particles.push(createParticle(false));
        }

        // Vẽ hoa 5 cánh
        const drawFlower = (x, y, size, color, rot) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);
            ctx.fillStyle = color;
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.rotate((Math.PI * 2) / 5);
                ctx.ellipse(size * 0.6, 0, size * 0.5, size * 0.3, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            // Nhụy hoa
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
            ctx.fillStyle = '#fef08a';
            ctx.fill();
            ctx.restore();
        };

        // Vẽ cánh hoa anh đào (Sakura Petal)
        const drawPetal = (x, y, size, color, rot, tilt) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);
            ctx.scale(Math.cos(tilt), 1);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.bezierCurveTo(size * 0.6, -size * 0.6, size * 0.6, size * 0.4, 0, size);
            ctx.bezierCurveTo(-size * 0.6, size * 0.4, -size * 0.6, -size * 0.6, 0, -size);
            ctx.fill();
            ctx.restore();
        };

        // Vẽ trái tim
        const drawHeart = (x, y, size, color, rot) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);
            ctx.fillStyle = color;
            ctx.beginPath();
            const topCurveHeight = size * 0.3;
            ctx.moveTo(0, topCurveHeight);
            ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
            ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size);
            ctx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
            ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
            ctx.fill();
            ctx.restore();
        };

        // Vẽ ngôi sao
        const drawStar = (x, y, size, color, rot) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);
            ctx.fillStyle = color;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * size, -Math.sin(((18 + i * 72) * Math.PI) / 180) * size);
                ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * (size / 2), -Math.sin(((54 + i * 72) * Math.PI) / 180) * (size / 2));
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        };

        // Vẽ ruy băng xoắn
        const drawRibbon = (x, y, size, color, rot, tilt) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);
            ctx.fillStyle = color;
            ctx.fillRect(-size * 0.4, -size * 0.15, size * 0.8 * Math.cos(tilt), size * 0.3);
            ctx.restore();
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.vx *= p.friction;
                p.rotation += p.rotationSpeed;
                p.tilt += p.tiltSpeed;
                p.opacity -= p.decay;

                if (p.opacity <= 0) {
                    p.opacity = 0;
                    continue;
                }

                ctx.globalAlpha = Math.max(0, p.opacity);

                switch (p.type) {
                    case 'flower':
                        drawFlower(p.x, p.y, p.size, p.color, p.rotation);
                        break;
                    case 'heart':
                        drawHeart(p.x, p.y, p.size, p.color, p.rotation);
                        break;
                    case 'star':
                        drawStar(p.x, p.y, p.size, p.color, p.rotation);
                        break;
                    case 'ribbon':
                        drawRibbon(p.x, p.y, p.size, p.color, p.rotation, p.tilt);
                        break;
                    case 'petal':
                    default:
                        drawPetal(p.x, p.y, p.size, p.color, p.rotation, p.tilt);
                        break;
                }
            }

            ctx.globalAlpha = 1;

            // Tiếp tục vòng lặp nếu còn hạt
            const activeParticles = particles.some(p => p.opacity > 0 && p.y < canvas.height + 50);
            if (activeParticles) {
                animationFrameId = requestAnimationFrame(render);
            }
        };

        render();

        const bannerTimer = setTimeout(() => {
            setShowBanner(false);
        }, duration - 1200);

        const endTimer = setTimeout(() => {
            if (onFinish) onFinish();
        }, duration);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
            clearTimeout(bannerTimer);
            clearTimeout(endTimer);
        };
    }, [duration, onFinish]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[160] flex flex-col items-center justify-start pt-16 px-4">
            {/* Canvas pháo hoa / cánh hoa tung bay */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

            {/* Popup Banner chúc mừng Stitch Keepsake */}
            {showBanner && (
                <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-[2.5rem] p-5 sm:p-6 shadow-[0_20px_60px_rgba(134,25,73,0.25)] border-2 border-pink-200/90 max-w-sm w-full text-center flex flex-col items-center gap-2.5 animate-bounce-in relative overflow-hidden transition-all duration-500">
                    {/* Soft background glow */}
                    <div className="absolute -top-10 -right-10 w-28 h-28 bg-pink-200/50 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-amber-200/40 rounded-full blur-2xl pointer-events-none"></div>

                    {/* Floating Icons */}
                    <div className="flex items-center justify-center gap-1.5 text-2xl animate-pulse">
                        <span>🌸</span>
                        <span>✨</span>
                        <span className="text-3xl">🎉</span>
                        <span>✨</span>
                        <span>🌸</span>
                    </div>

                    <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#861949] bg-pink-100/80 px-3 py-0.5 rounded-full border border-pink-200">
                            {type === 'baby_born' ? 'Chào Đời Bình An' : 'Chuyển Đổi Hồ Sơ'}
                        </span>
                        <h3 className="font-headline font-black text-xl text-gray-900 mt-1">
                            {type === 'baby_born' ? `Chúc Mừng Bé ${name}!` : `Chào Mừng ${name}!`}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed px-2">
                            {type === 'baby_born' 
                                ? 'Chào mừng thiên thần nhỏ đến với thế giới! Chúc con hay ăn chóng lớn, bình an và ngập tràn yêu thương.'
                                : 'Đã chuyển thành công sang hồ sơ bé yêu. Sẵn sàng theo dõi nhật ký phát triển!'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowBanner(false)}
                        className="mt-1 px-5 py-2 rounded-full bg-gradient-to-r from-[#861949] to-[#a53361] hover:opacity-95 text-white font-headline font-bold text-xs shadow-md shadow-[#861949]/20 transition-all active:scale-95 cursor-pointer"
                    >
                        Bắt đầu hành trình cùng con 🌸
                    </button>
                </div>
            )}
        </div>
    );
}
