import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Badge, Tab, Nav, Alert, Spinner } from "react-bootstrap";
import "./SubscriptionPlans.css";
import API from "../../API";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";

// Standard Plans (Original)
const standardPlans = [
    {
        name: "Starter",
        price: "$24.99",
        duration: "/month",
        badge: null,
        features: [
            "Up to 5 new AI comics each week (20 per month)",
            "Fully editable stories with rich custom visuals",
            "Built-in quizzes (Normal + Hardcore mode with powerups)",
            "Dashboard supports up to 20 students",
            "Weekly student performance insights",
            "Monthly consolidated progress report",
            "Full commercial rights to your generated comics",
        ],
        priceId: "price_1Tg6gMKGzJOFnjXy2PgwwAMo",
    },
    {
        name: "Growth",
        price: "$39.99",
        duration: "/month",
        badge: "Best Value",
        features: [
            "Up to 10 new AI comics each week (40 per month)",
            "Advanced quiz engine with timed challenges",
            "Dashboard supports up to 50 students",
            "Enhanced weekly insights",
            "Detailed monthly performance analytics",
            "Commercial rights included",
            "Spotlight up to 2 bundles in the marketplace"
        ],
        priceId: "price_1Tg6gaKGzJOFnjXyHeKvQNek",
    },
    {
        name: "Pro",
        price: "$74.99",
        duration: "/month",
        badge: null,
        features: [
            "Up to 20 new AI comics each week (80 per month)",
            "Full advanced assessment system (Normal + Hardcore)",
            "Dashboard supports up to 100 students",
            "Comprehensive weekly tracking",
            "Advanced monthly analytics reports",
            "Commercial rights included",
            "Spotlight up to 8 bundles in the marketplace"
        ],
        priceId: "price_1Tg6gmKGzJOFnjXyPWJj1paZ",
    },
];

// Founding Teacher Plans (Discounted)
const foundingTeacherPlans = [
    {
        name: "Starter",
        price: "$16.49",
        originalPrice: "$24.99",
        duration: "/month",
        badge: "⭐ Founding Discount",
        features: [
            "Up to 5 new AI comics each week (20 per month)",
            "Fully editable stories with rich custom visuals",
            "Built-in quizzes (Normal + Hardcore mode with powerups)",
            "Dashboard supports up to 20 students",
            "Weekly student performance insights",
            "Monthly consolidated progress report",
            "Full commercial rights to your generated comics",
            "Spotlight up to 2 bundles in the marketplace"
        ],
        priceId: "price_1U7yXcKGzJOFnjXyUqNXGdtY",
    },
    {
        name: "Growth",
        price: "$25.99",
        originalPrice: "$39.99",
        duration: "/month",
        badge: "⭐ Best Value",
        features: [
            "Up to 10 new AI comics each week (40 per month)",
            "Advanced quiz engine with timed challenges",
            "Dashboard supports up to 50 students",
            "Enhanced weekly insights",
            "Detailed monthly performance analytics",
            "Commercial rights included",
            "Spotlight up to 4 bundles in the marketplace"
        ],
        priceId: "price_1U7yYBKGzJOFnjXyo06tdvCt",
    },
    {
        name: "Pro",
        price: "$48.75",
        originalPrice: "$74.99",
        duration: "/month",
        badge: "⭐ Premium",
        features: [
            "Up to 20 new AI comics each week (80 per month)",
            "Full advanced assessment system (Normal + Hardcore)",
            "Dashboard supports up to 100 students",
            "Comprehensive weekly tracking",
            "Advanced monthly analytics reports",
            "Commercial rights included",
            "Spotlight up to 16 bundles in the marketplace"
        ],
        priceId: "price_1U7yYdKGzJOFnjXye89jPIzA",
    },
];

// Dashboard Plans (Unchanged)
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
    const [activeBanner, setActiveBanner] = useState(null);
    const [activeTab, setActiveTab] = useState("standard");
    const [showRefundAccordion, setShowRefundAccordion] = useState(false);
    const [userData, setUserData] = useState(null);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [purchaseError, setPurchaseError] = useState(null);
    const [isFoundingTeacher, setIsFoundingTeacher] = useState(false);

    const getPriceAmount = (priceId) => {
        const allPlans = [...standardPlans, ...foundingTeacherPlans, ...dashboardPlans];
        const found = allPlans.find(p => p.priceId === priceId);
        return found ? parseFloat(found.price.replace("$", "")) : 0;
    };

    const fetchActiveBanner = async () => {
        try {
            const { data } = await API.get("/coupon-banner/active");
            if (data.success) {
                setActiveBanner(data.data);
            }
        } catch (error) {
            console.error("Error fetching banner:", error);
        }
    };

    // Fetch user data to check Founding Teacher status
    const fetchUserData = async () => {
        if (!isLoggedIn()) return;

        try {
            const response = await API.get("/teacher/get-founding-teacher");

            console.log(response.data);

            if (response.data.success) {
                setUserData(response.data.data);
                setIsFoundingTeacher(response.data.data.isFoundingTeacher);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    useEffect(() => {
        fetchActiveBanner();
        fetchUserData();
    }, []);

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
        const token = localStorage.getItem("token");
        return Boolean(user && token);
    };

    const handleSelectPlan = async (priceId, planType) => {
        if (!isLoggedIn()) {
            navigate("/login");
            return;
        }

        // Check if user is trying to select Founding Teacher plan without being one
        if (planType === "founding" && !isFoundingTeacher) {
            alert("You must become a Founding Teacher first to access these plans.");
            return;
        }

        const referral = window.Rewardful?.referral || null;

        if (!currentSub) {
            const res = await API.post("/user/create-checkout-session", {
                priceId,
                planType,
                referral,
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

    const handleFoundingTeacherPurchase = async () => {
        if (!isLoggedIn()) {
            navigate("/login");
            return;
        }

        // Check if user already has active subscription
        if (currentSub && currentSub.status === "active") {
            alert("You currently have an active subscription. Please cancel it before becoming a Founding Teacher.");
            return;
        }

        // Check if already a founding teacher
        if (isFoundingTeacher) {
            alert("You are already a Founding Teacher!");
            return;
        }

        setPurchaseLoading(true);
        setPurchaseError(null);

        try {
            const response = await API.post("/teacher/create-founding-teacher-checkout");

            if (response.data.success && response.data.url) {
                window.location.href = response.data.url;
            } else {
                throw new Error("No checkout URL received");
            }
        } catch (error) {
            console.error("Error purchasing Founding Teacher:", error);
            const errorMessage = error.response?.data?.message ||
                "Failed to initiate purchase. Please try again.";
            setPurchaseError(errorMessage);
            alert(errorMessage);
        } finally {
            setPurchaseLoading(false);
        }
    };

    // Render Plan Cards
    const renderPlanCards = (plans, isFounding = false) => {
        const canSelectPlan = !isFounding || (isFounding && isFoundingTeacher);

        return (
            <Row className="g-4 justify-content-center">
                {plans.map((plan, index) => (
                    <Col lg={4} md={6} key={index}>
                        <div className={`plan-card h-100 position-relative ${isFounding ? 'founding-plan-card' : ''}`}>
                            {plan.badge && (
                                <Badge className={`plan-badge ${isFounding ? 'founding-badge' : ''}`}>
                                    {plan.badge}
                                </Badge>
                            )}
                            <div className="plan-header text-center mb-4">
                                <h5 className="fw-semibold mb-2">{plan.name}</h5>
                                <div className="plan-price">
                                    <div className="d-flex justify-content-center align-items-center gap-2">
                                        <span className={`price ${isFounding ? 'text-success fw-bold' : ''}`}>
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

                            {isFounding && !isFoundingTeacher && (
                                <div className="mt-auto">
                                    <Button
                                        disabled
                                        className="w-100"
                                        variant="secondary"
                                    >
                                        <i className="bi bi-lock me-2"></i>
                                        Become a Founding Teacher First
                                    </Button>
                                    <small className="text-muted d-block text-center mt-2">
                                        Pay $99.99 one-time fee to unlock
                                    </small>
                                </div>
                            )}

                            {currentSub?.status === "to_cancel" ? (
                                <div className="mt-auto">
                                    <Button disabled className="w-100">
                                        Cancels on {new Date(currentSub.endDate).toLocaleDateString()}
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
                                        className={`btn ${isFounding ? 'btn-success' : 'btn-custom'} w-100 py-2`}
                                        onClick={() => handleSelectPlan(plan.priceId, isFounding ? "bundle" : "bundle")}
                                        disabled={!canSelectPlan}
                                    >
                                        {currentSub ? "Change Plan" : "Select Plan"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Col>
                ))}
            </Row>
        );
    };

    return (
        <>
            <section className="subscription-plans-section py-5">
                {currentSub?.status === "to_cancel" && (
                    <div className="alert alert-warning text-center mb-4">
                        <h6 className="fw-semibold mb-2">Subscription Cancelled</h6>
                        <p className="mb-1">
                            Your plan will end on <strong>
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

                    {/* Founding Teacher Status Alert */}
                    {isFoundingTeacher && (
                        <Alert variant="success" className="text-center mb-4">
                            <i className="bi bi-star-fill me-2"></i>
                            <strong>You are a Founding Teacher!</strong>
                            <span className="ms-2">Enjoy exclusive pricing and lifetime benefits.</span>
                        </Alert>
                    )}

                    <div className="text-center mb-3">
                        {activeBanner?.headline && (
                            <div className="alert alert-warning fw-semibold">
                                {activeBanner.headline}
                            </div>
                        )}
                        <div>
                            <span className="text-muted">Want more discounts?</span>
                            <button
                                type="button"
                                className="btn btn-link p-0 ms-2 fw-semibold text-decoration-none"
                                onClick={() => navigate("/coupon-offers")}
                            >
                                View Active Offers <i className="bi bi-arrow-right ms-1"></i>
                            </button>
                        </div>
                    </div>

                    {/* ===== TAB NAVIGATION ===== */}
                    {/* <div className="pricing-tab-navigation mb-5">
                        <Nav variant="pills" className="justify-content-center" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                            <Nav.Item>
                                <Nav.Link eventKey="standard" className="px-4 py-2">
                                    Standard Plans
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="founding" className="px-4 py-2 position-relative">
                                    Founding Teacher Plan
                                    <Badge className="ms-2" bg="warning" text="dark">
                                        ⭐ Lifetime Perks
                                    </Badge>
                                    {isFoundingTeacher && (
                                        <Badge className="ms-2" bg="success">
                                            ✓ Unlocked
                                        </Badge>
                                    )}
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div> */}

                    {/* ===== TAB NAVIGATION ===== */}
                    <div className="pricing-tab-navigation mb-5">
                        <div style={{
                            background: '#f8f9fa',
                            borderRadius: '60px',
                            padding: '6px',
                            maxWidth: '650px',
                            margin: '0 auto',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                            border: '1px solid #e9ecef'
                        }}>
                            <Nav
                                variant="pills"
                                className="justify-content-center"
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k)}
                                style={{ gap: '4px' }}
                            >
                                <Nav.Item style={{ flex: 1 }}>
                                    <Nav.Link
                                        eventKey="standard"
                                        className="text-center fw-semibold rounded-pill"
                                        style={{
                                            padding: '12px 20px',
                                            fontSize: '0.95rem',
                                            transition: 'all 0.3s ease',
                                            background: activeTab === 'standard' ? 'white' : 'transparent',
                                            color: activeTab === 'standard' ? '#28a745' : '#6c757d',
                                            boxShadow: activeTab === 'standard' ? '0 4px 15px rgba(40,167,69,0.15)' : 'none',
                                            border: activeTab === 'standard' ? '2px solid #28a745' : '2px solid transparent',
                                        }}
                                    >
                                        <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                                        Standard Plans
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item style={{ flex: 1 }}>
                                    <Nav.Link
                                        eventKey="founding"
                                        className="text-center fw-semibold rounded-pill position-relative"
                                        style={{
                                            padding: '12px 20px',
                                            fontSize: '0.95rem',
                                            transition: 'all 0.3s ease',
                                            background: activeTab === 'founding' ? 'white' : 'transparent',
                                            color: activeTab === 'founding' ? '#28a745' : '#6c757d',
                                            boxShadow: activeTab === 'founding' ? '0 4px 15px rgba(40,167,69,0.15)' : 'none',
                                            border: activeTab === 'founding' ? '2px solid #28a745' : '2px solid transparent',
                                        }}
                                    >
                                        <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                                            <i className="bi bi-star-fill text-warning"></i>
                                            <span>Founding Teacher Plan</span>
                                            <Badge
                                                bg="warning"
                                                text="dark"
                                                style={{
                                                    fontSize: '0.6rem',
                                                    padding: '0.25rem 0.6rem',
                                                    borderRadius: '50px'
                                                }}
                                            >
                                                ⭐ Lifetime Perks
                                            </Badge>
                                            {isFoundingTeacher && (
                                                <Badge
                                                    bg="success"
                                                    style={{
                                                        fontSize: '0.6rem',
                                                        padding: '0.25rem 0.6rem',
                                                        borderRadius: '50px'
                                                    }}
                                                >
                                                    ✓ Unlocked
                                                </Badge>
                                            )}
                                        </div>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </div>
                    </div>

                    {/* ===== TAB CONTENT ===== */}
                    <Tab.Container activeKey={activeTab}>
                        <Tab.Content>
                            {/* ===== TAB 1: STANDARD PLANS ===== */}
                            <Tab.Pane eventKey="standard">
                                <div className="text-center mb-5">
                                    <div className="section-heading mb-2">
                                        Choose Your Subscription Plan
                                    </div>
                                    <p className="text-muted">
                                        Simple monthly pricing for teachers. Upgrade anytime.
                                    </p>
                                </div>

                                {renderPlanCards(standardPlans, false)}
                            </Tab.Pane>

                            {/* ===== TAB 2: FOUNDING TEACHER PLAN ===== */}
                            <Tab.Pane eventKey="founding">
                                {/* Show if user already purchased */}
                                {isFoundingTeacher ? (
                                    <Alert variant="success" className="text-center mb-4">
                                        <h5>✅ You are a Founding Teacher!</h5>
                                        <p className="mb-0">You have access to exclusive pricing and lifetime benefits.</p>
                                    </Alert>
                                ) : (
                                    // Hero Banner - only if not purchased
                                    <div className="founding-hero-banner bg-success text-white rounded-4 p-5 mb-5 text-center">
                                        <h2 className="display-5 fw-bold mb-3">
                                            🎓 Founding Teacher Status
                                        </h2>
                                        <p className="lead mb-4">
                                            Join the exclusive Founding Teacher program and enjoy lifetime benefits!
                                        </p>

                                        {/* Check if user has active subscription */}
                                        {currentSub && currentSub.status === "active" && (
                                            <Alert variant="warning" className="text-dark mb-3">
                                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                                You have an active subscription. Please cancel it before becoming a Founding Teacher.
                                            </Alert>
                                        )}

                                        {purchaseError && (
                                            <Alert variant="danger" className="text-dark mb-3">
                                                {purchaseError}
                                            </Alert>
                                        )}

                                        <div className="d-flex justify-content-center align-items-center gap-4 flex-wrap mb-4">
                                            <div className="bg-white text-dark rounded-3 px-4 py-2">
                                                <span className="h4 fw-bold">$99.99</span>
                                                <span className="text-muted ms-2">One-time fee</span>
                                            </div>
                                        </div>
                                        <Button
                                            className="btn btn-light btn-lg px-5 py-3 fw-bold"
                                            onClick={handleFoundingTeacherPurchase}
                                            disabled={purchaseLoading || (currentSub && currentSub.status === "active")}
                                        >
                                            {purchaseLoading ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" animation="border" />
                                                    Processing...
                                                </>
                                            ) : (
                                                "Become a Founding Teacher 🚀"
                                            )}
                                        </Button>
                                        <p className="mt-3 small">
                                            Limited to the first <strong>1,000 eligible teachers</strong>
                                        </p>
                                    </div>
                                )}

                                {/* Founding Teacher Plans */}
                                <div className="text-center mb-4">
                                    <h3 className="fw-bold">Exclusive Founding Teacher Pricing</h3>
                                    <p className="text-muted">
                                        {isFoundingTeacher
                                            ? "Enjoy up to 35% off standard pricing for life"
                                            : "Become a Founding Teacher to unlock these exclusive prices"}
                                    </p>
                                </div>

                                {renderPlanCards(foundingTeacherPlans, true)}

                                {/* Founding Teacher Benefits */}
                                <div className="founding-benefits mt-5">
                                    <h4 className="text-center fw-bold mb-4">✨ Founding Teacher Benefits</h4>
                                    <Row className="g-4">
                                        <Col md={4}>
                                            <div className="benefit-card p-4 border rounded-3 h-100 text-center">
                                                <div className="benefit-icon display-4 mb-3">🚀</div>
                                                <h5>2x Exposure Boost</h5>
                                                <p className="text-muted">Receive 2x spotlight across the platform</p>
                                            </div>
                                        </Col>
                                        <Col md={4}>
                                            <div className="benefit-card p-4 border rounded-3 h-100 text-center">
                                                <div className="benefit-icon display-4 mb-3">📝</div>
                                                <h5>Blog Feature & Credits</h5>
                                                <p className="text-muted">Have your stories published on Kridemy blogs with full author credit</p>
                                            </div>
                                        </Col>
                                        <Col md={4}>
                                            <div className="benefit-card p-4 border rounded-3 h-100 text-center">
                                                <div className="benefit-icon display-4 mb-3">📱</div>
                                                <h5>Social Media Amplification</h5>
                                                <p className="text-muted">Your educational content featured across official Kridemy social channels</p>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="benefit-card p-4 border rounded-3 h-100 text-center">
                                                <div className="benefit-icon display-4 mb-3">💰</div>
                                                <h5>20% Lifetime School Commission</h5>
                                                <p className="text-muted">Earn 20% lifetime commission on any successful school integration referred by you</p>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="benefit-card p-4 border rounded-3 h-100 text-center">
                                                <div className="benefit-icon display-4 mb-3">🏅</div>
                                                <h5>Founding Teacher Badge</h5>
                                                <p className="text-muted">Exclusive verified badge displayed on your profile and content</p>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>

                                {/* Refund Policy Accordion */}
                                <div className="refund-policy-section mt-5">
                                    <div
                                        className="refund-toggle p-4 border rounded-3 bg-light cursor-pointer"
                                        onClick={() => setShowRefundAccordion(!showRefundAccordion)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0 fw-bold">
                                                <i className="bi bi-shield-check me-2 text-success"></i>
                                                Founding Teacher Fee Refund Policy
                                            </h5>
                                            <i className={`bi bi-chevron-${showRefundAccordion ? 'up' : 'down'} fs-4`}></i>
                                        </div>
                                    </div>

                                    {showRefundAccordion && (
                                        <div className="refund-content p-4 border border-top-0 rounded-bottom-3 bg-light">
                                            <p className="fw-semibold">
                                                You are eligible for a <span className="text-success">100% refund ($99.99 USD)</span> if you choose to exit the Founding Teacher Program, provided you complete the following milestones at any point of time:
                                            </p>
                                            <ul className="list-unstyled">
                                                <li className="mb-2">
                                                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                    <strong>Publish 40 comics</strong> on the platform
                                                </li>
                                                <li className="mb-2">
                                                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                    <strong>Sell 10 bundles</strong> in the marketplace
                                                </li>
                                                <li className="mb-2">
                                                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                    <strong>Share 5 content pieces</strong> directly with the Kridemy team
                                                </li>
                                                <li className="mb-2">
                                                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                    <strong>Contribute 1 blog story</strong>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>


                </Container>
            </section>

            {/* ===== Standalone Dashboard Plans ===== */}
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
                                        {plan.features?.map((feature, i) => (
                                            <li key={i}>
                                                <i className="bi bi-check-circle-fill me-2"></i>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    {currentSub?.status === "to_cancel" ? (
                                        <div className="mt-auto">
                                            <Button disabled className="w-100">
                                                Cancels on {new Date(currentSub.endDate).toLocaleDateString()}
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

            {/* ===== Upgrade Modal ===== */}
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
                                            <Spinner size="sm" className="me-2" animation="border" />
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
                                        <Spinner size="sm" className="me-2" animation="border" />
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