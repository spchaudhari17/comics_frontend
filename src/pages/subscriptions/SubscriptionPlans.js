import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Badge } from "react-bootstrap";
import "./SubscriptionPlans.css";
import API from "../../API";
import { useNavigate } from "react-router-dom";
import { Modal, Spinner } from "react-bootstrap";



// const plans = [
//     {
//         name: "Starter",
//         price: "$4.99",
//         originalPrice: "$24.99",
//         duration: "/month",
//         badge: null,
//         features: [
//             "Up to 5 new AI comics each week (20 per month)",
//             "Fully editable stories with rich custom visuals",
//             "Built-in quizzes (Normal + Hardcore mode with powerups)",
//             "Supports up to 20 students",
//             "Weekly student performance insights",
//             "Monthly consolidated progress report",
//             "Full commercial rights to your generated comics",
//         ],
//         priceId: "price_1T7C1lKGzJOFnjXyBzb0fvZ6",
//     },
//     {
//         name: "Growth",
//         price: "$7.99",
//         originalPrice: "$39.99",
//         duration: "/month",
//         badge: "Best Value",
//         features: [
//             "Up to 10 new AI comics each week (40 per month)",
//             "Advanced quiz engine with timed challenges",
//             "Supports up to 50 students",
//             "Enhanced weekly insights",
//             "Detailed monthly performance analytics",
//             "Commercial rights included",
//         ],
//         priceId: "price_1T7C1xKGzJOFnjXyq4FXqK1x",
//     },
//     {
//         name: "Pro",
//         price: "$11.99",
//         originalPrice: "$59.99",
//         duration: "/month",
//         badge: null,
//         features: [
//             "Up to 20 new AI comics each week (80 per month)",
//             "Full advanced assessment system (Normal + Hardcore)",
//             "Supports up to 100 students",
//             "Comprehensive weekly tracking",
//             "Advanced monthly analytics reports",
//             "Commercial rights included",
//         ],
//         priceId: "price_1T7C28KGzJOFnjXyfdAo2ToJ",
//     },
// ];

// live
const plans = [
    {
        name: "Starter",
        price: "$4.99",
        originalPrice: "$24.99",
        duration: "/month",
        badge: null,
        features: [
            "Up to 5 new AI comics each week (20 per month)",
            "Fully editable stories with rich custom visuals",
            "Built-in quizzes (Normal + Hardcore mode with powerups)",
            "Supports up to 20 students",
            "Weekly student performance insights",
            "Monthly consolidated progress report",
            "Full commercial rights to your generated comics",
        ],
        priceId: "price_1T7dNbKGzJOFnjXyfFxrlv7m",
    },
    {
        name: "Growth",
        price: "$7.99",
        originalPrice: "$39.99",
        duration: "/month",
        badge: "Best Value",
        features: [
            "Up to 10 new AI comics each week (40 per month)",
            "Advanced quiz engine with timed challenges",
            "Supports up to 50 students",
            "Enhanced weekly insights",
            "Detailed monthly performance analytics",
            "Commercial rights included",
        ],
        priceId: "price_1T7dO3KGzJOFnjXy2lPD3Ldz",
    },
    {
        name: "Pro",
        price: "$11.99",
        originalPrice: "$59.99",
        duration: "/month",
        badge: null,
        features: [
            "Up to 20 new AI comics each week (80 per month)",
            "Full advanced assessment system (Normal + Hardcore)",
            "Supports up to 100 students",
            "Comprehensive weekly tracking",
            "Advanced monthly analytics reports",
            "Commercial rights included",
        ],
        priceId: "price_1T7dODKGzJOFnjXywACAu03j",
    },
];



// const dashboardPlans = [
//     {
//         name: "Small Classroom",
//         price: "$4.99",
//         duration: "/month",
//         features: [
//             "Up to 20 students",
//             "Weekly performance insights",
//             "Monthly progress summary",
//         ],
//         priceId: "price_1T6wozKGzJOFnjXyD61eBJYK",
//     },
//     {
//         name: "Medium Classroom",
//         price: "$9.99",
//         duration: "/month",
//         features: [
//             "Up to 50 students",
//             "Weekly performance insights",
//             "Monthly progress summary",
//         ],
//         priceId: "price_1T6wpFKGzJOFnjXy1u6aLEx0",
//     },
//     {
//         name: "Large Classroom",
//         price: "$19.99",
//         duration: "/month",
//         features: [
//             "Up to 100 students",
//             "Weekly performance insights",
//             "Monthly progress summary",
//         ],
//         priceId: "price_1T6wpSKGzJOFnjXyPps9FMUG",
//     },
// ];

// live
const dashboardPlans = [
    {
        name: "Small Classroom",
        price: "$4.99",
        duration: "/month",
        features: [
            "Up to 20 students",
            "Weekly performance insights",
            "Monthly progress summary",
        ],
        priceId: "price_1T7dOiKGzJOFnjXyWL0P3An7",
    },
    {
        name: "Medium Classroom",
        price: "$9.99",
        duration: "/month",
        features: [
            "Up to 50 students",
            "Weekly performance insights",
            "Monthly progress summary",
        ],
        priceId: "price_1T7dP6KGzJOFnjXyrAE0ZL0E",
    },
    {
        name: "Large Classroom",
        price: "$19.99",
        duration: "/month",
        features: [
            "Up to 100 students",
            "Weekly performance insights",
            "Monthly progress summary",
        ],
        priceId: "price_1T7dPIKGzJOFnjXyfI8vdrc8",
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
                {currentSub?.status === "to_cancel" && (
                    <div className="alert alert-warning text-center mb-4">
                        <h6 className="fw-semibold mb-2">
                            Subscription Cancelled
                        </h6>
                        <p className="mb-1">
                            Your plan will end on{" "}
                            <strong>
                                {new Date(currentSub.endDate).toLocaleDateString()}
                            </strong>.
                        </p>
                        <p className="mb-0 small text-muted">
                            You can continue using all features until this date.
                        </p>
                    </div>
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

                    <div className="text-center mb-3">
                        <div className="alert alert-warning fw-semibold">
                            🚀 Hurry Up! First 100 subscribers get <strong>80% OFF</strong> on Comics Plans.
                        </div>
                    </div>


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
                                        {/* <div className="plan-price">
                                            <span className="price">{plan.price}</span>
                                            <span className="duration">{plan.duration}</span>
                                        </div> */}

                                        <div className="plan-price">
                                            <div className="d-flex justify-content-center align-items-center gap-2">

                                                <span className="price text-success fw-bold">
                                                    {plan.price}
                                                </span>

                                                {plan.originalPrice && (
                                                    <span className="text-muted text-decoration-line-through">
                                                        {plan.originalPrice}
                                                    </span>
                                                )}


                                            </div>

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

                                    {currentSub?.status === "to_cancel" ? (
                                        <div className="mt-auto">
                                            <Button disabled className="w-100">
                                                Cancels on{" "}
                                                {new Date(currentSub.endDate).toLocaleDateString()}
                                            </Button>
                                        </div>

                                    ) : currentSub?.hasPendingChange ? (
                                        <div className="mt-auto">
                                            <Button disabled className="w-100">
                                                Change Scheduled
                                            </Button>
                                        </div>

                                    ) : currentSub?.priceId === plan.priceId ? (
                                        <div className="mt-auto">
                                            <Button disabled className="w-100">
                                                Current Plan
                                            </Button>
                                        </div>

                                    ) : (
                                        <div className="mt-auto">
                                            <Button
                                                className="btn btn-custom w-100 py-2"
                                                onClick={() => handleSelectPlan(plan.priceId, "bundle")}
                                            >
                                                {currentSub ? "Change Plan" : "Select Plan"}
                                            </Button>
                                        </div>
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
                                <div className="plan-card h-100">
                                    <div className="plan-header mb-4">
                                        <h5 className="fw-semibold mb-2 text-center">{plan.name}</h5>
                                        <div className="plan-price text-center">
                                            <span className="price">{plan.price}</span>
                                            <span className="duration">{plan.duration}</span>
                                        </div>
                                    </div>

                                    <ul className="plan-features list-unstyled mb-4">
                                        <li>


                                            {plan.features?.map((feature, i) => (
                                                <li key={i}>
                                                    <i className="bi bi-check-circle-fill me-2"></i>
                                                    {feature}
                                                </li>
                                            ))}
                                        </li>
                                    </ul>

                                    {/* {currentSub?.hasPendingChange ? (
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
                                    )} */}


                                    {currentSub?.status === "to_cancel" ? (
                                        <div className="mt-auto">
                                            <Button disabled className="w-100">
                                                Cancels on{" "}
                                                {new Date(currentSub.endDate).toLocaleDateString()}
                                            </Button>
                                        </div>

                                    ) : currentSub?.hasPendingChange ? (
                                        <Button disabled className="w-100">
                                            Change Scheduled
                                        </Button>

                                    ) : currentSub?.priceId === plan.priceId ? (
                                        <Button disabled className="w-100">
                                            Current Plan
                                        </Button>

                                    ) : (
                                        <div className="mt-auto">
                                            <Button
                                                className="btn btn-custom w-100 py-2"
                                                onClick={() => handleSelectPlan(plan.priceId, "dashboard")}
                                            >
                                                {currentSub ? "Change Plan" : "Select Plan"}
                                            </Button>
                                        </div>
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
