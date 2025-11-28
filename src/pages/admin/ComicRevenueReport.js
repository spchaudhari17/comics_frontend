import React, { useEffect, useState } from "react";
import { Button, Row, Col, Form, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import API from "../../API";
import dataTableCustomStyles from "../../assets/styles/dataTableCustomStyles";
import { Loader } from "../../lib/loader";
import { NoDataComponent } from "../../components/NoDataComponent";

const ComicRevenueReport = () => {
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page,
                limit,
                start_date: startDate,
                end_date: endDate,
            });

            const res = await API.get(`/user/revenue/comics?${params.toString()}`);
            setData(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    const applyFilters = () => {
        setPage(1);
        fetchData();
    };

    const resetFilters = () => {
        setStartDate("");
        setEndDate("");
        setPage(1);
        fetchData();
    };

    const columns = [
        {
            name: "Comic",
            grow: 3,
            cell: row => (
                <div>
                    <div className="fw-bold">{row.title}</div>
                    <small className="text-muted">{row.subject}</small>
                </div>
            )
        },
        {
            name: "Country",
            selector: row => row.country,
            sortable: true
        },
        {
            name: "Total Impr.",
            selector: row => row.total_impressions,
            sortable: true
        },
        {
            name: "Total Revenue",
            selector: row => `$${row.total_revenue.toFixed(4)}`,
            sortable: true
        },
        {
            name: "Android",
            grow: 2,
            cell: row => (
                <div>
                    <div>Banner: {row.android.banner.impressions}</div>
                    <div>Interstitial: {row.android.interstitial.impressions}</div>
                    <div>Rewarded: {row.android.rewarded.impressions}</div>
                    <div className="fw-bold mt-1">
                        Rev: ${row.android.total_revenue.toFixed(4)}
                    </div>
                </div>
            )
        },
        {
            name: "iOS",
            grow: 2,
            cell: row => (
                <div>
                    <div>Banner: {row.ios.banner.impressions}</div>
                    <div>Interstitial: {row.ios.interstitial.impressions}</div>
                    <div>Rewarded: {row.ios.rewarded.impressions}</div>
                    <div className="fw-bold mt-1">
                        Rev: ${row.ios.total_revenue.toFixed(4)}
                    </div>
                </div>
            )
        },
        {
            name: "Combined",
            grow: 2,
            cell: row => (
                <div>
                    <div>Banner: {row.combined.banner}</div>
                    <div>Interstitial: {row.combined.interstitial}</div>
                    <div>Rewarded: {row.combined.rewarded}</div>
                    <div className="fw-bold mt-1">
                        Rev: ${row.total_revenue.toFixed(4)}
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="py-4">
            <div className="container-xl">

                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="main-heading">Revenue Report</h1>

                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        ← Back
                    </Button>
                </div>

                {/* FILTERS */}
                <Card className="p-3 shadow-sm rounded-4 mb-4">
                    <Row className="g-3">
                        <Col md={3}>
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </Col>

                        <Col md={3}>
                            <Form.Label>End Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </Col>

                        <Col md={3} className="d-flex align-items-end">
                            <Button className="w-100" onClick={applyFilters}>
                                Apply Filters
                            </Button>
                        </Col>

                        <Col md={3} className="d-flex align-items-end">
                            <Button variant="outline-danger" className="w-100" onClick={resetFilters}>
                                Reset
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {loading ? (
                    <Loader />
                ) : (
                    <>
                        {/* TABLE */}
                        <div className="info-wrapper">
                            <div className="table-responsive table-custom-wrapper">
                                <DataTable
                                    columns={columns}
                                    data={data}
                                    pagination={false}
                                    striped
                                    responsive
                                    highlightOnHover
                                    customStyles={dataTableCustomStyles}
                                    noDataComponent={<NoDataComponent />}
                                />
                            </div>
                        </div>

                        {/* PAGINATION */}
                        <div className="d-flex justify-content-between mt-4">
                            <Button
                                variant="outline-primary"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                ← Previous
                            </Button>

                            <div className="fw-bold">Page {page}</div>

                            <Button
                                variant="outline-primary"
                                disabled={data.length < limit}
                                onClick={() => setPage(page + 1)}
                            >
                                Next →
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ComicRevenueReport;
