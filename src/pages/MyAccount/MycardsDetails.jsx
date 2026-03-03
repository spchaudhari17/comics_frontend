import React, { useEffect, useState } from "react";
import { Button, Alert, Spinner } from "react-bootstrap";
import API from "../../API";

const MycardsDetails = () => {
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);

    const fetchCard = async () => {
        try {
            const res = await API.get("/subscription/payment-method");

            if (res.data.hasCard) {
                setCard(res.data);
            } else {
                setCard(null);
            }
        } catch {
            setCard(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCard();
    }, []);

    const handleUpdateCard = async () => {
        try {
            setUpdateLoading(true);
            const res = await API.post("/subscription/update-card");
            window.location.href = res.data.url; // Redirect to Stripe Billing Portal
        } catch (err) {
            alert(err.response?.data?.message || "Failed to open billing portal");
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div>
            <h5 className="fw-bold mb-3">Payment Method</h5>

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

                        <div>
                            <span className="badge bg-success">Default</span>
                        </div>
                    </div>
                </div>
            )}

            <Button
                variant="dark"
                onClick={handleUpdateCard}
                disabled={updateLoading}
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
        </div>
    );
};

export default MycardsDetails;