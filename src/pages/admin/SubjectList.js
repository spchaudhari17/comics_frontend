import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Image } from "react-bootstrap";
import DataTable from "react-data-table-component";
import dataTableCustomStyles from "../../assets/styles/dataTableCustomStyles";
import { Loader } from "../../lib/loader";
import { NoDataComponent } from "../../components/NoDataComponent";
import API from "../../API";

const SubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [creating, setCreating] = useState(false);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState(null);

  // Ad toggle fields
  const [editShowAds, setEditShowAds] = useState(true);
  const [editShowAdsFaq, setEditShowAdsFaq] = useState(true);
  const [editShowAdsDidYouKnow, setEditShowAdsDidYouKnow] = useState(true);
  const [editShowAdsQuiz, setEditShowAdsQuiz] = useState(true);
  const [editShowAdsHardcoreQuiz, setEditShowAdsHardcoreQuiz] = useState(true);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Subjects
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/user/getAllSubjectsForWeb");
      setSubjects(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Create Subject
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newName || !newImage) return alert("Name and image required!");

    try {
      setCreating(true);
      const formData = new FormData();
      formData.append("name", newName);
      formData.append("image", newImage);

      const { data } = await API.post("/user/create-subject", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubjects((prev) => [...prev, data]);
      setShowAddModal(false);
      setNewName("");
      setNewImage(null);
    } catch (err) {
      console.error(err);
      alert("Failed to create subject");
    } finally {
      setCreating(false);
    }
  };

  // Delete Subject
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await API.post("/user/delete-subject", { id: deleteId });
      setSubjects((prev) => prev.filter((s) => s._id !== deleteId));
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to delete subject");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // 🧩 Open Edit Modal
  const openEditModal = (subject) => {
    setEditSubject(subject);
    setEditName(subject.name);
    setEditImage(null);
    setEditShowAds(subject.ishowads);
    setEditShowAdsFaq(subject.showAdsFaq ?? true);
    setEditShowAdsDidYouKnow(subject.showAdsDidYouKnow ?? true);
    setEditShowAdsQuiz(subject.showAdsQuiz ?? true);
    setEditShowAdsHardcoreQuiz(subject.showAdsHardcoreQuiz ?? true);
    setShowEditModal(true);
  };

  // 🧩 Update Subject (modal)
  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    if (!editSubject) return;

    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append("id", editSubject._id);
      formData.append("name", editName);
      formData.append("ishowads", editShowAds);
      formData.append("showAdsFaq", editShowAdsFaq);
      formData.append("showAdsDidYouKnow", editShowAdsDidYouKnow);
      formData.append("showAdsQuiz", editShowAdsQuiz);
      formData.append("showAdsHardcoreQuiz", editShowAdsHardcoreQuiz);
      if (editImage) formData.append("image", editImage);

      const { data } = await API.post("/user/update-subject", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubjects((prev) =>
        prev.map((s) => (s._id === data.subject._id ? data.subject : s))
      );

      setShowEditModal(false);
      setEditSubject(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update subject");
    } finally {
      setUpdating(false);
    }
  };

  // 🔁 Generic toggle handler for inline table switches
  const handleToggleAdField = async (subject, fieldName) => {
    try {
      const newValue = !subject[fieldName];
      const formData = new FormData();
      formData.append("id", subject._id);
      formData.append(fieldName, newValue);

      await API.post("/user/update-subject", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubjects((prev) =>
        prev.map((s) =>
          s._id === subject._id ? { ...s, [fieldName]: newValue } : s
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update ads flag");
    }
  };

  // Filter
  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Columns with all toggles
  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "60px" },
    {
      name: "Image",
      cell: (row) =>
        row.image ? (
          <Image
            src={row.image}
            alt={row.name}
            rounded
            style={{ width: "50px", height: "50px", objectFit: "cover" }}
          />
        ) : (
          "N/A"
        ),
      width: "80px",
    },
    { name: "Name", selector: (row) => row.name, sortable: true },

    {
      name: "Show Ads",
      cell: (row) => (
        <Form.Check
          type="switch"
          id={`ads-${row._id}`}
          checked={row.ishowads}
          onChange={() => handleToggleAdField(row, "ishowads")}
          label={row.ishowads ? "On" : "Off"}
        />
      ),
      width: "130px",
    },
    {
      name: "FAQ Ads",
      cell: (row) => (
        <Form.Check
          type="switch"
          id={`faq-${row._id}`}
          checked={row.showAdsFaq ?? false}
          onChange={() => handleToggleAdField(row, "showAdsFaq")}
          label={row.showAdsFaq ? "On" : "Off"}
        />
      ),
      width: "130px",
    },
    {
      name: "DidYouKnow Ads",
      cell: (row) => (
        <Form.Check
          type="switch"
          id={`dyk-${row._id}`}
          checked={row.showAdsDidYouKnow ?? false}
          onChange={() => handleToggleAdField(row, "showAdsDidYouKnow")}
          label={row.showAdsDidYouKnow ? "On" : "Off"}
        />
      ),
      width: "160px",
    },
    {
      name: "Quiz Ads",
      cell: (row) => (
        <Form.Check
          type="switch"
          id={`quiz-${row._id}`}
          checked={row.showAdsQuiz ?? false}
          onChange={() => handleToggleAdField(row, "showAdsQuiz")}
          label={row.showAdsQuiz ? "On" : "Off"}
        />
      ),
      width: "130px",
    },
    {
      name: "Hardcore Ads",
      cell: (row) => (
        <Form.Check
          type="switch"
          id={`hc-${row._id}`}
          checked={row.showAdsHardcoreQuiz ?? false}
          onChange={() => handleToggleAdField(row, "showAdsHardcoreQuiz")}
          label={row.showAdsHardcoreQuiz ? "On" : "Off"}
        />
      ),
      width: "160px",
    },
    {
      name: "Created At",
      selector: (row) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
      width: "150px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button size="sm" variant="info" onClick={() => openEditModal(row)}>
            <i className="bi bi-pencil"></i>
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
    },
  ];

  return (
    <div className="subject-list-page pt-4 pb-3">
      <div className="container-xl">
        {loading ? (
          <Loader />
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <div className="info-wrapper bg-white rounded-4 p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="main-heading">Subjects -</div>
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: "250px" }}
                />
                <Button onClick={() => setShowAddModal(true)} variant="primary">
                  <i className="bi bi-plus-circle"></i> Add Subject
                </Button>
              </div>
            </div>

            <div className="table-responsive table-custom-wrapper">
              <DataTable
                columns={columns}
                data={filteredSubjects}
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

      {/* Add Modal */}
      <Modal show={showAddModal} centered onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Subject</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateSubject}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Subject Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter subject name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setNewImage(e.target.files[0])}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} centered onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Subject</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateSubject}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Subject Name</Form.Label>
              <Form.Control
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Update Image (optional)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setEditImage(e.target.files[0])}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Show Ads (Global)"
                checked={editShowAds}
                onChange={(e) => setEditShowAds(e.target.checked)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Show Ads in FAQ"
                checked={editShowAdsFaq}
                onChange={(e) => setEditShowAdsFaq(e.target.checked)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Show Ads in Did You Know"
                checked={editShowAdsDidYouKnow}
                onChange={(e) => setEditShowAdsDidYouKnow(e.target.checked)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Show Ads in Quiz"
                checked={editShowAdsQuiz}
                onChange={(e) => setEditShowAdsQuiz(e.target.checked)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Show Ads in Hardcore Quiz"
                checked={editShowAdsHardcoreQuiz}
                onChange={(e) => setEditShowAdsHardcoreQuiz(e.target.checked)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={updating}>
              {updating ? "Updating..." : "Update"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} centered onHide={() => setShowDeleteModal(false)}>
        <Modal.Body>
          <div className="text-center">
            <div
              className="d-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle mx-auto mb-3"
              style={{ height: "50px", width: "50px" }}
            >
              <i className="bi bi-trash3 fs-4 text-danger"></i>
            </div>
            <div className="fs-18 fw-semibold lh-sm">
              Are you sure you want to delete this subject?
            </div>
            <div className="d-flex justify-content-center gap-2 mt-4">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SubjectList;
