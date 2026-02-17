import React from "react";
import { Container, Row, Col, Button, Badge } from "react-bootstrap";
import "./SubscriptionPlans.css";
import API from "../../API";
import { useNavigate } from "react-router-dom";


const plans = [
    {
        name: "Starter",
        price: "$24.99",
        duration: "/month",
        badge: null,
        features: [
            "5 comics per week",
            "Student Dashboard included ($5/month)",
            "Up to 20 students",
            "Teacher analytics access",
        ],
        priceId: "price_1SvojF1hJWq07BPoiLXsGdb2",
    },
    {
        name: "Growth",
        price: "$39.99",
        duration: "/month",
        badge: "Best Value",
        features: [
            "10 comics per week",
            "Student Dashboard included ($10/month)",
            "Up to 50 students",
            "Priority support",
        ],
        priceId: "price_1SvokW1hJWq07BPoF5eqF96u",
    },
    {
        name: "Pro",
        price: "$59.99",
        duration: "/month",
        badge: null,
        features: [
            "20 comics per week",
            "Student Dashboard included ($20/month)",
            "Up to 100 students",
            "Advanced teacher tools",
        ],
        priceId: "price_1Svoky1hJWq07BPot9vtsvOV",
    },
];

const dashboardPlans = [
    {
        name: "Dashboard Basic",
        price: "$5",
        duration: "/month",
        students: "Up to 20 students",
        priceId: "price_1SvomW1hJWq07BPoTrxz3Tyb",
    },
    {
        name: "Dashboard Plus",
        price: "$10",
        duration: "/month",
        students: "Up to 50 students",
        priceId: "price_1Svomk1hJWq07BPo9IjJLtZD",
    },
    {
        name: "Dashboard Pro",
        price: "$20",
        duration: "/month",
        students: "Up to 100 students",
        priceId: "price_1Svoms1hJWq07BPobzFCz5b8",
    },
];

const SubscriptionPlans = () => {
    const navigate = useNavigate();

    const isLoggedIn = () => {
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("token"); // agar token bhi use hota hai
        return Boolean(user && token);
    };

    const handleSelectPlan = async (priceId, planType) => {

        // 🚫 NOT LOGGED IN
        if (!isLoggedIn()) {
            // optional: save intent (real-world UX)
            localStorage.setItem("redirectAfterLogin", "/subscription-plans");

            navigate("/login");
            return;
        }

        // ✅ LOGGED IN → STRIPE
        try {
            const res = await API.post("/user/create-checkout-session", {
                priceId,
                planType,
            });

            if (res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (err) {
            alert(err.response?.data?.message || "Unable to start checkout");
        }
    };


    return (
        <>
            {/* ===== Bundled Plans (UNCHANGED) ===== */}
            <section className="subscription-plans-section py-5">
                <Container>
                    <div className="text-center mb-5">
                        <div className="section-heading mb-2">
                            Choose Your Subscription Plan
                        </div>
                        <p className="text-muted">
                            Simple monthly pricing for teachers. Upgrade anytime.
                        </p>
                    </div>

                    <Row className="g-4 justify-content-center">
                        {plans.map((plan, index) => (
                            <Col lg={4} md={6} key={index}>
                                <div className="plan-card h-100 position-relative">
                                    {plan.badge && (
                                        <Badge className="plan-badge">{plan.badge}</Badge>
                                    )}

                                    <div className="plan-header text-center mb-4">
                                        <h5 className="fw-semibold mb-2">{plan.name}</h5>
                                        <div className="plan-price">
                                            <span className="price">{plan.price}</span>
                                            <span className="duration">{plan.duration}</span>
                                        </div>
                                    </div>

                                    <ul className="plan-features list-unstyled mb-4">
                                        {plan.features.map((feature, i) => (
                                            <li key={i}>
                                                <i className="bi bi-check-circle-fill me-2"></i>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        className="btn btn-custom w-100 py-2"
                                        onClick={() => handleSelectPlan(plan.priceId, "bundle")}
                                    >
                                        Select Plan
                                    </Button>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ===== Standalone Dashboard Plans (NEW – niche) ===== */}
            <section className="subscription-plans-section py-5 pt-0">
                <Container>
                    <div className="text-center mb-5">
                        <div className="section-heading mb-2">
                            Student Dashboard Plans
                        </div>
                        <p className="text-muted">
                            Only need the dashboard? Choose a standalone plan.
                        </p>
                    </div>

                    <Row className="g-4 justify-content-center">
                        {dashboardPlans.map((plan, index) => (
                            <Col lg={4} md={6} key={index}>
                                <div className="plan-card h-100 text-center">
                                    <div className="plan-header mb-4">
                                        <h5 className="fw-semibold mb-2">{plan.name}</h5>
                                        <div className="plan-price">
                                            <span className="price">{plan.price}</span>
                                            <span className="duration">{plan.duration}</span>
                                        </div>
                                    </div>

                                    <ul className="plan-features list-unstyled mb-4">
                                        <li>
                                            <i className="bi bi-check-circle-fill me-2"></i>
                                            {plan.students}
                                        </li>
                                    </ul>

                                    <Button
                                        className="btn btn-custom w-100 py-2"
                                        onClick={() => handleSelectPlan(plan.priceId, "dashboard")}
                                    >
                                        Select Plan
                                    </Button>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* ===== Subscription Rules Link ===== */}
            <section className="py-4 bg-light">
                <Container className="text-center">
                    <p className="mb-2 text-muted">
                        By purchasing a subscription, you agree to our subscription terms and conditions.
                    </p>
                    <Button
                        variant="outline-dark"
                        size="sm"
                        onClick={() => navigate("/subscription-rules")}
                    >
                        View Subscription Rules
                    </Button>
                </Container>
            </section>

        </>
    );
};

export default SubscriptionPlans;
