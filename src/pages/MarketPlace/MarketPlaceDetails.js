import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../API";
import { Alert, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { trackClick } from "../../utility/analytics";
import { useAutoAddToCart, goToLoginThenAddToCart } from "../../hooks/useAutoAddToCart";
import { isUserLoggedIn } from "../../utility/authRedirect";
import { notifyCartUpdated } from "../../utility/cartEvents";
import "./MarketPlaceDetails.scss";

const PLACEHOLDER_IMG = "https://via.placeholder.com/600x450?text=Comic";

const MarketPlaceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const user = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null;

    const [bundle, setBundle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);

    const [hoverRating, setHoverRating] = useState(0);
    const [selectedRating, setSelectedRating] = useState(0);

    // Bada preview: kaunsi image dikh rahi hai (null = bundle cover)
    const [activeImage, setActiveImage] = useState(null);

    const [marketplaceStatus, setMarketplaceStatus] = useState({
        purchasedBundleIds: [],
        ownBundleIds: []
    });

    // 🛒 WordPress / login ke baad (?autoAdd=1) -> apne aap cart me + /cart
    const { autoAdding, autoAddMessage, clearAutoAddMessage } = useAutoAddToCart(id);

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
                setMarketplaceStatus({
                    purchasedBundleIds: (res.data.purchasedBundleIds || []).map(String),
                    ownBundleIds: (res.data.ownBundleIds || []).map(String)
                });
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        setActiveImage(null);
        fetchBundle();
        fetchMarketplaceStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const submitRating = async (rating) => {
        if (!isUserLoggedIn()) {
            toast.info("Please log in to rate this bundle");
            return;
        }

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
            toast.error(err.response?.data?.message || "Failed to submit rating");
        }
    };

    const renderStars = (rating = 0) => {
        return [...Array(5)].map((_, index) => (
            <span key={index} className={index < Math.round(rating) ? "" : "is-empty"}>
                ★
            </span>
        ));
    };

    const handleAddToCart = async () => {
        trackClick("add_to_cart_click", {
            bundle_id: id,
            location: "marketplace_details",
            logged_in: isUserLoggedIn(),
        });

        // 🔐 Logout hai -> login, phir wapas aake apne aap cart me
        if (!isUserLoggedIn()) {
            toast.info("Please log in. We'll add this bundle to your cart right after.");
            goToLoginThenAddToCart(navigate, id);
            return;
        }

        try {
            setAddingToCart(true);
            const res = await API.post("/user/addToCart", { bundleId: id });

            if (!res.data.error) {
                toast.success("Added to cart 🛒");
                notifyCartUpdated();
            } else {
                toast.warning(res.data.message);
            }
        } catch (err) {
            // Token expire ho gaya -> dobara login, phir cart me
            if (err.response?.status === 401) {
                toast.info("Your session expired. Please log in again.");
                goToLoginThenAddToCart(navigate, id);
                return;
            }
            toast.error(err.response?.data?.message || "Error adding to cart");
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading || autoAdding) {
        return (
            <div className="mp-details d-flex flex-column align-items-center justify-content-center gap-3 pt-5">
                <Spinner animation="border" style={{ color: "#B88746" }} />
                <div className="text-muted">
                    {autoAdding ? "Adding to your cart..." : "Loading bundle..."}
                </div>
            </div>
        );
    }
    if (!bundle) {
        return (
            <div className="mp-details text-center pt-5">
                <i className="bi bi-journal-x fs-1 text-muted"></i>
                <p className="mt-2 text-muted">No Data Found</p>
                <Button variant="primary" onClick={() => navigate("/market-place")}>
                    Back to Marketplace
                </Button>
            </div>
        );
    }

    const isPurchased = marketplaceStatus.purchasedBundleIds.includes(String(bundle._id));
    const isOwnBundle = marketplaceStatus.ownBundleIds.includes(String(bundle._id));

    // Get common info from first comic
    const firstComic = bundle.comics?.[0];
    const commonInfo = {
        seriesTitle: firstComic?.series?.title || bundle.title,
        subject: firstComic?.series?.subjectName || firstComic?.subjectName || "N/A",
        concept: firstComic?.series?.conceptName || firstComic?.conceptName || "N/A",
        grade: firstComic?.series?.grade || firstComic?.grade || "N/A",
        country: firstComic?.series?.country || firstComic?.country || "N/A",
        theme: firstComic?.themeId?.name || firstComic?.customTheme || firstComic?.theme || "N/A",
        style: firstComic?.styleId?.name || firstComic?.customStyle || firstComic?.style || "N/A",
        partNumber: firstComic?.series?.partNumber || null,
        hasQuiz: firstComic?.hasQuiz || false,
        createdAt: firstComic?.createdAt || bundle.createdAt
    };

    // getBundleDetails backend `teacher` bhejta hai, purana `teacherId` bhi chal jaye
    const teacher = bundle.teacher || bundle.teacherId;
    const teacherName = [teacher?.firstname, teacher?.lastname].filter(Boolean).join(" ") || "Kridemy Teacher";
    const avatarSrc = teacher?.profile_pic || require("../../assets/images/avatar.png");

    const coverImage = bundle.thumbnail || firstComic?.thumbnail || null;
    const previewImage = activeImage || coverImage || PLACEHOLDER_IMG;

    // Hero background: teacher ki cover photo, warna bundle cover (blur)
    const heroImage = teacher?.background_image || coverImage;
    const heroIsCover = !teacher?.background_image;

    const comicsCount = bundle.comics?.length || 0;
    const countryLabel = commonInfo.country === "ALL" ? "🌍 All Countries" : commonInfo.country;

    const infoTiles = [
        { icon: "bi-book", label: "Subject", value: commonInfo.subject },
        { icon: "bi-lightbulb", label: "Concept", value: commonInfo.concept },
        { icon: "bi-mortarboard", label: "Grade", value: commonInfo.grade },
        { icon: "bi-globe2", label: "Country", value: countryLabel },
        { icon: "bi-palette", label: "Theme", value: commonInfo.theme },
        { icon: "bi-brush", label: "Style", value: commonInfo.style },
        {
            icon: "bi-calendar3",
            label: "Created on",
            value: commonInfo.createdAt ? new Date(commonInfo.createdAt).toLocaleDateString() : "N/A"
        },
        { icon: "bi-journals", label: "Comics", value: `${comicsCount} included` }
    ];

    const includes = [
        `${comicsCount} comic${comicsCount === 1 ? "" : "s"} included`,
        ...(commonInfo.hasQuiz ? ["Quiz"] : []),
        "Did You Know facts",
        "FAQs",
        "Hardcore Quiz",
        "Instant access after purchase",
        "Downloadable PDF"
    ];

    // Price + cart card: mobile pe preview ke niche, desktop pe right side (sticky)
    const renderBuyCard = (className = "") => (
        <div className={`mp-card mp-buy ${className}`}>
            <div className="d-flex align-items-end justify-content-between mb-1">
                <div className="mp-price">${bundle.price}</div>
                <span className="badge rounded-pill text-bg-light border">
                    <i className="bi bi-journals me-1"></i>{comicsCount} {comicsCount === 1 ? "Comic" : "Comics"}
                </span>
            </div>
            <div className="small text-muted mb-3">One-time purchase · Lifetime access</div>
        
            <div className="d-flex gap-2 mb-3">
                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                    <i className="bi bi-patch-check-fill me-1"></i>Approved
                </span>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">
                    <i className="bi bi-megaphone-fill me-1"></i>Published
                </span>
            </div>
        
            {/* Buttons */}
            <div className="d-grid gap-2 mb-3">
                {isOwnBundle ? (
                    <Button variant="secondary" size="lg" disabled>
                        Your Bundle
                    </Button>
                ) : isPurchased ? (
                    <Button variant="success" size="lg" disabled>
                        <i className="bi bi-check2-circle me-1"></i>Purchased
                    </Button>
                ) : (
                    <>
                        <Button variant="primary" size="lg" onClick={handleAddToCart} disabled={addingToCart}>
                            {addingToCart ? (
                                <><Spinner size="sm" className="me-2" />Adding...</>
                            ) : (
                                <><i className="bi bi-cart-plus me-2"></i>Add To Cart</>
                            )}
                        </Button>
                        {isUserLoggedIn() && (
                            <Button variant="outline-primary" onClick={() => navigate("/cart")}>
                                <i className="bi bi-cart3 me-1"></i>
                                View Cart
                            </Button>
                        )}
                    </>
                )}
            </div>
        
            {/* Messages */}
            {isOwnBundle && (
                <div className="alert alert-info py-2 small">
                    📚 This is your bundle. You can view it anytime.
                </div>
            )}
            {isPurchased && (
                <div className="alert alert-success py-2 small">
                    ✅ You have already purchased this bundle.
                </div>
            )}
        
            <hr />
        
            <div className="fw-semibold mb-2">What's included</div>
            <ul className="mp-include-list">
                {includes.map((item) => (
                    <li key={item}><i className="bi bi-check-circle-fill"></i>{item}</li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="mp-details">

            {/* ============ HERO (background image) ============ */}
            <section className="mp-hero">
                {heroImage && (
                    <div
                        className={`mp-hero-bg ${heroIsCover ? "is-blurred" : ""}`}
                        style={{ backgroundImage: `url("${heroImage}")` }}
                    />
                )}
                <div className="mp-hero-overlay" />

                <div className="container-xl mp-hero-content">
                    <button type="button" className="mp-back mb-3" onClick={() => navigate("/market-place")}>
                        <i className="bi bi-arrow-left me-1"></i> Marketplace
                    </button>

                    <h1 className="mp-title text-capitalize mb-2">
                        {commonInfo.seriesTitle}
                    </h1>
                    {commonInfo.partNumber && bundle.title !== commonInfo.seriesTitle && (
                        <div className="fs-5 opacity-75 mb-2">{bundle.title}</div>
                    )}

                    <div className="d-flex flex-wrap gap-2 my-3">
                        <span className="mp-chip"><i className="bi bi-book"></i>{commonInfo.subject}</span>
                        <span className="mp-chip"><i className="bi bi-lightbulb"></i>{commonInfo.concept}</span>
                        <span className="mp-chip"><i className="bi bi-mortarboard"></i>Grade {commonInfo.grade}</span>
                        <span className="mp-chip"><i className="bi bi-journals"></i>{comicsCount} {comicsCount === 1 ? "Comic" : "Comics"}</span>
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-4">
                        <div className="mp-hero-creator d-flex align-items-center gap-2">
                            <img src={avatarSrc} alt={teacherName} className="rounded-circle" />
                            <div>
                                <div className="small opacity-75">Created by</div>
                                <div className="fw-semibold text-capitalize">{teacherName}</div>
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <span className="mp-stars fs-5">{renderStars(bundle.averageRating)}</span>
                            <span className="fw-semibold">{bundle.averageRating?.toFixed(1) || "0.0"}</span>
                            <span className="small opacity-75">({bundle.totalRatings || 0} ratings)</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ MAIN ============ */}
            <div className="container-xl mp-main">

                {/* WordPress se aaye user ka bundle add nahi hua (apna bundle / kharida hua) */}
                {autoAddMessage && (
                    <Alert variant="warning" dismissible onClose={clearAutoAddMessage}>
                        {autoAddMessage}
                    </Alert>
                )}

                <div className="row g-4">

                    {/* LEFT: preview + details */}
                    <div className="col-lg-8">

                        {/* Preview */}
                        <div className="mp-card mp-preview mb-4">
                            <div className="mp-preview-main">
                                <img src={previewImage} alt={bundle.title} />
                            </div>

                            {comicsCount > 1 && (
                                <div className="mp-thumbs">
                                    {bundle.comics.map((comic, index) => {
                                        const src = comic.thumbnail || PLACEHOLDER_IMG;
                                        const isActive = previewImage === src;
                                        return (
                                            <button
                                                key={comic._id}
                                                type="button"
                                                className={isActive ? "active" : ""}
                                                onClick={() => setActiveImage(src)}
                                                title={`Part ${index + 1}: ${comic.title}`}
                                                aria-label={`Preview part ${index + 1}`}
                                            >
                                                <img src={src} alt="" />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Price + cart (mobile) */}
                        {renderBuyCard("d-lg-none mb-4")}

                        {/* About */}
                        <div className="mp-card p-4 mb-4">
                            <h5 className="mp-section-title">About this bundle</h5>
                            <p className="text-muted mb-0" style={{ whiteSpace: "pre-line" }}>
                                {bundle.description || "No description available."}
                            </p>
                        </div>

                        {/* Details */}
                        <div className="mp-card p-4 mb-4">
                            <h5 className="mp-section-title">Bundle details</h5>
                            <div className="row g-3">
                                {infoTiles.map((tile) => (
                                    <div key={tile.label} className="col-6 col-xl-4">
                                        <div className="mp-info-tile">
                                            <div className="mp-info-icon"><i className={`bi ${tile.icon}`}></i></div>
                                            <div className="min-w-0">
                                                <div className="mp-info-label">{tile.label}</div>
                                                <div className="mp-info-value">{tile.value}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Creator */}
                        <div className="mp-card mp-creator mb-4">
                            <div
                                className="mp-creator-cover"
                                style={teacher?.background_image
                                    ? { backgroundImage: `url("${teacher.background_image}")` }
                                    : { backgroundImage: "linear-gradient(135deg, #B88746 0%, #DEC46A 100%)" }}
                            />
                            <div className="px-4 pb-4">
                                <img src={avatarSrc} alt={teacherName} className="mp-creator-avatar rounded-circle shadow-sm" />
                                <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mt-2">
                                    <div>
                                        <div className="small text-muted">About the creator</div>
                                        <h5 className="fw-bold mb-0 text-capitalize">{teacherName}</h5>
                                        {teacher?.email && (
                                            <div className="small text-muted">
                                                <i className="bi bi-envelope me-1"></i>{teacher.email}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-muted mt-3 mb-0" style={{ whiteSpace: "pre-line" }}>
                                    {teacher?.bio || "This teacher hasn't added a bio yet."}
                                </p>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="mp-card p-4">
                            <h5 className="mp-section-title">Ratings</h5>
                            <div className="d-flex flex-wrap align-items-center gap-4">
                                <div className="text-center">
                                    <div className="display-6 fw-bold lh-1">
                                        {bundle.averageRating?.toFixed(1) || "0.0"}
                                    </div>
                                    <div className="mp-stars mp-stars-light">
                                        {renderStars(bundle.averageRating)}
                                    </div>
                                    <div className="small text-muted">{bundle.totalRatings || 0} ratings</div>
                                </div>

                                <div className="vr d-none d-sm-block"></div>

                                <div>
                                    {isOwnBundle ? (
                                        <small className="text-muted">⚡ You cannot rate your own bundle.</small>
                                    ) : (
                                        <>
                                            <small className="text-muted d-block mb-1">Rate this bundle</small>
                                            <div onMouseLeave={() => setHoverRating(0)}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        className="mp-rate-star"
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onClick={() => submitRating(star)}
                                                        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                                                    >
                                                        {star <= (hoverRating || selectedRating) ? "★" : "☆"}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: buy card (desktop) */}
                    <div className="col-lg-4 d-none d-lg-block">
                        {renderBuyCard()}
                    </div>
                </div>

                {/* ============ COMICS ============ */}
                <div className="mt-5">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <h4 className="mp-section-title mb-0">📖 Included Comics</h4>
                        <span className="text-muted small">{comicsCount} total</span>
                    </div>

                    <div className="row g-4">
                        {bundle.comics?.map((comic, index) => {
                            const isCover = comic.thumbnail && comic.thumbnail === coverImage;
                            return (
                                <div key={comic._id} className="col-6 col-md-4 col-xl-3">
                                    <div className="mp-card mp-comic-card">
                                        <div className="mp-comic-img">
                                            {comic.thumbnail ? (
                                                <img src={comic.thumbnail} alt={comic.title} loading="lazy" />
                                            ) : (
                                                <div className="mp-placeholder"><i className="bi bi-image"></i></div>
                                            )}
                                            <span className="mp-part-badge">Part {index + 1}</span>
                                            {isCover && comicsCount > 1 && <span className="mp-cover-badge">Cover</span>}
                                        </div>
                                        <div className="p-3">
                                            <div className="fw-semibold text-truncate" title={comic.title}>{comic.title}</div>
                                            <div className="text-muted small text-truncate">
                                                {comic.subjectName || commonInfo.subject}
                                                {comic.conceptName ? ` · ${comic.conceptName}` : ""}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MarketPlaceDetails;
