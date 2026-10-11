import React, { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Form, Modal, Button, Spinner, Alert } from "react-bootstrap";
import DataTable from "react-data-table-component";
import dataTableCustomStyles from "../../assets/styles/dataTableCustomStyles";
import { NoDataComponent } from "../../components/NoDataComponent";
import { Loader } from "../../lib/loader";
import API from "../../API";
import { toast } from "react-toastify";

const ROLE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "admin", label: "Admin" },
  { value: "moderator", label: "Moderator" },
  { value: "user", label: "User" },
  { value: "parent", label: "Parent" },
  { value: "student", label: "Student" },
];

const DEFAULT_SORT = { sortBy: "createdAt", order: "desc" };

const AllUsers = () => {
  // ---------------- List data ----------------
  const [users, setUsers] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [stats, setStats] = useState({ total: 0 });
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------- Pagination / search / filter / sort ----------------
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sort, setSort] = useState(DEFAULT_SORT);

  // ---------------- Actions ----------------
  const [actionUserId, setActionUserId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedUserInfo, setSelectedUserInfo] = useState(null);

  const handleCloseInfo = () => setShowInfoModal(false);
  const handleClose = () => setShowDeleteModal(false);

  const userInfo = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;
  const isAdmin = userInfo?.userType === "admin";

  // Purani request ka response nayi request ke baad aaye to ignore
  const requestIdRef = useRef(0);

  // DataTable ko kisi page pe le jao (filter/sort change, delete ke baad)
  const goToPage = (page) => {
    setCurrentPage(page);
    setResetPaginationToggle((prev) => !prev);
  };

  // 📥 Fetch users (server-side pagination)
  const fetchUsers = useCallback(async () => {
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
      if (roleFilter !== "all") params.role = roleFilter;

      const { data } = await API.get("/admin/getAllUsers", { params });

      if (requestId !== requestIdRef.current) return;

      if (data.success) {
        setUsers(data.data || []);
        setTotalRows(data.total || 0);
        setStats(data.stats || { total: 0 });
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      if (requestId === requestIdRef.current) {
        setTableLoading(false);
        setInitialLoading(false);
      }
    }
  }, [currentPage, perPage, debouncedSearch, roleFilter, sort]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  // Assign/Remove Moderator
  const handleModeratorToggle = async (userId) => {
    try {
      setActionUserId(userId);
      const { data } = await API.post("/admin/assign-moderator", { user_id: userId });

      if (!data.error) {
        toast.success(data.message);
        fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating role");
    } finally {
      setActionUserId(null);
    }
  };

  // Toggle Unlimited Access
  const handleUnlimitedToggle = async (userId, currentValue) => {
    try {
      setActionUserId(userId);
      const { data } = await API.post("/admin/unlimited", {
        userId,
        isUnlimited: !currentValue, // toggle
      });

      if (data.success) {
        toast.success(data.message);
        fetchUsers();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setActionUserId(null);
    }
  };

  // Open Delete Modal
  const handleDeleteOpen = (userId) => {
    setSelectedUserId(userId);
    setShowDeleteModal(true);
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);

      const { data } = await API.post("/admin/deleteUser", { user_id: selectedUserId });

      if (!data.error) {
        toast.success("User Deleted Successfully!");
        handleClose();

        // Page ka aakhri user delete hua to pichhle page pe jao
        if (users.length === 1 && currentPage > 1) {
          goToPage(currentPage - 1);
        } else {
          fetchUsers();
        }
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  // Table Columns (sortField = backend ka sortBy)
  const columns = [
    {
      name: "#",
      selector: (row, index) => (currentPage - 1) * perPage + index + 1,
      width: "60px",
    },
    {
      id: "name",
      name: "Name",
      selector: (row) => `${row.firstname || ""} ${row.lastname || ""}`.trim() || "N/A",
      sortable: true,
      sortField: "name",
      minWidth: "180px",
    },
    {
      id: "username",
      name: "Username",
      selector: (row) => row.username || row.email,
      sortable: true,
      sortField: "username",
      minWidth: "220px",
    },
    {
      id: "userType",
      name: "User Type",
      selector: (row) => row.userType,
      sortable: true,
      sortField: "userType",
      minWidth: "120px",
      cell: (row) => <Badge bg="info">{row.userType || "N/A"}</Badge>,
    },
    {
      id: "createdAt",
      name: "Joined On",
      selector: (row) => new Date(row.createdAt).toLocaleString(),
      sortable: true,
      sortField: "createdAt",
      minWidth: "170px",
    },
    {
      name: "Actions",
      minWidth: "350px",
      cell: (row) => {
        if (actionUserId === row._id) return <Spinner size="sm" />;

        return (
          <div className="d-flex gap-2">
            {/* Assign Moderator */}
            {isAdmin && row.userType === "user" && (
              <button
                className="btn btn-sm btn-success d-flex align-items-center gap-1"
                onClick={() => handleModeratorToggle(row._id)}
              >
                <i className="bi bi-person-plus"></i>
                Assign Moderator
              </button>
            )}

            {/* Remove Moderator (only admin can remove) */}
            {isAdmin && row.userType === "moderator" && (
              <button
                className="btn btn-sm btn-warning d-flex align-items-center gap-1"
                onClick={() => handleModeratorToggle(row._id)}
              >
                <i className="bi bi-person-dash"></i>
                Remove Moderator
              </button>
            )}

            {/* Unlimited Access Toggle */}
            {isAdmin && (row.userType === "user" || row.userType === "admin") && (
              <button
                className={`btn btn-sm ${row.isUnlimited ? "btn-warning" : "btn-success"} d-flex align-items-center gap-1`}
                onClick={() => handleUnlimitedToggle(row._id, row.isUnlimited)}
              >
                {row.isUnlimited ? (
                  <>
                    <i className="bi bi-unlock-fill"></i> Disable Unlimited
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill"></i> Enable Unlimited
                  </>
                )}
              </button>
            )}

            {/* View Info */}
            <button
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
              onClick={() => {
                setSelectedUserInfo(row);
                setShowInfoModal(true);
              }}
            >
              <i className="bi bi-eye-fill"></i>
            </button>

            {/* Delete User */}
            {isAdmin && row.userType !== "admin" && (
              <button
                className="btn btn-sm btn-danger d-flex align-items-center gap-1"
                onClick={() => handleDeleteOpen(row._id)}
              >
                <i className="bi bi-trash3"></i>
              </button>
            )}
          </div>
        );
      },
    },
  ];

  if (initialLoading) {
    return (
      <div className="all-users-page pt-4 pb-3">
        <div className="container-xl">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="all-users-page pt-4 pb-3">
      <div className="container-xl">
        <div className="info-wrapper bg-white rounded-4 p-3">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="main-heading">All Users</div>
            <div className="fs-5 fw-semibold text-primary">
              Total Users: {totalRows}
            </div>
          </div>

          {/* Role Filter + Search */}
          <div className="mb-3 d-flex gap-2">
            <Form.Select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                goToPage(1);
              }}
              className="w-50"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.value === "all" ? stats.total || 0 : stats[opt.value] || 0})
                </option>
              ))}
            </Form.Select>

            <Form.Control
              type="search"
              placeholder="Search by name, username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-50"
            />
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          {/* Users Table */}
          <div className="table-responsive table-custom-wrapper">
            <DataTable
              columns={columns}
              data={users}
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
      </div>

      {/* User Info Modal */}
      <Modal show={showInfoModal} centered onHide={handleCloseInfo}>
        <Modal.Header closeButton>
          <Modal.Title>User Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUserInfo && (
            <div className="user-info-details">
              <p><strong>Name: </strong> {selectedUserInfo.firstname} {selectedUserInfo.lastname}</p>
              <p><strong>Username: </strong> {selectedUserInfo.username || "N/A"}</p>
              <p><strong>Email: </strong> {selectedUserInfo.email}</p>
              <p><strong>User Type: </strong> {selectedUserInfo.userType}</p>
              <p><strong>Joined On: </strong> {new Date(selectedUserInfo.createdAt).toLocaleString()}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseInfo}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} centered onHide={deleting ? undefined : handleClose}>
        <Modal.Body>
          <div className="content-wrapper text-center">
            <div
              className="icon-cover d-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle mx-auto mb-3"
              style={{ height: "50px", width: "50px" }}
            >
              <i className="bi bi-trash3 fs-4 text-danger"></i>
            </div>
            <div className="fs-18 fw-semibold lh-sm">
              Are you sure you want to delete this user?
            </div>
            <div className="btn-wrapper d-flex flex-wrap justify-content-center gap-2 mt-4">
              <Button variant="secondary" className="px-4 py-2" onClick={handleClose} disabled={deleting}>
                Cancel
              </Button>
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
    </div>
  );
};

export default AllUsers;