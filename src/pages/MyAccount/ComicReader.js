import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../API";
import { Loader } from "../../lib/loader";
import { Button, Nav } from "react-bootstrap";

const ComicReader = () => {
    const { comicId } = useParams();

    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [activeTab, setActiveTab] = useState("reader");

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

    if (loading) return <Loader />;

    return (
        <div className="container py-4">

            <h4 className="fw-bold mb-3">{data?.comic?.title}</h4>

            {/* 🔥 Tabs */}
            <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
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

        </div>
    );
};

export default ComicReader;