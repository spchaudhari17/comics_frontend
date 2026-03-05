import React, { useEffect, useState } from "react";
import { Button, Modal, Spinner, Alert } from "react-bootstrap";
import API from "../../API";

// const PRICE_PLAN_MAP = {
//   // Bundle Plans
//   price_1T7C1lKGzJOFnjXyBzb0fvZ6: "Starter", //4.99
//   price_1T7C1xKGzJOFnjXyq4FXqK1x: "Growth", //7.99
//   price_1T7C28KGzJOFnjXyfdAo2ToJ: "Pro", // 11.99

//   // Dashboard Plans
//   price_1T6wozKGzJOFnjXyD61eBJYK: "Small Classroom",
//   price_1T6wpFKGzJOFnjXy1u6aLEx0: "Medium Classroom",
//   price_1T6wpSKGzJOFnjXyPps9FMUG: "Large Classroom",
// };

// live 
const PRICE_PLAN_MAP = {
  // Bundle Plans
  price_1T7dNbKGzJOFnjXyfFxrlv7m: "Starter", //4.99
  price_1T7dO3KGzJOFnjXy2lPD3Ldz: "Growth", //7.99
  price_1T7dODKGzJOFnjXywACAu03j: "Pro", // 11.99

  // Dashboard Plans
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

      if (res.data.hasSubscription) {
        setSubscription(res.data);
      } else {
        setSubscription(null);
      }
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  // const planName = PRICE_PLAN_MAP[subscription.priceId] || "Unknown Plan";
  const planName = subscription?.priceId ? PRICE_PLAN_MAP[subscription.priceId] || "Unknown Plan" : "";

  const handleCancelSubscription = async () => {
    try {
      setCancelLoading(true);

      await API.post("/subscription/cancel");

      setShowCancelModal(false);

      // 🔥 Poll until status becomes "to_cancel"
      let attempts = 0;

      const interval = setInterval(async () => {
        const res = await API.get("/subscription/me");

        if (res.data.status === "to_cancel") {
          setSubscription(res.data);
          clearInterval(interval);
        }

        attempts++;

        if (attempts > 10) {
          clearInterval(interval);
        }

      }, 1000);

    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel subscription");
    } finally {
      setCancelLoading(false);
    }
  };


  if (loading) return <p>Loading subscription...</p>;

  if (!subscription) {
    return (
      <div>
        <h5 className="fw-bold mb-3">Current Plan</h5>
        <Alert variant="secondary">
          You do not have an active subscription.
        </Alert>
      </div>
    );
  }

  // 🔥 Safe date formatting
  const formattedStart = subscription.startDate
    ? new Date(subscription.startDate).toLocaleDateString()
    : "-";

  const formattedEnd = subscription.endDate
    ? new Date(subscription.endDate).toLocaleDateString()
    : "-";

  const formattedPendingDate = subscription.pendingApplyDate
    ? new Date(subscription.pendingApplyDate).toLocaleDateString()
    : null;

  return (
    <div>
      <h5 className="fw-bold mb-3">Current Plan</h5>

      {/* ===== CANCELLED STATE ===== */}
      {subscription.status === "to_cancel" && (
        <Alert variant="warning">
          <strong>Cancellation Scheduled</strong>
          <br />
          You can continue using your plan until{" "}
          <strong>{formattedEnd}</strong>.
        </Alert>
      )}

      {subscription.status === "cancelled" && (
        <Alert variant="secondary">
          This subscription has ended.
        </Alert>
      )}

      {/* ===== PENDING PLAN CHANGE ===== */}
      {subscription.hasPendingChange && (
        <Alert variant="info">
          <strong>Plan change scheduled</strong>
          <br />
          New plan activates on <strong>{formattedPendingDate}</strong>.
        </Alert>
      )}

      {/* ===== SUBSCRIPTION INFO ===== */}
      <div className="row mt-3">

        <div className="col-md-4 mb-3">
          <label className="fw-semibold">Plan</label>
          <div className="text-muted fw-semibold">
            {planName}
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <label className="fw-semibold">Students Limit</label>
          <div className="text-muted">{subscription.studentsLimit}</div>
        </div>

        <div className="col-md-4 mb-3">
          <label className="fw-semibold">Comics / Week</label>
          <div className="text-muted">{subscription.comicsPerWeek}</div>
        </div>

        <div className="col-md-4 mb-3">
          <label className="fw-semibold">Used This Week</label>
          <div className="text-muted">
            {subscription.usedThisWeek} / {subscription.comicsPerWeek}
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <label className="fw-semibold">Comics Left</label>
          <div className="text-muted">{subscription.comicsLeft}</div>
        </div>

        <div className="col-md-4 mb-3">
          <label className="fw-semibold">Start Date</label>
          <div className="text-muted">{formattedStart}</div>
        </div>

        <div className="col-md-4 mb-3">
          <label className="fw-semibold">Renewal Date</label>
          <div className="text-muted">{formattedEnd}</div>
        </div>

        <div className="col-md-4 mb-3">
          <label className="fw-semibold">Status</label>
          <span
            className={`badge ms-2 ${subscription.status === "active"
              ? "bg-success"
              : subscription.status === "to_cancel"
                ? "bg-warning text-dark"
                : "bg-secondary"
              }`}
          >
            {subscription.status}
          </span>
        </div>
      </div>

      {/* ===== CANCEL BUTTON ===== */}
      {subscription.status === "active" && (
        <div className="mt-3">
          <Button
            variant="danger"
            onClick={() => setShowCancelModal(true)}
          >
            Cancel Subscription
          </Button>
        </div>
      )}

      {/* ===== CANCEL MODAL ===== */}
      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Cancel Subscription</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure?
          <br />
          Your subscription will remain active until{" "}
          <strong>{formattedEnd}</strong>.
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCancelModal(false)}
          >
            Keep Subscription
          </Button>

          <Button
            variant="danger"
            onClick={handleCancelSubscription}
            disabled={cancelLoading}
          >
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