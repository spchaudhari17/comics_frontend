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
                    {data?.quiz?.map((q, i) => (
                        <div key={i} className="mb-3">
                            <strong>{q.question}</strong>
                        </div>
                    ))}
                </div>
            )}

            {/* 🔥 HARDCORE */}
            {activeTab === "hard" && (
                <div className="mt-4 text-danger">
                    Hardcore Quiz Coming Soon 🚀
                </div>
            )}

        </div>
    );
};

export default ComicReader;