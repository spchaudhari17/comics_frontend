// import React, { useEffect, useState } from "react";
// import API from "../../API";

// const Invoices = () => {
//   const [invoices, setInvoices] = useState([]);

//   useEffect(() => {
//     API.get("/subscription/invoices")
//       .then(res => setInvoices(res.data.invoices || []));
//   }, []);

//   if (!invoices.length) {
//     return <p className="text-muted">No invoices available.</p>;
//   }

//   return (
//     <div>
//       <h5 className="fw-bold mb-3">Invoices</h5>

//       <table className="table table-dark table-borderless">
//         <thead>
//           <tr>
//             <th>#</th>
//             <th>Date</th>
//             <th>Amount</th>
//             <th>Status</th>
//             <th>Download</th>
//           </tr>
//         </thead>

//         <tbody>
//           {invoices.map((inv, i) => (
//             <tr key={inv.id}>
//               <td>{i + 1}</td>
//               <td>{new Date(inv.date).toLocaleDateString()}</td>
//               <td>${inv.amount}</td>
//               <td>{inv.status}</td>
//               <td>
//                 <a
//                   href={inv.pdf}
//                   target="_blank"
//                   rel="noreferrer"
//                   className="btn btn-sm btn-outline-light"
//                 >
//                   Download
//                 </a>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Invoices;




import React, { useEffect, useState } from "react";
import { Spinner, Badge, Form, InputGroup, Button } from "react-bootstrap";
import API from "../../API";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    API.get("/subscription/invoices")
      .then((res) => setInvoices(res.data.invoices || []))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 text-muted">Loading invoices...</span>
      </div>
    );
  }

  if (!invoices.length) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light"
            style={{ width: 64, height: 64 }}
          >
            <span style={{ fontSize: 28 }}>📄</span>
          </div>
          <h5 className="fw-bold mb-2">No Invoices Yet</h5>
          <p className="text-muted mb-0">
            Your invoices will appear here once you have billing activity.
          </p>
        </div>
      </div>
    );
  }

  // ---- Helpers ----
  const getStatusMeta = (status) => {
    const s = (status || "").toLowerCase();
    const map = {
      paid: { bg: "success", label: "Paid", icon: "✓" },
      open: { bg: "warning", label: "Open", icon: "◔", textDark: true },
      pending: { bg: "warning", label: "Pending", icon: "◔", textDark: true },
      failed: { bg: "danger", label: "Failed", icon: "✕" },
      void: { bg: "secondary", label: "Void", icon: "○" },
      refunded: { bg: "info", label: "Refunded", icon: "↺", textDark: true },
      draft: { bg: "secondary", label: "Draft", icon: "•" },
    };
    return map[s] || { bg: "secondary", label: status || "Unknown", icon: "•" };
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined || amount === "") return "—";
    const num = Number(amount);
    if (Number.isNaN(num)) return "—";
    return `$${num.toFixed(2)}`;
  };

  // ---- Filtering ----
  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      !search ||
      String(inv.id).toLowerCase().includes(search.toLowerCase()) ||
      String(inv.amount).includes(search);
    const matchesStatus =
      statusFilter === "all" ||
      (inv.status || "").toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const uniqueStatuses = [
    "all",
    ...new Set(invoices.map((i) => (i.status || "").toLowerCase()).filter(Boolean)),
  ];

  // ---- Summary ----
  const totalAmount = invoices
    .filter((i) => (i.status || "").toLowerCase() === "paid")
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const paidCount = invoices.filter(
    (i) => (i.status || "").toLowerCase() === "paid"
  ).length;

  return (
    <div>
      <style>{`
        .invoice-row { transition: background-color 0.15s ease; }
        .invoice-row:hover { background-color: rgba(13, 110, 253, 0.05); }
        .invoice-table thead th {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #6c757d;
          font-weight: 600;
          border-bottom: 2px solid #e9ecef;
          padding: 0.75rem 1rem;
          background: transparent;
          white-space: nowrap;
        }
        .invoice-table tbody td {
          padding: 1rem;
          vertical-align: middle;
          border-bottom: 1px solid #f1f3f5;
        }
        .invoice-table tbody tr:last-child td { border-bottom: none; }
        .summary-card {
          background: linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%);
          border: 1px solid #e5e9f5;
        }
        .invoice-id {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.82rem;
          color: #4b5563;
          background: #f3f4f6;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
        }
        .download-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 500;
          font-size: 0.85rem;
        }
        .download-btn:hover { text-decoration: none; }
      `}</style>

      {/* ===== HEADER ===== */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h5 className="fw-bold mb-0">Invoices</h5>
          <small className="text-muted">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} on record
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
                Total Paid
              </small>
              <div className="fw-bold text-success" style={{ fontSize: "1.4rem" }}>
                ${totalAmount.toFixed(2)}
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
                Paid Invoices
              </small>
              <div className="fw-bold" style={{ fontSize: "1.4rem" }}>
                {paidCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FILTERS ===== */}
      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <InputGroup size="sm">
            <InputGroup.Text className="bg-white border-end-0">🔍</InputGroup.Text>
            <Form.Control
              placeholder="Search by invoice ID or amount..."
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
          <table className="table invoice-table mb-0 align-middle">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Invoice</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No matching invoices.
                  </td>
                </tr>
              ) : (
                filtered.map((inv, i) => {
                  const meta = getStatusMeta(inv.status);
                  return (
                    <tr key={inv.id} className="invoice-row">
                      <td className="text-muted fw-semibold">
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td>
                        <span className="invoice-id">
                          #{String(inv.id).slice(-10)}
                        </span>
                      </td>
                      <td className="text-muted small">{formatDate(inv.date)}</td>
                      <td className="fw-semibold">{formatAmount(inv.amount)}</td>
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
                      <td className="text-end">
                        {inv.pdf ? (
                          <a
                            href={inv.pdf}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-primary download-btn"
                          >
                            ⬇ Download
                          </a>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
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
          <p className="text-muted text-center py-4">No matching invoices.</p>
        ) : (
          filtered.map((inv, i) => {
            const meta = getStatusMeta(inv.status);
            return (
              <div key={inv.id} className="card border-0 shadow-sm mb-3">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="invoice-id">#{String(inv.id).slice(-10)}</span>
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

                  <div className="small text-muted mb-2">
                    📅 {formatDate(inv.date)}
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <div>
                      <small className="text-muted d-block">Amount</small>
                      <span className="fw-bold" style={{ fontSize: "1.05rem" }}>
                        {formatAmount(inv.amount)}
                      </span>
                    </div>
                    {inv.pdf ? (
                      <a
                        href={inv.pdf}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary download-btn"
                      >
                        ⬇ Download
                      </a>
                    ) : (
                      <span className="text-muted small">No PDF</span>
                    )}
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

export default Invoices;