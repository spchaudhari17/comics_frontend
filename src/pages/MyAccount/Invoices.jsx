import React, { useEffect, useState } from "react";
import API from "../../API";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    API.get("/subscription/invoices")
      .then(res => setInvoices(res.data.invoices || []));
  }, []);

  if (!invoices.length) {
    return <p className="text-muted">No invoices available.</p>;
  }

  return (
    <div>
      <h5 className="fw-bold mb-3">Invoices</h5>

      <table className="table table-dark table-borderless">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Download</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((inv, i) => (
            <tr key={inv.id}>
              <td>{i + 1}</td>
              <td>{new Date(inv.date).toLocaleDateString()}</td>
              <td>${inv.amount}</td>
              <td>{inv.status}</td>
              <td>
                <a
                  href={inv.pdf}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-light"
                >
                  Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Invoices;
