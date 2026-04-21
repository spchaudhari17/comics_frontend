import React, { useEffect, useState } from "react";
import API from "../../API";
import { Button } from "react-bootstrap";
import { Loader } from "../../lib/loader";
import { useNavigate } from "react-router-dom";

const MyPurchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // 🔥 Fetch Purchases
    const fetchPurchases = async () => {
        try {
            setLoading(true);
            const res = await API.get("/user/getMyPurchases");
            setPurchases(res.data.data || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchases();
    }, []);

    if (loading) return <Loader />;

    return (
        <div>
            <h5 className="fw-bold mb-3">My Purchased Comics</h5>

            {purchases.length === 0 ? (
                <div className="text-center py-5">
                    <h6>No purchases yet</h6>
                </div>
            ) : (
                <div className="row g-4">
                    {purchases.map((item) => {
                        const bundle = item.bundleId;

                        return (
                            <div key={item._id} className="col-lg-4 col-md-6">
                                <div className="border rounded-4 shadow-sm overflow-hidden h-100">

                                    {/* Thumbnail */}
                                    <img
                                        src={
                                            bundle?.comics?.[0]?.thumbnail ||
                                            "https://via.placeholder.com/300x200"
                                        }
                                        alt="bundle"
                                        className="w-100"
                                        style={{ height: "180px", objectFit: "cover" }}
                                    />

                                    <div className="p-3 d-flex flex-column">

                                        {/* Title */}
                                        <div className="fw-bold text-capitalize mb-1">
                                            {bundle?.title}
                                        </div>

                                        {/* Teacher */}
                                        <div className="text-muted small mb-1">
                                            Teacher:{" "}
                                            {bundle?.teacherId?.firstname}{" "}
                                            {bundle?.teacherId?.lastname}
                                        </div>

                                        {/* Comics count */}
                                        <div className="text-muted small mb-2">
                                            {bundle?.comics?.length} comics included
                                        </div>

                                        {/* Price */}
                                        <div className="fw-semibold text-success mb-3">
                                            ₹{bundle?.price}
                                        </div>

                                        {/* Action */}
                                        <Button
                                            variant="primary"
                                            onClick={() =>
                                                navigate(`/purchasedBundleDetails/${bundle._id}`)
                                            }
                                        >
                                            Open
                                        </Button>

                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyPurchases;