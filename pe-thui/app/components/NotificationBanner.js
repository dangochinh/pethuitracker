'use client';

import { useState, useEffect } from 'react';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationBanner({ code }) {
  const [visible, setVisible] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check support
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    // Already dismissed or denied
    if (localStorage.getItem('pe_thui_noti_dismissed')) return;
    if (Notification.permission === 'denied') return;

    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          if (!sub) setVisible(true); // granted but not subscribed
        });
      });
    } else {
      setVisible(true);
    }
  }, []);

  const hideBanner = () => {
    setFadeOut(true);
    setTimeout(() => setVisible(false), 300);
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        localStorage.setItem('pe_thui_noti_dismissed', '1');
        hideBanner();
        return;
      }

      const reg = await navigator.serviceWorker.ready;

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          subscription: subscription.toJSON()
        })
      });

      localStorage.setItem('pe_thui_noti_dismissed', '1');
      hideBanner();
    } catch (err) {
      console.error('Push subscription error:', err);
      // Still hide even if push fails — permission was granted
      localStorage.setItem('pe_thui_noti_dismissed', '1');
      hideBanner();
    } finally {
      setSubscribing(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pe_thui_noti_dismissed', '1');
    hideBanner();
  };

  if (!visible) return null;

  return (
    <div className={`bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20 rounded-[2rem] p-5 flex items-start gap-4 transition-all duration-300 ${fadeOut ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0 animate-in fade-in slide-in-from-top-4 duration-500'}`}>
      <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-secondary text-2xl">notifications_active</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-on-surface text-sm leading-tight mb-1">Bật thông báo nhắc lịch tiêm?</h4>
        <p className="text-[11px] text-on-surface-variant/70 leading-relaxed mb-3">
          Nhận nhắc nhở trước ngày tiêm để không bỏ lỡ lịch tiêm của bé.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            className="bg-secondary text-white text-[11px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl shadow-sm active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {subscribing ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined text-sm">notifications</span>
            )}
            Bật ngay
          </button>
          <button
            onClick={handleDismiss}
            className="text-on-surface-variant/50 text-[11px] font-bold px-4 py-2.5 rounded-2xl hover:bg-surface-container transition-all"
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
}
