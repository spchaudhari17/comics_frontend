import React, { useEffect, useState } from "react";
import { Badge, Form, Button, Modal } from "react-bootstrap";
import DataTable from "react-data-table-component";
import dataTableCustomStyles from "../../assets/styles/dataTableCustomStyles";
import { NoDataComponent } from "../../components/NoDataComponent";
import { Loader } from "../../lib/loader";
import API from "../../API";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


const ParentManageChildren = () => {
    const navigate = useNavigate()

    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(false);

    const [username, setUsername] = useState("");
    const [adding, setAdding] = useState(false);

    const [search, setSearch] = useState("");

    // Delete modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedChild, setSelectedChild] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // ---------- FETCH CHILDREN ----------
    const fetchChildren = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/user/parent-my-children");

            if (data.success) {
                setChildren(data.children);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChildren();
    }, []);

    // ---------- ADD CHILD ----------
    const handleAddChild = async () => {
        if (!username.trim()) {
            toast.error("Please enter a username.");
            return;
        }

        try {
            setAdding(true);
            const { data } = await API.post("/user/parent-add-child", {
                username,
            });

            if (data.success) {
                toast.success("Child added successfully!");

                setUsername("");
                fetchChildren();
            } else {

                toast.error(data.message || "Failed to add child");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add child");
        } finally {
            setAdding(false);
        }
    };

    // ---------- DELETE CHILD ----------
    const confirmDelete = async () => {
        try {
            setDeleting(true);
            const { data } = await API.post("/user/parent-remove-children", {
                childId: selectedChild._id,
            });

            if (data.success) {
                toast.success("Child removed successfully!");

                setShowDeleteModal(false);
                fetchChildren();
            } else {
                toast.error(data.message || "Failed to delete child");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete child");
        } finally {
            setDeleting(false);
        }
    };

    // ---------- SEARCH ----------
    const filtered = children.filter((c) =>
        c.username.toLowerCase().includes(search.toLowerCase())
    );

    // ---------- TABLE COLUMNS ----------
    const columns = [
        { name: "#", selector: (row, i) => i + 1, width: "60px" },
        {
            name: "Username",
            selector: (row) => row.username,
            sortable: true,
            minWidth: "180px",
        },
        {
            name: "Grade",
            selector: (row) => row.grade || "N/A",
            minWidth: "120px",
            cell: (row) => <Badge bg="info">{row.grade || "N/A"}</Badge>,
        },
        {
            name: "Country",
            selector: (row) => row.country || "N/A",
            minWidth: "140px",
        },
        {
            name: "Linked At",
            selector: (row) => new Date(row.linkedAt).toLocaleDateString(),
            minWidth: "160px",
        },
        {
            name: "Actions",
            minWidth: "200px",
            cell: (row) => (
                <div className="d-flex gap-2">

                    {/* VIEW ACTIVITY BUTTON */}
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate(`/activity/${row._id}`)}
                    >
                        <i className="bi bi-bar-chart"></i> View Activity
                    </Button>

                    {/* DELETE BUTTON */}
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                            setSelectedChild(row);
                            setShowDeleteModal(true);
                        }}
                    >
                        <i className="bi bi-trash"></i>
                    </Button>
                </div>
            ),
        }

    ];


    return (
        <div className="parent-children-page pt-4 pb-3">
            <div className="container-xl">
                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold text-primary">Manage Children</h3>
                    <div className="text-muted">Max allowed: 2</div>
                </div>

                {/* ADD CHILD BOX */}
                <div className="bg-white p-3 rounded-4 shadow-sm mb-4">
                    <h5 className="fw-semibold mb-3">Add Child</h5>

                    <div className="d-flex gap-2">
                        <Form.Control
                            placeholder="Enter child username..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={children.length >= 2}
                        />
                        <Button
                            variant="success"
                            disabled={adding || children.length >= 2}
                            onClick={handleAddChild}
                        >
                            {adding ? "Adding..." : "Add"}
                        </Button>
                    </div>

                    {children.length >= 2 && (
                        <p className="text-danger mt-2">
                            You already linked 2 children. Remove one to add more.
                        </p>
                    )}
                </div>



                {/* CHILDREN TABLE */}
                <div className="bg-white p-3 rounded-4 shadow-sm">
                    {loading ? (
                        <Loader />
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filtered}
                            highlightOnHover
                            responsive
                            pagination
                            striped
                            customStyles={dataTableCustomStyles}
                            noDataComponent={<NoDataComponent />}
                        />
                    )}
                </div>
            </div>

            {/* DELETE MODAL */}
            <Modal
                show={showDeleteModal}
                centered
                onHide={() => setShowDeleteModal(false)}
            >
                <Modal.Body>
                    <div className="content-wrapper text-center">
                        <div
                            className="icon-cover d-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle mx-auto mb-3"
                            style={{ height: "50px", width: "50px" }}
                        >
                            <i className="bi bi-trash3 fs-4 text-danger"></i>
                        </div>
                        <div className="fw-semibold">
                            Are you sure you want to remove <b>{selectedChild?.username}</b>?
                        </div>

                        <div className="d-flex justify-content-center gap-2 mt-4">
                            <Button
                                variant="secondary"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={confirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Removing..." : "Remove"}
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ParentManageChildren;
