import React, { useEffect, useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import API from "../../API";

const MySubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchSubscription = () => {
    setLoading(true);
    API.get("/subscription/active")
      .then(res => setSubscription(res.data.subscription))
      .catch(() => setSubscription(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleCancelSubscription = async () => {
    try {
      setCancelLoading(true);
      setMessage("");

      await API.post("/subscription/cancel");

      setMessage("Subscription will be cancelled at the end of billing cycle.");
      setShowCancelModal(false);
      fetchSubscription();

    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to cancel subscription"
      );
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return <p>Loading subscription...</p>;

  if (!subscription) {
    return <p className="text-muted">No active subscription found.</p>;
  }

  return (
    <div>
      <h5 className="fw-bold mb-3">Current Plan</h5>

      {/* ===== SUBSCRIPTION INFO ===== */}
      <div className="row">
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
          <div className="text-muted">
            {new Date(subscription.startDate).toLocaleDateString()}
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <label className="fw-semibold">End Date</label>
          <div className="text-muted">
            {new Date(subscription.endDate).toLocaleDateString()}
          </div>
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
      {/* ===== ACTION ===== */}
      <div className="mt-3">

        {subscription.status === "active" && (
          <Button
            variant="danger"
            onClick={() => setShowCancelModal(true)}
          >
            Cancel Subscription
          </Button>
        )}

        {subscription.status === "to_cancel" && (
          <div className="alert alert-warning">
            You have already cancelled your subscription. <br />
            It will end on{" "}
            <strong>
              {new Date(subscription.endDate).toLocaleDateString()}
            </strong>
          </div>
        )}

        {subscription.status === "cancelled" && (
          <div className="alert alert-secondary">
            This subscription has ended.
          </div>
        )}

      </div>


      {/* ===== FEEDBACK MESSAGE ===== */}
      {message && (
        <div className="alert alert-info mt-3">
          {message}
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
          <p>
            Are you sure you want to cancel your subscription?
          </p>
          <p className="text-muted mb-0">
            Your plan will remain active until the end of the current billing cycle.
          </p>
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
