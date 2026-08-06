import React, { useEffect, useMemo, useState } from "react";
import API from "../../API";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const MarketPlace = () => {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    const [marketplaceStatus, setMarketplaceStatus] = useState({
        purchasedBundleIds: [],
        ownBundleIds: []
    });

    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [conceptFilter, setConceptFilter] = useState("");
    const [gradeFilter, setGradeFilter] = useState("");
    const [countryFilter, setCountryFilter] = useState("");

    const fetchMarketplace = async () => {
        try {
            setLoading(true);

            const res = await API.get("/user/getMarketplace");

            setBundles(res.data.data || []);
        } catch (err) {
            console.error("Error fetching marketplace:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketplace();
    }, []);

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
    }, []);

    const handleView = (bundle) => {
        navigate(`/marketPlaceDetails/${bundle._id}`);
    };

    const handleAddToCart = async (bundleId) => {
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

    // Subject List
    const subjects = useMemo(() => {
        return [
            ...new Set(
                bundles.flatMap((bundle) =>
                    bundle.comics?.map(
                        (comic) =>
                            comic.subjectId?.name ||
                            comic.subject ||
                            "N/A"
                    ) || []
                )
            )
        ].filter(Boolean);
    }, [bundles]);

    // Concept List
    const concepts = useMemo(() => {
        return [
            ...new Set(
                bundles.flatMap((bundle) =>
                    bundle.comics?.map(
                        (comic) =>
                            comic.conceptId?.name ||
                            comic.concept ||
                            "N/A"
                    ) || []
                )
            )
        ].filter(Boolean);
    }, [bundles]);

    // Grade List
    const grades = useMemo(() => {
        return [
            ...new Set(
                bundles.flatMap((bundle) =>
                    bundle.comics?.map(
                        (comic) =>
                            comic.grade || "N/A"
                    ) || []
                )
            )
        ].filter(Boolean);
    }, [bundles]);

    // Country List
    const countries = useMemo(() => {
        return [
            ...new Set(
                bundles.flatMap((bundle) =>
                    bundle.comics?.map(
                        (comic) =>
                            comic.country || "N/A"
                    ) || []
                )
            )
        ].filter(Boolean);
    }, [bundles]);

    // Filtered Bundles
    const filteredBundles = useMemo(() => {
        return bundles.filter((bundle) => {
            const matchSearch =
                !search ||
                bundle.title?.toLowerCase().includes(search.toLowerCase()) ||
                bundle.teacherId?.firstname
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||
                bundle.teacherId?.lastname
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||
                bundle.comics?.some((comic) =>
                    comic.title?.toLowerCase().includes(search.toLowerCase()) ||
                    comic.subjectId?.name?.toLowerCase().includes(search.toLowerCase()) ||
                    comic.subject?.toLowerCase().includes(search.toLowerCase()) ||
                    comic.conceptId?.name?.toLowerCase().includes(search.toLowerCase()) ||
                    comic.concept?.toLowerCase().includes(search.toLowerCase()) ||
                    comic.grade?.toLowerCase().includes(search.toLowerCase()) ||
                    comic.country?.toLowerCase().includes(search.toLowerCase())
                );

            const matchSubject =
                !subjectFilter ||
                bundle.comics?.some(
                    (comic) =>
                        (comic.subjectId?.name ||
                            comic.subject) === subjectFilter
                );

            const matchConcept =
                !conceptFilter ||
                bundle.comics?.some(
                    (comic) =>
                        (comic.conceptId?.name ||
                            comic.concept) === conceptFilter
                );

            const matchGrade =
                !gradeFilter ||
                bundle.comics?.some(
                    (comic) =>
                        comic.grade === gradeFilter
                );

            const matchCountry =
                !countryFilter ||
                bundle.comics?.some(
                    (comic) =>
                        comic.country === countryFilter
                );

            return matchSearch && matchSubject && matchConcept && matchGrade && matchCountry;
        });
    }, [bundles, search, subjectFilter, conceptFilter, gradeFilter, countryFilter]);

    return (
        <div className="comoic-library-page pb-5">

            {/* Banner */}
            <section className="breadcrumb-banner-section py-5">
                <div className="container-xl position-relative z-1">
                    <div className="page-header text-white text-uppercase text-center">
                        <div className="section-heading text-white mb-2">
                            🛒 Marketplace
                        </div>

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
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="col-md-3">
                        <select
                            className="form-select"
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                        >
                            <option value="">All Subjects</option>
                            {subjects.map((subject) => (
                                <option key={subject} value={subject}>
                                    {subject}
                                </option>
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
                            {concepts.map((concept) => (
                                <option key={concept} value={concept}>
                                    {concept}
                                </option>
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
                            {grades.map((grade) => (
                                <option key={grade} value={grade}>
                                    {grade}
                                </option>
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
                            {countries.map((country) => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <p className="text-center">Loading bundles...</p>
                ) : filteredBundles.length === 0 ? (
                    <p className="text-center">No bundles found.</p>
                ) : (
                    <div className="row gy-5">
                        {filteredBundles.map((bundle) => {
                            const isPurchased = marketplaceStatus.purchasedBundleIds.includes(bundle._id);
                            const isOwnBundle = marketplaceStatus.ownBundleIds.includes(bundle._id);

                            const subjectNames = [
                                ...new Set(
                                    bundle.comics?.map(
                                        (comic) =>
                                            comic.subjectId?.name ||
                                            comic.subject
                                    ) || []
                                )
                            ];

                            const conceptNames = [
                                ...new Set(
                                    bundle.comics?.map(
                                        (comic) =>
                                            comic.conceptId?.name ||
                                            comic.concept
                                    ) || []
                                )
                            ];

                            // Get unique grades and countries from comics
                            const gradeNames = [
                                ...new Set(
                                    bundle.comics?.map(
                                        (comic) => comic.grade
                                    ) || []
                                )
                            ].filter(Boolean);

                            const countryNames = [
                                ...new Set(
                                    bundle.comics?.map(
                                        (comic) => comic.country
                                    ) || []
                                )
                            ].filter(Boolean);

                            return (
                                <div key={bundle._id} className="col-lg-4 col-md-6">
                                    <div className="bg-white h-100 border border-primary rounded-4 shadow-sm overflow-hidden">

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

                                            {/* Teacher */}
                                            <div className="info mb-1">
                                                <span className="fw-semibold text-primary">Teacher:</span>{" "}
                                                {bundle.teacherId?.firstname} {bundle.teacherId?.lastname}
                                            </div>

                                            <div className="info mb-1">
                                                <span className="fw-semibold" style={{ color: "#6f42c1" }}>
                                                    Subject:
                                                </span>{" "}
                                                {subjectNames.join(", ")}
                                            </div>

                                            <div className="info mb-1">
                                                <span className="fw-semibold text-danger">Concept:</span>{" "}
                                                {conceptNames.join(", ")}
                                            </div>

                                            {/* ✅ Grade */}
                                            {gradeNames.length > 0 && (
                                                <div className="info mb-1">
                                                    <span className="fw-semibold text-warning">Grade:</span>{" "}
                                                    {gradeNames.join(", ")}
                                                </div>
                                            )}

                                            {/* ✅ Country */}
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
                                                    <Button variant="secondary" disabled>
                                                        Your Bundle
                                                    </Button>
                                                ) : isPurchased ? (
                                                    <Button variant="success" disabled>
                                                        Purchased
                                                    </Button>
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
                )}
            </div>
        </div>
    );
};

export default MarketPlace;