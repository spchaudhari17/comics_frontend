import React from "react";
import { useNavigate } from "react-router-dom";

const CancelPage = () => {
    const navigate = useNavigate();

    return (
        <div className="text-center py-5">
            <h3>❌ Payment Cancelled</h3>
            <p>Your transaction was not completed.</p>

            <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/cart")}
            >
                Back to Cart
            </button>
        </div>
    );
};

export default CancelPage;