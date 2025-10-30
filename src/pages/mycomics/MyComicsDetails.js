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

const MyComicDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comicData, setComicData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComicDetails = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/user/comics/${id}`);
        setComicData(data.data || data); // ensure consistency
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load comic details");
      } finally {
        setLoading(false);
      }
    };
    fetchComicDetails();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!comicData) return null;

  const { comic, pages, parts, quiz, didYouKnow, faqs, hardcoreQuiz } = comicData;

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

  const getComicStatusBadge = (comicStatus) => {
    switch (comicStatus) {
      case "published":
        return <Badge bg="primary">Published</Badge>;
      case "draft":
        return <Badge bg="secondary">Draft</Badge>;
      default:
        return <Badge bg="dark">N/A</Badge>;
    }
  };

  return (
    <div className="comic-details-page pt-4 pb-5">
      <div className="container-xl">
        {/* 🔹 Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">{comic.title}</h3>
          <div className="d-flex gap-2">
            {getStatusBadge(comic.status)}
            {getComicStatusBadge(comic.comicStatus)}
          </div>
        </div>

        {/* 🔹 Comic Info */}
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body>
            <Row className="gy-3">
              <Col md={6}>
                <div><strong>Concept:</strong> {comic.concept}</div>
                <div><strong>Subject:</strong> {comic.subjectId?.name || comic.subject}</div>
                <div><strong>Grade:</strong> {comic.grade}</div>
                <div><strong>Country:</strong> {comic.country}</div>
              </Col>
              <Col md={6}>
                <div><strong>Theme:</strong> {comic.themeId?.name || comic.theme}</div>
                <div><strong>Style:</strong> {comic.styleId?.name || comic.style}</div>
                <div><strong>Created:</strong> {new Date(comic.createdAt).toLocaleString()}</div>
                <div><strong>Has Quiz:</strong> {comic.hasQuiz ? "✅ Yes" : "❌ No"}</div>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col md={4}>
                <div><strong>Has FAQ:</strong> {comic.hasFAQ ? "✅ Yes" : "❌ No"}</div>
              </Col>
              <Col md={4}>
                <div><strong>Has Did You Know:</strong> {comic.hasDidYouKnow ? "✅ Yes" : "❌ No"}</div>
              </Col>
              <Col md={4}>
                <div><strong>Hardcore Quiz:</strong> {comic.hasHardcoreQuiz ? "✅ Yes" : "❌ No"}</div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* 🔹 Story Section */}
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body>
            <h5 className="fw-semibold mb-3">Story Summary</h5>
            <p className="mb-2 text-muted">{comic.story || "No story provided."}</p>
            {comic.userStory && (
              <>
                <h6 className="fw-semibold mt-4">User Story (Prompt)</h6>
                <p className="text-muted">{comic.userStory}</p>
              </>
            )}
          </Card.Body>
        </Card>

        {/* 🔹 Series Parts */}
        {parts && parts.length > 1 && (
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body>
              <h5 className="fw-semibold mb-3">Series Parts</h5>
              <div className="d-flex flex-wrap gap-3">
                {parts.map((part) => (
                  <Button
                    key={part._id}
                    variant={part._id === comic._id ? "primary" : "outline-primary"}
                    onClick={() => navigate(`/my-comics-details/${part._id}`)}
                  >
                    Part {part.partNumber}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* 🔹 Comic Pages */}
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body>
            <h5 className="fw-semibold mb-4">Comic Pages</h5>
            <Row className="gy-4">
              {pages.map((page) => (
                <Col md={6} lg={4} key={page._id}>
                  <div className="comic-page-card text-center border rounded-4 shadow-sm p-2 bg-light h-100">
                    <Image
                      src={page.imageUrl}
                      alt={`Page ${page.pageNumber}`}
                      fluid
                      className="rounded-3 mb-2"
                      style={{ maxHeight: "350px", objectFit: "cover" }}
                    />
                    <div className="fw-semibold mb-1">Page {page.pageNumber}</div>
                    {page.panels && page.panels.length > 0 && (
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

        {/* 🔹 Quiz / DidYouKnow / FAQ / Hardcore (Accordion) */}
        <Accordion defaultActiveKey="0" alwaysOpen>
          {/* 📘 Quiz Section */}
          {quiz && quiz.questions?.length > 0 && (
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
                        {fact.imageUrl && (
                          <Image
                            src={fact.imageUrl}
                            alt="DidYouKnow"
                            fluid
                            className="rounded-top-4"
                          />
                        )}
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
          {hardcoreQuiz && hardcoreQuiz.questions?.length > 0 && (
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
        </div>
      </div>
    </div>
  );
};

export default MyComicDetails;
