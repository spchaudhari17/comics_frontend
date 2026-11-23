import React, { useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import "./PartsBreakdown.scss";

// Har part ka status ek jagah se (UI isi ke hisaab se)
const getPartStatus = (p, { completedParts, isFreeUser, writingPartNumber }) => {
    if (completedParts.includes(p.comicId)) return "done";
    if (isFreeUser && p.part > 1) return "locked";
    if (p.scriptStatus === "failed") return "failed";
    if (p.scriptStatus === "pending") return p.part === writingPartNumber ? "writing" : "queued";
    return "ready";
};

const STATUS_CHIP = {
    done: { label: "Completed", icon: "bi-check-circle-fill" },
    ready: { label: "Ready to create", icon: "bi-play-circle-fill" },
    writing: { label: "Writing script", icon: null },
    queued: { label: "In queue", icon: "bi-hourglass-split" },
    failed: { label: "Needs retry", icon: "bi-exclamation-triangle-fill" },
    locked: { label: "Locked", icon: "bi-lock-fill" },
};

const PartCard = ({ p, status, isNext, isLast, onStart, onRetry, onUpgrade, onViewMyComics }) => {
    const [storyOpen, setStoryOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const chip = STATUS_CHIP[status];
    const keyTerms = Array.isArray(p.keyTerms) ? p.keyTerms : [];
    const characters = Array.isArray(p.characters) ? p.characters : [];
    const hasDetails = characters.length > 0 || p.start || p.end;
    const longStory = (p.storySnippet || "").length > 220;

    return (
        <div className={`pb-item status-${status} ${isNext ? "is-next" : ""}`}>
            {/* Timeline: number + line */}
            <div className="pb-rail" aria-hidden="true">
                <span className="pb-dot">
                    {status === "done" ? <i className="bi bi-check-lg"></i> : p.part}
                </span>
                {!isLast && <span className="pb-line"></span>}
            </div>

            <div className="pb-card">
                {status === "locked" && (
                    <div className="pb-lock">
                        <div className="text-center">
                            <div className="pb-lock-icon"><i className="bi bi-lock-fill"></i></div>
                            <div className="fw-semibold mb-1">Unlock the full series</div>
                            <div className="small text-muted mb-2">Free plan includes Part 1 only.</div>
                            <Button variant="warning" size="sm" onClick={onUpgrade}>
                                Upgrade to Bundle
                            </Button>
                        </div>
                    </div>
                )}

                <div className="pb-card-head">
                    <div className="pb-card-title">
                        <span className="pb-part-label">Part {p.part}</span>
                        <h5 className="mb-0">{p.title}</h5>
                    </div>
                    <div className="pb-chips">
                        {isNext && <span className="pb-chip chip-next"><i className="bi bi-star-fill me-1"></i>Up next</span>}
                        <span className={`pb-chip chip-${status}`}>
                            {status === "writing"
                                ? <Spinner animation="border" size="sm" className="me-1 pb-chip-spinner" />
                                : <i className={`bi ${chip.icon} me-1`}></i>}
                            {chip.label}
                        </span>
                    </div>
                </div>

                <div className="pb-meta">
                    <span><i className="bi bi-book me-1"></i>8-page comic</span>
                    {keyTerms.length > 0 && <span><i className="bi bi-lightbulb me-1"></i>{keyTerms.length} key terms</span>}
                    {characters.length > 0 && <span><i className="bi bi-people me-1"></i>{characters.length} characters</span>}
                </div>

                {keyTerms.length > 0 && (
                    <div className="pb-terms">
                        {keyTerms.map((term) => (
                            <span key={term} className="pb-term">{term}</span>
                        ))}
                    </div>
                )}

                {p.storySnippet && (
                    <div className="pb-story">
                        <p className={storyOpen ? "" : "is-clamped"}>{p.storySnippet}</p>
                        {longStory && (
                            <button type="button" className="pb-link" onClick={() => setStoryOpen((v) => !v)}>
                                {storyOpen ? "Show less" : "Read more"}
                            </button>
                        )}
                    </div>
                )}

                {hasDetails && (
                    <>
                        <button
                            type="button"
                            className="pb-link pb-details-toggle"
                            onClick={() => setDetailsOpen((v) => !v)}
                            aria-expanded={detailsOpen}
                        >
                            <i className={`bi ${detailsOpen ? "bi-chevron-up" : "bi-chevron-down"} me-1`}></i>
                            {detailsOpen ? "Hide details" : "Show characters & story flow"}
                        </button>

                        {detailsOpen && (
                            <div className="pb-details">
                                {characters.length > 0 && (
                                    <div className="pb-characters">
                                        {characters.map((c) => (
                                            <div key={c.name} className="pb-character">
                                                <span className="pb-avatar" aria-hidden="true">
                                                    {String(c.name || "?").trim().charAt(0).toUpperCase()}
                                                </span>
                                                <div>
                                                    <div className="fw-semibold">{c.name}</div>
                                                    <div className="small text-muted">{c.description}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {(p.start || p.end) && (
                                    <div className="pb-flow">
                                        {p.start && (
                                            <div className="pb-flow-step">
                                                <div className="pb-flow-label"><i className="bi bi-flag me-1"></i>Begins</div>
                                                <div className="small">{p.start}</div>
                                            </div>
                                        )}
                                        {p.start && p.end && <i className="bi bi-arrow-right pb-flow-arrow" aria-hidden="true"></i>}
                                        {p.end && (
                                            <div className="pb-flow-step">
                                                <div className="pb-flow-label"><i className="bi bi-trophy me-1"></i>Ends</div>
                                                <div className="small">{p.end}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Action */}
                <div className="pb-actions">
                    {status === "ready" && (
                        <Button variant="primary" onClick={() => onStart(p)}>
                            <i className="bi bi-magic me-2"></i>Create Part {p.part}
                        </Button>
                    )}
                    {status === "writing" && (
                        <span className="pb-wait">
                            Writing the 8-page script for this part. It will be ready shortly.
                        </span>
                    )}
                    {status === "queued" && (
                        <span className="pb-wait">
                            Starts after Part {p.part - 1} is ready.
                        </span>
                    )}
                    {status === "failed" && (
                        <>
                            <span className="text-danger small">The script for this part could not be created.</span>
                            <Button variant="outline-danger" size="sm" onClick={() => onRetry(p)}>
                                <i className="bi bi-arrow-clockwise me-1"></i>Retry
                            </Button>
                        </>
                    )}
                    {status === "done" && (
                        <Button variant="outline-secondary" size="sm" onClick={onViewMyComics}>
                            <i className="bi bi-collection me-1"></i>View in My Comics
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * 📚 Concept Breakdown: series ke saare parts, status ke saath
 */
const PartsBreakdown = ({
    parts,
    seriesTitle,
    completedParts = [],
    isFreeUser,
    writingPartNumber,
    onStart,
    onRetry,
    onUpgrade,
    onViewMyComics,
}) => {
    const ctx = { completedParts, isFreeUser, writingPartNumber };
    const withStatus = parts.map((p) => ({ p, status: getPartStatus(p, ctx) }));

    const total = parts.length;
    const count = (s) => withStatus.filter((x) => x.status === s).length;
    const done = count("done");
    const ready = count("ready");
    const preparing = count("writing") + count("queued");
    const nextPart = withStatus.find((x) => x.status === "ready")?.p;
    const donePct = total ? Math.round((done / total) * 100) : 0;

    return (
        <div className="parts-breakdown">
            <div className="pb-summary">
                <div className="pb-summary-top">
                    <div>
                        <div className="pb-summary-kicker">Your comic series</div>
                        <div className="pb-summary-title">{seriesTitle || "Untitled series"}</div>
                        <div className="small text-muted">
                            {total} {total === 1 ? "part" : "parts"} · {total * 8} pages in total · each part continues the story
                        </div>
                    </div>
                    <div className="pb-stats">
                        <div className="pb-stat"><strong>{done}</strong><span>Completed</span></div>
                        <div className="pb-stat"><strong>{ready}</strong><span>Ready</span></div>
                        {preparing > 0 && <div className="pb-stat"><strong>{preparing}</strong><span>Preparing</span></div>}
                    </div>
                </div>

                <div className="pb-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={donePct}>
                    <span style={{ width: `${donePct}%` }}></span>
                </div>
                <div className="pb-progress-label">
                    {done === total
                        ? "All parts completed. Great work!"
                        : `${done} of ${total} parts completed`}
                </div>

                <div className="pb-tip">
                    <i className="bi bi-info-circle me-2"></i>
                    {preparing > 0
                        ? `Scripts are written one part at a time${writingPartNumber ? ` (now: Part ${writingPartNumber})` : ""}. You can start any ready part right away.`
                        : nextPart
                            ? `Tip: create the parts in order so the story flows. Part ${nextPart.part} is up next.`
                            : "Each part becomes an 8-page comic with its own quiz."}
                </div>
            </div>

            <div className="pb-list">
                {withStatus.map(({ p, status }, index) => (
                    <PartCard
                        key={p.comicId || p.part}
                        p={p}
                        status={status}
                        isNext={nextPart?.comicId === p.comicId}
                        isLast={index === withStatus.length - 1}
                        onStart={onStart}
                        onRetry={onRetry}
                        onUpgrade={onUpgrade}
                        onViewMyComics={onViewMyComics}
                    />
                ))}
            </div>
        </div>
    );
};

export default PartsBreakdown;
