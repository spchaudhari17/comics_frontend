import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Spinner } from "react-bootstrap";
import API from "../API";
import { trackClick } from "../utility/analytics";

// Payment ke baad credits aane ka wait (webhook me kuch second lagte hain)
const POLL_INTERVAL = 4000;
const POLL_MAX_TRIES = 75; // ~5 minute

/**
 * 💳 Page edit credits: balance + credit pack khareedna
 * Kahin bhi laga sakte ho: <EditCreditsCard />
 */
const EditCreditsCard = ({ className = "" }) => {
    const [credits, setCredits] = useState(null);
    const [isUnlimited, setIsUnlimited] = useState(false);
    const [costPerEdit, setCostPerEdit] = useState(1);
    const [packs, setPacks] = useState([]);
    const [loadError, setLoadError] = useState("");

    const [buyingPackId, setBuyingPackId] = useState(null);
    const [waitingForPayment, setWaitingForPayment] = useState(false);
    const [message, setMessage] = useState(null); // { variant, text }

    const pollRef = useRef(null);
    const creditsBeforeRef = useRef(0);

    const fetchCredits = useCallback(async () => {
        try {
            const { data } = await API.get("/user/credits");
            setCredits(data.credits ?? 0);
            setIsUnlimited(!!data.isUnlimited);
            setCostPerEdit(data.costPerEdit || 1);
            setPacks(data.packs || []);
            setLoadError("");
            return data.credits ?? 0;
        } catch (err) {
            console.error("Failed to load credits:", err);
            setLoadError("Could not load your credits.");
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

    const startPolling = () => {
        stopPolling();
        setWaitingForPayment(true);
        let tries = 0;

        pollRef.current = setInterval(async () => {
            tries += 1;
            const latest = await fetchCredits();

            if (latest !== null && latest > creditsBeforeRef.current) {
                stopPolling();
                setMessage({
                    variant: "success",
                    text: `Payment received! ${latest - creditsBeforeRef.current} credits added.`,
                });
                trackClick("edit_credits_purchase_success", { credits: latest, location: "credits_card" });
            } else if (tries >= POLL_MAX_TRIES) {
                stopPolling();
            }
        }, POLL_INTERVAL);
    };

    useEffect(() => {
        fetchCredits();

        // Payment wale tab se wapas aane pe balance refresh
        const onFocus = () => fetchCredits();
        window.addEventListener("focus", onFocus);

        return () => {
            window.removeEventListener("focus", onFocus);
            stopPolling();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchCredits]);

    const handleBuy = async (pack) => {
        trackClick("buy_edit_credits_click", {
            pack_id: pack.id,
            credits: pack.credits,
            amount: pack.amountUsd,
            location: "credits_card",
        });

        // Tab click ke time hi kholo, warna browser popup block karega
        const paymentTab = window.open("", "_blank");

        try {
            setBuyingPackId(pack.id);
            setMessage(null);

            const { data } = await API.post("/user/credits/checkout", { packId: pack.id });
            if (!data?.url) throw new Error("Payment link not received");

            creditsBeforeRef.current = credits ?? 0;

            if (paymentTab) {
                paymentTab.location.href = data.url;
                startPolling();
            } else {
                window.location.href = data.url;
            }
        } catch (err) {
            paymentTab?.close();
            setMessage({
                variant: "danger",
                text: err.response?.data?.message || "Could not start payment. Please try again.",
            });
        } finally {
            setBuyingPackId(null);
        }
    };

    const isLow = !isUnlimited && credits !== null && credits < costPerEdit;

    return (
        <div className={`bg-white border rounded-4 shadow-sm p-3 p-md-4 ${className}`}>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                {/* Balance */}
                <div className="d-flex align-items-center gap-3">
                    <div
                        className={`rounded-circle d-flex align-items-center justify-content-center ${isLow ? "bg-danger" : "bg-primary"} bg-opacity-10`}
                        style={{ width: 52, height: 52 }}
                    >
                        <i className={`bi bi-coin fs-3 ${isLow ? "text-danger" : "text-primary"}`}></i>
                    </div>
                    <div>
                        <div className="small text-muted fw-semibold">Page Edit Credits</div>
                        {credits === null && !loadError ? (
                            <Spinner size="sm" />
                        ) : isUnlimited ? (
                            <div className="fs-4 fw-bold">Unlimited</div>
                        ) : (
                            <div className="d-flex align-items-baseline gap-2">
                                <span className={`fs-3 fw-bold ${isLow ? "text-danger" : ""}`}>{credits ?? 0}</span>
                                <span className="text-muted">credits</span>
                            </div>
                        )}
                        <div className="small text-muted">
                            {costPerEdit} credit = 1 page edit. Failed edits are refunded.
                        </div>
                    </div>
                </div>

                {/* Buy */}
                {!isUnlimited && packs.length > 0 && (
                    <div className="d-flex flex-wrap gap-2">
                        {packs.map((pack) => (
                            <Button
                                key={pack.id}
                                variant={pack.badge ? "primary" : "outline-primary"}
                                onClick={() => handleBuy(pack)}
                                disabled={!!buyingPackId || waitingForPayment}
                                className="px-3"
                            >
                                {buyingPackId === pack.id ? (
                                    <>
                                        <Spinner size="sm" className="me-2" />
                                        Opening...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-plus-circle me-1"></i>
                                        <strong>{pack.credits}</strong> credits &middot; ${pack.amountUsd}
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
            </div>

            {waitingForPayment && (
                <div className="small mt-3 d-flex align-items-center flex-wrap gap-2 text-muted">
                    <Spinner size="sm" />
                    Waiting for payment to complete in the other tab...
                    <Button size="sm" variant="link" className="p-0" onClick={fetchCredits}>
                        I've paid, refresh
                    </Button>
                    <Button size="sm" variant="link" className="p-0 text-muted" onClick={stopPolling}>
                        Cancel
                    </Button>
                </div>
            )}

            {isLow && !waitingForPayment && (
                <div className="small mt-3 text-danger">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    You're out of credits. Buy a pack to edit comic pages.
                </div>
            )}

            {loadError && <Alert variant="warning" className="mt-3 mb-0 py-2 small">{loadError}</Alert>}

            {message && (
                <Alert
                    variant={message.variant}
                    className="mt-3 mb-0 py-2 small"
                    dismissible
                    onClose={() => setMessage(null)}
                >
                    {message.text}
                </Alert>
            )}
        </div>
    );
};

export default EditCreditsCard;