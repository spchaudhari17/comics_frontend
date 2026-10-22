import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "react-bootstrap";
import { trackClick } from "../../utility/analytics";

// Route: <Route path="/credits/payment-result" element={<CreditsPaymentResult />} />
// Stripe payment ke baad (naye tab me) ye page khulta hai
const CreditsPaymentResult = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const isSuccess = params.get("status") === "success";

    useEffect(() => {
        trackClick(isSuccess ? "edit_credits_payment_success_page" : "edit_credits_payment_cancel_page", {});
    }, [isSuccess]);

    // window.close() sirf script se khule tab pe chalta hai; na chale to My Comics pe bhej do
    const handleClose = () => {
        window.close();
        setTimeout(() => navigate("/my-comics"), 300);
    };

    return (
        <div className="container py-5 d-flex justify-content-center">
            <div className="bg-white border rounded-4 shadow-sm p-4 p-md-5 text-center" style={{ maxWidth: 520 }}>
                {isSuccess ? (
                    <>
                        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: 56 }}></i>
                        <h4 className="fw-bold mt-3">Payment successful</h4>
                        <p className="text-muted mb-4">
                            Your edit credits will be added in a few seconds. You can close this tab and go back
                            to your comic, the balance updates automatically.
                        </p>
                    </>
                ) : (
                    <>
                        <i className="bi bi-x-circle-fill text-secondary" style={{ fontSize: 56 }}></i>
                        <h4 className="fw-bold mt-3">Payment cancelled</h4>
                        <p className="text-muted mb-4">
                            No money was taken and no credits were added. You can close this tab and try again
                            from your comic.
                        </p>
                    </>
                )}

                <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <Button variant="primary" onClick={handleClose}>
                        Close this tab
                    </Button>
                    <Button variant="outline-secondary" onClick={() => navigate("/my-comics")}>
                        Go to My Comics
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreditsPaymentResult;