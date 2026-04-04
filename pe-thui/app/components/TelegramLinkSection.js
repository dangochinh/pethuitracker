'use client';

import { useState } from 'react';

export default function TelegramLinkSection({ code, telegramChatId, onSave }) {
  const [unlinking, setUnlinking] = useState(false);
  const isLinked = !!telegramChatId;

  const botUsername = 'pethuitrackerbot';

  const handleOpenTelegram = () => {
    const deepLink = `https://t.me/${botUsername}?start=${code}`;
    window.open(deepLink, '_blank');
  };

  const handleUnlink = async () => {
    setUnlinking(true);
    try {
      await fetch('/api/notifications/telegram', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      onSave?.();
    } catch (e) {
      console.error(e);
    } finally {
      setUnlinking(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1 flex items-center gap-2">
        <span className="text-base">🤖</span>
        Telegram Nhắc Lịch Tiêm
      </label>

      {isLinked ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
            </div>
            <div>
              <p className="text-sm font-bold text-green-800">Đã liên kết Telegram</p>
              <p className="text-[10px] text-green-600/70">ID: {telegramChatId}</p>
            </div>
          </div>
          <button
            onClick={handleUnlink}
            disabled={unlinking}
            className="text-[10px] font-bold text-red-400 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-all"
          >
            {unlinking ? '...' : 'Hủy'}
          </button>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
          <p className="text-[11px] text-blue-800/80 leading-relaxed">
            Liên kết Telegram để nhận nhắc lịch tiêm qua tin nhắn. Miễn phí!
          </p>
          <button
            onClick={handleOpenTelegram}
            className="w-full bg-[#0088cc] text-white font-bold text-[11px] uppercase tracking-widest py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Liên kết Telegram
          </button>
          <p className="text-[9px] text-blue-600/50 text-center">
            Sẽ mở Telegram và tự động gửi lệnh liên kết
          </p>
        </div>
      )}
    </div>
  );
}
