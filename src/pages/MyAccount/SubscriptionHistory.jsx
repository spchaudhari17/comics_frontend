import React, { useEffect, useState } from "react";
import API from "../../API";

const SubscriptionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/subscription/history")
      .then(res => setHistory(res.data.history || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading history...</p>;

  if (!history.length) {
    return <p className="text-muted">No subscription history found.</p>;
  }

  return (
    <div>
      <h5 className="fw-bold mb-3">Subscription History</h5>

      <table className="table table-dark table-borderless">
        <thead>
          <tr>
            <th>#</th>
            <th>Plan</th>
            <th>Date</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {history.map((item, i) => (
            <tr key={item._id}>
              <td>{i + 1}</td>
              <td className="text-capitalize">{item.planType}</td>
              <td>
                {new Date(item.createdAt).toLocaleString()}
              </td>
              <td>
                <span
                  className={`badge ${
                    item.status === "cancelled"
                      ? "bg-danger"
                      : item.status === "renewed"
                      ? "bg-success"
                      : "bg-primary"
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td>
                {item.amount ? `$${item.amount}` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubscriptionHistory;
