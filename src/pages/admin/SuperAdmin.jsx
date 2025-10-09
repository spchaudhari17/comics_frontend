import React, { useEffect, useState } from "react";
import { Table, Button, Badge, Card, Row, Col, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { listAllComicsAdmin, updateComicStatus } from "../../redux/actions/adminComicsActions";
import { deleteComic } from "../../redux/actions/comicActions";
import { Loader } from "../../lib/loader";

// react-data-table-component
import DataTable from 'react-data-table-component';
import dataTableCustomStyles from '../../assets/styles/dataTableCustomStyles';
import { NoDataComponent } from '../../components/NoDataComponent';

export const SuperAdmin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedComicId, setSelectedComicId] = useState(null);
  const [search, setSearch] = useState("");

  // Redux state
  const { loading, error, comics } = useSelector((state) => state.adminComicList);
  const { loading: updating, success: statusUpdated } = useSelector((state) => state.adminComicUpdateStatus);
  const { loading: deleting, success: deleteSuccess, error: deleteError, message: deleteMessage } = useSelector(
    (state) => state.deleteComic
  );

  useEffect(() => {
    dispatch(listAllComicsAdmin());
  }, [dispatch, statusUpdated, deleteSuccess]);

  // Auto-close modal and refresh after deletion
  useEffect(() => {
    if (deleteSuccess) {
      // alert(deleteMessage || "Comic deleted successfully!");
      setShowDeleteModal(false);
      setSelectedComicId(null);
      dispatch(listAllComicsAdmin());
    }
    if (deleteError) {
      alert(deleteError);
    }
  }, [deleteSuccess, deleteError, deleteMessage, dispatch]);

  const handleStatusChange = (comicId, newStatus) => {
    dispatch(updateComicStatus(comicId, newStatus));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge bg="success">Approved</Badge>;
      case "rejected":
        return <Badge bg="danger">Rejected</Badge>;
      case "pending":
        return <Badge bg="warning">Pending</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const openDeleteModal = (comicId) => {
    setSelectedComicId(comicId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedComicId) {
      dispatch(deleteComic(selectedComicId));
    }
  };

  const handleClose = () => {
    setShowDeleteModal(false);
    setSelectedComicId(null);
  };


  //  Filtered comics based on search term
  const filteredComics = comics.filter((comic) => {
    const searchTerm = search.toLowerCase();
    return (
      comic?.user_id?.firstname?.toLowerCase().includes(searchTerm) ||
      comic?.user_id?.email?.toLowerCase().includes(searchTerm) ||
      comic?.subject?.toLowerCase().includes(searchTerm) ||
      comic?.title?.toLowerCase().includes(searchTerm) ||
      comic?.user_id?.userType?.toLowerCase().includes(searchTerm)
    );
  });

  const columns = [
    // {
    //   name: "#",
    //   selector: (row, index) => index + 1,
    //   width: "60px",
    // },
    {
      name: "Creator Name",
      selector: row => row.user_id?.firstname || "Unknown",
      sortable: true,
      minWidth: '150px',
      cell: row => <div className="creator_name fw-medium text-capitalize">{row.user_id?.firstname || "Unknown"}</div>
    },
    {
      name: "Email",
      selector: row => row.user_id?.email || "N/A",
      sortable: true,
      minWidth: '200px',
    },
    {
      name: "User Type",
      selector: row => row.user_id?.userType || "N/A",
      sortable: true,
      cell: row => (
        <Badge bg="info">
          {row.user_id?.userType || "N/A"}
        </Badge>
      ),
    },
    {
      name: "Subject",
      selector: row => row.subject,
      sortable: true,
    },
    {
      name: "Comic Title",
      selector: row => row.title,
      sortable: true,
      minWidth: '180px',
    },
    {
      name: "Comic Viewer",
      minWidth: '150px',
      cell: row => (
        <Button size="sm" variant="link"
          onClick={() => window.open(row.pdfUrl, "_blank", "noopener,noreferrer")}
          disabled={!row.pdfUrl}
        >
          <i className="bi bi-filetype-pdf me-1"></i> View Comic
        </Button>
      ),
    },
    {
      name: "Status",
      cell: row => getStatusBadge(row.status),
      sortable: true,
    },
    {
      name: "Created",
      selector: row => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
      minWidth: '120px',
    },
    {
      name: "Country",
      minWidth: "180px",
      cell: row => (
        row.country ? (
          <div className="d-flex align-items-center gap-2">
            <img
              src={`https://flagcdn.com/24x18/${row.country.toLowerCase()}.png`}
              alt={row.country}
              style={{ borderRadius: "2px" }}
            />
            <span className="text-capitalize">{row.country}</span>
          </div>
        ) : "N/A"
      ),
    },


    {
      name: "Actions",
      minWidth: '180px',
      cell: row => (
        <div className="d-flex align-items-center gap-2">
          {row.status === "pending" ? (
            <div className="d-flex gap-2">
              <Button size="sm" variant="success" className="px-2" onClick={() => handleStatusChange(row._id, "approved")} >
                Accept
              </Button>
              <Button size="sm" variant="danger" className="px-2" onClick={() => handleStatusChange(row._id, "rejected")} >
                Decline
              </Button>
            </div>
          ) : (
            <div className="">
              {row.status === "approved" ? "Approved" : "Rejected"}
            </div>
          )}

          {(row.status === "approved" || row.status === "rejected") && (
            <Button size="sm" variant="outline-danger" onClick={() => openDeleteModal(row._id)} >
              <i className="bi bi-trash3"></i>
            </Button>
          )}
        </div>
      ),
    },

    {
      name: "Details",
      width: "130px",
      center: true,
      cell: (row) => (
        <Button
          size="sm"
          variant="outline-primary"
          onClick={() => navigate(`/comic-details/${row._id}`)}
        >
          View
        </Button>
      ),
    },

  ];

  return (
    <div className="super-admin-page pt-4 pb-3">
      <div className="container-xl">
        {loading ? (
          <Loader />
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <>
            {/* Stats Cards */}
            <Row className="g-3 mb-4">
              <Col md={3}>
                <div className="bg-primary bg-opacity-25 rounded-4 border-bottom border-4 border-primary p-3">
                  <div className="fs-3 fw-bold text-primary lh-sm mb-1">{comics.filter(c => c.status === "pending").length}</div>
                  <div className="title-name text-body">Pending</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="bg-success bg-opacity-25 rounded-4 border-bottom border-4 border-success p-3">
                  <div className="fs-3 fw-bold text-success lh-sm mb-1">{comics.filter(c => c.status === "approved").length}</div>
                  <div className="title-name text-body">Approved</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="bg-danger bg-opacity-25 rounded-4 border-bottom border-4 border-danger p-3">
                  <div className="fs-3 fw-bold text-danger lh-sm mb-1">{comics.filter(c => c.status === "rejected").length}</div>
                  <div className="title-name text-body">Rejected</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="bg-info bg-opacity-25 rounded-4 border-bottom border-4 border-info p-3">
                  <div className="fs-3 fw-bold text-info lh-sm mb-1">{comics.length}</div>
                  <div className="title-name text-body">Total</div>
                </div>
              </Col>
            </Row>

            {/* Comics Table */}
            <div className="info-wrapper">
              <div className="main-heading mb-3">Creator Submissions -</div>

              {/* 🔍 Search Box */}
              <div className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Search by name, email, title, or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className='table-responsive table-custom-wrapper'>
                <DataTable
                  columns={columns}
                  // data={comics}
                  data={filteredComics}
                  highlightOnHover
                  responsive
                  pagination
                  customStyles={dataTableCustomStyles}
                  noDataComponent={<NoDataComponent />}
                  striped
                />
              </div>
              {updating && <p className="text-info">Updating status...</p>}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} centered onHide={handleClose}>
              <Modal.Body>
                <div className="content-wrapper text-center">
                  <div className="icon-cover d-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle mx-auto mb-3"
                    style={{ height: '50px', width: '50px' }}>
                    <i className="bi bi-trash3 fs-4 text-danger"></i>
                  </div>
                  <div className="fs-18 fw-semibold lh-sm">Are you sure you want to delete this comic?</div>
                  <div className="btn-wrapper d-flex flex-wrap justify-content-center gap-2 mt-4">
                    <Button variant="secondary" className="px-4 py-2" onClick={handleClose}>Cancel</Button>
                    <Button
                      variant="danger"
                      className="px-4 py-2"
                      onClick={handleDeleteConfirm}
                      disabled={deleting}
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </Modal.Body>
            </Modal>
          </>
        )}
      </div>
    </div>
  );
};
