import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../API";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";

const MarketPlaceDetails = () => {
    const { id } = useParams();

    const user = JSON.parse(localStorage.getItem("user"));

    const [bundle, setBundle] = useState(null);
    const [loading, setLoading] = useState(false);

    const [hoverRating, setHoverRating] = useState(0);
    const [selectedRating, setSelectedRating] = useState(0);

    const [marketplaceStatus, setMarketplaceStatus] = useState({
        purchasedBundleIds: [],
        ownBundleIds: []
    });

    const fetchBundle = async () => {
        try {
            setLoading(true);
            const res = await API.get(`/user/bundleDetails/${id}`);
            setBundle(res.data.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMarketplaceStatus = async () => {
        if (!user?._id) return;

        try {
            const res = await API.post("/user/marketplace-status", {
                userId: user._id
            });

            if (!res.data.error) {
                setMarketplaceStatus(res.data);
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchBundle();
        fetchMarketplaceStatus();
    }, [id]);

    const submitRating = async (rating) => {
        try {
            setSelectedRating(rating);

            const res = await API.post("/user/bundle/rate", {
                bundleId: bundle._id,
                rating
            });

            if (res.data.success) {
                toast.success(`Thanks for your ${rating}-star rating! 🎉`);
                fetchBundle();
            }
        } catch (err) {
            toast.error("Failed to submit rating");
        }
    };

    const renderStars = (rating = 0) => {
        return [...Array(5)].map((_, index) => (
            <span
                key={index}
                style={{
                    color: index < Math.round(rating) ? "#ffc107" : "#d6d6d6",
                    fontSize: "24px",
                    marginRight: "2px"
                }}
            >
                ★
            </span>
        ));
    };

    const handleAddToCart = async () => {
        try {
            const res = await API.post("/user/addToCart", { bundleId: id });

            if (!res.data.error) {
                toast.success("Added to cart 🛒");
            } else {
                toast.warning(res.data.message);
            }
        } catch (err) {
            toast.error("Error adding to cart");
        }
    };

    if (loading) return <p className="text-center mt-5">Loading...</p>;
    if (!bundle) return <p className="text-center mt-5">No Data Found</p>;

    const isPurchased = marketplaceStatus.purchasedBundleIds.includes(bundle._id);
    const isOwnBundle = marketplaceStatus.ownBundleIds.includes(bundle._id);

    // Get common info from first comic
    const firstComic = bundle.comics?.[0];
    const commonInfo = {
        seriesTitle: firstComic?.series?.title || bundle.title,
        subject: firstComic?.series?.subjectName || firstComic?.subjectName || "N/A",
        concept: firstComic?.series?.conceptName || firstComic?.conceptName || "N/A",
        grade: firstComic?.series?.grade || firstComic?.grade || "N/A",
        country: firstComic?.series?.country || firstComic?.country || "N/A",
        theme: firstComic?.themeId?.name || firstComic?.theme || "N/A",
        style: firstComic?.styleId?.name || firstComic?.style || "N/A",
        partNumber: firstComic?.series?.partNumber || null,
        hasQuiz: firstComic?.hasQuiz || false,
        createdAt: firstComic?.createdAt || bundle.createdAt
    };

    return (
        <div className="container-xl py-5">

            <div className="row g-4">

                {/* LEFT SIDE - IMAGES */}
                <div className="col-lg-6">

                    {/* Main Image */}
                    <div className="border rounded-4 overflow-hidden mb-3">
                        <img
                            src={
                                bundle.comics?.[0]?.thumbnail ||
                                "https://via.placeholder.com/600x400"
                            }
                            alt="preview"
                            style={{ width: "100%", height: "400px", objectFit: "cover" }}
                        />
                    </div>

                    {/* Thumbnail List */}
                    <div className="d-flex gap-2 flex-wrap">
                        {bundle.comics?.slice(0, 5).map((comic) => (
                            <img
                                key={comic._id}
                                src={comic.thumbnail || "https://via.placeholder.com/100"}
                                alt="thumb"
                                style={{
                                    width: "80px",
                                    height: "80px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    border: "1px solid #ddd"
                                }}
                            />
                        ))}
                    </div>

                </div>

                {/* RIGHT SIDE - DETAILS */}
                <div className="col-lg-6">

                    {/* Title */}
                    <h3 className="fw-bold mb-1 text-capitalize">
                        {commonInfo.seriesTitle}
                        {commonInfo.partNumber && (
                            <span className="text-muted fs-5 ms-2">
                                {bundle.title}
                            </span>
                        )}
                    </h3>

                    {/* Created Date */}
                    {commonInfo.createdAt && (
                        <div className="text-muted small mb-2">
                            <i className="bi bi-calendar3 me-1"></i>
                            Created on {new Date(commonInfo.createdAt).toLocaleString()}
                        </div>
                    )}

                    {/* Status Badges */}
                    <div className="mb-3">
                        <span className="badge bg-success me-2 px-3 py-2">
                            ✅ Approved
                        </span>
                        <span className="badge bg-primary px-3 py-2">
                            📢 Published
                        </span>
                    </div>

                    <hr />

                    {/* Details Grid - 2 Columns */}
                    <div className="row g-2 mb-3">
                        {/* Left Column */}
                        <div className="col-md-6">
                            <div className="d-flex py-1">
                                <span className="fw-semibold text-muted" style={{ minWidth: "100px" }}>
                                    Creator:
                                </span>
                                <span>{bundle.teacherId?.firstname} {bundle.teacherId?.lastname}</span>
                            </div>
                            <div className="d-flex py-1">
                                <span className="fw-semibold text-muted" style={{ minWidth: "100px" }}>
                                    Email:
                                </span>
                                <span>{bundle.teacherId?.email || "N/A"}</span>
                            </div>
                            <div className="d-flex py-1">
                                <span className="fw-semibold text-muted" style={{ minWidth: "100px" }}>
                                    Country:
                                </span>
                                <span>{commonInfo.country}</span>
                            </div>
                            <div className="d-flex py-1">
                                <span className="fw-semibold text-muted" style={{ minWidth: "100px" }}>
                                    Grade:
                                </span>
                                <span>{commonInfo.grade}</span>
                            </div>
                            <div className="d-flex py-1">
                                <span className="fw-semibold text-muted" style={{ minWidth: "100px" }}>
                                    Has Quiz:
                                </span>
                                <span className={commonInfo.hasQuiz ? "text-success" : "text-danger"}>
                                    {commonInfo.hasQuiz ? "✅ Yes" : "❌ No"}
                                </span>
                            </div>
                            <div className="d-flex py-1">
                                <span className="fw-semibold text-muted" style={{ minWidth: "100px" }}>
                                    Has Did You Know:
                                </span>
                                <span className="text-success">✅ Yes</span>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="col-md-6">
                            <div className="d-flex py-1">
                                <span className="fw-semibold text-muted" style={{ minWidth: "100px" }}>
                                    Subject:
                                </span>
                                <span>{commonInfo.subject}</span>
                            </div>
                            <div className="d-flex py-1">
                                <span className="fw-semibold text-muted" style={{ minWidth: "100px" }}>
                                    Theme:
                                </span>
                                <span>{commonInfo.theme}</span>
                            </div>
                            <div className="d-flex py-1">
                                <span className="fw-semibold text-muted" style={{ minWidth: "100px" }}>
                                    Style:
                                </span>
                                <span>{commonInfo.style}</span>
                            </div>
                            <div className="d-flex py-1">
                                <span className="fw-semibold text-muted" style={{ minWidth: "100px" }}>
                                    Concept:
                                </span>
                                <span>{commonInfo.concept}</span>
                            </div>
                            <div className="d-flex py-1">
                                <span className="fw-semibold text-muted" style={{ minWidth: "100px" }}>
                                    Has FAQ:
                                </span>
                                <span className="text-success">✅ Yes</span>
                            </div>
                            <div className="d-flex py-1">
                                <span className="fw-semibold text-muted" style={{ minWidth: "100px" }}>
                                    Has Hardcore Quiz:
                                </span>
                                <span className="text-success">✅ Yes</span>
                            </div>
                        </div>
                    </div>

                    <hr />

                    {/* Price & Actions */}
                    <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                        <span className="fs-3 fw-bold text-success">
                            ${bundle.price}
                        </span>
                        <span className="text-muted">
                            <i className="bi bi-journal me-1"></i>
                            {bundle.comics?.length} Comics Included
                        </span>
                    </div>

                    {/* Buttons */}
                    <div className="d-flex gap-3 mb-4">
                        {isOwnBundle ? (
                            <Button variant="secondary" disabled>
                                Your Bundle
                            </Button>
                        ) : isPurchased ? (
                            <Button variant="success" disabled>
                                ✅ Purchased
                            </Button>
                        ) : (
                            <>
                                <Button variant="success" onClick={handleAddToCart}>
                                    <i className="bi bi-cart-plus me-1"></i>
                                    Add To Cart
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Messages */}
                    {isOwnBundle && (
                        <div className="alert alert-info py-2">
                            📚 This is your bundle. You can view it anytime.
                        </div>
                    )}

                    {isPurchased && (
                        <div className="alert alert-success py-2">
                            ✅ You have already purchased this bundle.
                        </div>
                    )}

                    {/* Description */}
                    <div className="mb-4">
                        <h5>About this bundle</h5>
                        <p className="text-muted">
                            {bundle.description || "No description available."}
                        </p>
                    </div>

                    {/* Highlights & Rating - LEFT | RIGHT */}
                    <div className="row g-4 mb-4">
                        {/* LEFT: Highlights */}
                        <div className="col-md-6">
                            <h5>Highlights</h5>
                            <ul className="text-muted ps-3">
                                <li>{bundle.comics?.length} Comics included</li>
                                <li>Instant access after purchase</li>
                                <li>Downloadable content</li>
                            </ul>
                        </div>

                        {/* RIGHT: Rating */}
                        <div className="col-md-6">
                            <div
                                className="p-3 rounded-3 h-100"
                                style={{
                                    background: "#FFF8E1",
                                    border: "1px solid #FFE082"
                                }}
                            >
                                <div className="d-flex align-items-center mb-2">
                                    {renderStars(bundle.averageRating)}

                                    <span className="ms-2 fw-bold">
                                        {bundle.averageRating?.toFixed(1) || "0.0"}
                                    </span>

                                    <span className="ms-2 text-muted">
                                        ({bundle.totalRatings || 0} ratings)
                                    </span>
                                </div>

                                {!isOwnBundle && (
                                    <>
                                        <small className="text-muted d-block mb-2">
                                            Rate this bundle
                                        </small>

                                        <div>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span
                                                    key={star}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => {
                                                        setSelectedRating(star);
                                                        submitRating(star);
                                                    }}
                                                    style={{
                                                        cursor: "pointer",
                                                        fontSize: "32px",
                                                        transition: "transform 0.2s"
                                                    }}
                                                >
                                                    {star <= (hoverRating || selectedRating) ? "★" : "☆"}
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {isOwnBundle && (
                                    <small className="text-muted">
                                        ⚡ You cannot rate your own bundle.
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Comics List */}
            <div className="mt-5">
                <h4 className="mb-3">📖 Included Comics</h4>

                <div className="row g-3">
                    {bundle.comics?.map((comic, index) => (
                        <div key={comic._id} className="col-md-4">
                            <div className="border rounded-3 p-2 h-100">

                                <img
                                    src={comic.thumbnail || "https://via.placeholder.com/200"}
                                    alt={comic.title}
                                    style={{ width: "100%", height: "150px", objectFit: "cover" }}
                                />

                                <div className="mt-2 fw-semibold">
                                    Part {index + 1}: {comic.title}
                                </div>
                                <div className="text-muted small">{commonInfo.subject}</div>

                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default MarketPlaceDetails;