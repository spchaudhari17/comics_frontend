import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../API";
import { Loader } from "../../lib/loader";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { trackClick } from "../../utility/analytics";

// Windows/Mac file names me ye characters allowed nahi
const toFileName = (name) =>
    (name || "comic").replace(/[\\/:*?"<>|]/g, "").trim() || "comic";

const PurchasedBundleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [bundle, setBundle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    const fetchBundleDetails = async () => {
        try {
            setLoading(true);

            const res = await API.get(`/user/purchasedBundleDetails/${id}`);

            if (!res.data.error) {
                setBundle(res.data.data);
            } else {
                toast.error(res.data.message);
            }

        } catch (err) {
            console.error(err);

            if (err.response?.status === 403) {
                toast.error("You have not purchased this bundle");
                navigate("/marketplace");
            } else {
                toast.error(err.response?.data?.message || "Error fetching bundle");
            }

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchBundleDetails();
    }, [id]);

    // 📥 PDF download
    // Agar comic pe pdfUrl saved hai to wahi kholo, warna backend se PDF generate karwao
    const handleDownloadPdf = async (comic, index) => {
        trackClick("purchased_comic_pdf_click", { comic_id: comic._id });

        if (comic.pdfUrl) {
            window.open(comic.pdfUrl, "_blank");
            return;
        }

        try {
            setDownloadingId(comic._id);

            const res = await API.get(`/user/comic-pdf/${comic._id}`, {
                responseType: "blob",
            });

            const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.download = `${toFileName(comic.title || `Part ${index + 1}`)}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);

        } catch (err) {
            // responseType blob hai, isliye error message bhi blob me aata hai
            let message = "Failed to download PDF";
            try {
                const text = await err.response?.data?.text();
                message = JSON.parse(text).message || message;
            } catch { /* ignore */ }
            toast.error(message);
        } finally {
            setDownloadingId(null);
        }
    };

    if (loading) return <Loader />;

    if (!bundle) {
        return (
            <div className="text-center py-5">
                <h5>No Data Found</h5>
            </div>
        );
    }

    // 🔥 Get common info from first comic
    const firstComic = bundle.comics?.[0];
    const commonInfo = {
        seriesTitle: firstComic?.series?.title || bundle.title,
        subject: firstComic?.series?.subjectName || firstComic?.subjectName || "N/A",
        concept: firstComic?.series?.conceptName || firstComic?.concept || "N/A",
        grade: firstComic?.series?.grade || "N/A",
        country: (() => {
            const list = firstComic?.series?.countries?.length
                ? firstComic.series.countries
                : firstComic?.countries?.length
                    ? firstComic.countries
                    : [firstComic?.series?.country || firstComic?.country].filter(Boolean);
            if (list.length === 0) return "N/A";
            return list.includes("ALL") ? "🌍 All Countries" : list.join(", ");
        })(),
        partNumber: firstComic?.series?.partNumber || null,
        theme: firstComic?.themeId?.name || "N/A",
        style: firstComic?.styleId?.name || "N/A",
        hasQuiz: firstComic?.hasQuiz || false,
        createdAt: firstComic?.createdAt || bundle.createdAt
    };

    return (
        <div className="container py-4">

            {/* 🔥 Back Button */}
            <div className="mb-4">
                <Button
                    variant="outline-secondary"
                    onClick={() => navigate(-1)}
                    className="d-flex align-items-center gap-2"
                >
                    <i className="bi bi-arrow-left"></i>
                    Back
                </Button>
            </div>

            {/* 🔥 Bundle Header - Label: Value Layout */}
            <div className="mb-4 p-4 bg-white rounded-4 border shadow-sm">

                {/* Title */}
                <div className="row mb-3">
                    <div className="col-12">
                        <h3 className="fw-bold text-capitalize mb-1">
                            {commonInfo.seriesTitle}
                            {commonInfo.partNumber && (
                                <span className="text-muted fs-5 ms-2">
                                    {bundle.title}
                                </span>
                            )}
                        </h3>
                        {commonInfo.createdAt && (
                            <div className="text-muted small">
                                Created on {new Date(commonInfo.createdAt).toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Badges */}
                <div className="row mb-3">
                    <div className="col-12">
                        <span className="badge bg-success me-2 px-3 py-2">
                            ✅ Approved
                        </span>
                        <span className="badge bg-primary px-3 py-2">
                            📢 Published
                        </span>
                    </div>
                </div>

                <hr />

                {/* Details Grid - 2 Columns */}
                <div className="row g-3">
                    {/* Left Column */}
                    <div className="col-md-6">
                        <div className="d-flex py-1">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>
                                Creator:
                            </span>
                            <span>{bundle.teacherId?.firstname} {bundle.teacherId?.lastname}</span>
                        </div>
                        <div className="d-flex py-1">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>
                                Email:
                            </span>
                            <span>{bundle.teacherId?.email || "N/A"}</span>
                        </div>
                        <div className="d-flex py-1">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>
                                Country:
                            </span>
                            <span>{commonInfo.country}</span>
                        </div>
                        <div className="d-flex py-1">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>
                                Grade:
                            </span>
                            <span>{commonInfo.grade}</span>
                        </div>
                        <div className="d-flex py-1">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>
                                Has Quiz:
                            </span>
                            <span className={commonInfo.hasQuiz ? "text-success" : "text-danger"}>
                                {commonInfo.hasQuiz ? "✅ Yes" : "❌ No"}
                            </span>
                        </div>
                        <div className="d-flex py-1">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>
                                Has Did You Know:
                            </span>
                            <span className="text-success">✅ Yes</span>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-md-6">
                        <div className="d-flex py-1">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>
                                Subject:
                            </span>
                            <span>{commonInfo.subject}</span>
                        </div>
                        <div className="d-flex py-1">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>
                                Theme:
                            </span>
                            <span>{commonInfo.theme}</span>
                        </div>
                        <div className="d-flex py-1">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>
                                Style:
                            </span>
                            <span>{commonInfo.style}</span>
                        </div>
                        <div className="d-flex py-1">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>
                                Concept:
                            </span>
                            <span>{commonInfo.concept}</span>
                        </div>
                        <div className="d-flex py-1">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>
                                Has FAQ:
                            </span>
                            <span className="text-success">✅ Yes</span>
                        </div>
                        <div className="d-flex py-1">
                            <span className="fw-semibold text-muted" style={{ minWidth: "120px" }}>
                                Has Hardcore Quiz:
                            </span>
                            <span className="text-success">✅ Yes</span>
                        </div>
                    </div>
                </div>

                <hr />

                {/* Bottom: Price & Comics */}
                <div className="row mt-2">
                    <div className="col-12">
                        <div className="d-flex flex-wrap gap-4">
                            <div>
                                <span className="fw-semibold text-muted">Price:</span>
                                <span className="text-success fw-bold fs-5 ms-2">${bundle.amountPaid ?? bundle.price}</span>
                            </div>
                            <div>
                                <span className="fw-semibold text-muted">Comics Included:</span>
                                <span className="ms-2">{bundle.comics?.length}</span>
                            </div>
                            <div>
                                <span className="fw-semibold text-muted">Status:</span>
                                <span className="badge bg-success ms-2">Purchased</span>
                            </div>
                            {bundle.purchaseDate && (
                                <div>
                                    <span className="fw-semibold text-muted">Purchased On:</span>
                                    <span className="ms-2">{new Date(bundle.purchaseDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔥 Comics List */}
            <h5 className="mb-3 fw-semibold">📖 Comics in this Bundle</h5>

            <div className="row g-4">
                {bundle.comics?.map((comic, index) => {
                    const isDownloading = downloadingId === comic._id;

                    return (
                        <div key={comic._id} className="col-lg-4 col-md-6">

                            <div className="border rounded-4 shadow-sm overflow-hidden h-100 bg-white">

                                {/* Thumbnail */}
                                <img
                                    src={
                                        comic.thumbnail ||
                                        "https://via.placeholder.com/300x200?text=Comic"
                                    }
                                    alt={comic.title}
                                    className="w-100"
                                    style={{ height: "180px", objectFit: "cover" }}
                                />

                                <div className="p-3 d-flex flex-column">

                                    {/* Comic Title */}
                                    <div className="fw-bold text-capitalize mb-1">
                                        {commonInfo.seriesTitle}
                                        <span className="text-muted fs-6 ms-1">
                                            (Part {index + 1})
                                        </span>
                                    </div>

                                    {/* Subtitle */}
                                    <div className="text-muted small mb-2">
                                        {comic.title || `Part ${index + 1}`}
                                    </div>

                                    {/* Pages & Actions */}
                                    <div className="d-flex align-items-center justify-content-between mt-auto">
                                        <div className="text-muted small">
                                            <i className="bi bi-file-earmark-text me-1"></i>
                                            {comic.pageCount || 0} page{comic.pageCount === 1 ? "" : "s"}
                                        </div>

                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => {
                                                    trackClick("purchased_comic_read_click", { comic_id: comic._id });
                                                    navigate(`/comic-reader/${comic._id}`, {
                                                        state: { from: `/purchasedBundleDetails/${id}` },
                                                    });
                                                }}
                                            >
                                                <i className="bi bi-eye me-1"></i>
                                                Read
                                            </Button>

                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                disabled={isDownloading || !comic.pageCount}
                                                onClick={() => handleDownloadPdf(comic, index)}
                                                title={!comic.pageCount ? "This comic has no pages yet" : "Download as PDF"}
                                            >
                                                {isDownloading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-1"></span>
                                                        Preparing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-file-pdf me-1"></i>
                                                        Download
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default PurchasedBundleDetails;