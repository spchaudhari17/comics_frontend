import React, { useEffect, useState } from "react";
import { Button, Badge, Card, Row, Col, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { Loader } from "../../lib/loader";
import API from "../../API";
import dataTableCustomStyles from "../../assets/styles/dataTableCustomStyles";
import { NoDataComponent } from "../../components/NoDataComponent";

const MyComics = () => {
  const navigate = useNavigate();
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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
    {
      name: "Actions",
      minWidth: "150px",
      cell: row => (
        <div className="d-flex gap-2">
          {row.comicStatus === "draft" ? (
            <Button
              size="sm"
              variant="outline-warning"
              onClick={() => handleResume(row)}
            >
              <i className="bi bi-pencil-square me-1"></i> Resume
            </Button>
          ) : (
            <>
              {/* <Button
                size="sm"
                variant="outline-primary"
                onClick={() => window.open(row.pdfUrl, "_blank")}
                disabled={!row.pdfUrl}
              >
                <i className="bi bi-filetype-pdf me-1"></i> View
              </Button> */}
            </>
          )}
        </div>
      ),
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
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyComics;