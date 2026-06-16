import React, { useEffect, useMemo, useState } from "react";
import API from "../../API";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const MarketPlace = () => {
    const navigate = useNavigate();

    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [conceptFilter, setConceptFilter] = useState("");

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
        ];
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
        ];
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
                    comic.concept?.toLowerCase().includes(search.toLowerCase())
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

            return (
                matchSearch &&
                matchSubject &&
                matchConcept
            );
        });
    }, [
        bundles,
        search,
        subjectFilter,
        conceptFilter
    ]);

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
                            <li className="text-white">
                                Home
                            </li>

                            <li>
                                <span>/</span>
                            </li>

                            <li className="text-warning">
                                Marketplace
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <div className="container-xl mt-5">

                {/* Filters */}
                <div className="row g-3 mb-4">

                    <div className="col-md-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search bundle or comic title..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />
                    </div>

                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={subjectFilter}
                            onChange={(e) =>
                                setSubjectFilter(e.target.value)
                            }
                        >
                            <option value="">
                                All Subjects
                            </option>

                            {subjects.map((subject) => (
                                <option
                                    key={subject}
                                    value={subject}
                                >
                                    {subject}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={conceptFilter}
                            onChange={(e) =>
                                setConceptFilter(e.target.value)
                            }
                        >
                            <option value="">
                                All Concepts
                            </option>

                            {concepts.map((concept) => (
                                <option
                                    key={concept}
                                    value={concept}
                                >
                                    {concept}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>

                {loading ? (
                    <p className="text-center">
                        Loading bundles...
                    </p>
                ) : filteredBundles.length === 0 ? (
                    <p className="text-center">
                        No bundles found.
                    </p>
                ) : (
                    <div className="row gy-5">
                        {filteredBundles.map((bundle) => {

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

                            const comicTitles =
                                bundle.comics?.map(
                                    (comic) => comic.title
                                ) || [];

                            return (
                                <div
                                    key={bundle._id}
                                    className="col-lg-4 col-md-6"
                                >
                                    <div className="bg-white h-100 border border-primary rounded-4 shadow-sm overflow-hidden">

                                        <img
                                            src={
                                                bundle.comics?.[0]
                                                    ?.thumbnail ||
                                                "https://via.placeholder.com/400x250?text=Bundle"
                                            }
                                            alt={bundle.title}
                                            className="card-img-top"
                                            style={{
                                                height: "220px",
                                                objectFit: "cover"
                                            }}
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
                                                <span
                                                    className="fw-semibold"
                                                    style={{ color: "#6f42c1" }} // Purple
                                                >
                                                    Subject:
                                                </span>{" "}
                                                {subjectNames.join(", ")}
                                            </div>



                                            <div className="info mb-1">
                                                <span className="fw-semibold text-danger">
                                                    Concept:
                                                </span>{" "}
                                                {conceptNames.join(", ")}
                                            </div>

                                            <div className="info mb-1">
                                                <span className="fw-semibold text-warning">Total Comics:</span>{" "}
                                                {bundle.comics?.length}
                                            </div>


                                            <div className="info mb-3">
                                                <span className="fw-semibold text-success">Price:</span>{" "}
                                                ₹{bundle.price}
                                            </div>

                                            <div className="d-flex gap-2 mt-auto">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleView(
                                                            bundle
                                                        )
                                                    }
                                                >
                                                    View
                                                </Button>

                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleAddToCart(
                                                            bundle._id
                                                        )
                                                    }
                                                >
                                                    <i className="bi bi-cart-plus me-1"></i>
                                                    Add To Cart
                                                </Button>
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