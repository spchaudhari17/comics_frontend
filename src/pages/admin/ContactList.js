import React, { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Form, Button, Modal, Spinner, Alert } from "react-bootstrap";
import DataTable from "react-data-table-component";
import dataTableCustomStyles from "../../assets/styles/dataTableCustomStyles";
import { NoDataComponent } from "../../components/NoDataComponent";
import { Loader } from "../../lib/loader";
import API from "../../API";
import { toast } from "react-toastify";

const DEFAULT_SORT = { sortBy: "createdAt", order: "desc" };

const ContactList = () => {
  // ---------------- List data ----------------
  const [contacts, setContacts] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [stats, setStats] = useState({ total: 0, roles: [] });
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------- Pagination / search / filter / sort ----------------
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sort, setSort] = useState(DEFAULT_SORT);

  // View Modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Purani request ka response nayi request ke baad aaye to ignore
  const requestIdRef = useRef(0);

  // DataTable ko kisi page pe le jao (filter/sort change, delete ke baad)
  const goToPage = (page) => {
    setCurrentPage(page);
    setResetPaginationToggle((prev) => !prev);
  };

  // 📥 Fetch contacts (server-side pagination)
  const fetchContacts = useCallback(async () => {
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
      if (roleFilter) params.role = roleFilter;

      const { data } = await API.get("/user/contacts", { params });

      if (requestId !== requestIdRef.current) return;

      if (data.success) {
        setContacts(data.contacts || []);
        setTotalRows(data.total || 0);
        setStats(data.stats || { total: 0, roles: [] });
      } else {
        setError("Failed to fetch contacts");
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err.response?.data?.message || err.response?.data?.error || "Something went wrong");
    } finally {
      if (requestId === requestIdRef.current) {
        setTableLoading(false);
        setInitialLoading(false);
      }
    }
  }, [currentPage, perPage, debouncedSearch, roleFilter, sort]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

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

  // 🗑️ Delete confirm
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await API.delete(`/user/contact/${deleteId}`);

      toast.success("Contact deleted successfully!");
      setShowDeleteModal(false);

      // Page ka aakhri contact delete hua to pichhle page pe jao
      if (contacts.length === 1 && currentPage > 1) {
        goToPage(currentPage - 1);
      } else {
        fetchContacts();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.response?.data?.error || "Failed to delete contact"
      );
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // Table columns (sortField = backend ka sortBy)
  const columns = [
    {
      name: "#",
      selector: (row, index) => (currentPage - 1) * perPage + index + 1,
      width: "60px",
    },
    {
      id: "name",
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      sortField: "name",
      minWidth: "180px",
    },
    {
      id: "email",
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      sortField: "email",
      minWidth: "220px",
    },
    {
      name: "Phone",
      selector: (row) => row.phone,
      minWidth: "150px",
    },
    {
      id: "role",
      name: "Role",
      selector: (row) => row.role,
      sortable: true,
      sortField: "role",
      minWidth: "150px",
      cell: (row) => <Badge bg="info">{row.role || "N/A"}</Badge>,
    },
    {
      name: "Message",
      selector: (row) => row.message,
      minWidth: "250px",
      wrap: true,
    },
    {
      id: "createdAt",
      name: "Submitted At",
      selector: (row) => new Date(row.createdAt).toLocaleString(),
      sortable: true,
      sortField: "createdAt",
      minWidth: "170px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant="info"
            onClick={() => {
              setSelectedContact(row);
              setShowViewModal(true);
            }}
          >
            <i className="bi bi-eye"></i>
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setDeleteId(row._id);
              setShowDeleteModal(true);
            }}
          >
            <i className="bi bi-trash"></i>
          </Button>
        </div>
      ),
      minWidth: "120px",
    },
  ];

  if (initialLoading) {
    return (
      <div className="contact-list-page pt-4 pb-3">
        <div className="container-xl">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="contact-list-page pt-4 pb-3">
      <div className="container-xl">
        <div className="info-wrapper bg-white rounded-4 p-3">
          {/* Header Section */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="main-heading">Contact Messages</div>
            <div className="fs-5 fw-semibold text-primary">
              Total: {totalRows}
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
              <option value="">All Roles ({stats.total || 0})</option>
              {stats.roles?.map((r) => (
                <option key={r.role} value={r.role}>
                  {r.role} ({r.count})
                </option>
              ))}
              {/* Selected role abhi list me nahi (search ki wajah se) to bhi dikhe */}
              {roleFilter && !stats.roles?.some((r) => r.role === roleFilter) && (
                <option value={roleFilter}>{roleFilter} (0)</option>
              )}
            </Form.Select>

            <Form.Control
              type="search"
              placeholder="Search by name, email, phone, role or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-50"
            />
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          {/* Contacts Table */}
          <div className="table-responsive table-custom-wrapper">
            <DataTable
              columns={columns}
              data={contacts}
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

      {/* View Modal */}
      <Modal show={showViewModal} centered onHide={() => setShowViewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Contact Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedContact && (
            <div className="d-flex flex-column gap-2">
              <p><strong>Name:</strong> {selectedContact.name}</p>
              <p><strong>Email:</strong> {selectedContact.email}</p>
              <p><strong>Phone:</strong> {selectedContact.phone}</p>
              <p><strong>Role:</strong> {selectedContact.role}</p>
              <p style={{ whiteSpace: "pre-wrap" }}><strong>Message:</strong> {selectedContact.message}</p>
              <p><strong>Submitted At:</strong> {new Date(selectedContact.createdAt).toLocaleString()}</p>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} centered onHide={deleting ? undefined : () => setShowDeleteModal(false)}>
        <Modal.Body>
          <div className="content-wrapper text-center">
            <div
              className="icon-cover d-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle mx-auto mb-3"
              style={{ height: "50px", width: "50px" }}
            >
              <i className="bi bi-trash3 fs-4 text-danger"></i>
            </div>
            <div className="fs-18 fw-semibold lh-sm">
              Are you sure you want to delete this contact?
            </div>
            <div className="btn-wrapper d-flex flex-wrap justify-content-center gap-2 mt-4">
              <Button
                variant="secondary"
                className="px-4 py-2"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
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

export default ContactList;