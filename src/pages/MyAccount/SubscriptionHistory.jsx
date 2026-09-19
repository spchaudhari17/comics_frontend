// import React, { useEffect, useState } from "react";
// import API from "../../API";

// const SubscriptionHistory = () => {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     API.get("/subscription/history")
//       .then(res => setHistory(res.data.history || []))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) return <p>Loading history...</p>;

//   if (!history.length) {
//     return <p className="text-muted">No subscription history found.</p>;
//   }

//   return (
//     <div>
//       <h5 className="fw-bold mb-3">Subscription History</h5>

//       <table className="table table-dark table-borderless">
//         <thead>
//           <tr>
//             <th>#</th>
//             <th>Plan</th>
//             <th>Date</th>
//             <th>Status</th>
//             <th>Amount</th>
//           </tr>
//         </thead>

//         <tbody>
//           {history.map((item, i) => (
//             <tr key={item._id}>
//               <td>{i + 1}</td>
//               <td className="text-capitalize">{item.planType}</td>
//               <td>
//                 {new Date(item.createdAt).toLocaleString()}
//               </td>
//               <td>
//                 <span
//                   className={`badge ${item.status === "cancelled"
//                       ? "bg-danger"
//                       : item.status === "renewed"
//                         ? "bg-success"
//                         : "bg-primary"
//                     }`}
//                 >
//                   {item.status}
//                 </span>
//               </td>
//               <td>
//                 {item.amount ? `$${item.amount}` : "-"}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default SubscriptionHistory;


import React, { useEffect, useState } from "react";
import { Spinner, Badge, Form, InputGroup } from "react-bootstrap";
import API from "../../API";

const SubscriptionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    API.get("/subscription/history")
      .then((res) => setHistory(res.data.history || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 text-muted">Loading history...</span>
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light"
            style={{ width: 64, height: 64 }}
          >
            <span style={{ fontSize: 28 }}>🧾</span>
          </div>
          <h5 className="fw-bold mb-2">No Subscription History</h5>
          <p className="text-muted mb-0">
            You don't have any past subscription activity yet.
          </p>
        </div>
      </div>
    );
  }

  // ---- Filtering ----
  const filtered = history.filter((item) => {
    const matchesSearch = item.planType
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ---- Helpers ----
  const getStatusMeta = (status) => {
    const map = {
      cancelled: { bg: "danger", label: "Cancelled", icon: "✕" },
      renewed: { bg: "success", label: "Renewed", icon: "↻" },
      active: { bg: "primary", label: "Active", icon: "●" },
      trialing: { bg: "info", label: "Trial", icon: "◐", textDark: true },
      to_cancel: { bg: "warning", label: "Cancelling", icon: "◔", textDark: true },
      expired: { bg: "secondary", label: "Expired", icon: "○" },
    };
    return map[status] || { bg: "secondary", label: status, icon: "•" };
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatAmount = (amount) =>
    amount ? `$${Number(amount).toFixed(2)}` : "—";

  const totalSpent = history.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const uniqueStatuses = ["all", ...new Set(history.map((h) => h.status))];

  return (
    <div>
      <style>{`
        .history-row { transition: background-color 0.15s ease; }
        .history-row:hover { background-color: rgba(13, 110, 253, 0.05); }
        .history-table thead th {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #6c757d;
          font-weight: 600;
          border-bottom: 2px solid #e9ecef;
          padding: 0.75rem 1rem;
          background: transparent;
        }
        .history-table tbody td {
          padding: 1rem;
          vertical-align: middle;
          border-bottom: 1px solid #f1f3f5;
        }
        .history-table tbody tr:last-child td { border-bottom: none; }
        .summary-card {
          background: linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%);
          border: 1px solid #e5e9f5;
        }
        .plan-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          background: #eef2ff;
          color: #4338ca;
          font-weight: 600;
          font-size: 0.85rem;
        }
      `}</style>

      {/* ===== HEADER ===== */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h5 className="fw-bold mb-0">Subscription History</h5>
          <small className="text-muted">
            {history.length} record{history.length !== 1 ? "s" : ""} found
          </small>
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm summary-card h-100">
            <div className="card-body p-3">
              <small
                className="text-muted fw-semibold text-uppercase d-block mb-1"
                style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
              >
                Total Records
              </small>
              <div className="fw-bold" style={{ fontSize: "1.4rem" }}>
                {history.length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm summary-card h-100">
            <div className="card-body p-3">
              <small
                className="text-muted fw-semibold text-uppercase d-block mb-1"
                style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
              >
                Total Spent
              </small>
              <div className="fw-bold text-success" style={{ fontSize: "1.4rem" }}>
                ${totalSpent.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FILTERS ===== */}
      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <InputGroup size="sm">
            <InputGroup.Text className="bg-white border-end-0">
              🔍
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by plan name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-start-0"
            />
          </InputGroup>
        </div>
        <div className="col-md-3">
          <Form.Select
            size="sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {uniqueStatuses.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Statuses" : s}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>

      {/* ===== TABLE (desktop) ===== */}
      <div className="card border-0 shadow-sm d-none d-md-block">
        <div className="table-responsive">
          <table className="table history-table mb-0 align-middle">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Plan</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    No matching records.
                  </td>
                </tr>
              ) : (
                filtered.map((item, i) => {
                  const meta = getStatusMeta(item.status);
                  return (
                    <tr key={item._id} className="history-row">
                      <td className="text-muted fw-semibold">
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td>
                        <span className="plan-chip text-capitalize">
                          {item.planType || "Unknown"}
                        </span>
                      </td>
                      <td className="text-muted small">{formatDate(item.createdAt)}</td>
                      <td>
                        <Badge
                          bg={meta.bg}
                          className={meta.textDark ? "text-dark" : ""}
                          pill
                          style={{ fontWeight: 600, padding: "0.45em 0.85em" }}
                        >
                          <span className="me-1">{meta.icon}</span>
                          {meta.label}
                        </Badge>
                      </td>
                      <td className="text-end fw-semibold">
                        {formatAmount(item.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== CARDS (mobile) ===== */}
      <div className="d-md-none">
        {filtered.length === 0 ? (
          <p className="text-muted text-center py-4">No matching records.</p>
        ) : (
          filtered.map((item, i) => {
            const meta = getStatusMeta(item.status);
            return (
              <div key={item._id} className="card border-0 shadow-sm mb-3">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="plan-chip text-capitalize">
                      {item.planType || "Unknown"}
                    </span>
                    <Badge
                      bg={meta.bg}
                      className={meta.textDark ? "text-dark" : ""}
                      pill
                      style={{ fontWeight: 600, padding: "0.45em 0.85em" }}
                    >
                      <span className="me-1">{meta.icon}</span>
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>📅 {formatDate(item.createdAt)}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                    <span className="text-muted small">Amount</span>
                    <span className="fw-bold">{formatAmount(item.amount)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SubscriptionHistory;