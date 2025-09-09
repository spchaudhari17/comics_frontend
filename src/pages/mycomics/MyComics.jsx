import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Badge, Card, Row, Col } from "react-bootstrap";
import { Loader } from "../../lib/loader"; // tumhare project me already hai
import API from "../../API";

const MyComics = () => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch comics
  useEffect(() => {
    const fetchComics = async () => {
      try {
        setLoading(true);
        setError("");
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

  return (
    <>

      {/* <div className="my-comics-page pt-4 pb-3">
        <div className="container-xxl">
          {loading ? (
            <Loader />
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <>

              <Row className="g-4 mb-4">
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h3 className="text-primary mb-1">
                        {comics.filter((c) => c.status === "pending").length}
                      </h3>
                      <p className="text-muted mb-0">Pending</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h3 className="text-success mb-1">
                        {comics.filter((c) => c.status === "approved").length}
                      </h3>
                      <p className="text-muted mb-0">Approved</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h3 className="text-danger mb-1">
                        {comics.filter((c) => c.status === "rejected").length}
                      </h3>
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


              <Card>
                <Card.Header>
                  <h5 className="mb-0">My Comics</h5>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Thumbnail</th>
                        <th>Title</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Comic Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comics.length > 0 ? (
                        comics.map((comic, index) => (
                          <tr key={comic._id}>
                            <td>{index + 1}</td>
                            <td>
                              <img
                                src={comic.thumbnail}
                                alt={comic.title}
                                style={{ width: "60px", height: "auto", borderRadius: "4px" }}
                              />
                            </td>
                            <td>
                              <div
                                className="text-truncate"
                                style={{ maxWidth: "150px" }}
                                title={comic.title}
                              >
                                {comic.title}
                              </div>
                            </td>
                            <td>{comic.subject}</td>
                            <td>{getStatusBadge(comic.status)}</td>
                            <td>{getComicStatusBadge(comic.comicStatus)}</td>
                            <td>{new Date(comic.createdAt).toLocaleDateString()}</td>
                            <td>
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() =>
                                  window.open(comic.pdfUrl, "_blank", "noopener,noreferrer")
                                }
                                disabled={!comic.pdfUrl}
                              >
                                <i className="bi bi-filetype-pdf me-1"></i>
                                View
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center">
                            No comics found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </>
          )}
        </div>
      </div> */}

      <h1>under maintenance my comics page</h1>

    </>
  );
};

export default MyComics;
