// import React, { useEffect, useState } from "react";
// import { Button, Alert, Spinner } from "react-bootstrap";
// import API from "../../API";

// const MycardsDetails = () => {
//     const [card, setCard] = useState(null);
//     const [payout, setPayout] = useState(null);

//     const [loading, setLoading] = useState(true);
//     const [updateLoading, setUpdateLoading] = useState(false);
//     const [bankLoading, setBankLoading] = useState(false);

//     const fetchData = async () => {
//         try {
//             // 🔥 CARD API
//             try {
//                 const cardRes = await API.get("/subscription/payment-method");
//                 if (cardRes.data.hasCard) {
//                     setCard(cardRes.data);
//                 } else {
//                     setCard(null);
//                 }
//             } catch (err) {
//                 console.log("Card API Error:", err);
//                 setCard(null);
//             }

//             // 🔥 PAYOUT API
//             try {
//                 const payoutRes = await API.get("/teacher/payout-status");
//                 console.log("PAYOUT RESPONSE:", payoutRes.data); // 🔥 debug
//                 setPayout(payoutRes.data);
//             } catch (err) {
//                 console.log("Payout API Error:", err);
//                 setPayout(null);
//             }

//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchData();
//     }, []);

//     // 🔥 Update Card
//     const handleUpdateCard = async () => {
//         try {
//             setUpdateLoading(true);
//             const res = await API.post("/subscription/update-card");
//             window.location.href = res.data.url;
//         } catch (err) {
//             alert(err.response?.data?.message || "Failed to open billing portal");
//         } finally {
//             setUpdateLoading(false);
//         }
//     };

//     // 🔥 Connect Bank (Stripe Connect Flow)
//     // MycardsDetails.js - Update handleConnectBank
//     const handleConnectBank = async () => {
//         try {
//             setBankLoading(true);

//             // Agar account already connected hai
//             if (payout?.isActive) {
//                 const res = await API.post("/teacher/stripe-dashboard");

//                 window.location.href = res.data.url;
//                 return;
//             }

//             // Naya account ya onboarding
//             const res = await API.post("/teacher/create-stripe-account");

//             if (res.data.onboardingUrl) {
//                 window.location.href = res.data.onboardingUrl;
//             }

//         } catch (err) {
//             alert(err.response?.data?.message || "Failed");
//         } finally {
//             setBankLoading(false);
//         }
//     };

//     if (loading) return <Spinner />;

//     console.log("PAYOUT:", payout);

//     return (
//         <div>

//             {/* ===================== */}
//             {/* 🔝 SUBSCRIPTION CARD */}
//             {/* ===================== */}
//             <h5 className="fw-bold mb-3">Subscription Payment Method</h5>

//             {!card && (
//                 <Alert variant="warning">
//                     No card found on your account.
//                 </Alert>
//             )}

//             {/* <Alert variant="info" className="mt-3">
//                 <strong>Note:</strong>
//                 This card is used only for purchasing subscription
//             </Alert> */}

//             {card && (
//                 <div className="border rounded p-3 mb-3">
//                     <div className="d-flex justify-content-between align-items-center">
//                         <div>
//                             <strong className="text-uppercase">{card.brand}</strong>{" "}
//                             **** {card.last4}
//                             <div className="text-muted small">
//                                 Expires {card.expMonth}/{card.expYear}
//                             </div>
//                         </div>

//                         <span className="badge bg-success">Default</span>
//                     </div>
//                 </div>
//             )}

//             <Button
//                 variant="dark"
//                 onClick={handleUpdateCard}
//                 disabled={updateLoading}
//                 className="mb-4"
//             >
//                 {updateLoading ? (
//                     <>
//                         <Spinner size="sm" className="me-2" />
//                         Redirecting...
//                     </>
//                 ) : (
//                     "Update Payment Method"
//                 )}
//             </Button>

//             <hr />

//             {/* ===================== */}
//             {/* 🔻 PAYOUT SECTION */}
//             {/* ===================== */}
//             <h5 className="fw-bold mb-3">Receive Payments (Teacher)</h5>

//             {payout && !payout.bank && (
//                 <>
//                     <Alert variant="warning">
//                         You have not connected a bank account yet.
//                     </Alert>
//                     <Alert variant="warning" className="mt-3">
//                         <strong>Important:</strong>
//                         Connect your bank account to receive earnings from comic bundle sales.
//                         If your bank account is not connected or your Stripe account is not fully verified,
//                         payouts cannot be transferred to you.
//                     </Alert>
//                 </>


//             )}

//             {payout?.connected && (
//                 <div className="border rounded p-3 mb-3">

//                     <div className="mb-2">
//                         <strong>Status: </strong>
//                         {payout.payoutsEnabled ? (
//                             <span className="badge bg-success">Ready</span>
//                         ) : (
//                             <span className="badge bg-warning">Pending Verification</span>
//                         )}
//                     </div>

//                     <div>
//                         <strong>Bank: </strong>
//                         {payout.bank || "Not added"}
//                     </div>
//                 </div>
//             )}

//             <Button
//                 variant="primary"
//                 onClick={handleConnectBank}
//                 disabled={bankLoading}
//             >
//                 {bankLoading ? (
//                     <>
//                         <Spinner size="sm" className="me-2" />
//                         Redirecting...
//                     </>
//                 ) : !payout?.connected ? (
//                     "Connect Bank Account"
//                 ) : payout?.isActive ? (
//                     "Manage Stripe Account"
//                 ) : (
//                     "Complete Verification"
//                 )}
//             </Button>

//             <div className="mt-3 text-muted small">
//                 💡 <strong>Card</strong> = pay for subscription &nbsp;·&nbsp; <strong>Bank</strong> = receive earnings
//             </div>

//         </div>
//     );
// };

// export default MycardsDetails;



import React, { useEffect, useState } from "react";
import { Button, Alert, Spinner, Badge } from "react-bootstrap";
import API from "../../API";

const MycardsDetails = () => {
    const [card, setCard] = useState(null);
    const [payout, setPayout] = useState(null);

    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [bankLoading, setBankLoading] = useState(false);

    const fetchData = async () => {
        try {
            try {
                const cardRes = await API.get("/subscription/payment-method");
                setCard(cardRes.data.hasCard ? cardRes.data : null);
            } catch (err) {
                console.log("Card API Error:", err);
                setCard(null);
            }

            try {
                const payoutRes = await API.get("/teacher/payout-status");
                setPayout(payoutRes.data);
            } catch (err) {
                console.log("Payout API Error:", err);
                setPayout(null);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 🔥 Update Card
    const handleUpdateCard = async () => {
        try {
            setUpdateLoading(true);
            const res = await API.post("/subscription/update-card");
            window.location.href = res.data.url;
        } catch (err) {
            alert(err.response?.data?.message || "Failed to open billing portal");
        } finally {
            setUpdateLoading(false);
        }
    };

    // 🔥 Connect Bank
    const handleConnectBank = async () => {
        try {
            setBankLoading(true);

            if (payout?.isActive) {
                const res = await API.post("/teacher/stripe-dashboard");
                window.location.href = res.data.url;
                return;
            }

            const res = await API.post("/teacher/create-stripe-account");
            if (res.data.onboardingUrl) {
                window.location.href = res.data.onboardingUrl;
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed");
        } finally {
            setBankLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <Spinner animation="border" variant="primary" />
                <span className="ms-3 text-muted">Loading payment details...</span>
            </div>
        );
    }

    // ---- Helpers ----
    const getBrandLogo = (brand) => {
        const b = (brand || "").toLowerCase();
        if (b.includes("visa")) return "💳";
        if (b.includes("master")) return "💳";
        if (b.includes("amex")) return "💳";
        if (b.includes("discover")) return "💳";
        return "💳";
    };

    const getBrandColor = (brand) => {
        const b = (brand || "").toLowerCase();
        if (b.includes("visa")) return "#1a1f71";
        if (b.includes("master")) return "#eb001b";
        if (b.includes("amex")) return "#2e77bc";
        if (b.includes("discover")) return "#ff6000";
        return "#374151";
    };

    // ---- Bank button label ----
    const bankButtonLabel = (() => {
        if (!payout?.connected) return "Connect Bank Account";
        if (payout?.isActive) return "Manage Stripe Account";
        return "Complete Verification";
    })();

    return (
        <div>
            <style>{`
        .section-card {
          background: #fff;
          border: 1px solid #eef0f4;
          border-radius: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s ease;
        }
        .section-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .section-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .section-title {
          font-weight: 700;
          margin: 0;
          font-size: 1.05rem;
          color: #1a1a2e;
        }
        .section-sub {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
        }

        .credit-card {
          position: relative;
          border-radius: 14px;
          padding: 1.25rem 1.4rem;
          color: #fff;
          min-height: 150px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          overflow: hidden;
        }
        .credit-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, rgba(255,255,255,0.15), transparent 60%);
          pointer-events: none;
        }
        .credit-card .chip {
          width: 38px; height: 28px;
          border-radius: 6px;
          background: linear-gradient(135deg, #f6d365, #fda085);
          margin-bottom: 0.75rem;
        }
        .credit-card .cc-number {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 1.15rem;
          letter-spacing: 2px;
          font-weight: 600;
        }
        .credit-card .cc-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.7;
          font-weight: 600;
        }
        .credit-card .cc-value {
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
      `}</style>

            {/* ========================================= */}
            {/* 🔝 SUBSCRIPTION PAYMENT METHOD            */}
            {/* ========================================= */}
            <div className="section-card p-4 mb-4">
                <div className="section-header">
                    <div
                        className="section-icon"
                        style={{ background: "#eef2ff", color: "#4338ca" }}
                    >
                        💳
                    </div>
                    <div>
                        <h6 className="section-title">Subscription Payment Method</h6>
                        <p className="section-sub">
                            Card used to pay for your subscription plan
                        </p>
                    </div>
                </div>

                {!card ? (
                    <Alert
                        variant="warning"
                        className="border-0 d-flex align-items-start mb-3"
                    >
                        <span className="me-2" style={{ fontSize: 18 }}>
                            ⚠️
                        </span>
                        <div>
                            <strong>No card on file</strong>
                            <div className="small">
                                Add a payment method to keep your subscription active.
                            </div>
                        </div>
                    </Alert>
                ) : (
                    <div className="row g-4 align-items-center">
                        {/* Realistic credit card visual */}
                        <div className="col-md-5">
                            <div
                                className="credit-card"
                                style={{
                                    background: `linear-gradient(135deg, ${getBrandColor(
                                        card.brand
                                    )} 0%, #111827 130%)`,
                                }}
                            >
                                <div>
                                    <div className="chip" />
                                    <div className="cc-number">
                                        •••• •••• •••• {card.last4}
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-end">
                                    <div>
                                        <div className="cc-label">Card Holder</div>
                                        <div className="cc-value">—</div>
                                    </div>
                                    <div className="text-end">
                                        <div className="cc-label">Expires</div>
                                        <div className="cc-value">
                                            {String(card.expMonth).padStart(2, "0")}/
                                            {String(card.expYear).slice(-2)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-end mt-2">
                                    <span
                                        className="fw-bold text-uppercase"
                                        style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                                    >
                                        {card.brand}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Card meta */}
                        <div className="col-md-7">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <Badge bg="success" pill style={{ fontWeight: 600 }}>
                                    ● Default
                                </Badge>
                                <Badge bg="light" text="dark" pill style={{ fontWeight: 600 }}>
                                    {card.brand?.toUpperCase() || "CARD"}
                                </Badge>
                            </div>

                            <div className="mb-3">
                                <div className="text-muted small text-uppercase fw-semibold mb-1">
                                    Card Number
                                </div>
                                <div
                                    className="fw-semibold"
                                    style={{
                                        fontFamily: "ui-monospace, monospace",
                                        letterSpacing: "1px",
                                    }}
                                >
                                    •••• •••• •••• {card.last4}
                                </div>
                            </div>

                            <div className="mb-3">
                                <div className="text-muted small text-uppercase fw-semibold mb-1">
                                    Expires
                                </div>
                                <div className="fw-semibold">
                                    {String(card.expMonth).padStart(2, "0")}/
                                    {card.expYear}
                                </div>
                            </div>

                            <Button
                                variant="dark"
                                onClick={handleUpdateCard}
                                disabled={updateLoading}
                                className="d-inline-flex align-items-center"
                            >
                                {updateLoading ? (
                                    <>
                                        <Spinner size="sm" className="me-2" />
                                        Redirecting...
                                    </>
                                ) : (
                                    <>
                                        <span className="me-1">✏️</span> Update Payment Method
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {!card && (
                    <Button
                        variant="dark"
                        onClick={handleUpdateCard}
                        disabled={updateLoading}
                        className="d-inline-flex align-items-center"
                    >
                        {updateLoading ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                Redirecting...
                            </>
                        ) : (
                            <>
                                <span className="me-1">➕</span> Add Payment Method
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* ========================================= */}
            {/* 🔻 TEACHER PAYOUT SECTION                 */}
            {/* ========================================= */}
            <div className="section-card p-4">
                <div className="section-header">
                    <div
                        className="section-icon"
                        style={{ background: "#dcfce7", color: "#166534" }}
                    >
                        🏦
                    </div>
                    <div>
                        <h6 className="section-title">Receive Payments (Teacher)</h6>
                        <p className="section-sub">
                            Bank account used to receive earnings from comic bundle sales
                        </p>
                    </div>
                </div>

                {/* --- Not connected state --- */}
                {!payout?.connected && (
                    <>
                        <Alert
                            variant="warning"
                            className="border-0 d-flex align-items-start mb-3"
                        >
                            <span className="me-2" style={{ fontSize: 18 }}>
                                ⚠️
                            </span>
                            <div>
                                <strong>Bank account not connected</strong>
                                <div className="small">
                                    Connect your bank account to receive payouts from comic
                                    bundle sales.
                                </div>
                            </div>
                        </Alert>

                        <Alert
                            variant="info"
                            className="border-0 d-flex align-items-start mb-3"
                        >
                            <span className="me-2" style={{ fontSize: 18 }}>
                                💡
                            </span>
                            <div className="small">
                                <strong>Important:</strong> If your bank account isn't
                                connected or your Stripe account isn't fully verified, payouts
                                cannot be transferred to you.
                            </div>
                        </Alert>
                    </>
                )}

                {/* --- Connected state --- */}
                {payout?.connected && (
                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <div
                                className="p-3 rounded-3 h-100"
                                style={{ background: "#f8fafc", border: "1px solid #e5e7eb" }}
                            >
                                <div className="text-muted small text-uppercase fw-semibold mb-2">
                                    Payout Status
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    {payout.payoutsEnabled ? (
                                        <>
                                            <span
                                                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    background: "#dcfce7",
                                                    color: "#166534",
                                                    fontSize: 14,
                                                }}
                                            >
                                                ✓
                                            </span>
                                            <span className="fw-bold text-success">
                                                Ready to receive payouts
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span
                                                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    background: "#fef3c7",
                                                    color: "#92400e",
                                                    fontSize: 14,
                                                }}
                                            >
                                                ◔
                                            </span>
                                            <span className="fw-bold" style={{ color: "#92400e" }}>
                                                Pending Verification
                                            </span>
                                        </>
                                    )}
                                </div>
                                {!payout.payoutsEnabled && (
                                    <div className="small text-muted mt-2">
                                        Complete your Stripe verification to start receiving
                                        payouts.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div
                                className="p-3 rounded-3 h-100"
                                style={{ background: "#f8fafc", border: "1px solid #e5e7eb" }}
                            >
                                <div className="text-muted small text-uppercase fw-semibold mb-2">
                                    Bank Account
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <span style={{ fontSize: 18 }}>🏦</span>
                                    <span className="fw-semibold">
                                        {payout.bank || "Not added"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <Button
                    variant="primary"
                    onClick={handleConnectBank}
                    disabled={bankLoading}
                    className="d-inline-flex align-items-center"
                >
                    {bankLoading ? (
                        <>
                            <Spinner size="sm" className="me-2" />
                            Redirecting...
                        </>
                    ) : (
                        <>
                            <span className="me-1">
                                {!payout?.connected ? "🔗" : payout?.isActive ? "⚙️" : "✅"}
                            </span>
                            {bankButtonLabel}
                        </>
                    )}
                </Button>
            </div>

            {/* ========================================= */}
            {/* 💡 FOOTER HINT                            */}
            {/* ========================================= */}
            <div
                className="mt-4 p-3 rounded-3 d-flex align-items-start"
                style={{ background: "#f9fafb", border: "1px dashed #e5e7eb" }}
            >
                <span className="me-2" style={{ fontSize: 18 }}>
                    💡
                </span>
                <div className="small text-muted">
                    <strong className="text-dark">Card</strong> = pay for your
                    subscription &nbsp;·&nbsp;{" "}
                    <strong className="text-dark">Bank</strong> = receive earnings from
                    sales
                </div>
            </div>
        </div>
    );
};

export default MycardsDetails;