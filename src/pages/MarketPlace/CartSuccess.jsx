// CartSuccess.js - Fixed with better error handling

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../../API";
import { toast } from "react-toastify";

const CartSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("processing");
    const [errorMessage, setErrorMessage] = useState("");

    const sessionId = searchParams.get("session_id");

    useEffect(() => {
        const checkPaymentStatus = async () => {
            // 🔥 Check if sessionId exists
            if (!sessionId) {
                console.log("❌ No sessionId found in URL");
                setErrorMessage("No session ID found");
                setStatus("error");
                setLoading(false);
                toast.error("Session ID missing");
                setTimeout(() => navigate("/cart"), 3000);
                return;
            }

            console.log("🔍 Session ID:", sessionId);

            try {
                console.log("📤 Calling API...");
                const res = await API.get(`/user/payment/status/${sessionId}`);
                console.log("📦 API Response:", res.data);

                if (res.data.status === "success") {
                    setStatus("success");
                    toast.success("Payment successful!");
                    setTimeout(() => navigate("/my-account"), 2000);

                } else if (res.data.status === "pending") {
                    setStatus("pending");
                    toast.info("Payment is being processed...");
                    setTimeout(() => navigate("/my-account"), 3000);

                } else {
                    setErrorMessage(res.data.message || "Unknown status");
                    setStatus("error");
                    toast.error("Payment verification failed");
                    setTimeout(() => navigate("/cart"), 3000);
                }

            } catch (err) {
                console.error("❌ Error:", err);
                console.error("❌ Response:", err.response);

                // 🔥 Handle specific errors
                if (err.response?.status === 401) {
                    setErrorMessage("Please login to verify your payment.");
                    toast.error("Please login");
                    setTimeout(() => navigate("/login"), 3000);

                } else if (err.response?.status === 404) {
                    setErrorMessage("Payment session not found.");
                    toast.error("Session not found");
                    setTimeout(() => navigate("/cart"), 3000);

                } else if (err.response?.status === 500) {
                    setErrorMessage("Server error. Your payment may still be processing.");
                    toast.error("Server error");
                    setTimeout(() => navigate("/my-account"), 3000);

                } else {
                    setErrorMessage(err.response?.data?.message || "Something went wrong");
                    toast.error("Something went wrong");
                    setTimeout(() => navigate("/cart"), 3000);
                }

                setStatus("error");

            } finally {
                setLoading(false);
            }
        };

        checkPaymentStatus();
    }, [sessionId, navigate]);

    // Loading State
    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h3>⏳ Processing Your Purchase...</h3>
                <p className="text-muted">Please don't close this page</p>
            </div>
        );
    }

    // Success State
    if (status === "success") {
        return (
            <div className="text-center py-5">
                <div className="mb-4">
                    <span className="display-1">✅</span>
                </div>
                <h3 className="text-success">Payment Successful!</h3>
                <p>Your purchase has been completed successfully.</p>
                <p className="text-muted">Redirecting to your purchases...</p>
                <button
                    className="btn btn-primary mt-3"
                    onClick={() => navigate("/my-account")}
                >
                    Go to My Purchases
                </button>
            </div>
        );
    }

    // Pending State
    if (status === "pending") {
        return (
            <div className="text-center py-5">
                <div className="mb-4">
                    <span className="display-1">⏳</span>
                </div>
                <h3 className="text-warning">Payment Processing</h3>
                <p>Your payment is being processed.</p>
                <p className="text-muted">Redirecting to your purchases...</p>
            </div>
        );
    }

    // Error State
    if (status === "error") {
        return (
            <div className="text-center py-5">
                <div className="mb-4">
                    <span className="display-1">❌</span>
                </div>
                <h3 className="text-danger">Something Went Wrong</h3>
                <p>{errorMessage || "Unable to verify your payment."}</p>
                <div className="mt-3">
                    <button
                        className="btn btn-primary me-2"
                        onClick={() => navigate("/my-account")}
                    >
                        Check My Purchases
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate("/market-Place")}
                    >
                        Back to Marketplace
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default CartSuccess;