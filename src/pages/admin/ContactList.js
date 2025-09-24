import React, { useEffect, useState } from "react";
import { Badge, Form, Button, Modal } from "react-bootstrap";
import DataTable from "react-data-table-component";
import dataTableCustomStyles from "../../assets/styles/dataTableCustomStyles";
import { NoDataComponent } from "../../components/NoDataComponent";
import { Loader } from "../../lib/loader";
import API from "../../API";

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // View Modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await API.get("/user/contacts");

      if (data.success) {
        setContacts(data.contacts);
      } else {
        setError("Failed to fetch contacts");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Filter contacts by name, email or role
  const filteredContacts = contacts.filter((c) => {
    const searchTerm = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(searchTerm)) ||
      (c.email && c.email.toLowerCase().includes(searchTerm)) ||
      (c.role && c.role.toLowerCase().includes(searchTerm))
    );
  });

  // Delete confirm
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await API.delete(`/user/contact/${deleteId}`);
      setContacts((prev) => prev.filter((c) => c._id !== deleteId));
      setShowDeleteModal(false);
    } catch (err) {
      alert("Failed to delete contact");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // Table columns
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      minWidth: "180px",
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      minWidth: "220px",
    },
    {
      name: "Phone",
      selector: (row) => row.phone,
      minWidth: "150px",
    },
    {
      name: "Role",
      selector: (row) => row.role,
      sortable: true,
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
      name: "Submitted At",
      selector: (row) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
      minWidth: "150px",
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

  return (
    <div className="contact-list-page pt-4 pb-3">
      <div className="container-xl">
        {loading ? (
          <Loader />
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <div className="info-wrapper bg-white rounded-4 p-3">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="main-heading">Contact Messages -</div>
              <div className="fs-5 fw-semibold text-primary">
                Total: {contacts.length}
              </div>
            </div>

            {/* Search Box */}
            <div className="mb-3">
              <Form.Control
                type="text"
                placeholder="Search by name, email or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Contacts Table */}
            <div className="table-responsive table-custom-wrapper">
              <DataTable
                columns={columns}
                data={filteredContacts}
                highlightOnHover
                responsive
                pagination
                customStyles={dataTableCustomStyles}
                noDataComponent={<NoDataComponent />}
                striped
              />
            </div>
          </div>
        )}
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
              <p><strong>Message:</strong> {selectedContact.message}</p>
              <p><strong>Submitted At:</strong> {new Date(selectedContact.createdAt).toLocaleString()}</p>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} centered onHide={() => setShowDeleteModal(false)}>
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
