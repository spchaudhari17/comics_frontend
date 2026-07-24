// TeacherDashboard.js - Clean Version (No Invoice, No Bank Payouts)

import React, { useEffect, useState } from "react";
import API from "../../API";
import { Badge, Button, Spinner, Container, Row, Col, Card, Table } from "react-bootstrap";
import { format } from "date-fns";
import { toast } from "react-toastify";

const TeacherDashboard = () => {
    // 🔥 State
    const [balance, setBalance] = useState(null);
    const [transfers, setTransfers] = useState([]);
    const [salesData, setSalesData] = useState({ totalSales: 0, totalEarnings: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // 🔥 Format helpers
    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return format(new Date(date), 'MMM dd, yyyy • hh:mm a');
        } catch {
            return 'Invalid Date';
        }
    };

    const formatCurrency = (amount) => {
        return `$${Number(amount).toFixed(2)}`;
    };

    // 🔥 Fetch all data
    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Sales data from database
            try {
                const salesRes = await API.get("/user/mySales");
                const sales = salesRes.data.data || [];
                const totalSales = sales.length;
                const totalEarnings = sales.reduce((acc, s) => acc + (s.teacherAmount || 0), 0);
                setSalesData({ totalSales, totalEarnings });
            } catch (err) {
                console.log("❌ Sales API error:", err);
                setError("Failed to load sales data");
            }

            // 2. Balance from Stripe
            try {
                const balanceRes = await API.get("/teacher/balance");
                if (balanceRes.data.data) {
                    setBalance(balanceRes.data.data);
                }
            } catch (err) {
                console.log("❌ Balance API error:", err);
            }

            // 3. Transfer status from Stripe
            try {
                const transferRes = await API.get("/teacher/transfers/status");
                if (transferRes.data.data) {
                    setTransfers(transferRes.data.data);
                }
            } catch (err) {
                console.log("❌ Transfer API error:", err);
            }

        } catch (err) {
            console.log("❌ Error fetching dashboard data:", err);
            setError("Failed to load dashboard data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchAllData();
    };

    // 🔥 Calculations
    const availableBalance = balance?.balance?.available?.reduce((sum, b) => sum + b.amount, 0) / 100 || 0;
    const pendingBalance = balance?.balance?.pending?.reduce((sum, b) => sum + b.amount, 0) / 100 || 0;
    const pendingTransfers = transfers.filter(t => t.transferStatus === 'pending').length;
    const completedTransfers = transfers.filter(t => t.transferStatus === 'paid').length;

    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading dashboard...</p>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            {/* 🔥 Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-0">📊 Teacher Dashboard</h4>
                    <small className="text-muted">
                        Last updated: {formatDate(new Date())}
                    </small>
                </div>
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="px-4"
                >
                    {refreshing ? (
                        <>
                            <Spinner as="span" size="sm" className="me-2" />
                            Refreshing...
                        </>
                    ) : (
                        '🔄 Refresh'
                    )}
                </Button>
            </div>

            {/* 🔥 Error Alert */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                    <strong>❌ {error}</strong>
                    <button type="button" className="btn-close" onClick={() => setError(null)} />
                </div>
            )}

            {/* 🔥 Stats Cards */}
            <Row className="g-3 mb-4">
                <Col lg={3} md={6}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="text-center">
                            <div className={`fs-2 fw-bold ${availableBalance > 0 ? 'text-success' : 'text-muted'}`}>
                                {formatCurrency(availableBalance)}
                            </div>
                            <Card.Text className="text-muted mb-1">Available Balance</Card.Text>
                            {pendingBalance > 0 && (
                                <small className="text-warning">
                                    + {formatCurrency(pendingBalance)} pending
                                </small>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="text-center">
                            <div className="text-primary fs-2 fw-bold">
                                {salesData.totalSales}
                            </div>
                            <Card.Text className="text-muted">Total Sales</Card.Text>
                            {salesData.totalSales > 0 && (
                                <small className="text-success">✅ {completedTransfers} completed</small>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="text-center">
                            <div className="text-warning fs-2 fw-bold">
                                {formatCurrency(salesData.totalEarnings)}
                            </div>
                            <Card.Text className="text-muted">Total Earnings (80%)</Card.Text>
                            {salesData.totalEarnings > 0 && (
                                <small className="text-info">💰 Your share after platform fee</small>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="text-center">
                            <div className={`fs-2 fw-bold ${pendingTransfers > 0 ? 'text-warning' : 'text-success'}`}>
                                {pendingTransfers}
                            </div>
                            <Card.Text className="text-muted">Pending Transfers</Card.Text>
                            {pendingTransfers === 0 && transfers.length > 0 && (
                                <small className="text-success">✅ All transfers completed</small>
                            )}
                            {pendingTransfers > 0 && (
                                <small className="text-warning">⏳ Waiting for bank confirmation</small>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* 🔥 Transfer Status Table */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Header className="fw-bold bg-light">
                    📤 Transfer Status
                    <Badge bg="secondary" className="ms-2">
                        {transfers.length}
                    </Badge>
                </Card.Header>
                <Card.Body>
                    {transfers.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            <div className="mb-2">📭</div>
                            <p className="mb-0">No transfers yet</p>
                            <small>Transfers appear after successful payments are processed</small>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table striped bordered hover size="sm" className="mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Bundle</th>
                                        <th className="text-end">Amount</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Arrival Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transfers.map((t, index) => (
                                        <tr key={t.purchaseId || index}>
                                            <td>
                                                <strong>{t.bundleTitle || 'N/A'}</strong>
                                                {t.bundlePrice && (
                                                    <div className="text-muted small">
                                                        Price: {formatCurrency(t.bundlePrice)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="text-end fw-bold text-success">
                                                {formatCurrency(t.amount)}
                                            </td>
                                            <td>
                                                {t.transferStatus === 'paid' && (
                                                    <Badge bg="success">✅ Transferred</Badge>
                                                )}
                                                {t.transferStatus === 'pending' && (
                                                    <Badge bg="warning" text="dark">⏳ Pending</Badge>
                                                )}
                                                {t.transferStatus === 'failed' && (
                                                    <Badge bg="danger">❌ Failed</Badge>
                                                )}
                                                {t.transferStatus === 'error' && (
                                                    <Badge bg="danger">⚠️ Error</Badge>
                                                )}
                                                {!t.transferStatus && (
                                                    <Badge bg="secondary">Unknown</Badge>
                                                )}
                                            </td>
                                            <td>
                                                {t.transferCreated ? (
                                                    <>
                                                        <div className="fw-semibold">
                                                            {formatDate(t.transferCreated)}
                                                        </div>
                                                        <small className="text-muted">
                                                            ID: {t.transferId?.slice(0, 12)}...
                                                        </small>
                                                    </>
                                                ) : 'N/A'}
                                            </td>
                                            <td>
                                                {t.arrivalDate ? (
                                                    <div className="fw-semibold text-success">
                                                        ✅ {formatDate(t.arrivalDate)}
                                                    </div>
                                                ) : t.transferStatus === 'paid' ? (
                                                    <Badge bg="success">✅ Completed</Badge>
                                                ) : t.transferStatus === 'pending' ? (
                                                    <Badge bg="warning">⏳ Processing</Badge>
                                                ) : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* 🔥 Footer - Quick Stats */}
            <div className="mt-4 p-3 bg-light rounded-3 text-muted">
                <Row>
                    <Col md={4}>
                        <small>💳 Total Transfers: {transfers.length}</small>
                    </Col>
                    <Col md={4}>
                        <small>✅ Completed: {completedTransfers}</small>
                    </Col>
                    <Col md={4}>
                        <small>⏳ Pending: {pendingTransfers}</small>
                    </Col>
                </Row>
                <hr className="my-2" />
                <Row>
                    <Col md={12}>
                        <small className="text-muted">
                            💡 <strong>Note:</strong> "Arrival Date" is when Stripe sends money to your bank.
                            Banks can take up to 5 business days to process.
                        </small>
                    </Col>
                </Row>
            </div>
        </Container>
    );
};

export default TeacherDashboard;