import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../../API";

const CartSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);

    const sessionId = searchParams.get("session_id");

    useEffect(() => {
        const completePurchase = async () => {
            try {
                await API.post("/user/completePurchase", { sessionId });

                setTimeout(() => {
                    navigate("/my-account");
                }, 1500);

            } catch (err) {
                console.error(err);
                alert("Error completing purchase");
                navigate("/cart");
            } finally {
                setLoading(false);
            }
        };

        if (sessionId) {
            completePurchase();
        }
    }, [sessionId, navigate]);

    return (
        <div className="text-center py-5">
            <h3>🎉 Payment Successful</h3>

            {loading ? (
                <p>Processing your purchase...</p>
            ) : (
                <p>Redirecting to your purchases...</p>
            )}

            <small className="text-muted">
                Please don’t refresh this page
            </small>
        </div>
    );
};

export default CartSuccess;