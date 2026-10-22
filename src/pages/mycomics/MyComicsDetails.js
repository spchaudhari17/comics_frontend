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
  Spinner,
} from "react-bootstrap";
import API from "../../API";
import { Loader } from "../../lib/loader";
import { trackClick, useScrollDepth } from "../../utility/analytics";
import EditCreditsCard from "../../components/EditCreditsCard";
import EditComicPageModal from "../ComicGenerator/EditComicPageModal";
import { getPdfErrorMessage, downloadComicPdf } from "../../utility/Comicpdf";


const MyComicDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comicData, setComicData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✏️ Page edit (credits se)
  const [editingPage, setEditingPage] = useState(null);   // { page, imageUrl, panels }
  const [editedPages, setEditedPages] = useState([]);
  const [pageMessage, setPageMessage] = useState("");

  // 📥 Poori PDF download
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  // 📄 Edit ke baad PDF dobara banana
  const [updatingPdf, setUpdatingPdf] = useState(false);
  const [pdfError, setPdfError] = useState("");

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
    // Dusre part pe jaane pe purani edit state saaf
    setEditedPages([]);
    setPageMessage("");
    setPdfError("");
    fetchComicDetails();
  }, [id]);

  // GA: how much users scroll on the comic details screen
  useScrollDepth("comic_details_screen", {
    enabled: !loading && Boolean(comicData),
    resetKey: id,
    params: { comic_id: id },
  });

  // ✏️ Ek page dobara bana -> sirf wahi page badlo
  const handlePageRegenerated = ({ page, imageUrl, panels }) => {
    setComicData((prev) => ({
      ...prev,
      // Backend purana pdfUrl hata deta hai (usme purani image thi)
      comic: { ...prev.comic, pdfUrl: null },
      pages: prev.pages.map((p) =>
        p.pageNumber === page ? { ...p, imageUrl, panels } : p
      ),
    }));
    setEditedPages((prev) => [...new Set([...prev, page])]);
    setPdfError("");
    setPageMessage(`Page ${page} updated successfully.`);
  };

  // 📄 Comic ki PDF nayi images ke saath dobara banao
  const handleUpdatePdf = async () => {
    trackClick("comic_details_update_pdf_click", {
      comic_id: id,
      edited_pages: editedPages.length,
    });

    try {
      setUpdatingPdf(true);
      setPdfError("");
      const { data } = await API.post("/user/generateComicPDF", { comicId: id });
      if (!data?.pdfUrl) throw new Error("PDF URL not returned");

      setComicData((prev) => ({
        ...prev,
        comic: { ...prev.comic, pdfUrl: data.pdfUrl },
      }));
      setPageMessage("PDF updated with your latest changes.");
    } catch (err) {
      setPdfError(err.response?.data?.error || err.message || "Failed to update PDF.");
    } finally {
      setUpdatingPdf(false);
    }
  };

  // 📥 Comic + FAQ + facts + quiz ek PDF me (watermark ke saath)
  const handleDownloadPdf = async () => {
    trackClick("comic_details_pdf_download_click", {
      comic_id: id,
      comic_status: comicData?.comic?.comicStatus || "",
    });

    try {
      setDownloadingPdf(true);
      setDownloadError("");
      await downloadComicPdf(id, comicData?.comic?.title);
    } catch (err) {
      setDownloadError(await getPdfErrorMessage(err));
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!comicData) return null;

  const { comic, pages, parts, quiz, didYouKnow, faqs, hardcoreQuiz } = comicData;

  const canEditPages = Array.isArray(pages) && pages.length > 0;
  const isPublished = comic.comicStatus === "published";
  const pdfNeedsUpdate = canEditPages && !comic.pdfUrl;

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
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <h3 className="fw-bold mb-0">{comic.title}</h3>
          <div className="d-flex flex-wrap align-items-center gap-2">
            {getStatusBadge(comic.status)}
            {getComicStatusBadge(comic.comicStatus)}

            {/* 📥 Download PDF */}
            <Button
              variant="danger"
              size="sm"
              className="ms-2"
              onClick={handleDownloadPdf}
              disabled={!canEditPages || downloadingPdf}
              title={canEditPages ? "Comic pages + FAQ + Did You Know + Quiz in one PDF" : "Generate the comic pages first"}
            >
              {downloadingPdf ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Preparing PDF...
                </>
              ) : (
                <>
                  <i className="bi bi-download me-1"></i>
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
        {downloadError && (
          <Alert variant="danger" dismissible onClose={() => setDownloadError("")}>
            {downloadError}
          </Alert>
        )}

        {/* 🔹 Comic Info */}
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body>
            <Row className="gy-3">
              <Col md={6}>
                <div><strong>Concept:</strong> {comic.concept}</div>
                <div><strong>Subject:</strong> {comic.subjectId?.name || comic.subject}</div>
                <div><strong>Grade:</strong> {comic.grade}</div>
                <div><strong>Country:</strong> {comic.country === "ALL" ? "🌍 All Countries" : comic.country}</div>
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
                    onClick={() => {
                      trackClick("comic_details_part_click", {
                        comic_id: comic._id,
                        target_comic_id: part._id,
                        part_number: part.partNumber,
                      });
                      navigate(`/my-comics-details/${part._id}`);
                    }}
                  >
                    Part {part.partNumber}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* 💳 Credits (sirf tab jab pages edit ho sakte hain) */}
        {canEditPages && <EditCreditsCard className="mb-4" />}

        {/* 🔹 Comic Pages */}
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h5 className="fw-semibold mb-0">Comic Pages</h5>
              {canEditPages && (
                <div className="small text-muted">
                  <i className="bi bi-pencil-square me-1"></i>
                  Use <strong>Edit page</strong> to change a page's scene, caption or dialogue (1 credit per page).
                </div>
              )}
            </div>

            {pageMessage && (
              <Alert variant="success" dismissible onClose={() => setPageMessage("")}>
                {pageMessage}
              </Alert>
            )}

            {/* 📄 Edit ke baad PDF purani ho gayi */}
            {pdfNeedsUpdate && (
              <Alert variant="warning" className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <i className="bi bi-file-earmark-pdf me-1"></i>
                  {editedPages.length > 0
                    ? "You changed some pages. Update the saved PDF so it includes the new images."
                    : "This comic doesn't have an up-to-date saved PDF."}
                  {isPublished && (
                    <div className="small text-muted mt-1">
                      Buyers already see the new pages in the reader and in downloaded PDFs.
                    </div>
                  )}
                </div>
                <Button variant="warning" onClick={handleUpdatePdf} disabled={updatingPdf}>
                  {updatingPdf ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Updating PDF...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-repeat me-1"></i>
                      Update PDF
                    </>
                  )}
                </Button>
              </Alert>
            )}
            {pdfError && <Alert variant="danger">{pdfError}</Alert>}

            <Row className="gy-4">
              {pages.map((page) => (
                <Col md={6} lg={4} key={page._id}>
                  <div className="comic-page-card text-center border rounded-4 shadow-sm p-2 bg-light h-100 d-flex flex-column">
                    <Image
                      src={page.imageUrl}
                      alt={`Page ${page.pageNumber}`}
                      fluid
                      className="rounded-3 mb-2"
                      style={{ maxHeight: "350px", objectFit: "cover" }}
                    />
                    <div className="fw-semibold mb-1 d-flex justify-content-center align-items-center gap-2">
                      Page {page.pageNumber}
                      {editedPages.includes(page.pageNumber) && <Badge bg="success">Edited</Badge>}
                    </div>

                    {page.panels && page.panels.length > 0 && (
                      <div className="mt-2 text-start">
                        {page.panels.map((panel, idx) => (
                          <div key={idx} className="mb-2 small">
                            {panel.scene && (
                              <div className="text-muted">
                                <strong>Scene:</strong> {panel.scene}
                              </div>
                            )}

                            {panel.caption && (
                              <div className="text-secondary">
                                <strong>Caption:</strong> {panel.caption}
                              </div>
                            )}

                            {panel.dialogue && panel.dialogue.length > 0 && (
                              <div className="text-dark">
                                {panel.dialogue.map((d, i) => (
                                  <div key={i}>
                                    <strong>{d.character}:</strong> {d.text}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ✏️ Edit (draft + published dono) */}
                    <div className="mt-auto pt-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        disabled={updatingPdf}
                        onClick={() => {
                          trackClick("comic_details_edit_page_click", {
                            comic_id: comic._id,
                            page_number: page.pageNumber,
                            comic_status: comic.comicStatus || "",
                          });
                          setEditingPage({
                            page: page.pageNumber,
                            imageUrl: page.imageUrl,
                            panels: page.panels || [],
                          });
                        }}
                      >
                        <i className="bi bi-pencil-square me-1"></i>
                        Edit page
                      </Button>
                    </div>
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

          {canEditPages && (
            <Button variant="outline-danger" onClick={handleDownloadPdf} disabled={downloadingPdf}>
              {downloadingPdf ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Preparing PDF...
                </>
              ) : (
                <>
                  <i className="bi bi-download me-1"></i>
                  Download PDF
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ✏️ Single page edit modal */}
      <EditComicPageModal
        show={!!editingPage}
        onHide={() => setEditingPage(null)}
        comicId={comic._id}
        page={editingPage}
        onRegenerated={handlePageRegenerated}
      />
    </div>
  );
};

export default MyComicDetails;