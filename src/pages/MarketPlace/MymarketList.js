import React, { useEffect, useState } from "react";
import { Badge, Form, Button } from "react-bootstrap";
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
    const handlePublish = async (bundleId) => {
        try {
            const res = await API.post("/user/publishBundle", { bundleId });

            if (!res.data.error) {
                toast.success("Bundle published successfully");

                // update UI instantly
                setBundles((prev) =>
                    prev.map((b) =>
                        b._id === bundleId ? { ...b, status: "published" } : b
                    )
                );
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Publish failed");
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
            selector: (row) => `₹${row.price}`,
            sortable: true,
            minWidth: "120px",
        },
        {
            name: "Status",
            cell: (row) => (
                <Badge bg={row.status === "published" ? "success" : "secondary"}>
                    {row.status}
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

                    {/* Publish Button */}
                    {row.status !== "published" && (
                        <Button
                            size="sm"
                            variant="success"
                            onClick={() => handlePublish(row._id)}
                        >
                            Publish
                        </Button>
                    )}

                </div>
            ),
            minWidth: "150px",
        },
    ];

    return (
        <div className="contact-list-page pt-4 pb-3">
            <div className="container-xl">
                {loading ? (
                    <Loader />
                ) : (
                    <div className="info-wrapper bg-white rounded-4 p-3">

                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="main-heading">My Bundles -</div>
                            <div className="fs-5 fw-semibold text-primary">
                                Total: {bundles.length}
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
        </div>
    );
};

export default MymarketList;