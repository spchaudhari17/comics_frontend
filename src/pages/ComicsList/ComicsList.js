import React, { useEffect, useState } from "react";
import API from "../../API";
import { Button, Modal } from "react-bootstrap";

const ComicsList = () => {
    const [comics, setComics] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    // modal states
    const [showFaqModal, setShowFaqModal] = useState(false);
    const [showFactModal, setShowFactModal] = useState(false);
    const [currentComic, setCurrentComic] = useState(null);

    // store data
    const [faqs, setFaqs] = useState([]);
    const [facts, setFacts] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const fetchComics = async (pageNum = 1) => {
        try {
            setLoading(true);
            const res = await API.get(`/user/comics?page=${pageNum}&limit=12`);
            setComics(res.data.comics || []);
            setPage(res.data.page);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error("Error fetching comics:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFAQs = async (comicId) => {
        try {
            setLoadingDetails(true);
            const res = await API.get(`/user/comic-faqs/${comicId}`);
            setFaqs(res.data.faqs || []);
            setShowFaqModal(true);
        } catch (err) {
            console.error("Error fetching FAQs:", err);
        } finally {
            setLoadingDetails(false);
        }
    };

    const fetchFacts = async (comicId) => {
        try {
            setLoadingDetails(true);
            const res = await API.get(`/user/comic-didyouknow/${comicId}`);
            setFacts(res.data.didYouKnow || []);
            setShowFactModal(true);
        } catch (err) {
            console.error("Error fetching facts:", err);
        } finally {
            setLoadingDetails(false);
        }
    };

    useEffect(() => {
        fetchComics(page);
    }, [page]);

    return (
        <div className="comoic-library-page pb-5">
            {/* Breadcrumb Banner Section */}
            <section className="breadcrumb-banner-section py-5">
                <div className="container-xl position-relative z-1">
                    <div className="page-header text-white text-uppercase text-center">
                        <div className="section-heading text-white mb-2">📚 Comics Library</div>
                        <ul className="list-unstyled d-flex justify-content-center gap-2 mb-0">
                            <li className="text-white">Home</li>
                            <li><span>/</span></li>
                            <li className="text-warning">Comics Library</li>
                        </ul>
                    </div>
                </div>
            </section>

            <div className="container-xl mt-5">
                {loading ? (
                    <p className="text-center">Loading comics...</p>
                ) : comics.length === 0 ? (
                    <p className="text-center">No comics available.</p>
                ) : (
                    <div className="row gy-5">
                        {comics.map((comic) => (
                            <div key={comic._id} className="col-lg-4 col-md-6">
                                <div className="bg-white h-100 border border-primary rounded-4 shadow-sm overflow-hidden">
                                    <img
                                        src={comic.thumbnail || "https://via.placeholder.com/300x200?text=No+Image"}
                                        alt={comic.title}
                                        className="card-img-top"
                                        style={{ height: "200px", objectFit: "cover" }}
                                    />
                                    <div className="card-body d-flex flex-column p-3">
                                        <div className="comic-title fs-16 fw-bold text-theme4 text-capitalize mb-2">{comic.title}</div>
                                        <div className="info mb-1">
                                            <span className="fw-semibold text-primary">Subject:</span> {comic.subject || "N/A"}
                                        </div>
                                        <div className="info mb-1">
                                            <span className="fw-semibold text-warning">Grade:</span> {comic.grade || "N/A"}
                                        </div>
                                        <div className="info mb-3">
                                            <span className="fw-semibold text-theme3">Country:</span> {comic.country || "N/A"}
                                        </div>

                                        <div className="d-flex flex-wrap gap-2">
                                            {comic.hasFAQ && (
                                                <Button variant="info" size="sm" className="fw-medium rounded-pill px-3"
                                                    onClick={() => {
                                                        setCurrentComic(comic);
                                                        fetchFAQs(comic._id);
                                                    }}
                                                >
                                                    FAQ
                                                </Button>
                                            )}
                                            {comic.hasDidYouKnow && (
                                                <Button variant="success" size="sm" className="fw-medium rounded-pill px-3"
                                                    onClick={() => {
                                                        setCurrentComic(comic);
                                                        fetchFacts(comic._id);
                                                    }}
                                                >
                                                    Did You Know
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <div className="d-flex justify-content-center align-items-center mt-5 gap-3">
                    <Button variant="outline-primary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} >◀ Prev</Button>
                    <span>Page {page} of {totalPages}</span>
                    <Button variant="outline-primary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next ▶</Button>
                </div>

                {/* FAQ Modal */}
                <Modal show={showFaqModal} size="lg" onHide={() => setShowFaqModal(false)} centered>
                    <Modal.Header className="bg-primary fs-16 fw-semibold text-white btn-close-white" closeButton>❓ FAQs - {currentComic?.title}</Modal.Header>
                    <Modal.Body>
                        {loadingDetails ? (
                            <p>Loading FAQs...</p>
                        ) : faqs.length > 0 ? (
                            <ul className="list-unstyled">
                                {faqs.map((f, i) => (
                                    <li key={i} className="mb-3">
                                        <strong>Q:</strong> {f.question} <br />
                                        <strong>A:</strong> {f.answer}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No FAQs available.</p>
                        )}
                    </Modal.Body>
                </Modal>

                {/* DidYouKnow Modal */}
                <Modal show={showFactModal} size="lg" onHide={() => setShowFactModal(false)} centered>
                    <Modal.Header className="bg-primary fs-16 fw-semibold text-white btn-close-white" closeButton>💡 Did You Know? - {currentComic?.title}</Modal.Header>
                    <Modal.Body>
                        {loadingDetails ? (
                            <p>Loading facts...</p>
                        ) : facts.length > 0 ? (
                            <ul className="list-unstyled">
                                {facts.map((fact, i) => (
                                    <li key={i} className="mb-2">👉 {fact.fact}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No facts available.</p>
                        )}
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    );
};

export default ComicsList;
