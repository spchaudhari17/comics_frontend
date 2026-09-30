import React, { useEffect, useMemo, useState } from "react";
import API from "../../API";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { trackClick } from "../../utility/analytics";

const MarketPlace = () => {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [marketplaceStatus, setMarketplaceStatus] = useState({
        purchasedBundleIds: [],
        ownBundleIds: []
    });

    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pagination
    const [pagination, setPagination] = useState({
        currentPage: 1,
        limit: 9,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
    });

    // Filters
    const [search, setSearch] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [conceptFilter, setConceptFilter] = useState("");
    const [gradeFilter, setGradeFilter] = useState("");
    const [countryFilter, setCountryFilter] = useState("");
    const [sort, setSort] = useState("latest");

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(t);
    }, [search]);

    // -----------------------------
    // Fetch Marketplace (server-side)
    // -----------------------------
    const fetchMarketplace = async (page = 1) => {
        try {
            setLoading(true);

            const params = {
                page,
                limit: pagination.limit,
                sort
            };

            if (debouncedSearch) params.search = debouncedSearch;
            if (subjectFilter) params.subjectId = subjectFilter;
            if (conceptFilter) params.conceptId = conceptFilter;
            if (gradeFilter) params.grade = gradeFilter;
            if (countryFilter) params.country = countryFilter;

            const res = await API.get("/user/getMarketplace", { params });

            setBundles(res.data.data || []);
            if (res.data.pagination) {
                setPagination((prev) => ({
                    ...prev,
                    ...res.data.pagination
                }));
            }
        } catch (err) {
            console.error("Error fetching marketplace:", err);
            toast.error("Failed to load marketplace ❌");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketplace(1);
        // eslint-disable-next-line
    }, [debouncedSearch, subjectFilter, conceptFilter, gradeFilter, countryFilter, sort]);

    // -----------------------------
    // Fetch user's marketplace status
    // -----------------------------
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
        fetchMarketplaceStatus();
        // eslint-disable-next-line
    }, []);

    const handleView = (bundle) => {
        trackClick("marketplace_view_bundle_click", { bundle_id: bundle._id, price: bundle.price || 0 });
        navigate(`/marketPlaceDetails/${bundle._id}`);
    };

    const handleAddToCart = async (bundleId) => {
        trackClick("add_to_cart_click", { bundle_id: bundleId, location: "marketplace_list" });
        try {
            const res = await API.post("/user/addToCart", { bundleId });

            if (!res.data.error) {
                toast.success("Added to cart 🛒");
            } else {
                toast.warning(res.data.message);
            }
        } catch (err) {
            toast.error("Error adding to cart ❌");
        }
    };

    // -----------------------------
    // Filter option lists (derived from current page bundles)
    // NOTE: Since filtering is now server-side, these dropdowns will
    // only show options from the current page. If you want global
    // options, you'd need a separate "facets" API endpoint.
    // -----------------------------
    const subjects = useMemo(() => {
        return [
            ...new Set(
                bundles.flatMap((bundle) =>
                    bundle.comics?.map((comic) => comic.subjectId?.name || comic.subject).filter(Boolean) || []
                )
            )
        ].filter(Boolean);
    }, [bundles]);

    const concepts = useMemo(() => {
        return [
            ...new Set(
                bundles.flatMap((bundle) =>
                    bundle.comics?.map((comic) => comic.conceptId?.name || comic.concept).filter(Boolean) || []
                )
            )
        ].filter(Boolean);
    }, [bundles]);

    const grades = useMemo(() => {
        return [
            ...new Set(
                bundles.flatMap((bundle) => bundle.comics?.map((c) => c.grade).filter(Boolean) || [])
            )
        ].filter(Boolean);
    }, [bundles]);

    const countries = useMemo(() => {
        return [
            ...new Set(
                bundles.flatMap((bundle) => bundle.comics?.map((c) => c.country).filter(Boolean) || [])
            )
        ].filter(Boolean);
    }, [bundles]);

    const handleResetFilters = () => {
        setSearch("");
        setSubjectFilter("");
        setConceptFilter("");
        setGradeFilter("");
        setCountryFilter("");
        setSort("latest");
    };

    return (
        <div className="comic-library-page pb-5">
            {/* Banner */}
            <section className="breadcrumb-banner-section py-5">
                <div className="container-xl position-relative z-1">
                    <div className="page-header text-white text-uppercase text-center">
                        <div className="section-heading text-white mb-2">🛒 Marketplace</div>
                        <ul className="list-unstyled d-flex justify-content-center gap-2 mb-0">
                            <li className="text-white">Home</li>
                            <li><span>/</span></li>
                            <li className="text-warning">Marketplace</li>
                        </ul>
                    </div>
                </div>
            </section>

            <div className="container-xl mt-5">
                {/* Filters */}
                <div className="row g-3 mb-4 align-items-center">
                    <div className="col-md-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search bundles, teachers, comics..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="col-md-2">
                        <select
                            className="form-select"
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                        >
                            <option value="">All Subjects</option>
                            {subjects.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-2">
                        <select
                            className="form-select"
                            value={conceptFilter}
                            onChange={(e) => setConceptFilter(e.target.value)}
                        >
                            <option value="">All Concepts</option>
                            {concepts.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-2">
                        <select
                            className="form-select"
                            value={gradeFilter}
                            onChange={(e) => setGradeFilter(e.target.value)}
                        >
                            <option value="">All Grades</option>
                            {grades.map((g) => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-2">
                        <select
                            className="form-select"
                            value={countryFilter}
                            onChange={(e) => setCountryFilter(e.target.value)}
                        >
                            <option value="">All Countries</option>
                            {countries.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-1 d-flex gap-2">
                        <select
                            className="form-select"
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                        >
                            <option value="latest">New</option>
                            <option value="oldest">Old</option>
                        </select>
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="text-muted small">
                        {pagination.totalItems > 0 && (
                            <>Showing page {pagination.currentPage} of {pagination.totalPages} • {pagination.totalItems} bundles</>
                        )}
                    </div>
                    <Button variant="outline-secondary" size="sm" onClick={handleResetFilters}>
                        Reset Filters
                    </Button>
                </div>

                {loading ? (
                    <p className="text-center py-5">Loading bundles...</p>
                ) : bundles.length === 0 ? (
                    <p className="text-center py-5">No bundles found.</p>
                ) : (
                    <>
                        <div className="row gy-5">
                            {bundles.map((bundle) => {
                                const isPurchased = marketplaceStatus.purchasedBundleIds.includes(bundle._id);
                                const isOwnBundle = marketplaceStatus.ownBundleIds.includes(bundle._id);

                                const subjectNames = [
                                    ...new Set(
                                        bundle.comics?.map((c) => c.subjectId?.name || c.subject).filter(Boolean) || []
                                    )
                                ];

                                const conceptNames = [
                                    ...new Set(
                                        bundle.comics?.map((c) => c.conceptId?.name || c.concept).filter(Boolean) || []
                                    )
                                ];

                                const gradeNames = [
                                    ...new Set(bundle.comics?.map((c) => c.grade).filter(Boolean) || [])
                                ];

                                const countryNames = [
                                    ...new Set(bundle.comics?.map((c) => c.country).filter(Boolean) || [])
                                ];

                                return (
                                    <div key={bundle._id} className="col-lg-4 col-md-6">
                                        <div className="bg-white h-100 border border-primary rounded-4 shadow-sm overflow-hidden d-flex flex-column">
                                            <img
                                                src={
                                                    bundle.comics?.[0]?.thumbnail ||
                                                    "https://via.placeholder.com/400x250?text=Bundle"
                                                }
                                                alt={bundle.title}
                                                className="card-img-top"
                                                style={{ height: "220px", objectFit: "cover" }}
                                            />

                                            <div className="card-body d-flex flex-column p-3">
                                                <div className="fs-16 fw-bold text-theme4 text-capitalize mb-2">
                                                    {bundle.title}
                                                </div>

                                                <div className="info mb-1">
                                                    <span className="fw-semibold text-primary">Teacher:</span>{" "}
                                                    {bundle.teacherId?.firstname} {bundle.teacherId?.lastname}
                                                </div>

                                                {subjectNames.length > 0 && (
                                                    <div className="info mb-1">
                                                        <span className="fw-semibold" style={{ color: "#6f42c1" }}>Subject:</span>{" "}
                                                        {subjectNames.join(", ")}
                                                    </div>
                                                )}

                                                {conceptNames.length > 0 && (
                                                    <div className="info mb-1">
                                                        <span className="fw-semibold text-danger">Concept:</span>{" "}
                                                        {conceptNames.join(", ")}
                                                    </div>
                                                )}

                                                {gradeNames.length > 0 && (
                                                    <div className="info mb-1">
                                                        <span className="fw-semibold text-warning">Grade:</span>{" "}
                                                        {gradeNames.join(", ")}
                                                    </div>
                                                )}

                                                {countryNames.length > 0 && (
                                                    <div className="info mb-1">
                                                        <span className="fw-semibold text-success">Country:</span>{" "}
                                                        {countryNames.join(", ")}
                                                    </div>
                                                )}

                                                <div className="info mb-1">
                                                    <span className="fw-semibold text-info">Total Comics:</span>{" "}
                                                    {bundle.comics?.length}
                                                </div>

                                                <div className="info mb-3">
                                                    <span className="fw-semibold text-success">Price:</span>{" "}
                                                    ${bundle.price}
                                                </div>

                                                <div className="d-flex gap-2 mt-auto">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleView(bundle)}
                                                    >
                                                        View
                                                    </Button>

                                                    {isOwnBundle ? (
                                                        <Button variant="secondary" disabled>Your Bundle</Button>
                                                    ) : isPurchased ? (
                                                        <Button variant="success" disabled>Purchased</Button>
                                                    ) : (
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() => handleAddToCart(bundle._id)}
                                                        >
                                                            <i className="bi bi-cart-plus me-1"></i>
                                                            Add To Cart
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
                                <Button
                                    variant="outline-primary"
                                    disabled={!pagination.hasPrevPage || loading}
                                    onClick={() => fetchMarketplace(pagination.currentPage - 1)}
                                >
                                    ← Prev
                                </Button>

                                <span className="fw-semibold">
                                    Page {pagination.currentPage} / {pagination.totalPages}
                                </span>

                                <Button
                                    variant="outline-primary"
                                    disabled={!pagination.hasNextPage || loading}
                                    onClick={() => fetchMarketplace(pagination.currentPage + 1)}
                                >
                                    Next →
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MarketPlace;