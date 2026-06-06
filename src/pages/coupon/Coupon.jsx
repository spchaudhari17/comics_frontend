import React, { useEffect, useState } from "react";
import {
    Badge,
    Button,
    Form,
    Modal,
    Row,
    Col
} from "react-bootstrap";

import DataTable from "react-data-table-component";

import API from "../../API";

import { toast } from "react-toastify";

import dataTableCustomStyles from "../../assets/styles/dataTableCustomStyles";

import { Loader } from "../../lib/loader";

import { NoDataComponent } from "../../components/NoDataComponent";



const CouponPage = () => {

    const [coupons, setCoupons] = useState([]);

    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [creating, setCreating] = useState(false);

    const [deleteModal, setDeleteModal] = useState(false);

    const [deleteId, setDeleteId] = useState("");

    const [deleting, setDeleting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const [perPage, setPerPage] = useState(10);



    const [formData, setFormData] = useState({

        name: "",

        code: "",

        discountType: "percentage",

        discountValue: "",

        duration: "once",

        durationInMonths: "",

        applicablePlan: "bundle",

        maxRedemptions: "",

        expiryDate: ""

    });




    // FETCH COUPONS
    const fetchCoupons = async () => {

        try {

            setLoading(true);

            const { data } = await API.get(
                "/admin/coupon/list"
            );

            if (data.success) {

                setCoupons(data.data);

            }

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Failed to fetch coupons"
            );

        } finally {

            setLoading(false);

        }
    };



    useEffect(() => {

        fetchCoupons();

    }, []);




    // HANDLE INPUT
    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });
    };




    // CREATE COUPON
    const handleCreateCoupon = async (e) => {

        e.preventDefault();

        try {

            setCreating(true);

            const { data } = await API.post(

                "/admin/coupon/create",

                formData

            );

            if (data.success) {

                toast.success(
                    "Coupon created successfully"
                );

                setShowModal(false);

                fetchCoupons();

                setFormData({

                    name: "",

                    code: "",

                    discountType: "percentage",

                    discountValue: "",

                    duration: "once",

                    durationInMonths: "",

                    applicablePlan: "bundle",

                    maxRedemptions: "",

                    expiryDate: ""

                });

            }

        } catch (error) {

            toast.error(

                error.response?.data?.message ||
                "Failed to create coupon"

            );

        } finally {

            setCreating(false);

        }
    };




    // DELETE COUPON
    const handleDeleteCoupon = async () => {

        try {

            setDeleting(true);

            const { data } = await API.delete(

                `/admin/coupon/delete/${deleteId}`

            );

            if (data.success) {

                toast.success(
                    "Coupon deleted successfully"
                );

                fetchCoupons();

                setDeleteModal(false);

            }

        } catch (error) {

            toast.error(

                error.response?.data?.message ||
                "Delete failed"

            );

        } finally {

            setDeleting(false);

        }
    };





    // FILTER
    const filteredCoupons = coupons.filter((coupon) => {

        const term = search.toLowerCase();

        return (

            coupon.name?.toLowerCase().includes(term) ||

            coupon.code?.toLowerCase().includes(term)

        );

    });





    // TABLE COLUMNS
    const columns = [

        {
            name: "#",
            selector: (row, index) =>
                (currentPage - 1) * perPage + index + 1,
            width: "70px"
        },

        {
            name: "Coupon",
            selector: (row) => row.name,
            sortable: true,
            minWidth: "180px"
        },

        {
            name: "Code",
            selector: (row) => row.code,
            sortable: true,
            minWidth: "120px",
            cell: (row) => (
                <Badge bg="dark">
                    {row.code}
                </Badge>
            )
        },

        {
            name: "Discount",
            sortable: true,
            minWidth: "150px",
            cell: (row) => (

                row.discountType === "percentage"

                    ?

                    `${row.discountValue}% OFF`

                    :

                    `$${row.discountValue} OFF`

            )
        },

        {
            name: "Plan",
            selector: (row) => row.applicablePlan,
            minWidth: "120px",
            cell: (row) => (
                <Badge bg="info">
                    {row.applicablePlan}
                </Badge>
            )
        },

        {
            name: "Duration",
            selector: (row) => row.duration,
            minWidth: "120px"
        },

        {
            name: "Status",
            minWidth: "120px",
            cell: (row) => (

                row.status

                    ?

                    <Badge bg="success">
                        Active
                    </Badge>

                    :

                    <Badge bg="danger">
                        Inactive
                    </Badge>

            )
        },

        {
            name: "Created",
            selector: (row) =>
                new Date(
                    row.createdAt
                ).toLocaleDateString(),

            minWidth: "140px"
        },

        {
            name: "Actions",

            minWidth: "120px",

            cell: (row) => (

                <Button

                    size="sm"

                    variant="danger"

                    onClick={() => {

                        setDeleteId(row._id);

                        setDeleteModal(true);

                    }}

                >
                    <i className="bi bi-trash"></i>
                </Button>

            )
        }

    ];




    return (

        <div className="pt-4 pb-3">

            <div className="container-xl">

                {
                    loading

                        ?

                        <Loader />

                        :

                        <div className="bg-white rounded-4 p-3">

                            {/* HEADER */}
                            <div className="d-flex justify-content-between align-items-center mb-3">

                                <div className="main-heading">
                                    Coupons
                                </div>

                                <Button
                                    onClick={() => setShowModal(true)}
                                >
                                    Create Coupon
                                </Button>

                            </div>



                            {/* SEARCH */}
                            <div className="mb-3">

                                <Form.Control

                                    placeholder="Search coupon..."

                                    value={search}

                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }

                                />

                            </div>



                            {/* TABLE */}
                            <DataTable

                                columns={columns}

                                data={filteredCoupons}

                                pagination

                                responsive

                                striped

                                highlightOnHover

                                customStyles={
                                    dataTableCustomStyles
                                }

                                noDataComponent={
                                    <NoDataComponent />
                                }

                                onChangePage={(page) =>
                                    setCurrentPage(page)
                                }

                                onChangeRowsPerPage={(rows) =>
                                    setPerPage(rows)
                                }

                            />

                        </div>
                }

            </div>





            {/* CREATE MODAL */}
            <Modal
                show={showModal}
                centered
                size="lg"
                onHide={() => setShowModal(false)}
            >

                <Modal.Header closeButton>

                    <Modal.Title>
                        Create Coupon
                    </Modal.Title>

                </Modal.Header>

                <Form onSubmit={handleCreateCoupon}>

                    <Modal.Body>

                        <Row>

                            <Col md={6}>
                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Coupon Name
                                    </Form.Label>

                                    <Form.Control
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />

                                </Form.Group>
                            </Col>



                            <Col md={6}>
                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Coupon Code
                                    </Form.Label>

                                    <Form.Control
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        required
                                    />

                                </Form.Group>
                            </Col>



                            <Col md={6}>
                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Discount Type
                                    </Form.Label>

                                    <Form.Select
                                        name="discountType"
                                        value={formData.discountType}
                                        onChange={handleChange}
                                    >
                                        <option value="percentage">
                                            Percentage
                                        </option>

                                        <option value="fixed">
                                            Fixed
                                        </option>

                                    </Form.Select>

                                </Form.Group>
                            </Col>



                            <Col md={6}>
                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Discount Value
                                    </Form.Label>

                                    <Form.Control
                                        type="number"
                                        name="discountValue"
                                        value={formData.discountValue}
                                        onChange={handleChange}
                                        required
                                    />

                                </Form.Group>
                            </Col>




                            <Col md={6}>
                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Duration
                                    </Form.Label>

                                    <Form.Select
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                    >
                                        <option value="once">
                                            Once
                                        </option>

                                        <option value="forever">
                                            Forever
                                        </option>

                                        <option value="repeating">
                                            Repeating
                                        </option>

                                    </Form.Select>

                                </Form.Group>
                            </Col>





                            {
                                formData.duration === "repeating" &&

                                <Col md={6}>
                                    <Form.Group className="mb-3">

                                        <Form.Label>
                                            Duration In Months
                                        </Form.Label>

                                        <Form.Control
                                            type="number"
                                            name="durationInMonths"
                                            value={formData.durationInMonths}
                                            onChange={handleChange}
                                        />

                                    </Form.Group>
                                </Col>
                            }





                            <Col md={6}>
                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Applicable Plan
                                    </Form.Label>

                                    <Form.Select
                                        name="applicablePlan"
                                        value={formData.applicablePlan}
                                        onChange={handleChange}
                                    >

                                        <option value="bundle">
                                            Bundle
                                        </option>

                                        <option value="dashboard">
                                            Dashboard
                                        </option>

                                        <option value="all">
                                            All
                                        </option>

                                    </Form.Select>

                                </Form.Group>
                            </Col>





                            <Col md={6}>
                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Max Redemptions
                                    </Form.Label>

                                    <Form.Control
                                        type="number"
                                        name="maxRedemptions"
                                        value={formData.maxRedemptions}
                                        onChange={handleChange}
                                    />

                                </Form.Group>
                            </Col>





                            <Col md={12}>
                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Expiry Date
                                    </Form.Label>

                                    <Form.Control
                                        type="date"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleChange}
                                    />

                                </Form.Group>
                            </Col>

                        </Row>

                    </Modal.Body>



                    <Modal.Footer>

                        <Button
                            variant="secondary"
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={creating}
                        >
                            {
                                creating
                                    ?
                                    "Creating..."
                                    :
                                    "Create Coupon"
                            }
                        </Button>

                    </Modal.Footer>

                </Form>

            </Modal>






            {/* DELETE MODAL */}
            <Modal
                show={deleteModal}
                centered
                onHide={() => setDeleteModal(false)}
            >

                <Modal.Body>

                    <div className="text-center">

                        <div className="fs-5 fw-semibold mb-4">
                            Delete this coupon?
                        </div>

                        <div className="d-flex justify-content-center gap-2">

                            <Button
                                variant="secondary"
                                onClick={() => setDeleteModal(false)}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="danger"
                                onClick={handleDeleteCoupon}
                                disabled={deleting}
                            >
                                {
                                    deleting
                                        ?
                                        "Deleting..."
                                        :
                                        "Delete"
                                }
                            </Button>

                        </div>

                    </div>

                </Modal.Body>

            </Modal>

        </div>
    );
};

export default CouponPage;