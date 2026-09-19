import React, { useEffect, useState } from "react";
import { Button, Modal, Spinner, Alert, ProgressBar } from "react-bootstrap";
import API from "../../API";

export const PRICE_PLAN_MAP = {
  price_1UCNs7KGzJOFnjXy1VvfcTIo: "Starter",
  price_1UCNtSKGzJOFnjXyXh8r2n6k: "Growth",
  price_1UCNtuKGzJOFnjXyTQGjAkIp: "Pro",
  price_1Tg6gMKGzJOFnjXy2PgwwAMo: "Starter",
  price_1Tg6gaKGzJOFnjXyHeKvQNek: "Growth",
  price_1Tg6gmKGzJOFnjXyPWJj1paZ: "Pro",
  price_1T7dOiKGzJOFnjXyWL0P3An7: "Small Classroom",
  price_1T7dP6KGzJOFnjXyrAE0ZL0E: "Medium Classroom",
  price_1T7dPIKGzJOFnjXyfI8vdrc8: "Large Classroom",
};

const MySubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await API.get("/subscription/me");
      setSubscription(res.data.hasSubscription ? res.data : null);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const planName = subscription?.priceId
    ? PRICE_PLAN_MAP[subscription.priceId] || "Unknown Plan"
    : "";

  const handleCancelSubscription = async () => {
    try {
      setCancelLoading(true);
      await API.post("/subscription/cancel");
      setShowCancelModal(false);

      let attempts = 0;
      const interval = setInterval(async () => {
        const res = await API.get("/subscription/me");
        if (res.data.status === "to_cancel") {
          setSubscription(res.data);
          clearInterval(interval);
        }
        if (++attempts > 10) clearInterval(interval);
      }, 1000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel subscription");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 text-muted">Loading subscription...</span>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light"
            style={{ width: 64, height: 64 }}
          >
            <span style={{ fontSize: 28 }}>📦</span>
          </div>
          <h5 className="fw-bold mb-2">No Active Subscription</h5>
          <p className="text-muted mb-3">
            You don't have an active subscription right now.
          </p>
        </div>
      </div>
    );
  }

  const formattedStart = subscription.startDate
    ? new Date(subscription.startDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    : "-";

  const formattedEnd = subscription.endDate
    ? new Date(subscription.endDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    : "-";

  const formattedPendingDate = subscription.pendingApplyDate
    ? new Date(subscription.pendingApplyDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    : null;

  // Compute usage %
  const usagePercent =
    subscription.comicsPerWeek > 0
      ? Math.round(
        (subscription.usedThisWeek / subscription.comicsPerWeek) * 100
      )
      : 0;

  const getStatusBadge = () => {
    const map = {
      active: { bg: "success", label: "Active", icon: "●" },
      trialing: { bg: "info", label: "Free Trial", icon: "◐", textDark: true },
      to_cancel: { bg: "warning", label: "Cancelling", icon: "◔", textDark: true },
      cancelled: { bg: "secondary", label: "Cancelled", icon: "○" },
    };
    const s = map[subscription.status] || map.cancelled;
    return (
      <span
        className={`badge bg-${s.bg} ${s.textDark ? "text-dark" : ""} px-3 py-2`}
        style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.3px" }}
      >
        <span className="me-1">{s.icon}</span>
        {s.label}
      </span>
    );
  };

  const StatCard = ({ icon, label, value, subValue, accent = "primary" }) => (
    <div className="col-6 col-md-4 col-lg-3 mb-3">
      <div className="card border-0 h-100 shadow-sm stat-card">
        <div className="card-body p-3">
          <div className="d-flex align-items-center mb-2">
            <div
              className={`d-flex align-items-center justify-content-center rounded-3 bg-${accent} bg-opacity-10 me-2`}
              style={{ width: 32, height: 32 }}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
            </div>
            <small className="text-muted fw-semibold text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>
              {label}
            </small>
          </div>
          <div className="fw-bold" style={{ fontSize: "1.1rem", color: "#1a1a2e" }}>
            {value}
          </div>
          {subValue && <small className="text-muted">{subValue}</small>}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <style>{`
        .stat-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.08) !important; }
        .hero-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
        }
        .hero-card.trialing {
          background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
        }
        .hero-card.to_cancel {
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
        }
        .hero-card.cancelled {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        }
      `}</style>

      {/* ===== HERO CARD ===== */}
      <div className={`card border-0 shadow-sm hero-card ${subscription.status} mb-4`}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <small className="text-white-100 text-uppercase fw-semibold" style={{ letterSpacing: "1px", fontSize: "0.7rem" }}>
                Current Plan
              </small>
              <h3 className="fw-bold mb-1 mt-1">{planName}</h3>
              <div className="text-white-100 small">
                {subscription.status === "trialing"
                  ? `Trial ends on ${formattedEnd}`
                  : subscription.status === "to_cancel"
                    ? `Active until ${formattedEnd}`
                    : subscription.status === "cancelled"
                      ? "Subscription ended"
                      : `Renews on ${formattedEnd}`}
              </div>
            </div>
            <div>{getStatusBadge()}</div>
          </div>

          {/* Usage bar in hero */}
          {subscription.comicsPerWeek > 0 && (
            <div className="mt-4">
              <div className="d-flex justify-content-between text-white-80 small mb-1">
                <span>Weekly usage</span>
                <span>
                  {subscription.usedThisWeek} / {subscription.comicsPerWeek} comics
                </span>
              </div>
              <ProgressBar
                now={usagePercent}
                variant={usagePercent >= 90 ? "danger" : usagePercent >= 70 ? "warning" : "light"}
                style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.25)" }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ===== ALERTS ===== */}
      {subscription.status === "to_cancel" && (
        <Alert variant="warning" className="border-0 shadow-sm d-flex align-items-start">
          <span className="me-2" style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <strong>Cancellation Scheduled</strong>
            <div className="small">
              You can continue using your plan until <strong>{formattedEnd}</strong>.
            </div>
          </div>
        </Alert>
      )}

      {subscription.status === "cancelled" && (
        <Alert variant="secondary" className="border-0 shadow-sm d-flex align-items-start">
          <span className="me-2" style={{ fontSize: 18 }}>ℹ️</span>
          <div>
            <strong>Subscription Ended</strong>
            <div className="small">This subscription is no longer active.</div>
          </div>
        </Alert>
      )}

      {subscription.hasPendingChange && (
        <Alert variant="info" className="border-0 shadow-sm d-flex align-items-start">
          <span className="me-2" style={{ fontSize: 18 }}>🔄</span>
          <div>
            <strong>Plan Change Scheduled</strong>
            <div className="small">
              New plan activates on <strong>{formattedPendingDate}</strong>.
            </div>
          </div>
        </Alert>
      )}

      {/* ===== STATS GRID ===== */}
      <h6 className="fw-bold mb-3 text-muted text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>
        Plan Details
      </h6>
      <div className="row g-3">
        <StatCard icon="👥" label="Students Limit" value={subscription.studentsLimit} accent="primary" />
        <StatCard icon="🎨" label="Comics / Week" value={subscription.comicsPerWeek} accent="info" />
        <StatCard
          icon="📊"
          label="Used This Week"
          value={`${subscription.usedThisWeek} / ${subscription.comicsPerWeek}`}
          subValue={`${usagePercent}% used`}
          accent="warning"
        />
        <StatCard icon="✨" label="Comics Left" value={subscription.comicsLeft} accent="success" />
        <StatCard icon="🚀" label="Start Date" value={formattedStart} accent="secondary" />
        <StatCard
          icon={subscription.status === "trialing" ? "⏳" : "🔁"}
          label={subscription.status === "trialing" ? "Trial Ends" : "Renewal Date"}
          value={formattedEnd}
          accent="danger"
        />
      </div>

      {subscription.status === "trialing" && (
        <small className="text-muted d-block mt-1">
          💳 Your card will be charged <strong>$24.99/month</strong> after the trial ends.
        </small>
      )}

      {/* ===== CANCEL BUTTON ===== */}
      {["active", "trialing"].includes(subscription.status) && (
        <div className="mt-4 pt-3 border-top">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <div className="fw-semibold">Cancel your subscription</div>
              <small className="text-muted">
                You'll keep access until the end of the billing period.
              </small>
            </div>
            <Button variant="outline-danger" onClick={() => setShowCancelModal(true)}>
              Cancel Subscription
            </Button>
          </div>
        </div>
      )}

      {/* ===== CANCEL MODAL ===== */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Cancel Subscription?</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {subscription.status === "trialing" ? (
            <>
              Your free trial will remain active until{" "}
              <strong>{formattedEnd}</strong>.
              <br />
              <small className="text-muted">
                You will not be charged after the trial ends.
              </small>
            </>
          ) : (
            <>
              Your subscription will remain active until{" "}
              <strong>{formattedEnd}</strong>. After that, you'll lose access to
              your plan features.
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowCancelModal(false)}>
            Keep Subscription
          </Button>
          <Button variant="danger" onClick={handleCancelSubscription} disabled={cancelLoading}>
            {cancelLoading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Cancelling...
              </>
            ) : (
              "Yes, Cancel"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MySubscription;