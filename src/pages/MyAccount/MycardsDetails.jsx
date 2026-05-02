import React, { useEffect, useState } from "react";
import { Button, Alert, Spinner } from "react-bootstrap";
import API from "../../API";

const MycardsDetails = () => {
    const [card, setCard] = useState(null);
    const [payout, setPayout] = useState(null);

    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [bankLoading, setBankLoading] = useState(false);

    // 🔥 Fetch BOTH data
    const fetchData = async () => {
        try {
            const [cardRes, payoutRes] = await Promise.all([
                API.get("/subscription/payment-method"),
                API.get("/teacher/payout-status")
            ]);

            // card
            if (cardRes.data.hasCard) {
                setCard(cardRes.data);
            } else {
                setCard(null);
            }

            // payout
            setPayout(payoutRes.data);

        } catch (err) {
            console.log(err);
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

    // 🔥 Connect Bank (Stripe Connect Flow)
    const handleConnectBank = async () => {
        try {
            setBankLoading(true);

            // 1. create account (if not exists)
            await API.post("/teacher/create-stripe-account");

            // 2. onboarding link
            const res = await API.post("/teacher/onboard");

            window.location.href = res.data.url;

        } catch (err) {
            alert("Failed to connect bank");
        } finally {
            setBankLoading(false);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div>

            {/* ===================== */}
            {/* 🔝 SUBSCRIPTION CARD */}
            {/* ===================== */}
            <h5 className="fw-bold mb-3">Subscription Payment Method</h5>

            {!card && (
                <Alert variant="warning">
                    No card found on your account.
                </Alert>
            )}

            {card && (
                <div className="border rounded p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong className="text-uppercase">{card.brand}</strong>{" "}
                            **** {card.last4}
                            <div className="text-muted small">
                                Expires {card.expMonth}/{card.expYear}
                            </div>
                        </div>

                        <span className="badge bg-success">Default</span>
                    </div>
                </div>
            )}

            <Button
                variant="dark"
                onClick={handleUpdateCard}
                disabled={updateLoading}
                className="mb-4"
            >
                {updateLoading ? (
                    <>
                        <Spinner size="sm" className="me-2" />
                        Redirecting...
                    </>
                ) : (
                    "Update Payment Method"
                )}
            </Button>

            <hr />

            {/* ===================== */}
            {/* 🔻 PAYOUT SECTION */}
            {/* ===================== */}
            <h5 className="fw-bold mb-3">Receive Payments (Teacher)</h5>

            {!payout?.connected && (
                <Alert variant="warning">
                    You have not connected a bank account yet.
                </Alert>
            )}

            {payout?.connected && (
                <div className="border rounded p-3 mb-3">

                    <div className="mb-2">
                        <strong>Status: </strong>
                        {payout.payoutsEnabled ? (
                            <span className="badge bg-success">Ready</span>
                        ) : (
                            <span className="badge bg-warning">Pending Verification</span>
                        )}
                    </div>

                    <div>
                        <strong>Bank: </strong>
                        {payout.bank || "Not added"}
                    </div>
                </div>
            )}

            <Button
                variant="primary"
                onClick={handleConnectBank}
                disabled={bankLoading}
            >
                {bankLoading ? (
                    <>
                        <Spinner size="sm" className="me-2" />
                        Redirecting...
                    </>
                ) : payout?.connected ? (
                    "Update Bank Details"
                ) : (
                    "Connect Bank Account"
                )}
            </Button>

        </div>
    );
};

export default MycardsDetails;