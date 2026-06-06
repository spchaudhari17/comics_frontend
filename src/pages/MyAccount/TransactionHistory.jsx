import React, { useEffect, useState } from "react";
import API from "../../API";
import { Badge, Form } from "react-bootstrap";
import { Loader } from "../../lib/loader";

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    // 🔥 Fetch Transactions
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await API.get("/user/transactions");
            setTransactions(res.data.data || []);
            setFilteredData(res.data.data || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // 🔍 Search filter
    useEffect(() => {
        const term = search.toLowerCase();

        const filtered = transactions.filter((txn) =>
            txn.bundleId?.title?.toLowerCase().includes(term) ||
            txn.paymentIntentId?.toLowerCase().includes(term)
        );

        setFilteredData(filtered);
    }, [search, transactions]);

    if (loading) return <Loader />;

    return (
        <div>
            {/* 🔥 Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold">Transaction History 💳</h5>

                <div style={{ maxWidth: "300px", width: "100%" }}>
                    <Form.Control
                        type="text"
                        placeholder="Search by bundle or txn ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* 🔥 Table */}
            {filteredData.length === 0 ? (
                <div className="text-center py-5">
                    <h6>No transactions found</h6>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered align-middle">

                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Bundle</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Transaction ID</th>
                                <th>Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredData.map((txn, index) => (
                                <tr key={txn._id}>
                                    <td>{index + 1}</td>

                                    <td>{txn.bundleId?.title || "N/A"}</td>

                                    <td className="fw-semibold text-success">
                                        ${txn.amount}
                                    </td>

                                    <td>
                                        {txn.paymentStatus === "success" && (
                                            <Badge bg="success">Success</Badge>
                                        )}
                                        {txn.paymentStatus === "pending" && (
                                            <Badge bg="warning">Pending</Badge>
                                        )}
                                        {txn.paymentStatus === "failed" && (
                                            <Badge bg="danger">Failed</Badge>
                                        )}
                                    </td>

                                    <td>
                                        <small className="text-muted">
                                            {txn.paymentIntentId || "-"}
                                        </small>
                                    </td>

                                    <td>
                                        {new Date(txn.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;