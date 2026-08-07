import React, { useEffect, useState } from "react";
import { Badge, Form, Button, Modal } from "react-bootstrap";
import DataTable from "react-data-table-component";
import dataTableCustomStyles from "../../assets/styles/dataTableCustomStyles";
import { NoDataComponent } from "../../components/NoDataComponent";
import { Loader } from "../../lib/loader";
import API from "../../API";
import { toast } from "react-toastify";

const MymarketList = () => {
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Publish Modal states
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [selectedBundleId, setSelectedBundleId] = useState(null);
    const [publishing, setPublishing] = useState(false);

    // Delete Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteBundleId, setDeleteBundleId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // 🔥 Fetch Teacher Bundles
    const fetchBundles = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/user/getTeacherBundles");
            setBundles(data.data || []);
        } catch (err) {
            console.log(err);
            toast.error("Failed to fetch bundles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBundles();
    }, []);

    // 🔍 Search filter
    const filteredBundles = bundles.filter((b) => {
        const searchTerm = search.toLowerCase();
        return (
            b.title?.toLowerCase().includes(searchTerm) ||
            b.status?.toLowerCase().includes(searchTerm)
        );
    });

    // 🚀 Publish Bundle
    const handlePublish = async () => {
        if (!selectedBundleId) return;

        try {
            setPublishing(true);
            const res = await API.post("/user/publishBundle", { bundleId: selectedBundleId });

            if (!res.data.error) {
                toast.success("Bundle published successfully");

                // update UI instantly
                setBundles((prev) =>
                    prev.map((b) =>
                        b._id === selectedBundleId ? { ...b, status: "published" } : b
                    )
                );

                // Close modal
                setShowPublishModal(false);
                setSelectedBundleId(null);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Publish failed");
        } finally {
            setPublishing(false);
        }
    };

    // 🗑️ Delete Bundle (Only for draft)
    const handleDeleteBundle = async () => {
        if (!deleteBundleId) return;

        try {
            setDeleting(true);
            const { data } = await API.delete(`/user/deleteBundle/${deleteBundleId}`);

            if (!data.error) {
                toast.success(data.message || "Bundle deleted successfully");
                // Refresh list
                fetchBundles();
                // Close modal
                setShowDeleteModal(false);
                setDeleteBundleId(null);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete bundle");
        } finally {
            setDeleting(false);
        }
    };

    // 📊 Table Columns
    const columns = [
        {
            name: "#",
            selector: (row, index) => (currentPage - 1) * perPage + index + 1,
            width: "60px",
        },
        {
            name: "Title",
            selector: (row) => row.title,
            sortable: true,
            minWidth: "200px",
        },
        {
            name: "Comics",
            selector: (row) => row.comics?.length || 0,
            sortable: true,
            minWidth: "120px",
        },
        {
            name: "Price",
            selector: (row) => `$${row.price}`,
            sortable: true,
            minWidth: "120px",
        },
        {
            name: "Status",
            cell: (row) => (
                <Badge bg={row.status === "published" ? "success" : "warning"}>
                    {row.status || "draft"}
                </Badge>
            ),
            sortable: true,
            minWidth: "120px",
        },
        {
            name: "Created",
            selector: (row) =>
                new Date(row.createdAt).toLocaleDateString(),
            sortable: true,
            minWidth: "140px",
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className="d-flex gap-2">
                    {/* Publish Button - Only show if not published */}
                    {row.status !== "published" && (
                        <Button
                            size="sm"
                            variant="success"
                            onClick={() => {
                                setSelectedBundleId(row._id);
                                setShowPublishModal(true);
                            }}
                        >
                            <i className="bi bi-cloud-upload me-1"></i>
                            Publish
                        </Button>
                    )}

                    {/* Delete Button - Only show if draft */}
                    {row.status !== "published" && (
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                                setDeleteBundleId(row._id);
                                setShowDeleteModal(true);
                            }}
                        >
                            <i className="bi bi-trash me-1"></i>
                            Delete
                        </Button>
                    )}
                </div>
            ),
            minWidth: "200px",
        },
    ];

    // Get bundle details for modals
    const selectedBundle = bundles.find(b => b._id === selectedBundleId);
    const deleteBundle = bundles.find(b => b._id === deleteBundleId);

    return (
        <div className="contact-list-page pt-4 pb-3">
            <div className="container-xl">
                {loading ? (
                    <Loader />
                ) : (
                    <div className="info-wrapper bg-white rounded-4 p-3">

                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="main-heading">My Bundles</div>
                            <div className="fs-5 fw-semibold text-primary">
                                Total: {bundles.length}
                            </div>
                        </div>

                        {/* Note */}
                        <div className="alert alert-info d-flex align-items-center mb-3">
                            <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                            <div>
                                <strong>Please publish your bundle</strong> to make it available in the marketplace.
                                Once published, you cannot delete or unpublish the bundle.
                            </div>
                        </div>

                        {/* Search */}
                        <div className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="Search by title or status..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Table */}
                        <div className="table-responsive table-custom-wrapper">
                            <DataTable
                                columns={columns}
                                data={filteredBundles}
                                highlightOnHover
                                responsive
                                pagination
                                striped
                                customStyles={dataTableCustomStyles}
                                noDataComponent={<NoDataComponent />}
                                onChangePage={(page) => setCurrentPage(page)}
                                onChangeRowsPerPage={(rows) => setPerPage(rows)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Publish Confirmation Modal */}
            <Modal
                show={showPublishModal}
                onHide={() => {
                    setShowPublishModal(false);
                    setSelectedBundleId(null);
                }}
                centered
                size="lg"
            >
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="d-flex align-items-center">
                        <i className="bi bi-exclamation-triangle-fill text-warning me-2 fs-3"></i>
                        Confirm Publish
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="text-center py-3">
                        <div className="mb-3">
                            <i className="bi bi-cloud-upload fs-1 text-success"></i>
                        </div>
                        <h5 className="fw-bold mb-3">Are you sure you want to publish this bundle?</h5>

                        <div className="alert alert-warning d-flex align-items-start">
                            <i className="bi bi-info-circle-fill me-2 fs-5 mt-1"></i>
                            <div className="text-start">
                                <strong>Important Note:</strong>
                                <ul className="mb-0 mt-1 ps-3">
                                    <li>Once published, the bundle will be visible to all users in the marketplace</li>
                                    <li><strong className="text-danger">You cannot delete or unpublish this bundle after publishing</strong></li>
                                    <li>Make sure all comics in the bundle are ready and approved</li>
                                    <li>You can still edit the bundle details after publishing</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-light p-3 rounded-3 mt-3">
                            <p className="mb-1"><strong>Bundle:</strong> {selectedBundle?.title || "Loading..."}</p>
                            <p className="mb-1"><strong>Price:</strong> ${selectedBundle?.price || "0"}</p>
                            <p className="mb-0"><strong>Comics:</strong> {selectedBundle?.comics?.length || 0} comics</p>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer className="border-0">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowPublishModal(false);
                            setSelectedBundleId(null);
                        }}
                        disabled={publishing}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="success"
                        onClick={handlePublish}
                        disabled={publishing}
                        className="px-4"
                    >
                        {publishing ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Publishing...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-cloud-upload me-2"></i>
                                Yes, Publish Bundle
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                show={showDeleteModal}
                onHide={() => {
                    setShowDeleteModal(false);
                    setDeleteBundleId(null);
                }}
                centered
            >
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="d-flex align-items-center">
                        <i className="bi bi-exclamation-triangle-fill text-danger me-2 fs-3"></i>
                        Confirm Delete
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="text-center py-3">
                        <div className="mb-3">
                            <i className="bi bi-trash fs-1 text-danger"></i>
                        </div>
                        <h5 className="fw-bold mb-3">Are you sure you want to delete this bundle?</h5>

                        <div className="alert alert-danger d-flex align-items-start">
                            <i className="bi bi-exclamation-circle-fill me-2 fs-5 mt-1"></i>
                            <div className="text-start">
                                <strong>Warning:</strong>
                                <ul className="mb-0 mt-1 ps-3">
                                    <li>This action <strong className="text-danger">cannot be undone</strong></li>
                                    <li>All comics in this bundle will be <strong>removed from the bundle</strong></li>
                                    <li>The comics themselves will <strong>not be deleted</strong></li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-light p-3 rounded-3 mt-3">
                            <p className="mb-1"><strong>Bundle:</strong> {deleteBundle?.title || "Loading..."}</p>
                            <p className="mb-1"><strong>Status:</strong> <Badge bg="warning">{deleteBundle?.status || "draft"}</Badge></p>
                            <p className="mb-0"><strong>Comics:</strong> {deleteBundle?.comics?.length || 0} comics</p>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer className="border-0">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowDeleteModal(false);
                            setDeleteBundleId(null);
                        }}
                        disabled={deleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDeleteBundle}
                        disabled={deleting}
                        className="px-4"
                    >
                        {deleting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-trash me-2"></i>
                                Yes, Delete Bundle
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            <style jsx>{`
                .main-heading {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #2c3e50;
                }
                .info-wrapper {
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }
                .table-custom-wrapper {
                    margin-top: 0.5rem;
                }
            `}</style>
        </div>
    );
};

export default MymarketList;