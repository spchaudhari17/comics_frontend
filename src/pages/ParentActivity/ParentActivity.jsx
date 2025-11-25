import React, { useEffect, useState } from "react";
import { Badge, Button, Form, Row, Col, Modal, ListGroup } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import dataTableCustomStyles from "../../assets/styles/dataTableCustomStyles";
import API from "../../API";
import "./ParentActivity.css";
import { useParams } from "react-router-dom";
import { Loader } from "../../lib/loader";

const ParentActivity = () => {
    const navigate = useNavigate();
    const { childId } = useParams();


    const [tableData, setTableData] = useState([]);
    const [child, setChild] = useState(null);

    // 🟦 New clean states
    const [wallet, setWallet] = useState({});
    const [progress, setProgress] = useState({});
    const [rewards, setRewards] = useState({});
    const [fullActivity, setFullActivity] = useState({});

    const [modalData, setModalData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivity();
    }, []);

    const fetchActivity = async () => {
        try {
            const res = await API.post(`/user/child-activity`, {
                childId: childId,
            });

            const d = res.data;
            setChild(d.child);

            // 🌟 clean state storage
            setWallet(d.wallet);
            setProgress(d.progressSummary);
            setRewards(d.rewardsInsight);
            setFullActivity(d.activity);

            let map = {};

            // 📘 Comic viewed
            d.activity.comicsViewed.forEach((c) => {
                map[c.comicId] = map[c.comicId] || {
                    comicId: c.comicId,
                    title: c.title,
                    subject: c.subject,
                    normal: 0,
                    hardcore: 0,
                    viewedAt: c.viewedAt,
                };
            });

            // 📝 Normal quiz
            d.activity.normalQuizzes.forEach((q) => {
                map[q.comicId] = map[q.comicId] || {
                    comicId: q.comicId,
                    title: q.title,
                    subject: q.subject,
                    normal: 0,
                    hardcore: 0,
                };
                map[q.comicId].normal += 1;
            });

            // 🔥 Hardcore quiz
            d.activity.hardcoreQuizzes.forEach((q) => {
                map[q.comicId] = map[q.comicId] || {
                    comicId: q.comicId,
                    title: q.title,
                    subject: q.subject,
                    normal: 0,
                    hardcore: 0,
                };
                map[q.comicId].hardcore += 1;
            });

            let rows = Object.values(map).map((r) => ({
                ...r,
                status:
                    r.hardcore > 0
                        ? "Hardcore Attempted"
                        : r.normal > 0
                            ? "Quiz Attempted"
                            : "Viewed",
            }));

            setTableData(rows);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // 🔍 Search
    const filtered = tableData.filter((x) => {
        const s = search.toLowerCase();
        return (
            x.title.toLowerCase().includes(s) ||
            x.subject.toLowerCase().includes(s) ||
            x.status.toLowerCase().includes(s)
        );
    });

    // ⭐ Modal Open
    const openModal = (row) => {
        const comicId = row.comicId;

        setModalData({
            ...row,
            viewed: fullActivity.comicsViewed.filter((c) => c.comicId === comicId),
            normalQuiz: fullActivity.normalQuizzes.filter((q) => q.comicId === comicId),
            hardcoreQuiz: fullActivity.hardcoreQuizzes.filter((q) => q.comicId === comicId),
        });

        setShowModal(true);
    };

    // 📘 Table Columns
    const columns = [
        { name: "#", selector: (row, i) => i + 1, width: "60px" },

        {
            name: "Activity Type",
            minWidth: "150px",
            cell: (row) => (
                <Badge
                    bg={
                        row.status === "Hardcore Attempted"
                            ? "danger"
                            : row.status === "Quiz Attempted"
                                ? "primary"
                                : "info"
                    }
                >
                    {row.status}
                </Badge>
            ),
        },

        { name: "Comic", selector: (row) => row.title, sortable: true, minWidth: "250px" },
        { name: "Subject", selector: (row) => row.subject, sortable: true, minWidth: "200px" },

        {
            name: "Normal Quiz",
            minWidth: "120px",
            cell: (row) =>
                row.normal > 0 ? (
                    <Badge bg="success">Attempted</Badge>
                ) : (
                    <Badge bg="secondary">No Attempt</Badge>
                ),
        },
        {
            name: "Hardcore Quiz",
            minWidth: "120px",
            cell: (row) =>
                row.hardcore > 0 ? (
                    <Badge bg="success">Attempted</Badge>
                ) : (
                    <Badge bg="secondary">No Attempt</Badge>
                ),
        },


        {
            name: "Action",
            minWidth: "50px",
            cell: (row) => (
                <Button variant="outline-primary" size="sm" onClick={() => openModal(row)}>
                    <i className="bi bi-eye-fill me-1"></i> View
                </Button>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="parent-activity-page pt-4 pb-3">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
                    <Loader />
                </div>
            </div>
        );
    }

    return (
        <div className="parent-activity-page pt-4 pb-3">
            <div className="container-xl slide-up">



                {/* CHILD HEADER */}
                {child && (
                    <div className="bg-white shadow-sm rounded-4 p-3 mb-3">
                        <h4 className="fw-bold text-primary">{child.username}'s Activity</h4>
                        <p className="text-muted">Grade: {child.grade} · Country: {child.country}</p>
                    </div>
                )}

                {/* -------------------- DASHBOARD CARDS -------------------- */}
                {child && (
                    <>
                        <Row className="g-3 mb-4">

                            {/* Coins */}
                            <Col md={3}>
                                <div className="bg-warning bg-opacity-25 rounded-4 border-bottom border-4 border-warning p-3 text-center">
                                    <div className="fs-3 fw-bold text-warning">{wallet.coins || 0}</div>
                                    <div className="fw-semibold text-muted">Coins</div>
                                </div>
                            </Col>

                            {/* EXP */}
                            <Col md={3}>
                                <div className="bg-success bg-opacity-25 rounded-4 border-bottom border-4 border-success p-3 text-center">
                                    <div className="fs-3 fw-bold text-success">{wallet.exp || 0}</div>
                                    <div className="fw-semibold text-muted">EXP</div>
                                </div>
                            </Col>

                            {/* Gems */}
                            <Col md={3}>
                                <div className="bg-info bg-opacity-25 rounded-4 border-bottom border-4 border-info p-3 text-center">
                                    <div className="fs-3 fw-bold text-info">{wallet.gems || 0}</div>
                                    <div className="fw-semibold text-muted">Gems</div>
                                </div>
                            </Col>

                            {/* Engagement Score */}
                            <Col md={3}>
                                <div className="bg-primary bg-opacity-25 rounded-4 border-bottom border-4 border-primary p-3 text-center">
                                    <div className="fs-3 fw-bold text-primary">
                                        {progress.overallEngagementScore || 0}
                                    </div>
                                    <div className="fw-semibold text-muted">Engagement Score</div>
                                </div>
                            </Col>
                        </Row>

                        {/* SECOND ROW */}
                        <Row className="g-3 mb-4">
                            <Col md={3}>
                                <div className="bg-secondary bg-opacity-25 rounded-4 border-bottom border-4 border-secondary p-3 text-center">
                                    <div className="fs-3 fw-bold text-secondary">
                                        {progress.totalComicsViewed || 0}
                                    </div>
                                    <div className="fw-semibold text-muted">Comics Viewed</div>
                                </div>
                            </Col>

                            <Col md={3}>
                                <div className="bg-primary bg-opacity-25 rounded-4 border-bottom border-4 border-primary p-3 text-center">
                                    <div className="fs-3 fw-bold text-primary">
                                        {progress.totalNormalQuizzesAttempted || 0}
                                    </div>
                                    <div className="fw-semibold text-muted">Normal Quizzes</div>
                                </div>
                            </Col>

                            <Col md={3}>
                                <div className="bg-danger bg-opacity-25 rounded-4 border-bottom border-4 border-danger p-3 text-center">
                                    <div className="fs-3 fw-bold text-danger">
                                        {progress.totalHardcoreQuizzesAttempted || 0}
                                    </div>
                                    <div className="fw-semibold text-muted">Hardcore Quizzes</div>
                                </div>
                            </Col>

                            <Col md={3}>
                                <div className="bg-success bg-opacity-25 rounded-4 border-bottom border-4 border-success p-3 text-center">
                                    <div className="fs-3 fw-bold text-success">
                                        {rewards.totalCoinsEarned || 0}
                                    </div>
                                    <div className="fw-semibold text-muted">Coins Earned</div>
                                </div>
                            </Col>
                        </Row>
                    </>
                )}



                {/* TABLE */}
                <div className="bg-white rounded-4 p-3 shadow-sm">
                    <DataTable
                        columns={columns}
                        data={filtered}
                        progressPending={loading}
                        pagination
                        striped
                        highlightOnHover
                        customStyles={dataTableCustomStyles}
                    />
                </div>

            </div>

            {/* BACK BUTTON AT BOTTOM */}
            <div className="text-center mt-4 mb-4">
                <Button
                    variant="outline-primary"
                    size="lg"
                    onClick={() => navigate(-1)}
                >
                    <i className="bi bi-arrow-left"></i> Back
                </Button>
            </div>


            {/* ⭐ MODAL */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-book-half text-primary me-2"></i>
                        Comic Activity Details
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {modalData && (
                        <>
                            <h4 className="fw-bold">{modalData.title}</h4>
                            <p className="text-muted">{modalData.subject}</p>

                            {/* Viewed */}
                            {modalData.viewed.length > 0 && (
                                <>
                                    <h6 className="mt-3">📘 Viewed</h6>
                                    <p className="text-muted">
                                        Viewed on:{" "}
                                        {new Date(modalData.viewed[0].viewedAt).toLocaleString()}
                                    </p>
                                </>
                            )}

                            {/* Normal Quiz */}
                            <h6 className="mt-4">📝 Normal Quiz Attempts</h6>
                            {modalData.normalQuiz.length > 0 ? (
                                <ListGroup>
                                    {modalData.normalQuiz.map((q, i) => (
                                        <ListGroup.Item key={i}>
                                            <div className="fw-semibold">{q.title}</div>
                                            <div className="small">
                                                Score: {q.score} | Coins: {q.coinsEarned} | EXP: {q.expEarned}
                                            </div>
                                            <div className="text-muted small">
                                                Attempted: {new Date(q.submittedAt).toLocaleString()}
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <p className="text-muted">No normal quiz attempts.</p>
                            )}

                            {/* Hardcore Quiz */}
                            <h6 className="mt-4">🔥 Hardcore Quiz Attempts</h6>
                            {modalData.hardcoreQuiz.length > 0 ? (
                                <ListGroup>
                                    {modalData.hardcoreQuiz.map((q, i) => (
                                        <ListGroup.Item key={i}>
                                            <div className="fw-semibold">
                                                Attempt #{q.attemptNumber} — {q.title}
                                            </div>
                                            <div className="small">
                                                Score: {q.score} | Coins: {q.coinsEarned} | EXP: {q.expEarned}
                                            </div>
                                            <div className="text-muted small">
                                                Attempted: {new Date(q.submittedAt).toLocaleString()}
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <p className="text-muted">No hardcore quiz attempts.</p>
                            )}
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ParentActivity;
