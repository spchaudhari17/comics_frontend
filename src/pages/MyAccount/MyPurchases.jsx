import React, { useCallback, useEffect, useRef, useState } from "react";
import API from "../../API";
import { Button, Pagination, Spinner } from "react-bootstrap";
import { Loader } from "../../lib/loader";
import { useNavigate } from "react-router-dom";
import { trackClick } from "../../utility/analytics";

const PAGE_SIZE = 9;

const SORT_OPTIONS = [
    { value: "latest", label: "Recently Purchased" },
    { value: "oldest", label: "Oldest Purchases" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "title", label: "Title A-Z" },
];

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

const MyPurchases = () => {
    const navigate = useNavigate();

    const [purchases, setPurchases] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        limit: PAGE_SIZE,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
    });

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sort, setSort] = useState("latest");

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
        }, 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    // 🔥 Fetch Purchases (server-side)
    const fetchPurchases = useCallback(async () => {
        const requestId = ++requestIdRef.current;

        try {
            setLoading(true);
            setError("");

            const params = { page: currentPage, limit: PAGE_SIZE, sort };
            if (debouncedSearch) params.search = debouncedSearch;

            const res = await API.get("/user/getMyPurchases", { params });

            if (requestId !== requestIdRef.current) return;

            setPurchases(res.data.data || []);
            if (res.data.pagination) setPagination(res.data.pagination);
        } catch (err) {
            if (requestId !== requestIdRef.current) return;
            console.log(err);
            setError(err.response?.data?.message || "Failed to load purchases");
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
                setInitialLoading(false);
            }
        }
    }, [currentPage, debouncedSearch, sort]);

    useEffect(() => {
        fetchPurchases();
    }, [fetchPurchases]);

    const goToPage = (page) => {
        if (page < 1 || page > pagination.totalPages || page === currentPage) return;
        trackClick("my_purchases_page_click", { page });
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const hasActiveFilters = search || sort !== "latest";

    const handleResetFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setSort("latest");
        setCurrentPage(1);
    };

    if (initialLoading) return <Loader />;

    const firstItem = (pagination.currentPage - 1) * pagination.limit + 1;
    const lastItem = Math.min(pagination.currentPage * pagination.limit, pagination.totalItems);

    return (
        <div>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h5 className="fw-bold mb-0">My Purchased Comics</h5>

                <div className="d-flex flex-wrap gap-2">
                    <input
                        type="search"
                        className="form-control"
                        style={{ minWidth: "240px" }}
                        placeholder="Search bundle, teacher or comic..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="form-select"
                        style={{ width: "200px" }}
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value);
                            setCurrentPage(1);
                        }}
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
                        <>Showing {firstItem}–{lastItem} of {pagination.totalItems} purchases</>
                    )}
                </div>
                {hasActiveFilters && (
                    <Button variant="outline-secondary" size="sm" onClick={handleResetFilters}>
                        Reset
                    </Button>
                )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center py-5">
                    <Spinner size="sm" className="me-2" />
                    Loading purchases...
                </div>
            ) : purchases.length === 0 ? (
                <div className="text-center py-5">
                    {debouncedSearch ? (
                        <>
                            <h6 className="mb-3">No purchases match "{debouncedSearch}"</h6>
                            <Button variant="outline-primary" size="sm" onClick={handleResetFilters}>
                                Clear search
                            </Button>
                        </>
                    ) : (
                        <>
                            <h6 className="mb-3">No purchases yet</h6>
                            <Button variant="primary" size="sm" onClick={() => navigate("/marketplace")}>
                                Browse Marketplace
                            </Button>
                        </>
                    )}
                </div>
            ) : (
                <>
                    <div className="row g-4">
                        {purchases.map((item) => {
                            const bundle = item.bundleId;
                            if (!bundle) return null;

                            return (
                                <div key={item._id} className="col-lg-4 col-md-6">
                                    <div className="border rounded-4 shadow-sm overflow-hidden h-100 d-flex flex-column">

                                        {/* Thumbnail */}
                                        <img
                                            src={
                                                bundle.comics?.[0]?.thumbnail ||
                                                "https://via.placeholder.com/300x200"
                                            }
                                            alt={bundle.title || "bundle"}
                                            className="w-100"
                                            style={{ height: "180px", objectFit: "cover" }}
                                        />

                                        <div className="p-3 d-flex flex-column flex-grow-1">

                                            {/* Title */}
                                            <div className="fw-bold text-capitalize mb-1">
                                                {bundle.title}
                                            </div>

                                            {/* Teacher */}
                                            <div className="text-muted small mb-1">
                                                Teacher:{" "}
                                                {bundle.teacherId?.firstname}{" "}
                                                {bundle.teacherId?.lastname}
                                            </div>

                                            {/* Comics count */}
                                            <div className="text-muted small mb-1">
                                                {bundle.comics?.length || 0} comics included
                                            </div>

                                            {/* Purchase date */}
                                            {item.createdAt && (
                                                <div className="text-muted small mb-2">
                                                    Purchased on {new Date(item.createdAt).toLocaleDateString()}
                                                </div>
                                            )}

                                            {/* Price paid */}
                                            <div className="fw-semibold text-success mb-3">
                                                ${item.amount ?? bundle.price}
                                            </div>

                                            {/* Action */}
                                            <Button
                                                variant="primary"
                                                className="mt-auto"
                                                onClick={() => {
                                                    trackClick("my_purchases_open_click", { bundle_id: bundle._id });
                                                    navigate(`/purchasedBundleDetails/${bundle._id}`);
                                                }}
                                            >
                                                Open
                                            </Button>

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
                                {getPageItems(currentPage, pagination.totalPages).map((p) =>
                                    typeof p === "string" ? (
                                        <Pagination.Ellipsis key={p} disabled />
                                    ) : (
                                        <Pagination.Item
                                            key={p}
                                            active={p === currentPage}
                                            disabled={loading}
                                            onClick={() => goToPage(p)}
                                        >
                                            {p}
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
    );
};

export default MyPurchases;