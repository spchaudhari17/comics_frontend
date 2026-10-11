import React, { useCallback, useEffect, useRef, useState } from "react";
import API from "../../API";
import { Button, Pagination, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { trackClick } from "../../utility/analytics";

const PAGE_SIZE = 9;

const SORT_OPTIONS = [
    { value: "latest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "rating", label: "Top Rated" },
    { value: "title", label: "Title A-Z" },
];

const EMPTY_FACETS = { subjects: [], concepts: [], grades: [], countries: [] };

const uniqueValues = (items) => [...new Set(items.filter(Boolean))];

// Comic ki countries (array ya purana single field)
const getComicCountries = (comic) =>
    Array.isArray(comic.countries) && comic.countries.length > 0
        ? comic.countries
        : comic.country
            ? [comic.country]
            : [];

// 1 … 4 5 [6] 7 8 … 20
const getPageItems = (current, total) => {
    const pages = new Set([1, total, current - 1, current, current + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

    const items = [];
    sorted.forEach((p, i) => {
        if (i > 0 && p - sorted[i - 1] > 1) items.push("ellipsis-" + p);
        items.push(p);
    });
    return items;
};

const MarketPlace = () => {
    const navigate = useNavigate();

    const user = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null;

    const [marketplaceStatus, setMarketplaceStatus] = useState({
        purchasedBundleIds: [],
        ownBundleIds: []
    });

    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [facets, setFacets] = useState(EMPTY_FACETS);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        limit: PAGE_SIZE,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
    });

    // Filters
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [conceptFilter, setConceptFilter] = useState("");
    const [gradeFilter, setGradeFilter] = useState("");
    const [countryFilter, setCountryFilter] = useState("");
    const [sort, setSort] = useState("latest");

    // Facets (dropdown options) sirf ek baar mangwao
    const facetsLoadedRef = useRef(false);
    // Purani request ka response nayi request ke baad aaye to ignore
    const requestIdRef = useRef(0);

    // 🔍 Search debounce (search badle to page 1)
    useEffect(() => {
        const t = setTimeout(() => {
            const value = search.trim();
            if (value !== debouncedSearch) {
                setDebouncedSearch(value);
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    // Filter badle to page 1 se
    const updateFilter = (setter) => (e) => {
        setter(e.target.value);
        setCurrentPage(1);
    };

    // -----------------------------
    // Fetch Marketplace (server-side)
    // -----------------------------
    const fetchMarketplace = useCallback(async () => {
        const requestId = ++requestIdRef.current;

        try {
            setLoading(true);

            const params = {
                page: currentPage,
                limit: PAGE_SIZE,
                sort
            };

            if (debouncedSearch) params.search = debouncedSearch;
            if (subjectFilter) params.subjectId = subjectFilter;
            if (conceptFilter) params.conceptId = conceptFilter;
            if (gradeFilter) params.grade = gradeFilter;
            if (countryFilter) params.country = countryFilter;
            if (!facetsLoadedRef.current) params.includeFacets = 1;

            const res = await API.get("/user/getMarketplace", { params });

            if (requestId !== requestIdRef.current) return;

            setBundles(res.data.data || []);
            if (res.data.pagination) {
                setPagination(res.data.pagination);
            }
            if (res.data.facets) {
                setFacets(res.data.facets);
                facetsLoadedRef.current = true;
            }
        } catch (err) {
            if (requestId !== requestIdRef.current) return;
            console.error("Error fetching marketplace:", err);
            toast.error("Failed to load marketplace ❌");
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }, [currentPage, debouncedSearch, subjectFilter, conceptFilter, gradeFilter, countryFilter, sort]);

    useEffect(() => {
        fetchMarketplace();
    }, [fetchMarketplace]);

    // -----------------------------
    // Fetch user's marketplace status
    // -----------------------------
    useEffect(() => {
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

        fetchMarketplaceStatus();
        // eslint-disable-next-line
    }, []);

    const goToPage = (page) => {
        if (page < 1 || page > pagination.totalPages || page === currentPage) return;
        trackClick("marketplace_page_click", { page });
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

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
            toast.error(err.response?.data?.message || "Error adding to cart ❌");
        }
    };

    const handleResetFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setSubjectFilter("");
        setConceptFilter("");
        setGradeFilter("");
        setCountryFilter("");
        setSort("latest");
        setCurrentPage(1);
    };

    const hasActiveFilters =
        search || subjectFilter || conceptFilter || gradeFilter || countryFilter || sort !== "latest";

    const firstItem = (pagination.currentPage - 1) * pagination.limit + 1;
    const lastItem = Math.min(pagination.currentPage * pagination.limit, pagination.totalItems);

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
                    <div className="col-lg-3 col-md-6">
                        <input
                            type="search"
                            className="form-control"
                            placeholder="Search bundles, teachers, comics..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="col-lg-2 col-md-6">
                        <select
                            className="form-select"
                            value={subjectFilter}
                            onChange={updateFilter(setSubjectFilter)}
                        >
                            <option value="">All Subjects</option>
                            {facets.subjects.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-lg-2 col-md-4">
                        <select
                            className="form-select"
                            value={conceptFilter}
                            onChange={updateFilter(setConceptFilter)}
                        >
                            <option value="">All Concepts</option>
                            {facets.concepts.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-lg-1 col-md-4">
                        <select
                            className="form-select"
                            value={gradeFilter}
                            onChange={updateFilter(setGradeFilter)}
                        >
                            <option value="">All Grades</option>
                            {facets.grades.map((g) => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-lg-2 col-md-4">
                        <select
                            className="form-select"
                            value={countryFilter}
                            onChange={updateFilter(setCountryFilter)}
                        >
                            <option value="">All Countries</option>
                            {facets.countries.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-lg-2 col-md-6">
                        <select
                            className="form-select"
                            value={sort}
                            onChange={updateFilter(setSort)}
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="text-muted small">
                        {pagination.totalItems > 0 && (
                            <>Showing {firstItem}–{lastItem} of {pagination.totalItems} bundles</>
                        )}
                    </div>
                    {hasActiveFilters && (
                        <Button variant="outline-secondary" size="sm" onClick={handleResetFilters}>
                            Reset Filters
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner className="me-2" size="sm" />
                        Loading bundles...
                    </div>
                ) : bundles.length === 0 ? (
                    <div className="text-center py-5">
                        <p className="mb-3">No bundles found.</p>
                        {hasActiveFilters && (
                            <Button variant="outline-primary" size="sm" onClick={handleResetFilters}>
                                Clear filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="row gy-5">
                            {bundles.map((bundle) => {
                                const isPurchased = marketplaceStatus.purchasedBundleIds.includes(String(bundle._id));
                                const isOwnBundle = marketplaceStatus.ownBundleIds.includes(String(bundle._id));

                                const comics = bundle.comics || [];

                                const subjectNames = uniqueValues(comics.map((c) => c.subjectId?.name || c.subject));
                                const conceptNames = uniqueValues(comics.map((c) => c.conceptId?.name || c.concept));
                                const gradeNames = uniqueValues(comics.map((c) => c.grade));

                                const allCountryCodes = uniqueValues(comics.flatMap(getComicCountries));
                                const countryLabel = allCountryCodes.includes("ALL")
                                    ? "🌍 All Countries"
                                    : allCountryCodes.join(", ");

                                return (
                                    <div key={bundle._id} className="col-lg-4 col-md-6">
                                        <div className="bg-white h-100 border border-primary rounded-4 shadow-sm overflow-hidden d-flex flex-column">
                                            <img
                                                src={
                                                    comics[0]?.thumbnail ||
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

                                                {countryLabel && (
                                                    <div className="info mb-1">
                                                        <span className="fw-semibold text-success">Country:</span>{" "}
                                                        {countryLabel}
                                                    </div>
                                                )}

                                                <div className="info mb-1">
                                                    <span className="fw-semibold text-info">Total Comics:</span>{" "}
                                                    {comics.length}
                                                </div>

                                                {bundle.totalRatings > 0 && (
                                                    <div className="info mb-1">
                                                        <span className="fw-semibold text-warning">Rating:</span>{" "}
                                                        ⭐ {bundle.averageRating} ({bundle.totalRatings})
                                                    </div>
                                                )}

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
                                                        <Button variant="secondary" size="sm" disabled>Your Bundle</Button>
                                                    ) : isPurchased ? (
                                                        <Button variant="success" size="sm" disabled>Purchased</Button>
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
                            <div className="d-flex justify-content-center mt-5">
                                <Pagination className="mb-0">
                                    <Pagination.Prev
                                        disabled={!pagination.hasPrevPage || loading}
                                        onClick={() => goToPage(currentPage - 1)}
                                    />
                                    {getPageItems(currentPage, pagination.totalPages).map((item) =>
                                        typeof item === "string" ? (
                                            <Pagination.Ellipsis key={item} disabled />
                                        ) : (
                                            <Pagination.Item
                                                key={item}
                                                active={item === currentPage}
                                                disabled={loading}
                                                onClick={() => goToPage(item)}
                                            >
                                                {item}
                                            </Pagination.Item>
                                        )
                                    )}
                                    <Pagination.Next
                                        disabled={!pagination.hasNextPage || loading}
                                        onClick={() => goToPage(currentPage + 1)}
                                    />
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MarketPlace;