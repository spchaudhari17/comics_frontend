import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./ZoomImage.scss";

const HOVER_ZOOM = 2.2;
const VIEWER_ZOOM = 2.5;

// Mouse / touch position -> "x% y%" (transform-origin ke liye)
const originFrom = (event, el) => {
    const point = event.touches?.[0] || event;
    const rect = el.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((point.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((point.clientY - rect.top) / rect.height) * 100));
    return `${x}% ${y}%`;
};

const canHover = () => typeof window !== "undefined" && window.matchMedia?.("(hover: hover)").matches;

/**
 * 🔍 E-commerce jaisa image zoom
 *  - Desktop: hover pe usi jagah zoom, mouse ke saath move
 *  - Click / tap: full-screen viewer, click se zoom in/out, mouse/finger se move
 * <img> ki jagah use karo: <ZoomImage src alt className style />
 */
const ZoomImage = ({ src, alt = "", className = "", style, hoverZoom = true, ...imgProps }) => {
    const wrapRef = useRef(null);
    const [hover, setHover] = useState(null); // transform-origin jab hover zoom on ho
    const [open, setOpen] = useState(false);

    if (!src) return null;

    const onMove = (e) => {
        if (!hoverZoom || !canHover()) return;
        setHover(originFrom(e, wrapRef.current));
    };

    return (
        <>
            <span
                ref={wrapRef}
                className={`zoom-image ${hover ? "is-zooming" : ""}`}
                onMouseMove={onMove}
                onMouseLeave={() => setHover(null)}
                onClick={() => { setHover(null); setOpen(true); }}
                role="button"
                tabIndex={0}
                aria-label={`Zoom ${alt || "image"}`}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpen(true);
                    }
                }}
            >
                <img
                    src={src}
                    alt={alt}
                    className={className}
                    style={{
                        ...style,
                        transformOrigin: hover || "50% 50%",
                        transform: hover ? `scale(${HOVER_ZOOM})` : "none",
                    }}
                    draggable={false}
                    {...imgProps}
                />
                <span className="zoom-image-hint" aria-hidden="true">
                    <i className="bi bi-zoom-in"></i>
                </span>
            </span>

            {open && <ZoomViewer src={src} alt={alt} onClose={() => setOpen(false)} />}
        </>
    );
};

// Full-screen viewer
const ZoomViewer = ({ src, alt, onClose }) => {
    const stageRef = useRef(null);
    const [zoomed, setZoomed] = useState(false);
    const [origin, setOrigin] = useState("50% 50%");

    const close = useCallback(() => onClose(), [onClose]);

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && close();
        document.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden"; // peeche page scroll na ho
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [close]);

    const toggleZoom = (e) => {
        e.stopPropagation();
        setOrigin(originFrom(e, stageRef.current));
        setZoomed((z) => !z);
    };

    const pan = (e) => {
        if (!zoomed) return;
        setOrigin(originFrom(e, stageRef.current));
    };

    return createPortal(
        <div className="zoom-viewer" role="dialog" aria-modal="true" aria-label={alt || "Image viewer"} onClick={close}>
            <div className="zoom-viewer-toolbar" onClick={(e) => e.stopPropagation()}>
                <span className="small opacity-75 d-none d-sm-inline">
                    {zoomed ? "Move to explore · click to zoom out" : "Click the image to zoom in"}
                </span>
                <button type="button" onClick={() => setZoomed((z) => !z)} aria-label={zoomed ? "Zoom out" : "Zoom in"}>
                    <i className={`bi ${zoomed ? "bi-zoom-out" : "bi-zoom-in"}`}></i>
                </button>
                <a href={src} target="_blank" rel="noopener noreferrer" aria-label="Open original" onClick={(e) => e.stopPropagation()}>
                    <i className="bi bi-box-arrow-up-right"></i>
                </a>
                <button type="button" onClick={close} aria-label="Close">
                    <i className="bi bi-x-lg"></i>
                </button>
            </div>

            <div
                ref={stageRef}
                className={`zoom-viewer-stage ${zoomed ? "is-zoomed" : ""}`}
                onClick={toggleZoom}
                onMouseMove={pan}
                onTouchMove={pan}
            >
                <img
                    src={src}
                    alt={alt}
                    draggable={false}
                    style={{ transformOrigin: origin, transform: zoomed ? `scale(${VIEWER_ZOOM})` : "none" }}
                />
            </div>
        </div>,
        document.body
    );
};

export default ZoomImage;
