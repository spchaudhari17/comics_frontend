import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Alert, Spinner } from "react-bootstrap";
import "./SubscriptionPlans.scss";
import API from "../../API";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { trackClickWithUser } from "../../utility/analytics";

// Standard Plans (Original)
const standardPlans = [
    {
        name: "Starter",
        price: "$24.99",
        duration: "/month",
        badge: "🎁 30 Days FREE Trial",
        trialDays: 30,
        trialText: "No charge for the first 30 days. Then $24.99/month.",
        features: [
            "Up to 5 new AI comics each week (20 per month)",
            "Fully editable stories with rich custom visuals",
            "Built-in quizzes (Normal + Hardcore mode with powerups)",
            "Dashboard supports up to 20 students",
            "Weekly student performance insights",
            "Monthly consolidated progress report",
            "Full commercial rights to your generated comics",
        ],
        priceId: "price_1UCNs7KGzJOFnjXy1VvfcTIo",

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
        priceId: "price_1UCNtSKGzJOFnjXyXh8r2n6k",
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
        priceId: "price_1UCNtuKGzJOFnjXyTQGjAkIp",
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
        priceId: "price_1Tg6gMKGzJOFnjXy2PgwwAMo",
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
        priceId: "price_1Tg6gaKGzJOFnjXyHeKvQNek",
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
        priceId: "price_1Tg6gmKGzJOFnjXyPWJj1paZ",
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

const PLAN_ICONS = {
    Starter: "bi-rocket-takeoff-fill",
    Growth: "bi-graph-up-arrow",
    Pro: "bi-gem",
};

const FOUNDING_BENEFITS = [
    { icon: "bi-lightning-charge-fill", title: "2x Exposure Boost", text: "Receive 2x spotlight across the platform" },
    { icon: "bi-journal-richtext", title: "Blog Feature & Credits", text: "Have your stories published on Kridemy blogs with full author credit" },
    { icon: "bi-megaphone-fill", title: "Social Media Amplification", text: "Your educational content featured across official Kridemy social channels" },
    { icon: "bi-cash-coin", title: "20% Lifetime School Commission", text: "Earn 20% lifetime commission on any successful school integration referred by you" },
    { icon: "bi-patch-check-fill", title: "Founding Teacher Badge", text: "Exclusive verified badge displayed on your profile and content" },
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
    // Student dashboard plans "Load more" ke peeche chhupe rahenge
    const [showDashboardPlans, setShowDashboardPlans] = useState(false);
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

    const handleSelectPlan = async (priceId, planType, planName = "") => {
        trackClickWithUser("subscribe_click", {
            plan_name: planName,
            price_id: priceId,
            plan_type: planType,
            action: currentSub ? "change_plan" : "subscribe",
            has_current_subscription: Boolean(currentSub),
        });

        if (!isLoggedIn()) {
            navigate("/login");
            return;
        }

        // Check if user is trying to select Founding Teacher plan without being one
        const isFoundingPlan = foundingTeacherPlans.includes(priceId);
        if (isFoundingPlan && !isFoundingTeacher) {
            alert(
                "You must become a Founding Teacher first to access these plans."
            );
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
        trackClickWithUser("subscribe_change_confirm_click", {
            price_id: selectedPriceId,
            plan_type: selectedPlanType,
            change_mode: mode,
            change_direction: upgradeMode,
        });
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
        trackClickWithUser("subscribe_click", {
            plan_name: "Founding Teacher",
            plan_type: "founding_teacher",
            action: "subscribe",
            has_current_subscription: Boolean(currentSub),
        });

        if (!isLoggedIn()) {
            navigate("/login");
            return;
        }

        // Check if user already has active subscription
        // if (currentSub && currentSub.status === "active") {
        //     alert("You currently have an active subscription. Please cancel it before becoming a Founding Teacher.");
        //     return;
        // }

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


    const formatDate = (d) => new Date(d).toLocaleDateString();

    // Plan card ka CTA button (subscription status ke hisaab se)
    const renderPlanAction = (plan, planType, { featured = false, locked = false } = {}) => {
        if (currentSub?.status === "to_cancel") {
            return <Button variant="" disabled className="sp-btn sp-btn-muted w-100">Cancels on {formatDate(currentSub.endDate)}</Button>;
        }
        if (currentSub?.hasPendingChange) {
            return <Button variant="" disabled className="sp-btn sp-btn-muted w-100">Change Scheduled</Button>;
        }
        if (currentSub?.priceId === plan.priceId) {
            return (
                <Button variant="" disabled className="sp-btn sp-btn-current w-100">
                    <i className="bi bi-check2-circle me-2"></i>Current Plan
                </Button>
            );
        }
        return (
            <Button
                variant=""
                className={`sp-btn w-100 ${featured ? "sp-btn-primary" : "sp-btn-outline"}`}
                onClick={() => handleSelectPlan(plan.priceId, planType, plan.name)}
                disabled={locked}
            >
                {currentSub
                    ? "Change Plan"
                    : plan.trialDays
                        ? `Start ${plan.trialDays}-Day FREE Trial`
                        : "Select Plan"}
            </Button>
        );
    };

    // Render Plan Cards
    const renderPlanCards = (plans, isFounding = false) => {
        const canSelectPlan = !isFounding || (isFounding && isFoundingTeacher);

        return (
            <Row className="g-4 justify-content-center align-items-stretch">
                {plans.map((plan, index) => {
                    // Beech wala (Growth) plan highlight
                    const featured = index === 1;
                    return (
                        <Col lg={4} md={6} key={index}>
                            <div className={`sp-plan-card ${featured ? "is-featured" : ""} ${isFounding ? "is-founding" : ""}`}>
                                {plan.badge && <span className="sp-plan-badge">{plan.badge}</span>}

                                <div className="sp-plan-head">
                                    <span className="sp-plan-icon">
                                        <i className={`bi ${PLAN_ICONS[plan.name] || "bi-stars"}`}></i>
                                    </span>
                                    <h5 className="sp-plan-name">{plan.name}</h5>
                                </div>

                                <div className="sp-plan-price">
                                    <span className="sp-price">{plan.price}</span>
                                    <span className="sp-duration">{plan.duration}</span>
                                    {plan.originalPrice && <span className="sp-original">{plan.originalPrice}</span>}
                                </div>

                                {plan.trialText && (
                                    <div className="sp-trial">
                                        <i className="bi bi-gift-fill"></i>
                                        <div>
                                            <strong>{plan.trialDays} Days FREE Trial</strong>
                                            <div>{plan.trialText}</div>
                                        </div>
                                    </div>
                                )}

                                <ul className="sp-features">
                                    {plan.features.map((feature, i) => (
                                        <li key={i}>
                                            <i className="bi bi-check-lg"></i>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto">
                                    {isFounding && !isFoundingTeacher ? (
                                        <>
                                            <Button variant="" disabled className="sp-btn sp-btn-muted w-100">
                                                <i className="bi bi-lock-fill me-2"></i>
                                                Become a Founding Teacher First
                                            </Button>
                                            <small className="sp-lock-note">Pay $99.99 one-time fee to unlock</small>
                                        </>
                                    ) : (
                                        renderPlanAction(plan, "bundle", { featured, locked: !canSelectPlan })
                                    )}
                                </div>
                            </div>
                        </Col>
                    );
                })}
            </Row>
        );
    };

    return (
        <div className="sp-page">
            {/* ===== HERO + TABS ===== */}
            <section className="sp-hero">
                <Container className="position-relative">
                    <span className="sp-eyebrow"><i className="bi bi-lightning-charge-fill"></i> Pricing</span>
                    <h1 className="sp-hero-title">
                        Plans that grow with <span>your classroom</span>
                    </h1>
                    <p className="sp-hero-sub">
                        Simple monthly pricing for teachers. Start free, upgrade anytime.
                    </p>

                    <div className="sp-tabs" role="tablist">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === "standard"}
                            className={`sp-tab ${activeTab === "standard" ? "active" : ""}`}
                            onClick={() => setActiveTab("standard")}
                        >
                            <i className="bi bi-grid-fill"></i> Standard Plans
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === "founding"}
                            className={`sp-tab ${activeTab === "founding" ? "active" : ""}`}
                            onClick={() => setActiveTab("founding")}
                        >
                            <i className="bi bi-star-fill"></i> Founding Teacher
                            <span className="sp-tab-pill">{isFoundingTeacher ? "✓ Unlocked" : "Lifetime Perks"}</span>
                        </button>
                    </div>
                </Container>
            </section>

            <section className="sp-body">
                <Container>
                    {/* ===== Status alerts ===== */}
                    {currentSub?.status === "to_cancel" && (
                        <div className="sp-alert sp-alert-warning">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            <div>
                                <strong>Subscription Cancelled.</strong> Your plan will end on{" "}
                                <strong>{formatDate(currentSub.endDate)}</strong>. You can continue using all features until this date.
                            </div>
                        </div>
                    )}

                    {currentSub?.hasPendingChange && (
                        <div className="sp-alert sp-alert-info">
                            <i className="bi bi-calendar-check-fill"></i>
                            <div>
                                <strong>Plan change scheduled.</strong> New plan will activate on{" "}
                                {currentSub.pendingApplyDate && formatDate(currentSub.pendingApplyDate)}. You cannot schedule another change until this one is applied.
                            </div>
                        </div>
                    )}

                    {isFoundingTeacher && (
                        <div className="sp-alert sp-alert-success">
                            <i className="bi bi-star-fill"></i>
                            <div>
                                <strong>You are a Founding Teacher!</strong> Enjoy exclusive pricing and lifetime benefits.
                            </div>
                        </div>
                    )}

                    {/* ===== TAB 1: STANDARD PLANS ===== */}
                    {activeTab === "standard" && (
                        <div className="sp-pane" key="standard">
                            <div className="sp-section-head">
                                <h2>Choose Your Subscription Plan</h2>
                                <p>Every plan includes AI comics, quizzes and a student dashboard.</p>
                            </div>
                            {renderPlanCards(standardPlans, false)}
                        </div>
                    )}

                    {/* ===== TAB 2: FOUNDING TEACHER PLAN ===== */}
                    {activeTab === "founding" && (
                        <div className="sp-pane" key="founding">
                            {!isFoundingTeacher && (
                                <div className="sp-founding-hero">
                                    <div className="sp-founding-copy">
                                        <span className="sp-eyebrow sp-eyebrow-orange">
                                            <i className="bi bi-mortarboard-fill"></i> Founding Teacher Status
                                        </span>
                                        <h2>Join the exclusive Founding Teacher program</h2>
                                        <p>Unlock up to 35% off every plan for life, plus spotlight, blog features and commission perks.</p>
                                        <small><i className="bi bi-people-fill me-1"></i> Limited to the first <strong>1,000 eligible teachers</strong></small>
                                    </div>

                                    <div className="sp-founding-cta">
                                        <div className="sp-founding-price">
                                            <span>$99.99</span>
                                            <small>One-time fee</small>
                                        </div>

                                        {purchaseError && (
                                            <Alert variant="danger" className="py-2 small mb-3">{purchaseError}</Alert>
                                        )}

                                        <Button
                                            variant=""
                                            className="sp-btn sp-btn-orange w-100"
                                            onClick={handleFoundingTeacherPurchase}
                                            disabled={purchaseLoading || isFoundingTeacher}
                                        >
                                            {purchaseLoading ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" animation="border" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>Become a Founding Teacher <i className="bi bi-rocket-takeoff-fill ms-1"></i></>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="sp-section-head">
                                <h2>Exclusive Founding Teacher Pricing</h2>
                                <p>
                                    {isFoundingTeacher
                                        ? "Enjoy up to 35% off standard pricing for life"
                                        : "Become a Founding Teacher to unlock these exclusive prices"}
                                </p>
                            </div>

                            {renderPlanCards(foundingTeacherPlans, true)}

                            {/* Founding Teacher Benefits */}
                            <div className="sp-section-head mt-5 pt-3">
                                <h2>Founding Teacher Benefits</h2>
                                <p>Perks that stay with you for life.</p>
                            </div>
                            <div className="sp-benefits">
                                {FOUNDING_BENEFITS.map((b) => (
                                    <div className="sp-benefit" key={b.title}>
                                        <span className="sp-benefit-icon"><i className={`bi ${b.icon}`}></i></span>
                                        <div>
                                            <h6>{b.title}</h6>
                                            <p>{b.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Refund Policy Accordion */}
                            <div className={`sp-refund ${showRefundAccordion ? "open" : ""}`}>
                                <button
                                    type="button"
                                    className="sp-refund-toggle"
                                    onClick={() => setShowRefundAccordion(!showRefundAccordion)}
                                    aria-expanded={showRefundAccordion}
                                >
                                    <span><i className="bi bi-shield-check"></i> Founding Teacher Fee Refund Policy</span>
                                    <i className="bi bi-chevron-down sp-chevron"></i>
                                </button>

                                {showRefundAccordion && (
                                    <div className="sp-refund-content">
                                        <p>
                                            You are eligible for a <strong className="text-success">100% refund ($99.99 USD)</strong> if you choose to exit the Founding Teacher Program, provided you complete the following milestones at any point of time:
                                        </p>
                                        <ul>
                                            <li><i className="bi bi-check-circle-fill"></i><span><strong>Publish 40 comics</strong> on the platform</span></li>
                                            <li><i className="bi bi-check-circle-fill"></i><span><strong>Sell 10 bundles</strong> in the marketplace</span></li>
                                            <li><i className="bi bi-check-circle-fill"></i><span><strong>Share 5 content pieces</strong> directly with the Kridemy team</span></li>
                                            <li><i className="bi bi-check-circle-fill"></i><span><strong>Contribute 1 blog story</strong></span></li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ===== Standalone Dashboard Plans (Load more ke andar) ===== */}
                    <div className={`sp-dashboard ${showDashboardPlans ? "open" : ""}`}>
                        <div className="sp-dashboard-intro">
                            <span className="sp-plan-icon"><i className="bi bi-bar-chart-line-fill"></i></span>
                            <div>
                                <h3>Only need the Student Dashboard?</h3>
                                <p>Standalone plans starting at $4.99/month for tracking student progress.</p>
                            </div>
                        </div>

                        {showDashboardPlans && (
                            <Row className="g-4 justify-content-center sp-dashboard-plans">
                                {dashboardPlans.map((plan, index) => (
                                    <Col lg={4} md={6} key={index}>
                                        <div className="sp-plan-card is-compact">
                                            <div className="sp-plan-head">
                                                <h5 className="sp-plan-name">{plan.name}</h5>
                                            </div>
                                            <div className="sp-plan-price">
                                                <span className="sp-price">{plan.price}</span>
                                                <span className="sp-duration">{plan.duration}</span>
                                            </div>
                                            <ul className="sp-features">
                                                {plan.features?.map((feature, i) => (
                                                    <li key={i}>
                                                        <i className="bi bi-check-lg"></i>
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="mt-auto">
                                                {renderPlanAction(plan, "dashboard")}
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        )}

                        <div className="text-center">
                            <button
                                type="button"
                                className="sp-load-more"
                                onClick={() => setShowDashboardPlans((v) => !v)}
                                aria-expanded={showDashboardPlans}
                            >
                                {showDashboardPlans ? "Show less" : "Load more: Student Dashboard Plans"}
                                <i className={`bi bi-chevron-${showDashboardPlans ? "up" : "down"}`}></i>
                            </button>
                        </div>
                    </div>

                    {/* ===== Subscription Rules Link ===== */}
                    <div className="sp-rules">
                        <p>By purchasing a subscription, you agree to our subscription terms and conditions.</p>
                        <Button variant="" className="sp-btn sp-btn-outline btn-sm" onClick={() => navigate("/subscription-rules")}>
                            View Subscription Rules <i className="bi bi-arrow-right ms-1"></i>
                        </Button>
                    </div>
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
        </div>
    );
};

export default SubscriptionPlans;
