import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../API";

const SubscriptionSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        let attempts = 0;

        const interval = setInterval(async () => {
            try {
                const res = await API.get("/subscription/me");

                if (res.data.hasSubscription) {
                    clearInterval(interval);
                    navigate("/my-account?tab=subscription");
                }

            } catch (err) {
                console.error("Waiting for subscription setup...");
            }

            attempts++;

            if (attempts >= 15) {
                clearInterval(interval);
                alert("Subscription setup is taking longer than expected. Please refresh your account page.");
            }

        }, 2000);

        return () => clearInterval(interval);

    }, [navigate]);

    return (
        <div className="text-center py-5">
            <h3>Payment successful 🎉</h3>
            <p>Setting up your subscription...</p>
            <small className="text-muted">
                Please don’t refresh this page
            </small>
        </div>
    );
};

export default SubscriptionSuccess;
