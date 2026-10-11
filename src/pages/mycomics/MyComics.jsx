import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Badge, Row, Col, Form, Modal, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { Loader } from "../../lib/loader";
import API from "../../API";
import dataTableCustomStyles from "../../assets/styles/dataTableCustomStyles";
import { NoDataComponent } from "../../components/NoDataComponent";
import { trackClick, trackClickWithUser, useScrollDepth } from "../../utility/analytics";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const DEFAULT_SORT = { sortBy: "createdAt", order: "desc" };
const EMPTY_STATS = { pending: 0, approved: 0, rejected: 0, total: 0 };

const getConceptName = (comic) => comic?.conceptId?.name || comic?.concept || "N/A";

const getCountryList = (row) =>
  Array.isArray(row.countries) && row.countries.length > 0
    ? row.countries
    : row.country
      ? [row.country]
      : [];

const MyComics = () => {
  const navigate = useNavigate();

  // ---------------- List data ----------------
  const [comics, setComics] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [availableConcepts, setAvailableConcepts] = useState([]);
  const [totalComicsCreated, setTotalComicsCreated] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------- Subscription ----------------
  const [subscription, setSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(true);

  // ---------------- Pagination / search / filter / sort ----------------
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedConceptFilter, setSelectedConceptFilter] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sort, setSort] = useState(DEFAULT_SORT);

  // ---------------- Bundle selection ----------------
  // id -> comic (pages badalne pe bhi selection aur concept info bani rahe)
  const [selectedMap, setSelectedMap] = useState({});
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [bundleCreating, setBundleCreating] = useState(false);

  const [bundleData, setBundleData] = useState({
    title: "",
    description: "",
    price: ""
  });

  const selectedComics = useMemo(() => Object.keys(selectedMap), [selectedMap]);
  const selectedComicsData = useMemo(() => Object.values(selectedMap), [selectedMap]);

  // GA: how much users scroll on My Comics screen
  useScrollDepth("my_comics_screen", { enabled: !initialLoading, params: { total_comics: totalComicsCreated } });

  // Purani request ka response nayi request ke baad aaye to ignore
  const requestIdRef = useRef(0);

  const goToPage = (page) => {
    setCurrentPage(page);
    setResetPaginationToggle((prev) => !prev);
  };

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

  // 📥 FETCH COMICS (server-side pagination)
  const fetchComics = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      setTableLoading(true);
      setError("");

      const params = {
        page: currentPage,
        limit: perPage,
        sortBy: sort.sortBy,
        order: sort.order,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedConceptFilter) params.concept = selectedConceptFilter;
      if (selectedStatus) params.status = selectedStatus;

      const { data } = await API.get("/user/my-comics", { params });

      if (requestId !== requestIdRef.current) return;

      setComics(data.comics || []);
      setTotalRows(data.total || 0);
      setStats(data.stats || EMPTY_STATS);
      setAvailableConcepts(data.concepts || []);
      setTotalComicsCreated(data.totalComics || 0);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to fetch comics");
    } finally {
      if (requestId === requestIdRef.current) {
        setTableLoading(false);
        setInitialLoading(false);
      }
    }
  }, [currentPage, perPage, debouncedSearch, selectedConceptFilter, selectedStatus, sort]);

  useEffect(() => {
    fetchComics();
  }, [fetchComics]);

  // 🔍 Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = search.trim();
      if (value !== debouncedSearch) {
        setDebouncedSearch(value);
        goToPage(1);
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // ↕️ Column sort (poore data pe, backend se)
  const handleSort = (column, direction) => {
    if (!column?.sortField) return;
    setSort({ sortBy: column.sortField, order: direction });
    goToPage(1);
  };

  const handleConceptFilter = (concept) => {
    setSelectedConceptFilter(concept);
    goToPage(1);
  };

  // PLAN FLAGS
  const planType = subscription?.planType || "FREE";
  const isFreeUser = planType === "FREE";
  const isDashboardUser = planType === "dashboard";

  // Current page ki approved comics (header checkbox ke liye)
  const pageApprovedComics = comics.filter(c => c.status === "approved");
  const approvedCount = stats.approved;

  const handleResume = (comic) => {
    trackClick("my_comics_resume_click", {
      comic_id: comic._id,
      series_id: comic.seriesId || "",
      comic_status: comic.comicStatus || "",
    });
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

  const handleSelectComic = (comic) => {
    const isSelected = !!selectedMap[comic._id];
    trackClick("bundle_comic_select_click", {
      comic_id: comic._id,
      action: isSelected ? "unselect" : "select",
      selected_count: isSelected ? selectedComics.length - 1 : selectedComics.length + 1,
    });
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[comic._id]) delete next[comic._id];
      else next[comic._id] = comic;
      return next;
    });
  };

  // Header checkbox: is page ki saari approved comics select/unselect
  const allPageApprovedSelected = pageApprovedComics.length > 0 &&
    pageApprovedComics.every(c => selectedMap[c._id]);

  const handleSelectAllApproved = () => {
    trackClick("bundle_comic_select_all_click", { approved_count: pageApprovedComics.length });
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (allPageApprovedSelected) {
        pageApprovedComics.forEach(c => { delete next[c._id]; });
      } else {
        pageApprovedComics.forEach(c => { next[c._id] = c; });
      }
      return next;
    });
  };

  // ✅ Selected comics ka concept info
  const selectedConcept = selectedComicsData.length > 0 ? getConceptName(selectedComicsData[0]) : null;

  const allSameConcept = useMemo(() => {
    if (selectedComicsData.length <= 1) return true;
    return new Set(selectedComicsData.map(getConceptName)).size <= 1;
  }, [selectedComicsData]);

  const handleCreateBundle = async () => {
    trackClickWithUser("bundle_popup_create_click", {
      selected_count: selectedComics.length,
      concept: selectedConcept || "",
      bundle_price: Number(bundleData.price) || 0,
    });
    try {
      if (!bundleData.title || !bundleData.price) {
        alert("Title and price are required");
        return;
      }

      // ✅ Check if all selected comics have same concept
      const concepts = new Set(selectedComicsData.map(getConceptName));

      if (concepts.size > 1) {
        alert("⚠️ All selected comics must belong to the same concept!");
        return;
      }

      setBundleCreating(true);

      const payload = {
        title: bundleData.title,
        description: bundleData.description,
        price: bundleData.price,
        comics: selectedComics,
        concept: Array.from(concepts)[0] // Send concept name
      };

      const { data } = await API.post("/user/createBundle", payload);

      if (!data.error) {
        setShowSuccessAlert(true);
        setShowBundleModal(false);
        setSelectedMap({});
        setSelectedConceptFilter("");
        setBundleData({
          title: "",
          description: "",
          price: ""
        });

        navigate("/mybundleList");
        // Hide success alert after 5 seconds
        setTimeout(() => setShowSuccessAlert(false), 5000);
      }

    } catch (err) {
      alert(err.response?.data?.message || "Error creating bundle");
    } finally {
      setBundleCreating(false);
    }
  };

  const columns = [
    {
      name: (
        <Form.Check
          type="checkbox"
          checked={allPageApprovedSelected}
          onChange={handleSelectAllApproved}
          disabled={pageApprovedComics.length === 0}
          title={pageApprovedComics.length === 0 ? "No approved comics on this page" : "Select all approved comics on this page"}
        />
      ),
      width: "50px",
      cell: (row) => (
        <Form.Check
          type="checkbox"
          checked={!!selectedMap[row._id]}
          disabled={row.status !== "approved"}
          onChange={() => handleSelectComic(row)}
          title={row.status !== "approved" ? "Only approved comics can be bundled" : ""}
        />
      )
    },
    {
      id: "title",
      name: "Title",
      sortable: true,
      sortField: "title",
      minWidth: "200px",
      cell: row => (
        <div className="fw-semibold text-capitalize">{row.title}</div>
      ),
    },
    {
      id: "subject",
      name: "Subject",
      selector: row => row.subject,
      sortable: true,
      sortField: "subject",
      minWidth: "200px",
    },
    {
      id: "concept",
      name: "Concept",
      selector: row => getConceptName(row),
      sortable: true,
      sortField: "concept",
      minWidth: "200px",
    },
    {
      id: "partNumber",
      name: "Part",
      selector: row => (row.seriesId ? `Part ${row.partNumber}` : "-"),
      sortable: true,
      sortField: "partNumber",
      minWidth: "110px",
    },
    {
      id: "status",
      name: "Status",
      cell: row => getStatusBadge(row.status),
      sortable: true,
      sortField: "status",
      minWidth: "130px",
    },
    {
      id: "comicStatus",
      name: "Comic Status",
      cell: row => getComicStatusBadge(row.comicStatus),
      sortable: true,
      sortField: "comicStatus",
      minWidth: "140px",
    },
    {
      id: "createdAt",
      name: "Created",
      selector: row => new Date(row.createdAt).toLocaleString(),
      sortable: true,
      sortField: "createdAt",
      minWidth: "170px",
    },
    {
      name: "Details",
      cell: row => (
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-info" onClick={() => {
            trackClick("my_comics_details_click", { comic_id: row._id });
            navigate(`/my-comics-details/${row._id}`);
          }} >
            <i className="bi bi-eye me-1"></i> Details
          </Button>
        </div>
      ),
      minWidth: "120px",
    },
    {
      id: "country",
      name: "Country",
      sortable: true,
      sortField: "country",
      minWidth: "140px",
      cell: row => {
        const list = getCountryList(row);
        if (list.length === 0) return "N/A";
        if (list.includes("ALL")) return <Badge bg="primary">🌍 All Countries</Badge>;
        return <span className="text-uppercase">{list.join(", ")}</span>;
      },
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

  if (initialLoading || subLoading) {
    return (
      <div className="my-comics-page py-4">
        <div className="container-xl">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="my-comics-page py-4">
      <div className="container-xl">
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

        {/* Stats Cards (concept filter ke hisaab se, saare pages ka total) */}
        <Row className="g-3 mb-4">
          <Col md={3}>
            <div className="bg-warning bg-opacity-25 rounded-4 border-bottom border-4 border-warning p-3 text-center">
              <div className="fs-3 fw-bold text-warning">{stats.pending}</div>
              <div className="fw-semibold text-muted">Pending</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-success bg-opacity-25 rounded-4 border-bottom border-4 border-success p-3 text-center">
              <div className="fs-3 fw-bold text-success">{stats.approved}</div>
              <div className="fw-semibold text-muted">Approved</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-danger bg-opacity-25 rounded-4 border-bottom border-4 border-danger p-3 text-center">
              <div className="fs-3 fw-bold text-danger">{stats.rejected}</div>
              <div className="fw-semibold text-muted">Rejected</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-info bg-opacity-25 rounded-4 border-bottom border-4 border-info p-3 text-center">
              <div className="fs-3 fw-bold text-info">{stats.total}</div>
              <div className="fw-semibold text-muted">Total</div>
            </div>
          </Col>
        </Row>

        {/* ✅ Concept Filter (approved comics ke concepts, backend se) */}
        {availableConcepts.length > 0 && (
          <div className="mb-3">
            <Form.Group>
              <Form.Label className="fw-semibold">
                <i className="bi bi-funnel me-1"></i> Filter by Concept
              </Form.Label>
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  variant={selectedConceptFilter === "" ? "primary" : "outline-secondary"}
                  size="sm"
                  onClick={() => handleConceptFilter("")}
                >
                  All Concepts
                </Button>
                {availableConcepts.map(concept => (
                  <Button
                    key={concept.name}
                    variant={selectedConceptFilter === concept.name ? "primary" : "outline-secondary"}
                    size="sm"
                    onClick={() => handleConceptFilter(concept.name)}
                  >
                    {concept.name} <span className="opacity-75">({concept.count})</span>
                  </Button>
                ))}
              </div>
            </Form.Group>
          </div>
        )}

        {/* Bundle Creation Guide */}
        {approvedCount > 0 && (
          <Alert variant="info" className="mb-4 d-flex align-items-start">
            <i className="bi bi-lightbulb-fill me-2 fs-4 mt-1"></i>
            <div>
              <strong>Create a Bundle:</strong>
              <ul className="mb-0 mt-1 ps-3">
                <li>Select <strong>approved comics</strong> from the same <strong>concept</strong> (you can select across pages)</li>
                <li>Click the <strong>"Create Bundle"</strong> button (shows selected count)</li>
                <li>All selected comics must belong to the same concept</li>
                <li>
                  Before publishing and selling bundles, go to <strong>Manage Cards</strong> and connect your
                  <strong> Stripe bank account</strong>. If your bank account is not connected and verified,
                  you will <strong>not receive payments</strong> when users purchase your bundles.
                </li>
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
              {selectedConceptFilter && (
                <Badge bg="info" className="p-2">
                  <i className="bi bi-tag me-1"></i>
                  {selectedConceptFilter}
                </Badge>
              )}
            </div>

            <div className="d-flex gap-2 align-items-center flex-wrap">
              {/* Status Filter */}
              <Form.Select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  goToPage(1);
                }}
                style={{ width: "160px" }}
                className="rounded-3"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Form.Select>

              {/* Search Box */}
              <div className="search-wrapper" style={{ minWidth: "250px" }}>
                <Form.Control
                  type="search"
                  placeholder="Search comics... (e.g. part 2)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-3"
                />
              </div>

              {/* Bundle Creation Button */}
              <Button
                variant="primary"
                className="px-4 position-relative"
                disabled={selectedComics.length === 0 || !allSameConcept}
                onClick={() => {
                  trackClick("create_bundle_click", { selected_count: selectedComics.length, concept: selectedConcept || "" });
                  setShowBundleModal(true);
                }}
                title={!allSameConcept && selectedComics.length > 1 ? "All selected comics must belong to the same concept" : ""}
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
            <div className={`p-2 rounded-3 mb-3 d-flex justify-content-between align-items-center ${allSameConcept ? 'bg-primary bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
              <div>
                <i className={`bi ${allSameConcept ? 'bi-check-square-fill text-primary' : 'bi-exclamation-triangle-fill text-danger'} me-2`}></i>
                <strong>{selectedComics.length}</strong> comic{selectedComics.length > 1 ? 's' : ''} selected
                {selectedComics.length > 1 && (
                  <>
                    {allSameConcept ? (
                      <span className="text-success ms-2">
                        <i className="bi bi-check-circle me-1"></i>
                        Same concept: <strong>{selectedConcept}</strong>
                      </span>
                    ) : (
                      <span className="text-danger ms-2">
                        ⚠️ All comics must belong to the same concept!
                      </span>
                    )}
                  </>
                )}
                {selectedComics.length === 1 && (
                  <span className="text-muted ms-2">
                    Concept: <strong>{selectedConcept}</strong>
                  </span>
                )}
              </div>
              <Button
                variant="link"
                className="text-decoration-none p-0"
                onClick={() => setSelectedMap({})}
              >
                Clear All
              </Button>
            </div>
          )}

          {/* No approved comics message */}
          {approvedCount === 0 && stats.total > 0 && (
            <Alert variant="warning" className="mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {selectedConceptFilter ? (
                <>No approved comics found for concept: <strong>{selectedConceptFilter}</strong></>
              ) : (
                <>You don't have any approved comics yet. Only approved comics can be added to bundles.</>
              )}
            </Alert>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          <div className="table-responsive table-custom-wrapper">
            <DataTable
              columns={columns}
              data={comics}
              highlightOnHover
              responsive
              striped
              customStyles={dataTableCustomStyles}
              noDataComponent={<NoDataComponent />}
              progressPending={tableLoading}
              progressComponent={
                <div className="py-5 text-center">
                  <Spinner />
                </div>
              }
              // Sorting (server-side)
              sortServer
              onSort={handleSort}
              defaultSortFieldId="createdAt"
              defaultSortAsc={false}
              // Pagination (server-side)
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              paginationPerPage={perPage}
              paginationRowsPerPageOptions={[10, 25, 50, 100]}
              paginationDefaultPage={currentPage}
              paginationResetDefaultPage={resetPaginationToggle}
              onChangePage={(page) => setCurrentPage(page)}
              onChangeRowsPerPage={(rows) => {
                setPerPage(rows);
                goToPage(1);
              }}
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
                  {selectedConcept && (
                    <span className="ms-2 text-success">
                      • Concept: <strong>{selectedConcept}</strong>
                    </span>
                  )}
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
                {selectedComicsData.slice(0, 5).map(comic => (
                  <Badge bg="secondary" className="me-1" key={comic._id}>
                    {comic.title}
                  </Badge>
                ))}
                {selectedComics.length > 5 && (
                  <Badge bg="secondary">+{selectedComics.length - 5} more</Badge>
                )}
              </div>
              {selectedConcept && (
                <div className="mt-2 text-success">
                  <i className="bi bi-tag me-1"></i>
                  Concept: <strong>{selectedConcept}</strong>
                </div>
              )}
            </div>

            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Bundle Title <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder={`e.g., ${selectedConcept} Collection Vol. 1`}
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
                  placeholder={`A collection of comics exploring ${selectedConcept}...`}
                  value={bundleData.description}
                  onChange={(e) =>
                    setBundleData({ ...bundleData, description: e.target.value })
                  }
                  className="rounded-3"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Price ($) <span className="text-danger">*</span>
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
                  Set a competitive price for your {selectedConcept} comic bundle
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
      </div>

      {/* Custom CSS */}
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