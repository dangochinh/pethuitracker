'use client';

import { useEffect, useRef } from 'react';

/**
 * Intercepts the browser / hardware back button while the component is mounted.
 *
 * Strategy:
 *  1. On mount, push a "guard" entry into the browser history so the first
 *     back press fires `popstate` instead of navigating away from the page.
 *  2. Each time `popstate` fires, call `onBack()` then re-push the guard so
 *     the *next* back press is also intercepted.
 *  3. On unmount the listener is cleaned up.  The leftover guard entry stays
 *     in history but causes no visible side-effect (same URL, no navigation).
 *
 * @param {() => void} onBack  Called every time the back button is pressed.
 */
export default function useBackHandler(onBack) {
    // Keep a stable ref to the latest callback so we never need to re-register
    // the event listener when the callback identity changes between renders.
    const callbackRef = useRef(onBack);
    useEffect(() => {
        callbackRef.current = onBack;
    });

    useEffect(() => {
        // Insert a guard entry.  The URL stays the same; only the state object
        // changes so the browser treats this as a new history entry.
        history.pushState({ __peThuitBackGuard: true }, '');

        const handlePopState = () => {
            callbackRef.current();
            // Re-push so the next back press is also intercepted.
            history.pushState({ __peThuitBackGuard: true }, '');
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []); // Run once on mount only.
}
