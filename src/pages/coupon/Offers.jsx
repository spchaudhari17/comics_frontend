import React, { useEffect, useState } from "react";
import {
    Badge,
    Card,
    Col,
    Row,
    Spinner
} from "react-bootstrap";

import API from "../../API";

import { toast } from "react-toastify";



const Offers = () => {

    const [offers, setOffers] = useState([]);

    const [loading, setLoading] = useState(false);




    // FETCH OFFERS
    const fetchOffers = async () => {

        try {

            setLoading(true);

            const { data } = await API.get(
                "/admin/coupon/list"
            );

            if (data.success) {

                // ONLY ACTIVE OFFERS
                const activeOffers = data.data.filter(

                    (item) => item.status === true

                );

                setOffers(activeOffers);

            }

        } catch (error) {

            toast.error(

                error.response?.data?.message ||
                "Failed to fetch offers"

            );

        } finally {

            setLoading(false);

        }
    };




    useEffect(() => {

        fetchOffers();

    }, []);




    return (

        <div className="offers-page pt-4 pb-4">

            <div className="container">

                {/* PAGE TITLE */}
                <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>

                        <h2 className="fw-bold mb-1">
                            Active Offers
                        </h2>

                        <p className="text-muted mb-0">
                            Apply these coupon codes during checkout
                        </p>

                    </div>

                    <Badge bg="primary" className="fs-6 px-3 py-2">

                        {offers.length} Offers

                    </Badge>

                </div>





                {
                    loading

                        ?

                        <div className="text-center py-5">

                            <Spinner animation="border" />

                        </div>

                        :

                        <Row>

                            {
                                offers.length > 0

                                    ?

                                    offers.map((offer) => (

                                        <Col
                                            md={6}
                                            lg={4}
                                            className="mb-4"
                                            key={offer._id}
                                        >

                                            <Card className="border-0 shadow-sm rounded-4 h-100">

                                                <Card.Body className="p-4">

                                                    {/* OFFER BADGE */}
                                                    <div className="d-flex justify-content-between align-items-start mb-3">

                                                        <Badge
                                                            bg="success"
                                                            className="px-3 py-2"
                                                        >
                                                            Active Offer
                                                        </Badge>

                                                        <Badge bg="dark">

                                                            {
                                                                offer.discountType === "percentage"

                                                                    ?

                                                                    `${offer.discountValue}% OFF`

                                                                    :

                                                                    `$${offer.discountValue} OFF`
                                                            }

                                                        </Badge>

                                                    </div>





                                                    {/* OFFER NAME */}
                                                    <h4 className="fw-bold mb-2">

                                                        {offer.name}

                                                    </h4>





                                                    {/* PLAN */}
                                                    <p className="text-muted mb-3">

                                                        Applicable on:

                                                        <span className="fw-semibold text-dark ms-1 text-capitalize">

                                                            {offer.applicablePlan}

                                                        </span>

                                                    </p>





                                                    {/* COUPON CODE */}
                                                    <div className="bg-light rounded-3 p-3 mb-3">

                                                        <div className="small text-muted mb-1">

                                                            Coupon Code

                                                        </div>

                                                        <div className="fs-4 fw-bold text-primary">

                                                            {offer.code}

                                                        </div>

                                                    </div>





                                                    {/* DURATION */}
                                                    <div className="d-flex justify-content-between mb-2">

                                                        <span className="text-muted">
                                                            Duration
                                                        </span>

                                                        <span className="fw-semibold text-capitalize">

                                                            {
                                                                offer.duration
                                                            }

                                                        </span>

                                                    </div>





                                                    {/* EXPIRY */}
                                                    <div className="d-flex justify-content-between">

                                                        <span className="text-muted">
                                                            Expiry
                                                        </span>

                                                        <span className="fw-semibold">

                                                            {
                                                                offer.expiryDate

                                                                    ?

                                                                    new Date(
                                                                        offer.expiryDate
                                                                    ).toLocaleDateString()

                                                                    :

                                                                    "No Expiry"
                                                            }

                                                        </span>

                                                    </div>

                                                </Card.Body>

                                            </Card>

                                        </Col>

                                    ))

                                    :

                                    <div className="text-center py-5">

                                        <h5 className="text-muted">

                                            No active offers available

                                        </h5>

                                    </div>
                            }

                        </Row>
                }

            </div>

        </div>
    );
};

export default Offers;

