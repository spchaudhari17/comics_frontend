import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Badge, Row, Col, Modal, Form, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Loader } from "../../lib/loader";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// react-data-table-component
import DataTable from 'react-data-table-component';
import dataTableCustomStyles from '../../assets/styles/dataTableCustomStyles';
import { NoDataComponent } from '../../components/NoDataComponent';
import API from "../../API";

const STATUS_OPTIONS = [
  { value: "", label: "📌 All Status" },
  { value: "pending", label: "🟡 Pending" },
  { value: "approved", label: "🟢 Approved" },
  { value: "rejected", label: "🔴 Rejected" },
];

const ALL_COUNTRY_OPTION = { value: "ALL", label: "🌍 All Countries" };
const FILTER_ALL_COUNTRIES = { value: "", label: "🌍 All Countries" };
const EMPTY_STATS = { pending: 0, approved: 0, rejected: 0, total: 0 };

// countries array ho to wahi, warna purana single country field
const getCountryList = (row) =>
  Array.isArray(row.countries) && row.countries.length > 0
    ? row.countries
    : row.country
      ? [row.country]
      : [];

export const SuperAdmin = () => {
  const navigate = useNavigate();

  const userInfo = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // ---------------- List data ----------------
  const [comics, setComics] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------- Pagination + filters ----------------
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countries, setCountries] = useState([]);

  // ---------------- Actions ----------------
  const [updatingId, setUpdatingId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedComicId, setSelectedComicId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedSeriesId, setSelectedSeriesId] = useState(null);
  const [newCountry, setNewCountry] = useState([]);
  const [updatingCountry, setUpdatingCountry] = useState(false);

  // Purani request ka response nayi request ke baad aaye to ignore karo
  const requestIdRef = useRef(0);

  // DataTable ko kisi page pe le jaane ke liye (filter change, delete ke baad)
  const goToPage = (page) => {
    setCurrentPage(page);
    setResetPaginationToggle((prev) => !prev);
  };

  // 📥 Fetch comics (server-side pagination, latest first)
  const fetchComics = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      setTableLoading(true);
      setError("");

      const params = { page: currentPage, limit: perPage };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedCountry) params.country = selectedCountry;

      const { data } = await API.get("/admin/comics", { params });

      if (requestId !== requestIdRef.current) return;

      setComics(data.comics || []);
      setTotalRows(data.total || 0);
      setStats(data.stats || EMPTY_STATS);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error("Failed to load comics:", err);
      setError(err.response?.data?.message || "Failed to fetch comics");
    } finally {
      if (requestId === requestIdRef.current) {
        setTableLoading(false);
        setInitialLoading(false);
      }
    }
  }, [currentPage, perPage, debouncedSearch, selectedStatus, selectedCountry]);

  useEffect(() => {
    fetchComics();
  }, [fetchComics]);

  // 🔍 Search debounce (har letter pe API call na ho)
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

  // 🌍 Country list
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const { data } = await API.get("/user/countries");
        if (data.success) {
          const sorted = data.countries
            .sort((a, b) => a.label.trim().localeCompare(b.label.trim()))
            .map((c) => ({
              value: c.value,
              label: c.label, // already has flag + name
            }));
          setCountries(sorted);
        }
      } catch (err) {
        console.error("❌ Failed to load countries:", err);
      }
    };

    fetchCountries();
  }, []);

  // ✅ Approve / Reject
  const handleStatusChange = async (comicId, newStatus) => {
    try {
      setUpdatingId(comicId);
      const { data } = await API.post("/admin/comics/status", { id: comicId, status: newStatus });
      toast.success(data.message || `Comic ${newStatus}`);
      fetchComics();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update status");
    } finally {
      setUpdatingId(null);
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

  // 🗑️ Delete
  const openDeleteModal = (comicId) => {
    setSelectedComicId(comicId);
    setShowDeleteModal(true);
  };

  const handleClose = () => {
    setShowDeleteModal(false);
    setSelectedComicId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedComicId) return;

    try {
      setDeleting(true);
      const { data } = await API.post("/user/deleteComic", { id: selectedComicId });
      toast.success(data.message || "Comic deleted successfully");
      handleClose();

      // Page ki aakhri comic delete hui to pichhle page pe jao
      if (comics.length === 1 && currentPage > 1) {
        goToPage(currentPage - 1);
      } else {
        fetchComics();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete comic");
    } finally {
      setDeleting(false);
    }
  };

  // 🌍 Country modal (current countries pehle se selected)
  const openCountryModal = (row) => {
    setSelectedSeriesId(row.seriesId || row._id);
    setNewCountry(getCountryList(row));
    setShowCountryModal(true);
  };

  const handleCloseCountryModal = () => {
    setShowCountryModal(false);
    setSelectedSeriesId(null);
    setNewCountry([]);
  };

  const handleUpdateCountry = async () => {
    if (!selectedSeriesId || !newCountry || newCountry.length === 0) {
      toast.warning("Please select at least one country!");
      return;
    }

    try {
      setUpdatingCountry(true);

      // If "All Countries" was selected → just send ["ALL"]
      const countriesToSend = newCountry.includes("ALL") ? ["ALL"] : newCountry;

      const { data } = await API.put("/admin/update-country", {
        seriesId: selectedSeriesId,
        newCountry: countriesToSend,
      });

      if (data.success) {
        toast.success(data.message || "Countries updated successfully!");
        handleCloseCountryModal();
        fetchComics();
      } else {
        toast.error("Failed to update countries.");
      }
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Error updating countries: " + (err.response?.data?.error || err.message));
    } finally {
      setUpdatingCountry(false);
    }
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => (currentPage - 1) * perPage + index + 1,
      width: "60px",
    },
    {
      name: "Creator Name",
      minWidth: '150px',
      cell: row => (
        <div className="creator_name fw-medium text-capitalize">
          {row.user_id?.firstname || "Unknown"} {row.user_id?.lastname || ""}
        </div>
      ),
    },
    {
      name: "Email",
      selector: row => row.user_id?.email || "N/A",
      minWidth: '200px',
    },
    {
      name: "User Type",
      cell: row => (
        <Badge bg="info">
          {row.user_id?.userType || "N/A"}
        </Badge>
      ),
    },
    {
      name: "Subject",
      selector: row => row.subject || "N/A",
    },
    {
      name: "Comic Title",
      selector: row => row.title,
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
    },
    {
      name: "Created",
      selector: row => new Date(row.createdAt).toLocaleString(),
      minWidth: '170px',
    },
    {
      name: "Country",
      minWidth: "200px",
      cell: (row) => {
        const countryList = getCountryList(row);

        if (countryList.length === 0) return "N/A";

        if (countryList.includes("ALL")) {
          return <Badge bg="primary">🌍 All Countries</Badge>;
        }

        return (
          <div className="d-flex flex-wrap align-items-center gap-2">
            {countryList.map((c, i) => (
              <div key={i} className="d-flex align-items-center gap-1">
                <img
                  src={`https://flagcdn.com/24x18/${String(c).toLowerCase()}.png`}
                  alt={c}
                  style={{ borderRadius: "2px" }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <span className="text-uppercase">{c}</span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      name: "Actions",
      minWidth: '260px',
      cell: row => {
        const isUpdating = updatingId === row._id;

        return (
          <div className="d-flex align-items-center gap-2">
            {isUpdating ? (
              <Spinner size="sm" />
            ) : row.status === "pending" ? (
              <>
                <Button size="sm" variant="success" className="px-2" onClick={() => handleStatusChange(row._id, "approved")}>
                  Accept
                </Button>
                <Button size="sm" variant="danger" className="px-2" onClick={() => handleStatusChange(row._id, "rejected")}>
                  Decline
                </Button>
              </>
            ) : row.status === "approved" ? (
              <Button size="sm" variant="outline-danger" className="px-2" onClick={() => handleStatusChange(row._id, "rejected")}>
                Reject
              </Button>
            ) : (
              <Button size="sm" variant="outline-success" className="px-2" onClick={() => handleStatusChange(row._id, "approved")}>
                Approve
              </Button>
            )}

            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => openCountryModal(row)}
            >
              🌍 Edit Country
            </Button>

            {userInfo?.userType === "admin" &&
              (row.status === "approved" || row.status === "rejected") && (
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => openDeleteModal(row._id)}
                >
                  <i className="bi bi-trash3"></i>
                </Button>
              )}
          </div>
        );
      },
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

  if (initialLoading) {
    return (
      <div className="super-admin-page pt-4 pb-3">
        <div className="container-xl">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="super-admin-page pt-4 pb-3">
      <div className="container-xl">

        {/* Stats Cards (filters ke hisaab se, saare pages ka total) */}
        <Row className="g-3 mb-4">
          <Col md={3}>
            <div className="bg-primary bg-opacity-25 rounded-4 border-bottom border-4 border-primary p-3">
              <div className="fs-3 fw-bold text-primary lh-sm mb-1">{stats.pending}</div>
              <div className="title-name text-body">Pending</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-success bg-opacity-25 rounded-4 border-bottom border-4 border-success p-3">
              <div className="fs-3 fw-bold text-success lh-sm mb-1">{stats.approved}</div>
              <div className="title-name text-body">Approved</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-danger bg-opacity-25 rounded-4 border-bottom border-4 border-danger p-3">
              <div className="fs-3 fw-bold text-danger lh-sm mb-1">{stats.rejected}</div>
              <div className="title-name text-body">Rejected</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-info bg-opacity-25 rounded-4 border-bottom border-4 border-info p-3">
              <div className="fs-3 fw-bold text-info lh-sm mb-1">{stats.total}</div>
              <div className="title-name text-body">Total</div>
            </div>
          </Col>
        </Row>

        {/* Comics Table */}
        <div className="info-wrapper">
          <div className="main-heading mb-3">Creator Submissions</div>

          {/* 🌍 Country Filter + Status Filter + Search */}
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <div style={{ width: "300px" }}>
              <Select
                options={[FILTER_ALL_COUNTRIES, ...countries]}
                value={countries.find((c) => c.value === selectedCountry) || FILTER_ALL_COUNTRIES}
                onChange={(selected) => {
                  setSelectedCountry(selected?.value || "");
                  goToPage(1);
                }}
                placeholder="Select or search country..."
                isSearchable
                className="react-select-country"
              />
            </div>

            <div style={{ width: "200px" }}>
              <Select
                options={STATUS_OPTIONS}
                value={STATUS_OPTIONS.find((s) => s.value === selectedStatus)}
                onChange={(selected) => {
                  setSelectedStatus(selected?.value || "");
                  goToPage(1);
                }}
                placeholder="Filter by status..."
                isSearchable={false}
              />
            </div>

            <Form.Control
              type="search"
              placeholder="Search by name, email, title, or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: "350px" }}
            />
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <div className='table-responsive table-custom-wrapper'>
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

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} centered onHide={deleting ? undefined : handleClose}>
          <Modal.Body>
            <div className="content-wrapper text-center">
              <div className="icon-cover d-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle mx-auto mb-3"
                style={{ height: '50px', width: '50px' }}>
                <i className="bi bi-trash3 fs-4 text-danger"></i>
              </div>
              <div className="fs-18 fw-semibold lh-sm">Are you sure you want to delete this comic?</div>
              <div className="btn-wrapper d-flex flex-wrap justify-content-center gap-2 mt-4">
                <Button variant="secondary" className="px-4 py-2" onClick={handleClose} disabled={deleting}>Cancel</Button>
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

        {/* 🌍 Update Country Modal */}
        <Modal show={showCountryModal} onHide={handleCloseCountryModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Update Countries</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-4">
              <label className="form-label">Select Country or Countries</label>

              <Select
                options={[ALL_COUNTRY_OPTION, ...countries]}
                isMulti
                value={
                  newCountry.includes("ALL")
                    ? [ALL_COUNTRY_OPTION]
                    : countries.filter((c) => newCountry.includes(c.value))
                }
                onChange={(selected) => {
                  if (selected?.some((s) => s.value === "ALL")) {
                    setNewCountry(["ALL"]);
                  } else {
                    setNewCountry(selected?.map((s) => s.value) || []);
                  }
                }}
                placeholder="Choose one or more countries..."
                isSearchable
                className="react-select-country"
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseCountryModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateCountry}
              disabled={updatingCountry}
            >
              {updatingCountry ? "Updating..." : "Update Countries"}
            </Button>
          </Modal.Footer>
        </Modal>

      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};