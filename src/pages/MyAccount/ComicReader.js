import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../../API";
import { Loader } from "../../lib/loader";
import { Button, Nav } from "react-bootstrap";
import { trackClick, useScrollDepth } from "../../utility/analytics";

const ComicReader = () => {
    const { comicId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [activeTab, setActiveTab] = useState("reader");
    const [pdfAction, setPdfAction] = useState(null); // "download" | "open" | null

    const fetchComic = async () => {
        try {
            setLoading(true);

            const res = await API.get(`/user/comic-reader/${comicId}`);
            setData(res.data.data);

        } catch (err) {
            alert(err.response?.data?.message || "Error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComic();
    }, [comicId]);

    // ⬅️ Back: app ke andar se aaye ho to pichhle page pe,
    // link seedha khola ho (history nahi) to bundle page pe, warna home
    const handleBack = () => {
        trackClick("comic_reader_back_click", { comic_id: comicId });

        if (location.key !== "default") {
            navigate(-1);
        } else {
            navigate(location.state?.from || "/");
        }
    };

    // Windows/Mac file names me ye characters allowed nahi
    const pdfFileName = `${(data?.comic?.title || "comic").replace(/[\\/:*?"<>|]/g, "").trim() || "comic"}.pdf`;

    // Backend se poori PDF (comic + FAQ + facts + quiz + hardcore quiz)
    // NOTE: comic.pdfUrl jaan-boojh ke use NAHI kar rahe, wo purani PDF hai
    // jisme sirf comic pages hain
    const fetchPdfBlobUrl = async () => {
        const res = await API.get(`/user/comic-pdf/${comicId}`, {
            responseType: "blob",
        });
        return URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    };

    // responseType blob hai, isliye error message bhi blob me aata hai
    const getPdfErrorMessage = async (err, fallback) => {
        try {
            const text = await err.response?.data?.text();
            return JSON.parse(text).message || fallback;
        } catch {
            return fallback;
        }
    };

    // 📥 Seedha download (file name ke saath)
    const handleDownloadPdf = async () => {
        trackClick("comic_reader_pdf_download_click", { comic_id: comicId });

        try {
            setPdfAction("download");
            const url = await fetchPdfBlobUrl();

            const link = document.createElement("a");
            link.href = url;
            link.download = pdfFileName;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) {
            alert(await getPdfErrorMessage(err, "Failed to download PDF"));
        } finally {
            setPdfAction(null);
        }
    };

    // 📄 Naye tab me kholo (dekhne ke liye)
    const handleOpenPdf = async () => {
        trackClick("comic_reader_pdf_click", { comic_id: comicId });

        // Tab abhi (click ke time) khol lo, warna API call ke baad
        // browser ise popup samajh ke block kar deta hai
        const pdfTab = window.open("", "_blank");
        if (pdfTab) {
            pdfTab.document.title = "Preparing PDF...";
            pdfTab.document.body.innerHTML =
                '<p style="font-family:sans-serif;padding:24px">Preparing PDF...</p>';
        }

        try {
            setPdfAction("open");
            const url = await fetchPdfBlobUrl();

            if (pdfTab) {
                pdfTab.location.href = url;
            } else {
                // Popup block ho gaya to isi tab me khol do
                window.location.href = url;
            }

            // Tab ko PDF load karne ka time do, phir memory free karo
            setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
        } catch (err) {
            pdfTab?.close();
            alert(await getPdfErrorMessage(err, "Failed to open PDF"));
        } finally {
            setPdfAction(null);
        }
    };

    // GA: reader tab buttons (reader / faq / facts / quiz / hardcore)
    const handleTabSelect = (tab) => {
        trackClick("comic_reader_tab_click", { tab_name: tab === "hard" ? "hardcore" : tab, comic_id: comicId });
        setActiveTab(tab);
    };

    // GA: scroll depth per reader tab (quiz screen etc.)
    useScrollDepth(`comic_reader_${activeTab === "hard" ? "hardcore" : activeTab}`, {
        enabled: !loading,
        resetKey: `${comicId}_${activeTab}`,
        params: { comic_id: comicId },
    });

    if (loading) return <Loader />;

    return (
        <div className="container py-4">

            {/* ⬅️ Back Button */}
            <div className="mb-3">
                <Button
                    variant="outline-secondary"
                    onClick={handleBack}
                    className="d-flex align-items-center gap-2"
                >
                    <i className="bi bi-arrow-left"></i>
                    Back
                </Button>
            </div>

            <h4 className="fw-bold mb-3">{data?.comic?.title}</h4>

            {/* 🔥 Tabs */}
            <Nav variant="tabs" activeKey={activeTab} onSelect={handleTabSelect}>
                <Nav.Item><Nav.Link eventKey="reader">📖 Reader</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="faq">❓ FAQ</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="facts">💡 Facts</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="quiz">🧠 Quiz</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="hard">🔥 Hardcore</Nav.Link></Nav.Item>
            </Nav>

            {/* 📖 READER */}
            {activeTab === "reader" && (
                <div className="text-center mt-4">

                    <img
                        src={data?.pages?.[currentPage]?.imageUrl}
                        className="img-fluid rounded shadow"
                        style={{ maxHeight: "80vh" }}
                    />

                    {/* Captions */}
                    <div className="mt-4">

                        <h6 className="fw-bold text-start">
                            Page Captions
                        </h6>

                        {data?.pages?.[currentPage]?.panels?.map((panel, index) => (
                            <div
                                key={index}
                                className="alert alert-light border text-start"
                            >
                                <strong>Panel {index + 1}:</strong>{" "}
                                {panel.caption}
                            </div>
                        ))}

                    </div>

                    <div className="d-flex justify-content-center gap-3 mt-3">
                        <Button disabled={currentPage === 0}
                            onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>

                        <span>Page {currentPage + 1} / {data?.pages?.length}</span>

                        <Button disabled={currentPage === data?.pages?.length - 1}
                            onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
                    </div>
                </div>
            )}

            {/* ❓ FAQ */}
            {activeTab === "faq" && (
                <ul className="mt-4">
                    {data?.faqs?.map((f, i) => (
                        <li key={i}>
                            <strong>Q:</strong> {f.question} <br />
                            <strong>A:</strong> {f.answer}
                        </li>
                    ))}
                </ul>
            )}

            {/* 💡 FACTS */}
            {activeTab === "facts" && (
                <ul className="mt-4">
                    {data?.facts?.map((f, i) => (
                        <li key={i}>👉 {f.fact}</li>
                    ))}
                </ul>
            )}

            {/* 🧠 QUIZ */}
            {activeTab === "quiz" && (
                <div className="mt-4">

                    {data?.quiz?.[0]?.questions?.map((question, index) => (
                        <div
                            key={question._id}
                            className="card mb-3 shadow-sm"
                        >
                            <div className="card-body">

                                <h6 className="fw-bold mb-3">
                                    Q{index + 1}. {question.question}
                                </h6>

                                {question.options?.map((option, optIndex) => (
                                    <div
                                        key={optIndex}
                                        className={`border rounded p-2 mb-2 
                                            }`}
                                    >
                                        {option}
                                    </div>
                                ))}

                                <div className="alert alert-success mt-3">
                                    <strong>Correct Answer:</strong> {question.correctAnswer}
                                </div>

                                {question.explanation && (
                                    <div className="alert alert-info">
                                        <strong>Explanation:</strong> {question.explanation}
                                    </div>
                                )}

                                <div className="mb-3">
                                    <span
                                        className={`badge ${question.difficulty === "easy"
                                            ? "bg-success"
                                            : question.difficulty === "medium"
                                                ? "bg-warning text-dark"
                                                : question.difficulty === "hard"
                                                    ? "bg-danger"
                                                    : "bg-dark"
                                            }`}
                                    >
                                        {question.difficulty?.toUpperCase()}
                                    </span>
                                </div>

                            </div>

                        </div>
                    ))}

                </div>
            )}

            {/* 🔥 HARDCORE */}
            {activeTab === "hard" && (
                <div className="mt-4">

                    {data?.hardcoreQuiz?.[0]?.questions?.map((question, index) => (
                        <div
                            key={question._id}
                            className="card mb-3 border-danger shadow-sm"
                        >
                            <div className="card-body">

                                <div className="d-flex justify-content-between align-items-center mb-3">

                                    <h6 className="fw-bold mb-0 text-danger">
                                        Q{index + 1}. {question.question}
                                    </h6>

                                    <span
                                        className={`badge ${question.difficulty === "easy"
                                            ? "bg-success"
                                            : question.difficulty === "medium"
                                                ? "bg-warning text-dark"
                                                : question.difficulty === "hard"
                                                    ? "bg-danger"
                                                    : "bg-dark"
                                            }`}
                                    >
                                        {question.difficulty?.toUpperCase()}
                                    </span>

                                </div>

                                {question.options?.map((option, optIndex) => (
                                    <div
                                        key={optIndex}
                                        className={`border rounded p-2 mb-2 ${option === question.correctAnswer
                                            ? "border-success bg-success-subtle"
                                            : ""
                                            }`}
                                    >
                                        {String.fromCharCode(65 + optIndex)}. {option}
                                    </div>
                                ))}

                                {question.hint && (
                                    <div className="alert alert-warning mt-3">
                                        <strong>💡 Hint:</strong> {question.hint}
                                    </div>
                                )}

                                <div className="alert alert-success">
                                    <strong>✅ Correct Answer:</strong>{" "}
                                    {question.correctAnswer}
                                </div>

                                {question.explanation && (
                                    <div className="alert alert-info">
                                        <strong>📖 Explanation:</strong>{" "}
                                        {question.explanation}
                                    </div>
                                )}

                            </div>
                        </div>
                    ))}

                </div>
            )}

            {/* 📄 PDF: Download + Open */}
            {data?.pages?.length > 0 && (
                <div className="border-top mt-4 pt-4 text-center">
                    <div className="d-flex justify-content-center flex-wrap gap-2">
                        <Button
                            variant="danger"
                            onClick={handleDownloadPdf}
                            disabled={!!pdfAction}
                            className="px-4"
                        >
                            {pdfAction === "download" ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Preparing PDF...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-download me-2"></i>
                                    Download PDF
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline-danger"
                            onClick={handleOpenPdf}
                            disabled={!!pdfAction}
                            className="px-4"
                        >
                            {pdfAction === "open" ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Opening...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-file-earmark-pdf me-2"></i>
                                    Open PDF
                                </>
                            )}
                        </Button>
                    </div>
                    <div className="text-muted small mt-2">
                        Includes the comic pages, FAQs, Did You Know facts, Quiz and Hardcore Quiz with answer keys.
                    </div>
                </div>
            )}

        </div>
    );
};

export default ComicReader;