import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    Row,
    Col,
    Badge,
    Button,
    Image,
    Alert,
    Accordion,
    ListGroup,
} from "react-bootstrap";
import API from "../../API";
import { Loader } from "../../lib/loader";



const AdminComicDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");



    useEffect(() => {
        const fetchComic = async () => {
            try {
                setLoading(true);
                const { data } = await API.get(`/admin/comics/${id}`);
                setData(data.data); // ✅ Adjusted (data.data)
            } catch (err) {
                setError(err.response?.data?.error || "Failed to load comic details");
            } finally {
                setLoading(false);
            }
        };
        fetchComic();
    }, [id]);

    if (loading) return <Loader />;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!data) return null;

    const { comic, pages, quiz, didYouKnow, faqs, hardcoreQuiz } = data;

    const getStatusBadge = (status) => {
        switch (status) {
            case "approved":
                return <Badge bg="success">Approved</Badge>;
            case "rejected":
                return <Badge bg="danger">Rejected</Badge>;
            case "pending":
                return <Badge bg="warning" text="dark">Pending</Badge>;
            default:
                return <Badge bg="secondary">Unknown</Badge>;
        }
    };



    return (
        <div className="admin-comic-details-page pt-4 pb-5">
            <div className="container-xl">
                {/* 🔹 Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="fw-bold mb-1">{comic.title}</h3>
                        <small className="text-muted">
                            Created on {new Date(comic.createdAt).toLocaleString()}
                        </small>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                        {getStatusBadge(comic.status)}
                        {comic.comicStatus === "published" && (
                            <Badge bg="primary">Published</Badge>
                        )}
                    </div>
                </div>

                {/* 🔹 Comic Info */}
                <Card className="border-0 shadow-sm rounded-4 mb-4">
                    <Card.Body>
                        <Row className="gy-3">
                            <Col md={6}>
                                <div><strong>Creator:</strong> {comic.user_id?.firstname}</div>
                                <div><strong>Email:</strong> {comic.user_id?.email}</div>
                                <div><strong>Country:</strong> {comic.country}</div>
                                <div><strong>Grade:</strong> {comic.grade}</div>

                                <div><strong>Has Quiz:</strong> {comic.hasQuiz ? "✅ Yes" : "❌ No"}</div>
                                <div><strong>Has Did You Know:</strong> {data.hasDidYouKnow ? "✅ Yes" : "❌ No"}</div>
                            </Col>
                            <Col md={6}>
                                <div><strong>Subject:</strong> {comic.subjectId?.name}</div>
                                <div><strong>Theme:</strong> {comic.themeId?.name}</div>
                                <div><strong>Style:</strong> {comic.styleId?.name}</div>
                                <div><strong>Concept:</strong> {comic.concept}</div>

                                <div><strong>Has FAQ:</strong> {data.hasFaq ? "✅ Yes" : "❌ No"}</div>
                                <div><strong>Has Hardcore Quiz:</strong> {data.hasHardcoreQuiz ? "✅ Yes" : "❌ No"}</div>

                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* 🔹 Story */}
                <Card className="border-0 shadow-sm rounded-4 mb-4">
                    <Card.Body>
                        <h5 className="fw-semibold mb-3">Story</h5>
                        <p className="text-muted mb-3">
                            {comic.story || "No story available."}
                        </p>

                        {comic.userStory && (
                            <>
                                <h6 className="fw-semibold mt-3">User Story</h6>
                                <p className="text-muted">{comic.userStory}</p>
                            </>
                        )}
                    </Card.Body>
                </Card>

                {/* 🔹 Comic Pages */}
                <Card className="border-0 shadow-sm rounded-4 mb-4">
                    <Card.Body>
                        <h5 className="fw-semibold mb-4">Comic Pages</h5>
                        <Row className="gy-4">
                            {pages.map((page) => (
                                <Col md={6} lg={4} key={page._id}>
                                    <div className="comic-page-card border rounded-4 shadow-sm p-2 bg-light text-center h-100">
                                        <Image
                                            src={page.imageUrl}
                                            alt={`Page ${page.pageNumber}`}
                                            fluid
                                            className="rounded-3 mb-2"
                                            style={{ maxHeight: "350px", objectFit: "cover" }}
                                        />
                                        <div className="fw-semibold mb-1">Page {page.pageNumber}</div>
                                        {page.panels?.length > 0 && (
                                            <>
                                                <div className="small text-muted">
                                                    <strong>Scene:</strong> {page.panels[0].scene}
                                                </div>
                                                <div className="small text-secondary">
                                                    <strong>Caption:</strong> {page.panels[0].caption}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Card.Body>
                </Card>

                {/* 🔹 Quiz / DidYouKnow / FAQ / Hardcore */}
                <Accordion defaultActiveKey="0" alwaysOpen>
                    {/* 📘 Quiz Section */}
                    {quiz && (
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>📘 Quiz Questions</Accordion.Header>
                            <Accordion.Body>
                                <ListGroup variant="flush">
                                    {quiz.questions.map((q, idx) => (
                                        <ListGroup.Item key={q._id}>
                                            <strong>Q{idx + 1}:</strong> {q.question}
                                            <ul className="mt-2">
                                                {q.options.map((opt, i) => (
                                                    <li key={i}>
                                                        {opt === q.correctAnswer ? (
                                                            <span className="text-success fw-semibold">{opt} ✅</span>
                                                        ) : (
                                                            <span>{opt}</span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                            <small className="text-muted">Difficulty: {q.difficulty}</small>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Accordion.Body>
                        </Accordion.Item>
                    )}

                    {/* 💡 Did You Know */}
                    {didYouKnow && didYouKnow.length > 0 && (
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>💡 Did You Know Facts</Accordion.Header>
                            <Accordion.Body>
                                <Row className="gy-3">
                                    {didYouKnow.map((fact) => (
                                        <Col md={6} key={fact._id}>
                                            <Card className="border-0 shadow-sm rounded-4">
                                                <Image
                                                    src={fact.imageUrl}
                                                    alt="DidYouKnow"
                                                    fluid
                                                    className="rounded-top-4"
                                                />
                                                <Card.Body>
                                                    <p>{fact.fact}</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>
                    )}

                    {/* ❓ FAQs */}
                    {faqs && faqs.length > 0 && (
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>❓ FAQs</Accordion.Header>
                            <Accordion.Body>
                                <ListGroup variant="flush">
                                    {faqs.map((faq) => (
                                        <ListGroup.Item key={faq._id}>
                                            <strong>Q:</strong> {faq.question}
                                            <div className="mt-2 text-muted">A: {faq.answer}</div>
                                            {faq.imageUrl && (
                                                <div className="mt-2">
                                                    <Image
                                                        src={faq.imageUrl}
                                                        alt="FAQ"
                                                        style={{ maxWidth: "200px", borderRadius: "8px" }}
                                                    />
                                                </div>
                                            )}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Accordion.Body>
                        </Accordion.Item>
                    )}

                    {/* 🔥 Hardcore Quiz */}
                    {hardcoreQuiz && (
                        <Accordion.Item eventKey="3">
                            <Accordion.Header>🔥 Hardcore Quiz</Accordion.Header>
                            <Accordion.Body>
                                <ListGroup variant="flush">
                                    {hardcoreQuiz.questions.map((q, idx) => (
                                        <ListGroup.Item key={q._id}>
                                            <strong>Q{idx + 1}:</strong> {q.question}
                                            <ul className="mt-2">
                                                {q.options.map((opt, i) => (
                                                    <li key={i}>
                                                        {opt === q.correctAnswer ? (
                                                            <span className="text-success fw-semibold">{opt} ✅</span>
                                                        ) : (
                                                            <span>{opt}</span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                            <small className="text-muted">
                                                Difficulty: {q.difficulty} <br />
                                                Explanation: {q.explanation}
                                            </small>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Accordion.Body>
                        </Accordion.Item>
                    )}
                </Accordion>

                {/* 🔹 Footer */}
                <div className="d-flex justify-content-between align-items-center mt-4">
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        ← Back
                    </Button>

                    {/* <Button variant="success" onClick={handleDownloadAsPDF}>
                        <i className="bi bi-file-earmark-arrow-down me-1"></i> Download Full Quiz Data (PDF)
                    </Button> */}

                    {comic.pdfUrl && (
                        <Button
                            variant="danger"
                            onClick={() => window.open(comic.pdfUrl, "_blank")}
                        >
                            <i className="bi bi-filetype-pdf me-1"></i> View PDF
                        </Button>
                    )}


                </div>
            </div>
        </div>
    );
};

export default AdminComicDetails;
