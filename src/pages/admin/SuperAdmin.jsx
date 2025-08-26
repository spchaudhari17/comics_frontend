import React, { useEffect, useState } from "react";
import { Table, Button, Badge, Card, Row, Col, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { listAllComicsAdmin, updateComicStatus } from "../../redux/actions/adminComicsActions";
import { deleteComic } from "../../redux/actions/comicActions";
import { Loader } from "../../lib/loader";

export const SuperAdmin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedComicId, setSelectedComicId] = useState(null);

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
        return <Badge bg="warning" text="dark">Pending</Badge>;
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
            <Row className="g-4 mb-4">
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-primary mb-1">{comics.filter(c => c.status === "pending").length}</h3>
                    <p className="text-muted mb-0">Pending</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-success mb-1">{comics.filter(c => c.status === "approved").length}</h3>
                    <p className="text-muted mb-0">Approved</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-danger mb-1">{comics.filter(c => c.status === "rejected").length}</h3>
                    <p className="text-muted mb-0">Rejected</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-info mb-1">{comics.length}</h3>
                    <p className="text-muted mb-0">Total</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Comics Table */}
            <Card>
              <Card.Header>
                <h5 className="mb-0">Creator Submissions</h5>
              </Card.Header>
              <Card.Body>
                {updating && <p className="text-info">Updating status...</p>}
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Creator Name</th>
                      <th>Email</th>
                      <th>User Type</th>
                      <th>Subject</th>
                      <th>Comic Title</th>
                      <th>Comic Viewer</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comics.map((comic, index) => (
                      <tr key={comic._id}>
                        <td>{index + 1}</td>
                        <td><strong>{comic.user_id?.firstname || "Unknown"}</strong></td>
                        <td>{comic.user_id?.email || "N/A"}</td>
                        <td>
                          <Badge bg="info" className="text-white">{comic.user_id?.userType || "N/A"}</Badge>
                        </td>
                        <td>{comic.subject}</td>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: "150px" }} title={comic.title}>
                            {comic.title}
                          </div>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => window.open(comic.pdfUrl, "_blank", "noopener,noreferrer")}
                            disabled={!comic.pdfUrl}
                          >
                            <i className="bi bi-filetype-pdf me-1"></i>
                            View Comic
                          </Button>
                        </td>
                        <td>{getStatusBadge(comic.status)}</td>
                        <td>{new Date(comic.createdAt).toLocaleDateString()}</td>
                        <td>
                          {comic.status === "pending" ? (
                            <div className="d-flex gap-2">
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleStatusChange(comic._id, "approved")}
                              >
                                <i className="bi bi-check-lg me-1"></i>
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleStatusChange(comic._id, "rejected")}
                              >
                                <i className="bi bi-x-lg me-1"></i>
                                Decline
                              </Button>
                            </div>
                          ) : (
                            <div className="text-muted small">
                              {comic.status === "approved" ? "Approved" : "Rejected"}
                            </div>
                          )}

                          {(comic.status === "approved" || comic.status === "rejected") && (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => openDeleteModal(comic._id)}
                            >
                              <i className="bi bi-trash3 me-1"></i>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} centered onHide={handleClose}>
              <Modal.Body className="text-center px-md-5 py-5">
                <div
                  className="icon-cover d-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle mx-auto mb-3"
                  style={{ height: '50px', width: '50px' }}
                >
                  <i className="bi bi-exclamation-triangle fs-4 text-danger"></i>
                </div>
                <div className="fs-18 fw-semibold lh-sm mb-3 pb-1">Are you sure you want to delete this comic?</div>
                <div className="btn-wrapper d-flex flex-wrap justify-content-center gap-2">
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
              </Modal.Body>
            </Modal>
          </>
        )}
      </div>
    </div>
  );
};
