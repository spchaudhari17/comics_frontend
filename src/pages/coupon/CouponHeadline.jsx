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

const CouponHeadlinePage = () => {

    const [headlines, setHeadlines] = useState([]);
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

        headline: "",
        couponId: "",
        status: true

    });



    // FETCH BANNERS
    const fetchHeadlines = async () => {

        try {

            setLoading(true);

            const { data } = await API.get(
                "/admin/coupon-banner/list"
            );

            if (data.success) {

                setHeadlines(data.data);
            }

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Failed to fetch coupon banners"
            );

        } finally {

            setLoading(false);
        }
    };



    // FETCH COUPONS
    const fetchCoupons = async () => {

        try {

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
        }
    };



    useEffect(() => {

        fetchHeadlines();

        fetchCoupons();

    }, []);



    // HANDLE INPUT
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({

            ...formData,

            [name]:
                name === "status"
                    ? value === "true"
                    : value

        });
    };



    // CREATE BANNER
    const handleCreateHeadline = async (e) => {

        e.preventDefault();

        try {

            setCreating(true);

            const { data } = await API.post(

                "/admin/coupon-banner/create",

                formData

            );

            if (data.success) {

                toast.success(
                    data.message ||
                    "Coupon banner created successfully"
                );

                setShowModal(false);

                fetchHeadlines();

                setFormData({

                    headline: "",
                    couponId: "",
                    status: true

                });
            }

        } catch (error) {

            toast.error(

                error.response?.data?.message ||
                "Failed to create banner"

            );

        } finally {

            setCreating(false);
        }
    };



    // DELETE BANNER
    const handleDeleteHeadline = async () => {

        try {

            setDeleting(true);

            const { data } = await API.delete(`/admin/coupon-banner/delete/${deleteId}`);

            if (data.success) {

                toast.success(
                    data.message ||
                    "Coupon banner deleted successfully"
                );

                setDeleteModal(false);

                fetchHeadlines();
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



    // SEARCH
    const filteredHeadlines = headlines.filter((item) => {

        const term = search.toLowerCase();

        return (

            item.headline?.toLowerCase().includes(term) ||

            item.couponId?.code
                ?.toLowerCase()
                .includes(term)

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
            name: "Headline",
            selector: (row) => row.headline,
            grow: 3,
            wrap: true
        },

        {
            name: "Coupon Code",
            minWidth: "150px",
            cell: (row) => (
                <Badge bg="dark">
                    {row?.couponId?.code || "-"}
                </Badge>
            )
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
            minWidth: "150px",
            selector: (row) =>
                new Date(
                    row.createdAt
                ).toLocaleDateString()
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
                                    Coupon Banners
                                </div>

                                <Button
                                    onClick={() => setShowModal(true)}
                                >
                                    Create Banner
                                </Button>

                            </div>



                            {/* SEARCH */}

                            <div className="mb-3">

                                <Form.Control

                                    placeholder="Search banner..."

                                    value={search}

                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }

                                />

                            </div>



                            {/* TABLE */}

                            <DataTable

                                columns={columns}

                                data={filteredHeadlines}

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
                        Create Coupon Banner
                    </Modal.Title>

                </Modal.Header>

                <Form onSubmit={handleCreateHeadline}>

                    <Modal.Body>

                        <Row>

                            <Col md={12}>

                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Headline
                                    </Form.Label>

                                    <Form.Control

                                        as="textarea"

                                        rows={4}

                                        name="headline"

                                        value={formData.headline}

                                        onChange={handleChange}

                                        placeholder="Use code FIRSTFREE to get 100% off the Starter Pack for your first month."

                                        required

                                    />

                                </Form.Group>

                            </Col>



                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Coupon
                                    </Form.Label>

                                    <Form.Select

                                        name="couponId"

                                        value={formData.couponId}

                                        onChange={handleChange}

                                    >

                                        <option value="">
                                            Select Coupon
                                        </option>

                                        {

                                            coupons.map((coupon) => (

                                                <option

                                                    key={coupon._id}

                                                    value={coupon._id}

                                                >

                                                    {coupon.code}

                                                </option>

                                            ))

                                        }

                                    </Form.Select>

                                </Form.Group>

                            </Col>



                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Status
                                    </Form.Label>

                                    <Form.Select

                                        name="status"

                                        value={String(formData.status)}

                                        onChange={handleChange}

                                    >

                                        <option value="true">
                                            Active
                                        </option>

                                        <option value="false">
                                            Inactive
                                        </option>

                                    </Form.Select>

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
                                    "Create Banner"
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
                            Delete this banner?
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
                                onClick={handleDeleteHeadline}
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

export default CouponHeadlinePage;
