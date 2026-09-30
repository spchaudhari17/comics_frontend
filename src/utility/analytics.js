import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------ *
 *  Google Analytics (GA4) helpers
 *  gtag.js is loaded in public/index.html (G-FF6FEP7R3R).
 *
 *  - trackEvent(name, params)          -> plain event
 *  - trackClick(name, params)          -> button / link click (adds page + screen info)
 *  - trackClickWithUser(name, params)  -> same, plus app_user_id & user_role
 *                                         (ONLY for the flows where user data is required)
 *  - useScrollDepth(screenName, opts)  -> fires "screen_scroll_depth" at 25/50/75/90/100 %
 *
 *  NOTE: Google Analytics does not allow sending personally identifiable
 *  information (email, name, phone, address). Only the internal user id
 *  and the account type are sent.
 * ------------------------------------------------------------------ */

const isBrowser = () => typeof window !== "undefined";

export const trackEvent = (eventName, params = {}) => {
    if (isBrowser() && window.gtag) {
        window.gtag("event", eventName, params);
    }
};

export const trackPageView = (path) => {
    if (!isBrowser()) {
        return;
    }

    trackEvent("page_view", {
        page_path: path,
        page_location: window.location.href,
        page_title: document.title,
    });
};

/** Logged-in user info that is safe to send to GA (no PII). */
export const getAnalyticsUser = () => {
    if (!isBrowser()) return {};
    try {
        const raw = localStorage.getItem("user");
        const user = raw ? JSON.parse(raw) : null;
        if (!user) return { is_logged_in: false };
        return {
            is_logged_in: true,
            app_user_id: user._id || user.id || "",
            user_role: user.userType || "",
        };
    } catch (e) {
        return { is_logged_in: false };
    }
};

const baseClickParams = (params) => ({
    page_path: isBrowser() ? window.location.pathname : "",
    ...params,
});

/** Button / link click without user data. */
export const trackClick = (eventName, params = {}) => {
    trackEvent(eventName, baseClickParams(params));
};

/** Button click WITH user data (user id + role). */
export const trackClickWithUser = (eventName, params = {}) => {
    trackEvent(eventName, { ...baseClickParams(params), ...getAnalyticsUser() });
};

const SCROLL_THRESHOLDS = [25, 50, 75, 90, 100];

/**
 * Tracks how far a user scrolls on a screen.
 * Sends "screen_scroll_depth" once per threshold (25/50/75/90/100 %).
 *
 * @param {string} screenName            e.g. "comic_screen", "quiz_screen"
 * @param {object} options
 * @param {React.RefObject} [options.containerRef]  scrollable element; window if omitted
 * @param {boolean} [options.enabled=true]          start tracking only when content is ready
 * @param {any} [options.resetKey]                  change this (e.g. comic id) to start counting again
 * @param {object} [options.params]                 extra params sent with every scroll event
 */
export const useScrollDepth = (screenName, options = {}) => {
    const { containerRef = null, enabled = true, resetKey = null, params = {} } = options;
    const paramsRef = useRef(params);
    paramsRef.current = params;

    useEffect(() => {
        if (!isBrowser() || !enabled) return undefined;

        const container = containerRef ? containerRef.current : null;
        if (containerRef && !container) return undefined;

        const target = container || window;
        const fired = new Set();
        let ticking = false;

        const getPercent = () => {
            let scrollTop;
            let scrollable;
            if (container) {
                scrollTop = container.scrollTop;
                scrollable = container.scrollHeight - container.clientHeight;
            } else {
                const doc = document.documentElement;
                scrollTop = window.scrollY || doc.scrollTop;
                scrollable = doc.scrollHeight - window.innerHeight;
            }
            if (scrollable <= 0) return 100;
            return Math.min(100, Math.round((scrollTop / scrollable) * 100));
        };

        const check = () => {
            ticking = false;
            const percent = getPercent();
            SCROLL_THRESHOLDS.forEach((threshold) => {
                if (percent >= threshold && !fired.has(threshold)) {
                    fired.add(threshold);
                    trackEvent("screen_scroll_depth", {
                        screen_name: screenName,
                        percent_scrolled: threshold,
                        page_path: window.location.pathname,
                        ...paramsRef.current,
                    });
                }
            });
        };

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(check);
        };

        target.addEventListener("scroll", onScroll, { passive: true });
        return () => target.removeEventListener("scroll", onScroll);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screenName, enabled, resetKey]);
};
