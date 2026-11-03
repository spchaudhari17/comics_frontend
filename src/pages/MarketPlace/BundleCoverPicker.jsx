import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Form, Spinner } from "react-bootstrap";
import API from "../../API";
import EditCreditsCard from "../../components/EditCreditsCard";
import { trackClick } from "../../utility/analytics";

const getId = (c) => String(c?._id || c);
const INSTRUCTIONS_MAX = 200;

const tileStyle = (enabled) => ({
    width: 92,
    cursor: enabled ? "pointer" : "not-allowed",
    opacity: enabled ? 1 : 0.5,
});

// Bundle cover chunne ke liye:
//   - har selected comic ka pehla page (free)
//   - AI se bana cover (har nayi thumbnail = 1 credit), pehle bani hui dobara free me chun sakte ho
// value = cover comic id ("" / null = pehla comic, default)
// aiThumbnailId / onAiChange na do to AI wala option nahi dikhega
const BundleCoverPicker = ({ comics, value, onChange, aiThumbnailId, onAiChange }) => {
    const aiEnabled = typeof onAiChange === "function";

    const [aiThumbs, setAiThumbs] = useState([]);
    const [aiLoaded, setAiLoaded] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [sourceComicId, setSourceComicId] = useState("");
    const [instructions, setInstructions] = useState("");
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState("");

    const [credits, setCredits] = useState(null); // null = abhi load nahi hua
    const [isUnlimited, setIsUnlimited] = useState(false);
    const [cost, setCost] = useState(1);

    const ids = useMemo(() => comics.map(getId), [comics]);
    const idsKey = ids.join(",");
    const comicsWithImage = useMemo(() => comics.filter((c) => c.thumbnail), [comics]);

    // Pehle bani AI thumbnails (sirf in comics ki)
    useEffect(() => {
        if (!aiEnabled || !idsKey) return;
        API.get("/user/bundle-thumbnails", { params: { comicIds: idsKey } })
            .then(({ data }) => setAiThumbs(data.data || []))
            .catch(() => { })
            .finally(() => setAiLoaded(true));
    }, [aiEnabled, idsKey]);

    // Jis comic se AI cover bana tha wo bundle se hat gaya -> AI cover bhi hatao
    // (warna save pe backend reject karega)
    useEffect(() => {
        if (!aiEnabled || !aiLoaded || !aiThumbnailId) return;
        const stillThere = aiThumbs.some(
            (t) => String(t._id) === String(aiThumbnailId) && ids.includes(String(t.comicId))
        );
        if (!stillThere) onAiChange("");
    }, [aiEnabled, aiLoaded, aiThumbnailId, aiThumbs, ids, onAiChange]);

    const fetchCredits = useCallback(async () => {
        try {
            const { data } = await API.get("/user/credits");
            setCredits(data.credits ?? 0);
            setIsUnlimited(!!data.isUnlimited);
            setCost(data.costPerThumbnail || 1);
        } catch {
            setCredits(0);
        }
    }, []);

    if (!comics.length) return null;

    const visibleAiThumbs = aiThumbs.filter((t) => ids.includes(String(t.comicId)));
    const activeAi = aiEnabled && aiThumbnailId && visibleAiThumbs.some((t) => String(t._id) === String(aiThumbnailId))
        ? String(aiThumbnailId)
        : "";
    const activeComicId = activeAi ? "" : (value && ids.includes(String(value)) ? String(value) : ids[0]);

    const hasEnoughCredits = isUnlimited || (credits ?? 0) >= cost;

    const openCreate = () => {
        trackClick("bundle_thumbnail_create_open", { comics: comics.length });
        setError("");
        setShowCreate(true);
        setSourceComicId(
            comicsWithImage.some((c) => getId(c) === activeComicId) ? activeComicId : getId(comicsWithImage[0] || "")
        );
        fetchCredits();
    };

    const selectComic = (id) => {
        onChange(id);
        if (aiEnabled) onAiChange("");
    };

    const handleGenerate = async () => {
        if (!sourceComicId) return setError("Pick a comic to create the thumbnail from.");
        if (!hasEnoughCredits) return setError("You don't have enough credits. Buy a credit pack below.");

        setError("");
        setGenerating(true);
        trackClick("bundle_thumbnail_generate_click", { comic_id: sourceComicId, credits_before: credits ?? 0 });

        try {
            const { data } = await API.post("/user/bundle-thumbnail/generate", {
                comicId: sourceComicId,
                instructions: instructions.trim(),
            });

            const thumb = data.thumbnail;
            setAiThumbs((prev) => [thumb, ...prev.filter((t) => t._id !== thumb._id)]);
            onChange(sourceComicId);
            onAiChange(String(thumb._id));
            if (data.creditsLeft !== null && data.creditsLeft !== undefined) setCredits(data.creditsLeft);
            setInstructions("");
            setShowCreate(false);
            trackClick("bundle_thumbnail_generate_success", { comic_id: sourceComicId });
        } catch (err) {
            if (err.response?.status === 402 || err.response?.data?.code === "NO_CREDITS") {
                setCredits(err.response?.data?.credits ?? 0);
            } else {
                // Fail pe backend credit wapas kar deta hai -> balance refresh
                fetchCredits();
            }
            setError(err.response?.data?.message || "Thumbnail generation failed. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Form.Group className="mb-3">
            <Form.Label className="fw-semibold mb-1">Cover image</Form.Label>
            <div className="small text-muted mb-2">
                The first page of the comic you pick is shown as the bundle thumbnail.
            </div>

            {/* ================= 1. FREE: comic ka pehla page ================= */}
            <div className="d-flex gap-2 pb-2" style={{ overflowX: "auto" }}>
                {/* Comics ka pehla page */}
                {comics.map((comic) => {
                    const id = getId(comic);
                    const active = id === activeComicId;
                    const hasImage = !!comic.thumbnail;

                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => hasImage && selectComic(id)}
                            disabled={!hasImage || generating}
                            title={hasImage ? comic.title : `${comic.title} (no pages yet)`}
                            aria-pressed={active}
                            className={`p-0 bg-white rounded-3 position-relative flex-shrink-0 border ${active ? "border-primary border-3 shadow-sm" : ""}`}
                            style={tileStyle(hasImage)}
                        >
                            {hasImage ? (
                                <img
                                    src={comic.thumbnail}
                                    alt={comic.title}
                                    className="rounded-top-2 d-block"
                                    style={{ width: "100%", height: 116, objectFit: "cover" }}
                                />
                            ) : (
                                <div
                                    className="rounded-top-2 bg-secondary-subtle d-flex align-items-center justify-content-center"
                                    style={{ height: 116 }}
                                >
                                    <i className="bi bi-image text-muted fs-4"></i>
                                </div>
                            )}

                            {active && (
                                <span className="badge bg-primary position-absolute top-0 start-0 m-1">
                                    <i className="bi bi-check2 me-1"></i>Cover
                                </span>
                            )}

                            <div className="small text-truncate px-1 py-1" style={{ maxWidth: "100%" }}>
                                {comic.title}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* ================= 2. AI THUMBNAIL (credit wala, alag section) ================= */}
            {aiEnabled && (
                <div className="border rounded-3 p-3 mt-2">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                        <div>
                            <div className="fw-semibold">
                                <i className="bi bi-stars text-primary me-1"></i>AI thumbnail
                                <Badge bg="light" text="dark" className="ms-2 border fw-normal">
                                    <i className="bi bi-coin me-1"></i>{cost} credit each
                                </Badge>
                            </div>
                            <div className="small text-muted">
                                Want a custom cover? Create a new one with AI from your comic.
                            </div>
                        </div>
                        {!showCreate && (
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={openCreate}
                                disabled={!comicsWithImage.length || generating}
                                title={comicsWithImage.length ? "" : "Generate your comic pages first"}
                            >
                                <i className="bi bi-stars me-1"></i>Create AI thumbnail
                            </Button>
                        )}
                    </div>

            {visibleAiThumbs.length > 0 && (
            <div className="d-flex gap-2 pt-3 pb-1" style={{ overflowX: "auto" }}>
                {/* Pehle bani AI thumbnails (dobara chunna free) */}
                {visibleAiThumbs.map((thumb) => {
                    const active = String(thumb._id) === activeAi;
                    return (
                        <button
                            key={thumb._id}
                            type="button"
                            onClick={() => onAiChange(String(thumb._id))}
                            disabled={generating}
                            title="AI cover"
                            aria-pressed={active}
                            className={`p-0 bg-white rounded-3 position-relative flex-shrink-0 border ${active ? "border-primary border-3 shadow-sm" : ""}`}
                            style={tileStyle(true)}
                        >
                            <img
                                src={thumb.imageUrl}
                                alt="AI cover"
                                className="rounded-top-2 d-block"
                                style={{ width: "100%", height: 116, objectFit: "cover" }}
                            />
                            {active ? (
                                <span className="badge bg-primary position-absolute top-0 start-0 m-1">
                                    <i className="bi bi-check2 me-1"></i>Cover
                                </span>
                            ) : (
                                <span className="badge bg-dark bg-opacity-75 position-absolute top-0 start-0 m-1">
                                    <i className="bi bi-stars me-1"></i>AI
                                </span>
                            )}
                            <div className="small text-truncate px-1 py-1">AI cover</div>
                        </button>
                    );
                })}
            </div>
            )}

            {/* Create panel */}
            {showCreate && (
                <div className="border rounded-3 p-3 mt-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="fw-semibold">
                            <i className="bi bi-stars text-primary me-1"></i>Create an AI cover
                        </div>
                        <div className="small text-muted">
                            {credits === null ? (
                                <Spinner size="sm" />
                            ) : isUnlimited ? (
                                "Unlimited credits"
                            ) : (
                                <>You have <strong className={hasEnoughCredits ? "" : "text-danger"}>{credits}</strong> credits</>
                            )}
                        </div>
                    </div>

                    <Form.Group className="mb-2">
                        <Form.Label className="small mb-1">Based on comic</Form.Label>
                        <Form.Select
                            size="sm"
                            value={sourceComicId}
                            onChange={(e) => setSourceComicId(e.target.value)}
                            disabled={generating}
                        >
                            {comicsWithImage.map((c) => (
                                <option key={getId(c)} value={getId(c)}>{c.title}</option>
                            ))}
                        </Form.Select>
                        <Form.Text>Its characters and art style will be used for the cover.</Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small mb-1">Extra instructions (optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            size="sm"
                            maxLength={INSTRUCTIONS_MAX}
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="e.g. Space background, characters looking at the stars"
                            disabled={generating}
                        />
                        <Form.Text className="d-block text-end">{instructions.length}/{INSTRUCTIONS_MAX}</Form.Text>
                    </Form.Group>

                    {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                    {credits !== null && !hasEnoughCredits && (
                        <EditCreditsCard
                            className="mb-3"
                            onCreditsChange={(c, unlimited) => {
                                setCredits(c);
                                setIsUnlimited(unlimited);
                                if (unlimited || c >= cost) setError("");
                            }}
                        />
                    )}

                    <div className="d-flex align-items-center gap-2">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleGenerate}
                            disabled={generating || credits === null || !hasEnoughCredits || !sourceComicId}
                        >
                            {generating ? (
                                <><Spinner size="sm" className="me-2" />Creating... (~30 sec)</>
                            ) : (
                                <><i className="bi bi-stars me-1"></i>Generate · {isUnlimited ? "free" : `${cost} credit`}</>
                            )}
                        </Button>
                        <Button variant="link" size="sm" className="text-muted" onClick={() => setShowCreate(false)} disabled={generating}>
                            Cancel
                        </Button>
                    </div>
                    <div className="small text-muted mt-2">
                        If generation fails, your credit is refunded automatically.
                    </div>
                </div>
            )}
                </div>
            )}
        </Form.Group>
    );
};

export default BundleCoverPicker;
