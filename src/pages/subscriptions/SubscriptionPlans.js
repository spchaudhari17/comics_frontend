import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Badge } from "react-bootstrap";
import "./SubscriptionPlans.css";
import API from "../../API";
import { useNavigate } from "react-router-dom";
import { Modal, Spinner } from "react-bootstrap";


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

    const [currentSub, setCurrentSub] = useState(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedPriceId, setSelectedPriceId] = useState(null);
    const [selectedPlanType, setSelectedPlanType] = useState(null);
    const [upgradeLoading, setUpgradeLoading] = useState(false);
    const [upgradeMode, setUpgradeMode] = useState(null);

    const getPriceAmount = (priceId) => {
        const allPlans = [...plans, ...dashboardPlans];
        const found = allPlans.find(p => p.priceId === priceId);
        return found ? parseFloat(found.price.replace("$", "")) : 0;
    };


    useEffect(() => {
        if (isLoggedIn()) {
            API.get("/subscription/me")
                .then(res => {
                    if (res.data.hasSubscription) {
                        setCurrentSub(res.data);
                    }
                })
                .catch(() => { });
        }
    }, []);

    const isLoggedIn = () => {
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("token"); // agar token bhi use hota hai
        return Boolean(user && token);
    };

    const handleSelectPlan = async (priceId, planType) => {

        if (!isLoggedIn()) {
            navigate("/login");
            return;
        }

        if (!currentSub) {
            const res = await API.post("/user/create-checkout-session", {
                priceId,
                planType,
            });
            window.location.href = res.data.url;
            return;
        }

        if (priceId === currentSub.priceId) {
            return;
        }

        const currentPrice = getPriceAmount(currentSub.priceId);
        const newPrice = getPriceAmount(priceId);

        setSelectedPriceId(priceId);
        setSelectedPlanType(planType);

        if (newPrice > currentPrice) {
            setUpgradeMode("upgrade");
        } else {
            setUpgradeMode("downgrade");
        }

        setShowUpgradeModal(true);
    };



    const handleUpgrade = async (mode) => {
        try {
            setUpgradeLoading(true);

            if (mode === "immediate") {
                await API.post("/subscription/upgrade-immediate", {
                    priceId: selectedPriceId,
                    // planType: selectedPlanType,
                });
            } else {
                await API.post("/subscription/upgrade-scheduled", {
                    priceId: selectedPriceId,
                    planType: selectedPlanType,
                });
            }

            const updated = await API.get("/subscription/me");

            if (updated.data.hasSubscription) {
                setCurrentSub(updated.data);
            }

            setShowUpgradeModal(false);

        } catch (err) {
            alert(err.response?.data?.message || "Action failed");
        } finally {
            setUpgradeLoading(false);
        }
    };




    return (
        <>
            {/* ===== Bundled Plans (UNCHANGED) ===== */}
            <section className="subscription-plans-section py-5">
                {currentSub && (
                    <p className="text-center text-muted small mb-4">
                        Current plan renews on{" "}
                        {currentSub.endDate &&
                            new Date(currentSub.endDate).toLocaleDateString()}
                    </p>
                )}
                <Container>
                    {currentSub?.hasPendingChange && (
                        <div className="text-center mb-4">
                            <div className="alert alert-info">
                                <strong>Plan change scheduled.</strong>
                                <br />
                                New plan will activate on{" "}
                                {currentSub.pendingApplyDate &&
                                    new Date(currentSub.pendingApplyDate).toLocaleDateString()}
                                <p className="text-muted small mt-2">
                                    You cannot schedule another change until this one is applied.
                                </p>
                            </div>
                        </div>
                    )}

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

                                    {currentSub?.hasPendingChange ? (
                                        <Button disabled className="w-100">
                                            Change Scheduled
                                        </Button>
                                    ) : currentSub?.priceId === plan.priceId ? (
                                        <Button disabled className="w-100">
                                            Current Plan
                                        </Button>
                                    ) : (
                                        <Button
                                            className="btn btn-custom w-100 py-2"
                                            onClick={() => handleSelectPlan(plan.priceId, "bundle")}
                                        >
                                            {currentSub ? "Change Plan" : "Select Plan"}
                                        </Button>
                                    )}

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

                                    {currentSub?.hasPendingChange ? (
                                        <Button disabled className="w-100">
                                            Change Scheduled
                                        </Button>
                                    ) : currentSub?.priceId === plan.priceId ? (
                                        <Button disabled className="w-100">
                                            Current Plan
                                        </Button>
                                    ) : (
                                        <Button
                                            className="btn btn-custom w-100 py-2"
                                            onClick={() => handleSelectPlan(plan.priceId, "dashboard")}
                                        >
                                            {currentSub ? "Change Plan" : "Select Plan"}
                                        </Button>
                                    )}
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

            <Modal
                show={showUpgradeModal}
                onHide={() => setShowUpgradeModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Change Subscription Plan</Modal.Title>
                </Modal.Header>

                <Modal.Body>

                    {upgradeMode === "upgrade" && (
                        <>
                            <p className="mb-3">
                                This is an upgrade. How would you like to apply it?
                            </p>

                            <div className="d-grid gap-3">

                                <Button
                                    variant="primary"
                                    onClick={() => handleUpgrade("immediate")}
                                    disabled={upgradeLoading}
                                >
                                    {upgradeLoading ? (
                                        <>
                                            <Spinner size="sm" className="me-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Apply Immediately (Prorated Charge)"
                                    )}
                                </Button>

                                <Button
                                    variant="outline-dark"
                                    onClick={() => handleUpgrade("scheduled")}
                                    disabled={upgradeLoading}
                                >
                                    Apply Next Billing Cycle
                                </Button>
                            </div>
                        </>
                    )}

                    {upgradeMode === "downgrade" && (
                        <>
                            <p className="mb-3">
                                This is a downgrade.
                            </p>

                            <p className="text-muted small">
                                Downgrades are applied at the next billing cycle.
                                You will keep your current access until then.
                            </p>

                            <Button
                                variant="dark"
                                onClick={() => handleUpgrade("scheduled")}
                                disabled={upgradeLoading}
                            >
                                {upgradeLoading ? (
                                    <>
                                        <Spinner size="sm" className="me-2" />
                                        Scheduling...
                                    </>
                                ) : (
                                    "Schedule Downgrade"
                                )}
                            </Button>
                        </>
                    )}

                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowUpgradeModal(false)}
                        disabled={upgradeLoading}
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>




        </>
    );
};

export default SubscriptionPlans;
