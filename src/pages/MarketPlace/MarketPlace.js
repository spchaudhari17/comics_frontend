import React, { useEffect, useState } from "react";
import API from "../../API";
import { Button } from "react-bootstrap";

const MarketPlace = () => {
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(false);

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
        console.log("Bundle Details:", bundle);
        // 👉 next step: navigate to bundle detail page
    };

    const handlePurchase = async (bundleId) => {
        try {
            const res = await API.post("/user/purchase", { bundleId });

            if (!res.data.error) {
                alert("Purchase successful");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Purchase failed");
        }
    };

    return (
        <div className="comoic-library-page pb-5">

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
                {loading ? (
                    <p className="text-center">Loading bundles...</p>
                ) : bundles.length === 0 ? (
                    <p className="text-center">No bundles available.</p>
                ) : (
                    <div className="row gy-5">
                        {bundles.map((bundle) => (
                            <div key={bundle._id} className="col-lg-4 col-md-6">
                                <div className="bg-white h-100 border border-primary rounded-4 shadow-sm overflow-hidden">

                                    {/* Thumbnail (first comic image) */}
                                    <img
                                        src={
                                            bundle.comics?.[0]?.thumbnail
                                                ? bundle.comics[0].thumbnail
                                                : "https://via.placeholder.com/300x200?text=Bundle"
                                        }
                                        alt={bundle.title}
                                        className="card-img-top"
                                        style={{ height: "200px", objectFit: "cover" }}
                                    />

                                    <div className="card-body d-flex flex-column p-3">

                                        {/* Title */}
                                        <div className="fs-16 fw-bold text-theme4 text-capitalize mb-2">
                                            {bundle.title}
                                        </div>

                                        {/* Teacher */}
                                        <div className="info mb-1">
                                            <span className="fw-semibold text-primary">Teacher:</span>{" "}
                                            {bundle.teacherId?.firstname} {bundle.teacherId?.lastname}
                                        </div>

                                        {/* Comics count */}
                                        <div className="info mb-1">
                                            <span className="fw-semibold text-warning">Comics:</span>{" "}
                                            {bundle.comics?.length}
                                        </div>

                                        {/* Price */}
                                        <div className="info mb-3">
                                            <span className="fw-semibold text-success">Price:</span>{" "}
                                            ₹{bundle.price}
                                        </div>

                                        {/* Buttons */}
                                        <div className="d-flex gap-2 mt-auto">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleView(bundle)}
                                            >
                                                View
                                            </Button>

                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => handlePurchase(bundle._id)}
                                            >
                                                Buy Now
                                            </Button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketPlace;