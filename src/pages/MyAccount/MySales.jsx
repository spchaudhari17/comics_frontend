// MySales.js - With TeacherDashboard Button

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 🔥 Import navigate
import API from "../../API";
import { Badge, Button } from "react-bootstrap"; // 🔥 Import Button
import { Loader } from "../../lib/loader";

const MySales = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // 🔥 Initialize navigate

    const fetchSales = async () => {
        try {
            setLoading(true);
            const res = await API.get("/user/mySales");
            setSales(res.data.data || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    if (loading) return <Loader />;

    // Calculations
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((acc, s) => acc + (s.amount || 0), 0);
    const totalEarning = sales.reduce((acc, s) => acc + (s.teacherAmount || 0), 0);

    // 🔥 Redirect to TeacherDashboard
    const goToDashboard = () => {
        navigate("/teacherDashboard");
    };

    return (
        <div>
            {/* 🔥 Header with Button */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">My Sales Dashboard 💰</h5>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={goToDashboard}
                >
                    📊 Go to Dashboard
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="p-3 border rounded text-center">
                        <div className="fs-4 fw-bold text-primary">{totalSales}</div>
                        <div>Total Sales</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="p-3 border rounded text-center">
                        <div className="fs-4 fw-bold text-success">
                            ${totalRevenue}
                        </div>
                        <div>Total Revenue</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="p-3 border rounded text-center">
                        <div className="fs-4 fw-bold text-warning">
                            ${totalEarning}
                        </div>
                        <div>Your Earnings (80%)</div>
                    </div>
                </div>
            </div>

            {/* Sales Table */}
            {sales.length === 0 ? (
                <div className="text-center py-5">
                    <h6>No sales yet</h6>
                    <small className="text-muted">
                        Sales will appear here when students purchase your bundles
                    </small>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Buyer</th>
                                <th>Email</th>
                                <th>Bundle</th>
                                <th>Amount</th>
                                <th>Your Share</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map((sale, index) => (
                                <tr key={sale._id}>
                                    <td>{index + 1}</td>
                                    <td>{sale.userId?.firstname || "N/A"}</td>
                                    <td>{sale.userId?.email || "N/A"}</td>
                                    <td>{sale.bundleId?.title}</td>
                                    <td className="text-success fw-semibold">
                                        ${sale.amount}
                                    </td>
                                    <td className="text-warning fw-semibold">
                                        ${sale.teacherAmount}
                                    </td>
                                    <td>
                                        {sale.paymentStatus === "success" && (
                                            <Badge bg="success">Success</Badge>
                                        )}
                                        {sale.paymentStatus === "pending" && (
                                            <Badge bg="warning">Pending</Badge>
                                        )}
                                        {sale.paymentStatus === "failed" && (
                                            <Badge bg="danger">Failed</Badge>
                                        )}
                                    </td>
                                    <td>
                                        {new Date(sale.createdAt).toLocaleDateString()}
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

export default MySales;