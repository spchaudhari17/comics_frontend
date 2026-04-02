import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import API from "../../API";
import { Loader } from "../../lib/loader";
import { useNavigate } from "react-router-dom";

const AddToCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // 🔥 Fetch Cart
    const fetchCart = async () => {
        try {
            setLoading(true);
            const res = await API.get("/user/cart");
            setCartItems(res.data.data || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // ❌ Remove from cart
    const handleRemove = async (bundleId) => {
        try {
            await API.delete(`/user/cart/${bundleId}`);

            setCartItems((prev) =>
                prev.filter((item) => item.bundleId._id !== bundleId)
            );
        } catch (err) {
            alert("Failed to remove item");
        }
    };

    // 💰 Total Price
    const totalPrice = cartItems.reduce(
        (acc, item) => acc + (item.bundleId?.price || 0),
        0
    );

    // 🚀 Checkout (simple)
    const handleCheckout = async () => {
        try {
            const res = await API.post("/user/createCheckoutSessionforCart");

            if (!res.data.error) {
                window.location.href = res.data.url; // 🔥 redirect to Stripe
            }
        } catch (err) {
            alert("Checkout failed");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="container-xl py-5">

            <h3 className="mb-4 fw-bold">🛒 My Cart</h3>

            {cartItems.length === 0 ? (
                <div className="text-center mt-5">
                    <h5>Your cart is empty</h5>
                    <Button onClick={() => navigate("/market-Place")}>
                        Go to Marketplace
                    </Button>
                </div>
            ) : (
                <div className="row g-4">

                    {/* LEFT - ITEMS */}
                    <div className="col-lg-8">

                        {cartItems.map((item) => {
                            const bundle = item.bundleId;

                            return (
                                <div
                                    key={item._id}
                                    className="d-flex gap-3 border rounded-3 p-3 mb-3"
                                >

                                    {/* Image */}
                                    <img
                                        src={
                                            bundle.comics?.[0]?.thumbnail ||
                                            "https://via.placeholder.com/150"
                                        }
                                        alt="bundle"
                                        style={{
                                            width: "120px",
                                            height: "100px",
                                            objectFit: "cover",
                                            borderRadius: "8px",
                                        }}
                                    />

                                    {/* Info */}
                                    <div className="flex-grow-1">

                                        <div className="fw-bold">{bundle.title}</div>

                                        <div className="text-muted small">
                                            {bundle.comics?.length} comics included
                                        </div>

                                        <div className="text-success fw-semibold mt-1">
                                            ₹{bundle.price}
                                        </div>

                                    </div>

                                    {/* Actions */}
                                    <div className="d-flex flex-column justify-content-between">

                                        <Button
                                            size="sm"
                                            variant="outline-danger"
                                            onClick={() => handleRemove(bundle._id)}
                                        >
                                            Remove
                                        </Button>

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                    {/* RIGHT - SUMMARY */}
                    <div className="col-lg-4">

                        <div className="border rounded-3 p-4">

                            <h5 className="mb-3">Order Summary</h5>

                            <div className="d-flex justify-content-between mb-2">
                                <span>Items</span>
                                <span>{cartItems.length}</span>
                            </div>

                            <div className="d-flex justify-content-between mb-3">
                                <span>Total</span>
                                <span className="fw-bold">₹{totalPrice}</span>
                            </div>

                            <Button
                                variant="success"
                                className="w-100"
                                onClick={handleCheckout}
                            >
                                Checkout
                            </Button>

                        </div>

                    </div>

                </div>
            )}
        </div>
    );
};

export default AddToCart;