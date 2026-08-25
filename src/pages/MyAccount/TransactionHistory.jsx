import React, { useEffect, useState } from "react";
import API from "../../API";
import { Badge, Form } from "react-bootstrap";
import { Loader } from "../../lib/loader";

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [foundingTeacherPayment, setFoundingTeacherPayment] = useState(null);
    const [isFoundingTeacher, setIsFoundingTeacher] = useState(false);

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

    // 🔥 Fetch Founding Teacher Payment Details
    const fetchFoundingTeacherPayment = async () => {
        try {
            const res = await API.get("/teacher/get-founding-teacher-payment-details");

            if (res.data.success && res.data.data) {
                setFoundingTeacherPayment(res.data.data);
                setIsFoundingTeacher(true);
            }
        } catch (err) {
            console.log("No Founding Teacher payment found:", err);
            setIsFoundingTeacher(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
        fetchFoundingTeacherPayment();
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

    // Prepare all data
    let allData = [...filteredData];

    // Add Founding Teacher payment as a special row if exists
    if (isFoundingTeacher && foundingTeacherPayment) {
        const foundingRow = {
            _id: "founding_teacher",
            bundleId: { title: "⭐ Founding Teacher Fee" },
            amount: foundingTeacherPayment.amount,
            paymentStatus: "success",
            paymentIntentId: foundingTeacherPayment.transactionId,
            createdAt: foundingTeacherPayment.purchasedAt,
            receiptUrl: foundingTeacherPayment.receiptUrl,
            isFoundingTeacher: true,
            currency: foundingTeacherPayment.currency,
        };

        // Option 1: Founding Teacher row top par (default)
        allData.unshift(foundingRow);

        // Option 2: Date ke hisaab se sort karein (comment karke rakha hai)
        // allData.push(foundingRow);
        // allData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

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
            {allData.length === 0 ? (
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
                                <th>Receipt</th>
                            </tr>
                        </thead>

                        <tbody>
                            {allData.map((txn, index) => (
                                <tr
                                    key={txn._id}
                                    className={txn.isFoundingTeacher ? "table-success fw-semibold" : ""}
                                >
                                    <td>
                                        {txn.isFoundingTeacher ? (
                                            <Badge bg="success">⭐</Badge>
                                        ) : (
                                            index + 1
                                        )}
                                    </td>

                                    <td>
                                        {txn.bundleId?.title || "N/A"}
                                        {txn.isFoundingTeacher && (
                                            <Badge bg="warning" text="dark" className="ms-2">
                                                One-Time
                                            </Badge>
                                        )}
                                    </td>

                                    <td className="fw-semibold text-success">
                                        ${txn.amount}
                                        {txn.currency && (
                                            <small className="text-muted ms-1">
                                                {txn.currency.toUpperCase()}
                                            </small>
                                        )}
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
                                            {txn.paymentIntentId ? (
                                                txn.paymentIntentId.length > 25 ?
                                                    `${txn.paymentIntentId.slice(0, 25)}...` :
                                                    txn.paymentIntentId
                                            ) : (
                                                "-"
                                            )}
                                        </small>
                                    </td>

                                    <td>
                                        {new Date(txn.createdAt).toLocaleDateString()}
                                    </td>

                                    <td>
                                        {txn.receiptUrl ? (
                                            <a
                                                href={txn.receiptUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-outline-primary"
                                            >
                                                Download
                                            </a>
                                        ) : (
                                            "-"
                                        )}
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