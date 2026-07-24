import React, { useEffect, useState } from "react";
import { Button, Badge, Card, Row, Col, Form, Modal, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { Loader } from "../../lib/loader";
import API from "../../API";
import dataTableCustomStyles from "../../assets/styles/dataTableCustomStyles";
import { NoDataComponent } from "../../components/NoDataComponent";

const MyComics = () => {
  const navigate = useNavigate();
  const [comics, setComics] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [selectedComics, setSelectedComics] = useState([]);
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [bundleCreating, setBundleCreating] = useState(false);

  const [bundleData, setBundleData] = useState({
    title: "",
    description: "",
    price: ""
  });

  // FETCH SUBSCRIPTION
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data } = await API.get("/subscription/me");
        setSubscription(data);
      } catch {
        setSubscription(null);
      } finally {
        setSubLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  // FETCH COMICS
  useEffect(() => {
    const fetchComics = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/user/my-comics");
        setComics(data.comics || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch comics");
      } finally {
        setLoading(false);
      }
    };
    fetchComics();
  }, []);

  // PLAN FLAGS
  const planType = subscription?.planType || "FREE";
  const isFreeUser = planType === "FREE";
  const isDashboardUser = planType === "dashboard";
  const isBundleUser = planType === "bundle";
  const isUnlimitedUser = planType === "unlimited";
  const totalComicsCreated = comics.length;

  // Get approved comics count
  const approvedComics = comics.filter(c => c.status === "approved");
  const approvedCount = approvedComics.length;

  const handleResume = (comic) => {
    if (comic.seriesId) {
      navigate("/create-comic", {
        state: { comicId: comic._id, seriesId: comic.seriesId },
      });
    } else {
      navigate("/create-comic", { state: { comicId: comic._id } });
    }
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

  const getComicStatusBadge = (comicStatus) => {
    switch (comicStatus) {
      case "published":
        return <Badge bg="primary">Published</Badge>;
      case "draft":
        return <Badge bg="secondary">Draft</Badge>;
      default:
        return <Badge bg="dark">N/A</Badge>;
    }
  };

  const handleSelectComic = (comicId) => {
    if (selectedComics.includes(comicId)) {
      setSelectedComics(selectedComics.filter(id => id !== comicId));
    } else {
      setSelectedComics([...selectedComics, comicId]);
    }
  };

  const handleSelectAllApproved = () => {
    const approvedIds = approvedComics.map(c => c._id);
    if (selectedComics.length === approvedIds.length && approvedIds.every(id => selectedComics.includes(id))) {
      setSelectedComics([]);
    } else {
      setSelectedComics(approvedIds);
    }
  };

  const handleCreateBundle = async () => {
    try {
      if (!bundleData.title || !bundleData.price) {
        alert("Title and price are required");
        return;
      }

      setBundleCreating(true);

      const payload = {
        title: bundleData.title,
        description: bundleData.description,
        price: bundleData.price,
        comics: selectedComics
      };

      const { data } = await API.post("/user/createBundle", payload);

      if (!data.error) {
        setShowSuccessAlert(true);
        setShowBundleModal(false);
        setSelectedComics([]);
        setBundleData({
          title: "",
          description: "",
          price: ""
        });

        // Refresh comics list
        const { data: comicsData } = await API.get("/user/my-comics");
        setComics(comicsData.comics || []);

        // Hide success alert after 5 seconds
        setTimeout(() => setShowSuccessAlert(false), 5000);
      }

    } catch (err) {
      alert(err.response?.data?.message || "Error creating bundle");
    } finally {
      setBundleCreating(false);
    }
  };

  // Filter comics based on search input
  const filteredComics = comics.filter((comic) => {
    const searchTerm = search.toLowerCase();
    return (
      comic.title?.toLowerCase().includes(searchTerm) ||
      comic.subject?.toLowerCase().includes(searchTerm) ||
      comic.status?.toLowerCase().includes(searchTerm) ||
      comic.comicStatus?.toLowerCase().includes(searchTerm) ||
      (comic.seriesId && `part ${comic.partNumber}`.includes(searchTerm))
    );
  });

  // Check if all approved comics are selected
  const allApprovedSelected = approvedComics.length > 0 &&
    approvedComics.every(c => selectedComics.includes(c._id));

  const columns = [
    {
      name: (
        <Form.Check
          type="checkbox"
          checked={allApprovedSelected}
          onChange={handleSelectAllApproved}
          disabled={approvedComics.length === 0}
          title={approvedComics.length === 0 ? "No approved comics to select" : "Select all approved comics"}
        />
      ),
      width: "50px",
      cell: (row) => (
        <Form.Check
          type="checkbox"
          checked={selectedComics.includes(row._id)}
          disabled={row.status !== "approved"}
          onChange={() => handleSelectComic(row._id)}
          title={row.status !== "approved" ? "Only approved comics can be bundled" : ""}
        />
      )
    },
    {
      name: "Title",
      sortable: true,
      minWidth: "200px",
      cell: row => (
        <div className="fw-semibold text-capitalize">{row.title}</div>
      ),
    },
    {
      name: "Subject",
      selector: row => row.subject,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Part",
      selector: row => (row.seriesId ? `Part ${row.partNumber}` : "-"),
      sortable: true,
      minWidth: "110px",
    },
    {
      name: "Status",
      cell: row => getStatusBadge(row.status),
      sortable: true,
      minWidth: "130px",
    },
    {
      name: "Comic Status",
      cell: row => getComicStatusBadge(row.comicStatus),
      sortable: true,
      minWidth: "140px",
    },
    {
      name: "Created",
      selector: row => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
      minWidth: "130px",
    },
    {
      name: "Details",
      cell: row => (
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-info" onClick={() => navigate(`/my-comics-details/${row._id}`)} >
            <i className="bi bi-eye me-1"></i> Details
          </Button>
        </div>
      ),
      minWidth: "120px",
    },
    {
      name: "Actions",
      cell: (row) => {
        if (row.comicStatus !== "draft") return null;

        if (isDashboardUser) return null;

        if (isFreeUser && totalComicsCreated >= 1) {
          return null;
        }

        return (
          <Button
            size="sm"
            variant="outline-warning"
            onClick={() => handleResume(row)}
          >
            <i className="bi bi-pencil-square me-1"></i> Resume
          </Button>
        );
      },
    },
  ];

  return (
    <div className="my-comics-page py-4">
      <div className="container-xl">
        {loading ? (
          <Loader />
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <>
            {/* Success Alert */}
            {showSuccessAlert && (
              <Alert variant="success" className="mb-4 d-flex align-items-center">
                <i className="bi bi-check-circle-fill me-2 fs-4"></i>
                <div>
                  <strong>Bundle created successfully!</strong> Your bundle has been created and is now available in your store.
                </div>
                <Button
                  variant="outline-success"
                  size="sm"
                  className="ms-auto"
                  onClick={() => setShowSuccessAlert(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </Button>
              </Alert>
            )}

            {/* Stats Cards */}
            <Row className="g-3 mb-4">
              <Col md={3}>
                <div className="bg-warning bg-opacity-25 rounded-4 border-bottom border-4 border-warning p-3 text-center">
                  <div className="fs-3 fw-bold text-warning">
                    {comics.filter((c) => c.status === "pending").length}
                  </div>
                  <div className="fw-semibold text-muted">Pending</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="bg-success bg-opacity-25 rounded-4 border-bottom border-4 border-success p-3 text-center">
                  <div className="fs-3 fw-bold text-success">
                    {approvedCount}
                  </div>
                  <div className="fw-semibold text-muted">Approved</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="bg-danger bg-opacity-25 rounded-4 border-bottom border-4 border-danger p-3 text-center">
                  <div className="fs-3 fw-bold text-danger">
                    {comics.filter((c) => c.status === "rejected").length}
                  </div>
                  <div className="fw-semibold text-muted">Rejected</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="bg-info bg-opacity-25 rounded-4 border-bottom border-4 border-info p-3 text-center">
                  <div className="fs-3 fw-bold text-info">{comics.length}</div>
                  <div className="fw-semibold text-muted">Total</div>
                </div>
              </Col>
            </Row>

            {/* Bundle Creation Guide - Shows when approved comics exist */}
            {approvedCount > 0 && (
              <Alert variant="info" className="mb-4 d-flex align-items-start">
                <i className="bi bi-lightbulb-fill me-2 fs-4 mt-1"></i>
                <div>
                  <strong>Create a Bundle:</strong>
                  <ul className="mb-0 mt-1 ps-3">
                    <li>Select <strong>approved comics</strong> by ticking the checkboxes in the first column</li>
                    <li>Click the <strong>"Create Bundle"</strong> button (shows selected count)</li>
                    <li>You can select multiple comics to create a collection</li>
                  </ul>
                </div>
              </Alert>
            )}

            {/* Main Table */}
            <div className="info-wrapper">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="main-heading">My Comics</div>
                  {approvedCount > 0 && (
                    <Badge bg="success" className="p-2">
                      <i className="bi bi-check-circle me-1"></i>
                      {approvedCount} Approved
                    </Badge>
                  )}
                </div>

                <div className="d-flex gap-2 align-items-center flex-wrap">
                  {/* Search Box */}
                  <div className="search-wrapper" style={{ minWidth: "250px" }}>
                    <Form.Control
                      type="search"
                      placeholder="Search comics..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="rounded-3"
                    />
                  </div>

                  {/* Bundle Creation Button - Prominent */}
                  <Button
                    variant="primary"
                    className="px-4 position-relative"
                    disabled={selectedComics.length === 0}
                    onClick={() => setShowBundleModal(true)}
                  >
                    <i className="bi bi-collection me-2"></i>
                    Create Bundle
                    {selectedComics.length > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {selectedComics.length}
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Selection Info Bar */}
              {selectedComics.length > 0 && (
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 mb-3 d-flex justify-content-between align-items-center">
                  <div>
                    <i className="bi bi-check-square-fill text-primary me-2"></i>
                    <strong>{selectedComics.length}</strong> comic{selectedComics.length > 1 ? 's' : ''} selected
                    {selectedComics.length > 1 && (
                      <span className="text-muted ms-2">(Ready for bundle)</span>
                    )}
                  </div>
                  <Button
                    variant="link"
                    className="text-decoration-none p-0"
                    onClick={() => setSelectedComics([])}
                  >
                    Clear All
                  </Button>
                </div>
              )}

              {/* No approved comics message */}
              {approvedCount === 0 && comics.length > 0 && (
                <Alert variant="warning" className="mb-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  You don't have any approved comics yet. Only approved comics can be added to bundles.
                </Alert>
              )}

              <div className="table-responsive table-custom-wrapper">
                <DataTable
                  columns={columns}
                  data={filteredComics}
                  highlightOnHover
                  pagination
                  responsive
                  striped
                  customStyles={dataTableCustomStyles}
                  noDataComponent={<NoDataComponent />}
                  onChangePage={(page) => setCurrentPage(page)}
                  onChangeRowsPerPage={(rows) => setPerPage(rows)}
                />
              </div>
            </div>

            {/* Create Bundle Modal */}
            <Modal
              show={showBundleModal}
              onHide={() => setShowBundleModal(false)}
              centered
              size="lg"
            >
              <Modal.Header closeButton className="border-0">
                <Modal.Title className="d-flex align-items-center">
                  <i className="bi bi-collection me-2 text-primary fs-3"></i>
                  <div>
                    <div>Create Bundle</div>
                    <small className="text-muted fs-6 fw-normal">
                      {selectedComics.length} comic{selectedComics.length > 1 ? 's' : ''} selected
                    </small>
                  </div>
                </Modal.Title>
              </Modal.Header>

              <Modal.Body className="pt-0">
                {/* Selected Comics Preview */}
                <div className="bg-light p-3 rounded-3 mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong className="text-muted">Selected Comics:</strong>
                    <Badge bg="primary">{selectedComics.length}</Badge>
                  </div>
                  <div className="d-flex flex-wrap gap-1">
                    {selectedComics.slice(0, 5).map(id => {
                      const comic = comics.find(c => c._id === id);
                      return comic ? (
                        <Badge bg="secondary" className="me-1" key={id}>
                          {comic.title}
                        </Badge>
                      ) : null;
                    })}
                    {selectedComics.length > 5 && (
                      <Badge bg="secondary">+{selectedComics.length - 5} more</Badge>
                    )}
                  </div>
                  <div className="mt-2 text-muted small">
                    <i className="bi bi-info-circle me-1"></i>
                    Bundle will include all selected comics
                  </div>
                </div>

                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      Bundle Title <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., Adventure Collection Vol. 1"
                      value={bundleData.title}
                      onChange={(e) =>
                        setBundleData({ ...bundleData, title: e.target.value })
                      }
                      className="rounded-3"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Describe what makes this bundle special..."
                      value={bundleData.description}
                      onChange={(e) =>
                        setBundleData({ ...bundleData, description: e.target.value })
                      }
                      className="rounded-3"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      Price (₹) <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter bundle price"
                      value={bundleData.price}
                      onChange={(e) =>
                        setBundleData({ ...bundleData, price: e.target.value })
                      }
                      className="rounded-3"
                      min="0"
                      step="0.01"
                    />
                    <Form.Text className="text-muted">
                      Set a competitive price for your comic bundle
                    </Form.Text>
                  </Form.Group>
                </Form>
              </Modal.Body>

              <Modal.Footer className="border-0">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowBundleModal(false);
                    setBundleData({ title: "", description: "", price: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateBundle}
                  disabled={!bundleData.title || !bundleData.price || bundleCreating}
                  className="px-4"
                >
                  {bundleCreating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-2"></i>
                      Create Bundle
                    </>
                  )}
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        )}
      </div>

      {/* Custom CSS - Add to your styles */}
      <style jsx>{`
        .my-comics-page .main-heading {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c3e50;
        }
        .my-comics-page .info-wrapper {
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .my-comics-page .table-custom-wrapper {
          margin-top: 0.5rem;
        }
        .my-comics-page .search-wrapper input {
          border: 1px solid #e0e0e0;
          transition: all 0.3s ease;
        }
        .my-comics-page .search-wrapper input:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13,110,253,0.25);
        }
        @media (max-width: 768px) {
          .my-comics-page .d-flex.flex-wrap {
            flex-direction: column;
            align-items: stretch !important;
          }
          .my-comics-page .search-wrapper {
            min-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MyComics;