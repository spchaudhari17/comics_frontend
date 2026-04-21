import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../API";
import { Loader } from "../../lib/loader";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";

const PurchasedBundleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [bundle, setBundle] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchBundleDetails = async () => {
        try {
            setLoading(true);

            const res = await API.get(`/user/purchasedBundleDetails/${id}`);

            if (!res.data.error) {
                setBundle(res.data.data);
            } else {
                toast.error(res.data.message);
            }

        } catch (err) {
            console.error(err);

            // 🔥 Better error handling
            if (err.response?.status === 403) {
                toast.error("You have not purchased this bundle");
                navigate("/marketplace");
            } else {
                toast.error(err.response?.data?.message || "Error fetching bundle");
            }

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchBundleDetails();
    }, [id]);

    if (loading) return <Loader />;

    if (!bundle) {
        return (
            <div className="text-center py-5">
                <h5>No Data Found</h5>
            </div>
        );
    }

    return (
        <div className="container py-4">

            {/* 🔥 Bundle Header */}
            <div className="mb-4">
                <h3 className="fw-bold text-capitalize">{bundle.title}</h3>

                <div className="text-muted">
                    Teacher: {bundle.teacherId?.firstname}{" "}
                    {bundle.teacherId?.lastname}
                </div>

                <div className="text-success fw-semibold">
                    ${bundle.price}
                </div>

                <div className="text-muted small">
                    {bundle.comics?.length} Comics Included
                </div>
            </div>

            {/* 🔥 Comics List */}
            <div className="row g-4">
                {bundle.comics?.map((comic) => (
                    <div key={comic._id} className="col-lg-4 col-md-6">

                        <div className="border rounded-4 shadow-sm overflow-hidden h-100">

                            {/* Thumbnail */}
                            <img
                                src={
                                    comic.thumbnail ||
                                    "https://via.placeholder.com/300x200"
                                }
                                alt={comic.title}
                                className="w-100"
                                style={{ height: "180px", objectFit: "cover" }}
                            />

                            <div className="p-3 d-flex flex-column">

                                {/* Title */}
                                <div className="fw-bold text-capitalize mb-1">
                                    {comic.title}
                                </div>

                                {/* Pages */}
                                <div className="text-muted small mb-2">
                                    {comic.pages?.length || 0} pages
                                </div>

                                {/* Action Buttons */}
                                <div className="d-flex gap-2 mt-auto">

                                    {/* 📖 Read */}
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() =>
                                            navigate(`/comic-reader/${comic._id}`)
                                        }
                                    >
                                        Read
                                    </Button>

                                    {/* 📄 PDF */}
                                    {comic.pdfUrl && (
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() =>
                                                window.open(comic.pdfUrl, "_blank")
                                            }
                                        >
                                            PDF
                                        </Button>
                                    )}

                                </div>

                            </div>
                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
};

export default PurchasedBundleDetails;