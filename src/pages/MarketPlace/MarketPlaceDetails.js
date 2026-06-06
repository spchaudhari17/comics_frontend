import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../API";
import { Button } from "react-bootstrap";

const MarketPlaceDetails = () => {
    const { id } = useParams();

    const [bundle, setBundle] = useState(null);
    const [loading, setLoading] = useState(false);

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

    useEffect(() => {
        fetchBundle();
    }, []);

    const handlePurchase = async () => {
        try {
            const res = await API.post("/user/purchase", { bundleId: id });

            if (!res.data.error) {
                alert("Purchased successfully");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Purchase failed");
        }
    };
    if (loading) return <p className="text-center mt-5">Loading...</p>;
    if (!bundle) return <p className="text-center mt-5">No Data Found</p>;

    const handleAddToCart = async () => {
        try {
            const res = await API.post("/user/addToCart", { bundleId: id });

            if (!res.data.error) {
                alert("Added to cart");
            } else {
                alert(res.data.message);
            }
        } catch (err) {
            alert("Error adding to cart");
        }
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
                    <h3 className="fw-bold mb-2">{bundle.title}</h3>

                    {/* Teacher */}
                    <div className="mb-2 text-muted">
                        By {bundle.teacherId?.firstname} {bundle.teacherId?.lastname}
                    </div>

                    {/* Rating (static for now) */}
                    <div className="mb-3 text-warning">
                        ⭐⭐⭐⭐⭐ <span className="text-dark">(4.8)</span>
                    </div>

                    {/* Price */}
                    <div className="fs-3 fw-bold text-success mb-3">
                        ₹{bundle.price}
                    </div>

                    {/* Buttons */}
                    <div className="d-flex gap-3 mb-4">
                        <Button variant="success" onClick={handleAddToCart}>
                            Add To Card
                        </Button>

                        <Button variant="outline-secondary">
                            Add to Wishlist
                        </Button>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <h5>About this bundle</h5>
                        <p className="text-muted">
                            {bundle.description || "No description available."}
                        </p>
                    </div>

                    {/* Highlights */}
                    <div>
                        <h5>Highlights</h5>
                        <ul className="text-muted">
                            <li>{bundle.comics?.length} Comics included</li>
                            <li>Instant access after purchase</li>
                            <li>Downloadable content</li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* 🔥 Comics List */}
            <div className="mt-5">
                <h4 className="mb-3">Included Comics</h4>

                <div className="row g-3">
                    {bundle.comics?.map((comic) => (
                        <div key={comic._id} className="col-md-4">
                            <div className="border rounded-3 p-2 h-100">

                                <img
                                    src={comic.thumbnail || "https://via.placeholder.com/200"}
                                    alt={comic.title}
                                    style={{ width: "100%", height: "150px", objectFit: "cover" }}
                                />

                                <div className="mt-2 fw-semibold">{comic.title}</div>
                                <div className="text-muted small">{comic.subject}</div>

                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default MarketPlaceDetails;