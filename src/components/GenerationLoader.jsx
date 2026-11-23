import React, { useEffect, useState } from "react";
import "./GenerationLoader.scss";

const MESSAGE_EVERY_MS = 3500;

const formatElapsed = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
};

/**
 * ✨ AI kaam chal raha ho tab ka loading card
 *  - messages: chhote status lines, har kuch second me badalte hain
 *    (pehla sirf ek baar, phir baaki repeat hote hain)
 *  - progress: 0-100 diya to asli progress bar, warna chalta hua (indeterminate) bar
 *  - status: upar wali line se zyada exact info (jaise "3 of 8 pages ready")
 *  - hint: neeche chhota note (kitna time lagta hai)
 */
const GenerationLoader = ({
    icon = "bi-stars",
    title,
    messages = [],
    status,
    progress,
    hint,
    children,
}) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const startedAt = Date.now();
        const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
        return () => clearInterval(timer);
    }, []);

    const step = Math.floor((elapsed * 1000) / MESSAGE_EVERY_MS);
    const message =
        messages.length === 0
            ? ""
            : step < messages.length
                ? messages[step]
                : messages.length > 1
                    ? messages[1 + ((step - messages.length) % (messages.length - 1))]
                    : messages[0];

    const hasProgress = typeof progress === "number" && !Number.isNaN(progress);
    const pct = hasProgress ? Math.max(0, Math.min(100, Math.round(progress))) : null;

    return (
        <div className="generation-loader" role="status" aria-live="polite">
            <div className="generation-loader-head">
                <span className="generation-loader-icon" aria-hidden="true">
                    <i className={`bi ${icon}`}></i>
                </span>
                <div className="generation-loader-text">
                    <div className="generation-loader-title">{title}</div>
                    {message && (
                        <div key={message} className="generation-loader-message">
                            {message}
                        </div>
                    )}
                </div>
                <span className="generation-loader-time" title="Time elapsed">
                    <i className="bi bi-clock me-1" aria-hidden="true"></i>
                    {formatElapsed(elapsed)}
                </span>
            </div>

            <div
                className={`generation-loader-bar ${hasProgress ? "" : "is-indeterminate"}`}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={hasProgress ? pct : undefined}
            >
                <span style={hasProgress ? { width: `${pct}%` } : undefined}></span>
            </div>

            {(status || hasProgress) && (
                <div className="generation-loader-status">
                    <span>{status}</span>
                    {hasProgress && <strong>{pct}%</strong>}
                </div>
            )}

            {children}

            {hint && <div className="generation-loader-hint">{hint}</div>}
        </div>
    );
};

export default GenerationLoader;
