// import React, { useEffect } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import API from "../../API";

// const SubscriptionSuccess = () => {
//     const [params] = useSearchParams();
//     const navigate = useNavigate();

//     const sessionId = params.get("session_id");

//     useEffect(() => {
//         if (!sessionId) return;

//         const createSubscription = async () => {
//             try {
//                 await API.post("/user/createSubscription", {
//                     sessionId,
//                     // backend Stripe se planType verify kar lega,
//                     // but tum optional bhej sakte ho
//                     planType: "bundle",
//                 });

//                 navigate("/create-comic"); // ya /profile
//             } catch (err) {
//                 console.error(err);
//                 alert("Subscription creation failed");
//             }
//         };

//         createSubscription();
//     }, [sessionId, navigate]);

//     return (
//         <div className="text-center py-5">
//             <h3>Payment successful 🎉</h3>
//             <p>Setting up your subscription...</p>
//         </div>
//     );
// };

// export default SubscriptionSuccess;




import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../API";

const SubscriptionSuccess = () => {
    const navigate = useNavigate();
    const [tries, setTries] = useState(0);

    useEffect(() => {
        const checkSubscription = async () => {
            try {
                await API.get("/subscription/active");

                // ✅ Webhook ne DB update kar diya
                navigate("/my-account?tab=subscription");
            } catch (err) { 
                // Webhook thoda late ho sakta hai
                if (tries < 5) {
                    setTimeout(() => {
                        setTries((prev) => prev + 1);
                    }, 2000);
                } else {
                    alert("Subscription setup is taking longer than expected.");
                }
            }
        };

        checkSubscription();
    }, [tries, navigate]);

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
