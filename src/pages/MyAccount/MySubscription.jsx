import React, { useEffect, useState } from "react";
import { Button, Modal, Spinner, Alert } from "react-bootstrap";
import API from "../../API";

const MySubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchSubscription = () => {
    setLoading(true);

    API.get("/subscription/me")
      .then(res => {
        if (res.data.hasSubscription) {
          setSubscription(res.data);
        } else {
          setSubscription(null);
        }
      })
      .catch(() => setSubscription(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

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

      }, 1500);

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

  const formattedStart = new Date(subscription.startDate).toLocaleDateString();
  const formattedEnd = new Date(subscription.endDate).toLocaleDateString();

  return (
    <div>
      <h5 className="fw-bold mb-3">Current Plan</h5>

      {/* ===== STATUS MESSAGE (Persistent after refresh) ===== */}
      {subscription.status === "to_cancel" && (
        <Alert variant="warning">
          <strong>Subscription Cancelled</strong>
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

      {/* ===== SUBSCRIPTION INFO ===== */}
      <div className="row mt-3">

        <div className="col-md-4 mb-3">
          <label className="fw-semibold">Plan Type</label>
          <div className="text-muted text-capitalize">
            {subscription.planType}
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
          <label className="fw-semibold">Start Date</label>
          <div className="text-muted">{formattedStart}</div>
        </div>

        <div className="col-md-4 mb-3">
          <label className="fw-semibold">End Date</label>
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

      {/* ===== ACTION ===== */}
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
          Are you sure you want to cancel your subscription?
          <br />
          <br />
          Your plan will remain active until the end of the current billing cycle.
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
