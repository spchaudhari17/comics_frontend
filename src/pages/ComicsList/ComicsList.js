import React, { useEffect, useState } from "react";
import API from "../../API";

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
        <div className="container my-4">
            <h2 className="mb-4 text-center fw-bold">📚 Comics Library</h2>

            {loading ? (
                <p className="text-center">Loading comics...</p>
            ) : comics.length === 0 ? (
                <p className="text-center">No comics available.</p>
            ) : (
                <div className="row g-4">
                    {comics.map((comic) => (
                        <div key={comic._id} className="col-md-4 col-sm-6">
                            <div className="card h-100 shadow-sm">
                                <img
                                    src={comic.thumbnail || "https://via.placeholder.com/300x200?text=No+Image"}
                                    alt={comic.title}
                                    className="card-img-top"
                                    style={{ height: "200px", objectFit: "cover" }}
                                />
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{comic.title}</h5>
                                    <p className="card-text mb-1">
                                        <strong>Subject:</strong> {comic.subject || "N/A"}
                                    </p>
                                    <p className="card-text mb-1">
                                        <strong>Grade:</strong> {comic.grade || "N/A"}
                                    </p>
                                    <p className="card-text mb-2">
                                        <strong>Country:</strong> {comic.country || "N/A"}
                                    </p>

                                    <div className="mt-auto">
                                        {comic.hasFAQ && (
                                            <button
                                                className="badge bg-info text-dark me-2 border-0"
                                                onClick={() => {
                                                    setCurrentComic(comic);
                                                    fetchFAQs(comic._id);
                                                }}
                                            >
                                                FAQ
                                            </button>
                                        )}
                                        {comic.hasDidYouKnow && (
                                            <button
                                                className="badge bg-success border-0"
                                                onClick={() => {
                                                    setCurrentComic(comic);
                                                    fetchFacts(comic._id);
                                                }}
                                            >
                                                Did You Know
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
                <button
                    className="btn btn-outline-primary"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                >
                    ◀ Prev
                </button>
                <span>
                    Page {page} of {totalPages}
                </span>
                <button
                    className="btn btn-outline-primary"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Next ▶
                </button>
            </div>

            {/* FAQ Modal */}
            {showFaqModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content bg-light shadow-lg rounded-4">
                            <div className="modal-header bg-info bg-opacity-25">
                                <h5 className="modal-title">❓ FAQs - {currentComic?.title}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowFaqModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
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
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DidYouKnow Modal */}
            {showFactModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content bg-light shadow-lg rounded-4">
                            <div className="modal-header bg-success bg-opacity-25">
                                <h5 className="modal-title">💡 Did You Know? - {currentComic?.title}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowFactModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
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
                            </div>
                        </div>
                    </div>
                </div>
            )}



        </div>
    );
};

export default ComicsList;
