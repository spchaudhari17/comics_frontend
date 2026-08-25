import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../API";

const FoundingTeacherSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        let attempts = 0;
        let isChecking = false;

        const interval = setInterval(async () => {
            if (isChecking) return;

            isChecking = true;

            try {
                const res = await API.get("/teacher/get-founding-teacher");

                if (res.data?.success && res.data?.data?.isFoundingTeacher) {
                    clearInterval(interval);

                    navigate("/my-account?tab=subscription");
                    return;
                }
            } catch (err) {
                console.log("Waiting for Founding Teacher activation...");
            } finally {
                isChecking = false;
            }

            attempts++;

            if (attempts >= 15) {
                clearInterval(interval);

                alert(
                    "Your payment was successful, but your Founding Teacher status is taking a little longer to activate. Please refresh the page after a few moments."
                );
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <div
            className="container d-flex justify-content-center align-items-center py-5"
            style={{ minHeight: "85vh" }}
        >
            <div
                className="card shadow-lg border-0 rounded-4 text-center p-5"
                style={{ maxWidth: "700px", width: "100%" }}
            >
                {/* Success Icon */}
                <div
                    className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                        width: "90px",
                        height: "90px",
                        background: "#d1fae5",
                        color: "#16a34a",
                        fontSize: "42px",
                    }}
                >
                    🎉
                </div>

                {/* Heading */}
                <h2 className="fw-bold text-success mb-3">
                    Welcome to the Founding Teacher Program!
                </h2>

                <p className="text-muted fs-5 mb-4">
                    Your payment has been received successfully.
                    <br />
                    We're activating your <strong>Founding Teacher</strong> benefits.
                </p>

                {/* Benefits */}
                <div className="alert alert-success text-start border-0 shadow-sm">
                    <h5 className="fw-bold mb-3">
                        Your Exclusive Benefits
                    </h5>

                    <ul className="mb-0 ps-3">
                        <li className="mb-2">
                            ✅ Lifetime discounted subscription pricing
                        </li>

                        <li className="mb-2">
                            ✅ Exclusive Founding Teacher Badge
                        </li>

                        <li className="mb-2">
                            ✅ 2× Marketplace Exposure
                        </li>

                        <li className="mb-2">
                            ✅ Blog & Social Media Promotion
                        </li>

                        <li className="mb-2">
                            ✅ 20% Lifetime School Referral Commission
                        </li>
                    </ul>
                </div>

                {/* Loader */}
                <div className="mt-4">
                    <div
                        className="spinner-border text-success"
                        role="status"
                        style={{
                            width: "3rem",
                            height: "3rem",
                        }}
                    >
                        <span className="visually-hidden">Loading...</span>
                    </div>

                    <h5 className="mt-4 fw-semibold">
                        Activating Your Account...
                    </h5>

                    <p className="text-muted mb-2">
                        Please wait while we verify your payment and enable
                        your Founding Teacher benefits.
                    </p>

                    <small className="text-secondary">
                        This usually takes only a few seconds.
                        <br />
                        Please don't close or refresh this page.
                    </small>
                </div>
            </div>
        </div>
    );
};

export default FoundingTeacherSuccess;