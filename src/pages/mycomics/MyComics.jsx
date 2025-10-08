import React, { useEffect, useState } from "react";
import { Button, Badge, Card, Row, Col } from "react-bootstrap";
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
        return <Badge bg="warning" text="dark">Pending</Badge>;
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

  const columns = [
    {
      name: "Title",
      selector: row => row.title,
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
      width: "110px",
      center: true,
    },
    {
      name: "Status",
      cell: row => getStatusBadge(row.status),
      sortable: true,
      width: "140px",
      center: true,
    },
    {
      name: "Comic Status",
      cell: row => getComicStatusBadge(row.comicStatus),
      sortable: true,
      width: "150px",
      center: true,
    },
    {
      name: "Created",
      selector: row => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
      width: "150px",
      center: true,
    },
    {
      name: "Deatils",
      width: "150px",
      center: true,
    },
    {
      name: "Actions",
      minWidth: "180px",
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

          <Button
            size="sm"
            variant="outline-info"
            onClick={() => navigate(`/my-comics-details/${row._id}`)}
          >
            <i className="bi bi-eye me-1"></i> Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="my-comics-page pt-4 pb-3">
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

            {/* Table */}
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body>
                <div className="main-heading mb-3 fw-semibold fs-5">My Comics</div>
                <DataTable
                  columns={columns}
                  data={comics}
                  highlightOnHover
                  pagination
                  responsive
                  striped
                  customStyles={dataTableCustomStyles}
                  noDataComponent={<NoDataComponent />}
                />
              </Card.Body>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default MyComics;
