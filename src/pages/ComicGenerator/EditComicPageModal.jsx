import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Alert, Spinner, Badge, Row, Col } from "react-bootstrap";
import API from "../../API";
import { trackClick } from "../../utility/analytics";

const MAX_PANELS = 4;
const MAX_DIALOGUES = 6;

// Payment ke baad credits aane ka wait (webhook me kuch second lagte hain)
const PAYMENT_POLL_INTERVAL = 4000;
const PAYMENT_POLL_MAX_TRIES = 75; // ~5 minute

const emptyPanel = () => ({ scene: "", caption: "", dialogue: [] });

// Deep copy taaki modal me edit karte waqt parent ka data na badle
const clonePanels = (panels) =>
    (Array.isArray(panels) && panels.length ? panels : [emptyPanel()]).map((p) => ({
        scene: p?.scene || "",
        caption: p?.caption || "",
        dialogue: (Array.isArray(p?.dialogue) ? p.dialogue : []).map((d) => ({
            character: d?.character || "",
            text: d?.text || "",
        })),
    }));

/**
 * Ek comic page ka script (scene / caption / dialogue) edit karke
 * SIRF us page ki image dobara banata hai. Har edit = 1 credit.
 *
 * props:
 *  show, onHide
 *  comicId
 *  page: { page, imageUrl, panels }
 *  onRegenerated({ page, imageUrl, panels, caption })
 */
const EditComicPageModal = ({ show, onHide, comicId, page, onRegenerated }) => {
    const [panels, setPanels] = useState([emptyPanel()]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // 💳 Credits
    const [credits, setCredits] = useState(null); // null = abhi load nahi hua
    const [isUnlimited, setIsUnlimited] = useState(false);
    const [costPerEdit, setCostPerEdit] = useState(1);
    const [packs, setPacks] = useState([]);
    const [buyingPackId, setBuyingPackId] = useState(null);
    const [waitingForPayment, setWaitingForPayment] = useState(false);
    const [creditMessage, setCreditMessage] = useState("");

    const pollRef = useRef(null);
    const creditsBeforePaymentRef = useRef(0);

    const hasEnoughCredits = isUnlimited || (credits ?? 0) >= costPerEdit;

    // ---------------- Credits ----------------
    const fetchCredits = useCallback(async () => {
        try {
            const { data } = await API.get("/user/credits");
            setCredits(data.credits ?? 0);
            setIsUnlimited(!!data.isUnlimited);
            setCostPerEdit(data.costPerEdit || 1);
            setPacks(data.packs || []);
            return data.credits ?? 0;
        } catch (err) {
            console.error("Failed to load credits:", err);
            return null;
        }
    }, []);

    const stopPolling = () => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
        setWaitingForPayment(false);
    };

    // Payment tab khula hai -> credits aane tak check karte raho
    const startPaymentPolling = () => {
        stopPolling();
        setWaitingForPayment(true);
        let tries = 0;

        pollRef.current = setInterval(async () => {
            tries += 1;
            const latest = await fetchCredits();

            if (latest !== null && latest > creditsBeforePaymentRef.current) {
                stopPolling();
                setCreditMessage(`Payment received! You now have ${latest} credits.`);
                trackClick("edit_credits_purchase_success", { credits: latest });
            } else if (tries >= PAYMENT_POLL_MAX_TRIES) {
                stopPolling();
            }
        }, PAYMENT_POLL_INTERVAL);
    };

    useEffect(() => {
        if (show && page) {
            setPanels(clonePanels(page.panels));
            setError("");
            setCreditMessage("");
            fetchCredits();
        }
        if (!show) stopPolling();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, page, fetchCredits]);

    // Payment tab se wapas aane pe balance refresh
    useEffect(() => {
        if (!show) return undefined;
        const onFocus = () => fetchCredits();
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, [show, fetchCredits]);

    useEffect(() => () => stopPolling(), []);

    const handleBuyCredits = async (pack) => {
        trackClick("buy_edit_credits_click", {
            pack_id: pack.id,
            credits: pack.credits,
            amount: pack.amountUsd,
        });

        // Tab click ke time hi kholo, warna browser popup block kar dega.
        // Naye tab me payment -> yahan comic ka kaam safe rehta hai.
        const paymentTab = window.open("", "_blank");

        try {
            setBuyingPackId(pack.id);
            setError("");
            setCreditMessage("");

            const { data } = await API.post("/user/credits/checkout", { packId: pack.id });
            if (!data?.url) throw new Error("Payment link not received");

            creditsBeforePaymentRef.current = credits ?? 0;

            if (paymentTab) {
                paymentTab.location.href = data.url;
                startPaymentPolling();
            } else {
                // Popup block -> isi tab me (comic ka unsaved kaam yahan chhoot sakta hai)
                window.location.href = data.url;
            }
        } catch (err) {
            paymentTab?.close();
            setError(err.response?.data?.message || "Could not start payment. Please try again.");
        } finally {
            setBuyingPackId(null);
        }
    };

    // ---------------- Panel helpers ----------------
    const updatePanel = (index, field, value) => {
        setPanels((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
    };

    const updateDialogue = (panelIndex, dialogueIndex, field, value) => {
        setPanels((prev) =>
            prev.map((p, i) =>
                i !== panelIndex
                    ? p
                    : {
                        ...p,
                        dialogue: p.dialogue.map((d, j) => (j === dialogueIndex ? { ...d, [field]: value } : d)),
                    }
            )
        );
    };

    const addDialogue = (panelIndex) => {
        setPanels((prev) =>
            prev.map((p, i) =>
                i === panelIndex ? { ...p, dialogue: [...p.dialogue, { character: "", text: "" }] } : p
            )
        );
    };

    const removeDialogue = (panelIndex, dialogueIndex) => {
        setPanels((prev) =>
            prev.map((p, i) =>
                i === panelIndex ? { ...p, dialogue: p.dialogue.filter((_, j) => j !== dialogueIndex) } : p
            )
        );
    };

    const addPanel = () => {
        if (panels.length >= MAX_PANELS) return;
        setPanels((prev) => [...prev, emptyPanel()]);
    };

    const removePanel = (index) => {
        if (panels.length <= 1) return;
        setPanels((prev) => prev.filter((_, i) => i !== index));
    };

    const resetChanges = () => {
        setPanels(clonePanels(page?.panels));
        setError("");
    };

    // ---------------- Regenerate ----------------
    const handleRegenerate = async () => {
        if (!hasEnoughCredits) {
            setError("You don't have enough credits. Buy a credit pack to edit this page.");
            return;
        }

        const missingScene = panels.findIndex((p) => !p.scene.trim());
        if (missingScene !== -1) {
            setError(`Panel ${missingScene + 1}: please describe the scene.`);
            return;
        }

        // Adhure dialogue (naam ya text khali) hata do
        const cleanPanels = panels.map((p) => ({
            scene: p.scene.trim(),
            caption: p.caption.trim(),
            dialogue: p.dialogue
                .map((d) => ({ character: d.character.trim(), text: d.text.trim() }))
                .filter((d) => d.character && d.text),
        }));

        trackClick("regenerate_comic_page_click", {
            comic_id: comicId,
            page_number: page.page,
            panel_count: cleanPanels.length,
            credits_before: credits ?? 0,
        });

        try {
            setSaving(true);
            setError("");
            setCreditMessage("");

            const { data } = await API.post("/user/regenerate-comic-page", {
                comicId,
                pageNumber: page.page,
                panels: cleanPanels,
            });

            if (data.creditsLeft !== null && data.creditsLeft !== undefined) {
                setCredits(data.creditsLeft);
            }

            onRegenerated?.({
                page: data.page,
                imageUrl: data.imageUrl,
                panels: data.panels,
                caption: data.caption,
            });
            onHide();
        } catch (err) {
            if (err.response?.status === 402 || err.response?.data?.code === "NO_CREDITS") {
                setCredits(err.response?.data?.credits ?? 0);
            } else {
                // Fail hone pe backend credit wapas kar deta hai -> balance refresh
                fetchCredits();
            }
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Failed to regenerate this page. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    if (!page) return null;

    return (
        <Modal
            show={show}
            onHide={saving ? undefined : onHide}
            size="xl"
            centered
            scrollable
            backdrop={saving ? "static" : true}
        >
            <Modal.Header closeButton={!saving} className="border-0">
                <Modal.Title className="d-flex align-items-center gap-2 flex-wrap">
                    <i className="bi bi-pencil-square text-primary"></i>
                    Edit Page {page.page}
                    {credits !== null && (
                        <Badge bg={hasEnoughCredits ? "success" : "danger"} className="ms-2 fs-6 fw-normal">
                            <i className="bi bi-coin me-1"></i>
                            {isUnlimited ? "Unlimited edits" : `${credits} credit${credits === 1 ? "" : "s"} left`}
                        </Badge>
                    )}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Row className="g-4">
                    {/* Current image */}
                    <Col lg={4}>
                        <div className="position-sticky" style={{ top: 0 }}>
                            <div className="small fw-semibold text-muted mb-2">Current image</div>
                            <img
                                src={page.imageUrl}
                                alt={`Page ${page.page}`}
                                className="img-fluid rounded-3 border"
                                style={{ opacity: saving ? 0.5 : 1 }}
                            />
                            <Alert variant="light" className="border small mt-3 mb-0">
                                <i className="bi bi-info-circle me-1"></i>
                                Only this page will be regenerated. All other pages stay exactly the same.
                                After it's done, update the comic PDF so it includes the new image.
                                {!isUnlimited && (
                                    <div className="mt-2">
                                        <i className="bi bi-coin me-1"></i>
                                        Each page edit uses <strong>{costPerEdit} credit</strong>. If the image fails
                                        to generate, the credit is returned.
                                    </div>
                                )}
                            </Alert>
                        </div>
                    </Col>

                    {/* Script editor */}
                    <Col lg={8}>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {creditMessage && (
                            <Alert variant="success" dismissible onClose={() => setCreditMessage("")}>
                                {creditMessage}
                            </Alert>
                        )}

                        {/* 💳 Credits khatam -> buy */}
                        {credits !== null && !hasEnoughCredits && (
                            <div className="border border-warning rounded-3 p-3 mb-3 bg-warning bg-opacity-10">
                                <div className="fw-semibold mb-1">
                                    <i className="bi bi-exclamation-circle me-1"></i>
                                    You're out of edit credits
                                </div>
                                <div className="small text-muted mb-3">
                                    Buy a credit pack to keep editing pages. Payment opens in a new tab, your
                                    comic stays right here.
                                </div>

                                {packs.length === 0 ? (
                                    <div className="small text-muted">Credit packs are not available right now.</div>
                                ) : (
                                    <div className="d-flex flex-wrap gap-2">
                                        {packs.map((pack) => (
                                            <Button
                                                key={pack.id}
                                                variant={pack.badge ? "primary" : "outline-primary"}
                                                onClick={() => handleBuyCredits(pack)}
                                                disabled={!!buyingPackId || waitingForPayment}
                                                className="text-start"
                                            >
                                                {buyingPackId === pack.id ? (
                                                    <>
                                                        <Spinner size="sm" className="me-2" />
                                                        Opening payment...
                                                    </>
                                                ) : (
                                                    <>
                                                        <strong>{pack.credits} credits</strong> for ${pack.amountUsd}
                                                        {pack.badge && (
                                                            <Badge bg="light" text="dark" className="ms-2">
                                                                {pack.badge}
                                                            </Badge>
                                                        )}
                                                    </>
                                                )}
                                            </Button>
                                        ))}
                                    </div>
                                )}

                                {waitingForPayment && (
                                    <div className="small mt-3 d-flex align-items-center flex-wrap gap-2">
                                        <Spinner size="sm" />
                                        Waiting for payment to complete in the other tab...
                                        <Button size="sm" variant="link" className="p-0" onClick={fetchCredits}>
                                            I've paid, refresh balance
                                        </Button>
                                        <Button size="sm" variant="link" className="p-0 text-muted" onClick={stopPolling}>
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {panels.map((panel, panelIndex) => (
                            <div key={panelIndex} className="border rounded-3 p-3 mb-3 bg-light">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <Badge bg="primary">Panel {panelIndex + 1}</Badge>
                                    {panels.length > 1 && (
                                        <Button
                                            size="sm"
                                            variant="link"
                                            className="text-danger p-0"
                                            onClick={() => removePanel(panelIndex)}
                                            disabled={saving}
                                        >
                                            <i className="bi bi-trash me-1"></i>Remove panel
                                        </Button>
                                    )}
                                </div>

                                <Form.Group className="mb-2">
                                    <Form.Label className="small fw-semibold mb-1">
                                        Scene <span className="text-danger">*</span>
                                        <span className="text-muted fw-normal ms-1">(what the picture shows)</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={panel.scene}
                                        maxLength={1000}
                                        onChange={(e) => updatePanel(panelIndex, "scene", e.target.value)}
                                        disabled={saving}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Label className="small fw-semibold mb-1">Caption</Form.Label>
                                    <Form.Control
                                        value={panel.caption}
                                        maxLength={300}
                                        onChange={(e) => updatePanel(panelIndex, "caption", e.target.value)}
                                        disabled={saving}
                                    />
                                </Form.Group>

                                <Form.Label className="small fw-semibold mb-1">Dialogue</Form.Label>
                                {panel.dialogue.length === 0 && (
                                    <div className="small text-muted mb-2">No dialogue in this panel.</div>
                                )}
                                {panel.dialogue.map((d, dialogueIndex) => (
                                    <div key={dialogueIndex} className="d-flex gap-2 mb-2">
                                        <Form.Control
                                            placeholder="Character"
                                            value={d.character}
                                            maxLength={50}
                                            style={{ maxWidth: "160px" }}
                                            onChange={(e) =>
                                                updateDialogue(panelIndex, dialogueIndex, "character", e.target.value)
                                            }
                                            disabled={saving}
                                        />
                                        <Form.Control
                                            placeholder="What they say"
                                            value={d.text}
                                            maxLength={300}
                                            onChange={(e) =>
                                                updateDialogue(panelIndex, dialogueIndex, "text", e.target.value)
                                            }
                                            disabled={saving}
                                        />
                                        <Button
                                            variant="outline-danger"
                                            onClick={() => removeDialogue(panelIndex, dialogueIndex)}
                                            disabled={saving}
                                            title="Remove line"
                                        >
                                            <i className="bi bi-x-lg"></i>
                                        </Button>
                                    </div>
                                ))}
                                {panel.dialogue.length < MAX_DIALOGUES && (
                                    <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        onClick={() => addDialogue(panelIndex)}
                                        disabled={saving}
                                    >
                                        <i className="bi bi-plus-lg me-1"></i>Add dialogue
                                    </Button>
                                )}
                            </div>
                        ))}

                        {panels.length < MAX_PANELS && (
                            <Button variant="outline-primary" size="sm" onClick={addPanel} disabled={saving}>
                                <i className="bi bi-plus-lg me-1"></i>Add panel
                            </Button>
                        )}

                        <div className="small text-muted mt-3">
                            Captions and dialogue appear inside the image only for comics created with
                            <strong> "With Text &amp; Dialogue"</strong>. For "No Text" comics they still guide the picture.
                        </div>
                    </Col>
                </Row>
            </Modal.Body>

            <Modal.Footer className="border-0">
                <Button variant="link" className="me-auto text-decoration-none" onClick={resetChanges} disabled={saving}>
                    Reset changes
                </Button>
                <Button variant="secondary" onClick={onHide} disabled={saving}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleRegenerate}
                    disabled={saving || credits === null || !hasEnoughCredits}
                    className="px-4"
                    title={!hasEnoughCredits ? "Buy credits to edit this page" : ""}
                >
                    {saving ? (
                        <>
                            <Spinner size="sm" className="me-2" />
                            Regenerating page... (up to a minute)
                        </>
                    ) : (
                        <>
                            <i className="bi bi-arrow-repeat me-2"></i>
                            Regenerate this page
                            {!isUnlimited && ` (${costPerEdit} credit)`}
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditComicPageModal;