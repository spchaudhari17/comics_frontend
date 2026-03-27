import React, { useEffect, useState } from "react";
import { Button, Badge, Card, Row, Col, Form, Modal } from "react-bootstrap";
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

  //  PLAN FLAGS
  const planType = subscription?.planType || "FREE";

  const isFreeUser = planType === "FREE";
  const isDashboardUser = planType === "dashboard";
  const isBundleUser = planType === "bundle";
  const isUnlimitedUser = planType === "unlimited";

  const totalComicsCreated = comics.length;




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

  const handleCreateBundle = async () => {
    try {
      if (!bundleData.title || !bundleData.price) {
        alert("Title and price required");
        return;
      }

      const payload = {
        title: bundleData.title,
        description: bundleData.description,
        price: bundleData.price,
        comics: selectedComics
      };

      const { data } = await API.post("/user/createBundle", payload);

      if (!data.error) {
        alert("Bundle created successfully");

        setShowBundleModal(false);
        setSelectedComics([]);

        setBundleData({
          title: "",
          description: "",
          price: ""
        });
      }

    } catch (err) {
      alert(err.response?.data?.message || "Error creating bundle");
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


  const columns = [
    // {
    //   name: "#",
    //   selector: (row, index) => (currentPage - 1) * perPage + index + 1,
    //   width: "60px"
    // },
    {
      name: "",
      width: "50px",
      cell: (row) => (
        <Form.Check
          type="checkbox"
          checked={selectedComics.includes(row._id)}
          onChange={() => handleSelectComic(row._id)}
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
      name: "Deatils",
      cell: row => (
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-info" onClick={() => navigate(`/my-comics-details/${row._id}`)} >
            <i className="bi bi-eye me-1"></i> Details
          </Button>
        </div>
      ),
      minWidth: "120px",
    },
    // {
    //   name: "Actions",
    //   minWidth: "150px",
    //   cell: row => (
    //     <div className="d-flex gap-2">
    //       {row.comicStatus === "draft" ? (
    //         <Button
    //           size="sm"
    //           variant="outline-warning"
    //           onClick={() => handleResume(row)}
    //         >
    //           <i className="bi bi-pencil-square me-1"></i> Resume
    //         </Button>
    //       ) : (
    //         <>
    //           {/* <Button
    //             size="sm"
    //             variant="outline-primary"
    //             onClick={() => window.open(row.pdfUrl, "_blank")}
    //             disabled={!row.pdfUrl}
    //           >
    //             <i className="bi bi-filetype-pdf me-1"></i> View
    //           </Button> */}
    //         </>
    //       )}
    //     </div>
    //   ),
    // },

    {
      name: "Actions",
      cell: (row) => {
        if (row.comicStatus !== "draft") return null;

        // ❌ Dashboard cannot resume
        if (isDashboardUser) return null;

        // 🟡 FREE USER LIMIT
        if (isFreeUser && totalComicsCreated >= 1) {
          return null; // hide completely
        }

        // 🟢 Bundle / Unlimited OR free with 0 comics
        return (
          <Button
            size="sm"
            variant="outline-warning"
            onClick={() => handleResume(row)}
          >
            Resume
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
                    {comics.filter((c) => c.status === "approved").length}
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

            {/* Main Table */}
            <div className="info-wrapper">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <div className="main-heading">My Comics - </div>
                <div className="search-wrapper w-100" style={{ maxWidth: "300px" }}>
                  <Form.Control type="search" className="ms-auto rounded-3" placeholder="Search by title, subject, status..." value={search} onChange={(e) => setSearch(e.target.value)} />
                  <Button
                    variant="primary"
                    disabled={selectedComics.length === 0}
                    onClick={() => setShowBundleModal(true)}
                  >
                    Create Bundle ({selectedComics.length})
                  </Button>
                </div>
              </div>
              <div className="table-responsive table-custom-wrapper">
                <DataTable
                  columns={columns}
                  // data={comics}
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


            <Modal show={showBundleModal} onHide={() => setShowBundleModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Create Bundle</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={bundleData.title}
                      onChange={(e) =>
                        setBundleData({ ...bundleData, title: e.target.value })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={bundleData.description}
                      onChange={(e) =>
                        setBundleData({ ...bundleData, description: e.target.value })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      type="number"
                      value={bundleData.price}
                      onChange={(e) =>
                        setBundleData({ ...bundleData, price: e.target.value })
                      }
                    />
                  </Form.Group>
                </Form>
              </Modal.Body>

              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowBundleModal(false)}>
                  Cancel
                </Button>
                <Button variant="success" onClick={handleCreateBundle}>
                  Create
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        )}
      </div>
    </div>
  );
};

export default MyComics;