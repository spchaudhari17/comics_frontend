import React, { useMemo, useState } from "react";
import { Button, Form, Alert, Badge } from "react-bootstrap";

// Page editor (EditComicPageModal) wali hi limits
const MAX_PANELS = 4;
const MAX_DIALOGUES = 6;

const emptyPanel = () => ({ scene: "", caption: "", dialogue: [] });

// JSON string -> pages array (galat JSON ho to null)
const parseScript = (value) => {
    try {
        const parsed = JSON.parse(value || "[]");
        return Array.isArray(parsed) ? parsed : null;
    } catch {
        return null;
    }
};

/**
 * Comic script (JSON) ko readable form me dikhata + edit karata hai.
 * Andar se data JSON string hi rehta hai, isliye baaki flow (generate, tracking) same.
 *
 * props:
 *  value: script JSON string
 *  onChange(newJsonString)
 */
const ScriptEditor = ({ value, onChange }) => {
    const pages = useMemo(() => parseScript(value), [value]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showJson, setShowJson] = useState(false);

    // JSON galat ho (ya user ne raw JSON todi) -> sirf textarea
    if (!pages || showJson) {
        return (
            <div className="script-editor">
                {!pages && (
                    <Alert variant="warning" className="py-2 small">
                        The script JSON is not valid. Fix it below to switch back to the easy editor.
                    </Alert>
                )}
                {pages && (
                    <div className="d-flex justify-content-end mb-2">
                        <Button variant="link" size="sm" className="p-0" onClick={() => setShowJson(false)}>
                            <i className="bi bi-pencil-square me-1"></i>Back to easy editor
                        </Button>
                    </div>
                )}
                <Form.Control
                    as="textarea"
                    rows={16}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    spellCheck={false}
                    style={{ fontFamily: "monospace" }}
                />
            </div>
        );
    }

    if (pages.length === 0) {
        return <Alert variant="warning">No pages in this script.</Alert>;
    }

    const index = Math.min(activeIndex, pages.length - 1);
    const page = pages[index] || {};
    const panels = Array.isArray(page.panels) ? page.panels : [];
    const characters = Array.isArray(page.characters) ? page.characters : [];

    // Ek page badlo -> poora script JSON wapas parent ko
    const updatePage = (changes) => {
        const next = pages.map((p, i) => (i === index ? { ...p, ...changes } : p));
        onChange(JSON.stringify(next, null, 2));
    };

    const updatePanel = (panelIndex, changes) =>
        updatePage({ panels: panels.map((p, i) => (i === panelIndex ? { ...p, ...changes } : p)) });

    const updateDialogue = (panelIndex, dialogueIndex, changes) => {
        const dialogue = (panels[panelIndex].dialogue || []).map((d, i) =>
            i === dialogueIndex ? { ...d, ...changes } : d
        );
        updatePanel(panelIndex, { dialogue });
    };

    // Dialogue me character chunne ke suggestions: page ke characters + jo pehle se bol rahe hain
    const speakerOptions = [
        ...new Set([
            ...characters.map((c) => c?.name).filter(Boolean),
            ...panels.flatMap((p) => (p.dialogue || []).map((d) => d?.character)).filter(Boolean),
        ]),
    ];
    const datalistId = `script-speakers-${index}`;

    return (
        <div className="script-editor">
            {/* ===== Page tabs ===== */}
            <div className="se-toolbar">
                <div className="se-page-tabs" role="tablist">
                    {pages.map((p, i) => (
                        <button
                            key={i}
                            type="button"
                            role="tab"
                            aria-selected={i === index}
                            className={`se-page-tab ${i === index ? "active" : ""}`}
                            onClick={() => setActiveIndex(i)}
                        >
                            Page {p?.page ?? i + 1}
                        </button>
                    ))}
                </div>
                <Button variant="link" size="sm" className="p-0 text-nowrap" onClick={() => setShowJson(true)}>
                    <i className="bi bi-code-slash me-1"></i>View JSON
                </Button>
            </div>

            <div className="se-page">
                {/* ===== Setting ===== */}
                {typeof page.setting === "string" && (
                    <Form.Group className="mb-3">
                        <Form.Label className="se-label">
                            <i className="bi bi-geo-alt"></i> Setting
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={page.setting}
                            onChange={(e) => updatePage({ setting: e.target.value })}
                        />
                    </Form.Group>
                )}

                {/* ===== Characters (part se aate hain, consistency ke liye sirf dikhate hain) ===== */}
                {characters.length > 0 && (
                    <div className="mb-3">
                        <div className="se-label">
                            <i className="bi bi-people"></i> Characters on this page
                        </div>
                        <div className="se-characters">
                            {characters.map((c) => (
                                <div className="se-character" key={c?.name}>
                                    <strong>{c?.name}</strong>
                                    <span>{c?.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== Panels ===== */}
                {panels.map((panel, panelIndex) => (
                    <div className="se-panel" key={panelIndex}>
                        <div className="se-panel-head">
                            <Badge bg="primary">Panel {panelIndex + 1}</Badge>
                            {panels.length > 1 && (
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="text-danger p-0"
                                    onClick={() => updatePage({ panels: panels.filter((_, i) => i !== panelIndex) })}
                                >
                                    <i className="bi bi-trash me-1"></i>Remove panel
                                </Button>
                            )}
                        </div>

                        <Form.Group className="mb-2">
                            <Form.Label className="se-label">What we see (scene)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={panel.scene || ""}
                                onChange={(e) => updatePanel(panelIndex, { scene: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label className="se-label">Caption</Form.Label>
                            <Form.Control
                                value={panel.caption || ""}
                                onChange={(e) => updatePanel(panelIndex, { caption: e.target.value })}
                            />
                        </Form.Group>

                        <div className="se-label">Dialogue</div>
                        {(panel.dialogue || []).map((d, dialogueIndex) => (
                            <div className="se-dialogue" key={dialogueIndex}>
                                <Form.Control
                                    className="se-speaker"
                                    placeholder="Character"
                                    list={datalistId}
                                    value={d?.character || ""}
                                    onChange={(e) => updateDialogue(panelIndex, dialogueIndex, { character: e.target.value })}
                                />
                                <Form.Control
                                    placeholder="What they say"
                                    value={d?.text || ""}
                                    onChange={(e) => updateDialogue(panelIndex, dialogueIndex, { text: e.target.value })}
                                />
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    aria-label="Remove dialogue"
                                    onClick={() =>
                                        updatePanel(panelIndex, {
                                            dialogue: panel.dialogue.filter((_, i) => i !== dialogueIndex),
                                        })
                                    }
                                >
                                    <i className="bi bi-x-lg"></i>
                                </Button>
                            </div>
                        ))}
                        {(panel.dialogue || []).length < MAX_DIALOGUES && (
                            <Button
                                variant="link"
                                size="sm"
                                className="p-0"
                                onClick={() =>
                                    updatePanel(panelIndex, {
                                        dialogue: [...(panel.dialogue || []), { character: speakerOptions[0] || "", text: "" }],
                                    })
                                }
                            >
                                <i className="bi bi-plus-circle me-1"></i>Add dialogue
                            </Button>
                        )}
                    </div>
                ))}

                <datalist id={datalistId}>
                    {speakerOptions.map((name) => <option key={name} value={name} />)}
                </datalist>

                {panels.length < MAX_PANELS && (
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => updatePage({ panels: [...panels, emptyPanel()] })}
                    >
                        <i className="bi bi-plus-lg me-1"></i>Add panel
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ScriptEditor;
