import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Badge } from "react-bootstrap";
import DataTable from "react-data-table-component";
import dataTableCustomStyles from "../../assets/styles/dataTableCustomStyles";
import { NoDataComponent } from "../../components/NoDataComponent";
import { Loader } from "../../lib/loader";
import API from "../../API";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

const InstituteDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // studentId or "all"
  const [deleting, setDeleting] = useState(false);

  // Class filters
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("All");

  // 🔹 Fetch all students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/user/get-students");
      if (!data.error) {
        setStudents(data.data);

        const uniqueClasses = [
          ...new Set(
            data.data.map(
              (s) =>
                `${s.classInfo?.school}-${s.classInfo?.year}-${s.classInfo?.class}-${s.classInfo?.section}`
            )
          ),
        ];
        setClasses(uniqueClasses);
      } else {
        setError(data.message || "Failed to fetch students");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 🔹 Upload Excel
  const handleUpload = async () => {
    if (!file) return toast.warning("Please select an Excel file first.");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await API.post("/user/bulk-register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.error) {
        toast.error(res.data.message);
      } else {
        toast.success("✅ Students imported successfully!");
        setShowImportModal(false);
        setFile(null);
        fetchStudents();
      }
    } catch (e) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Reset Student Password
  const handleResetPassword = async (studentId) => {
    if (!window.confirm("Reset this student's password?")) return;
    try {
      const res = await API.post("/user/reset-student-password", { studentId });
      if (!res.data.error) {
        toast.success(
          `Password reset for ${res.data.username}: ${res.data.newPassword}`
        );
        fetchStudents();
      } else {
        toast.error(res.data.message);
      }
    } catch (e) {
      toast.error("Failed to reset password");
    }
  };

  // 🔹 Confirm delete (for single or all)
  // 🔹 Confirm delete (for single or all)
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      if (deleteTarget === "all") {
        const res = await API.post("/user/delete-all-students", {
          filter: selectedClass,
        });

        if (!res.data.error) {
          toast.success(res.data.message);

          // 🧹 Optimistic remove from UI
          setStudents((prev) =>
            selectedClass === "All"
              ? []
              : prev.filter((s) => {
                const key = `${s.classInfo?.school}-${s.classInfo?.year}-${s.classInfo?.class}-${s.classInfo?.section}`;
                return key !== selectedClass;
              })
          );

          // 🧠 Reset filter if class no longer exists
          if (selectedClass !== "All") setSelectedClass("All");

          // Background re-fetch (sync safety)
          setTimeout(fetchStudents, 500);
        } else {
          toast.error(res.data.message);
        }
      } else {
        const res = await API.post("/user/delete-student", {
          studentId: deleteTarget,
        });

        if (!res.data.error) {
          toast.success(res.data.message);

          // 🧹 Optimistically remove
          setStudents((prev) => prev.filter((s) => s._id !== deleteTarget));

          // Refresh
          setTimeout(fetchStudents, 500);
        } else {
          toast.error(res.data.message);
        }
      }
    } catch (e) {
      toast.error("Error deleting student(s)");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };



  // 🔹 Filter logic
  const filteredStudents = students.filter((s) => {
    const term = search.toLowerCase();
    const matchSearch =
      s.username.toLowerCase().includes(term) ||
      s.classInfo?.class?.toString().toLowerCase().includes(term) ||
      s.classInfo?.section?.toLowerCase().includes(term);

    const classKey = `${s.classInfo?.school}-${s.classInfo?.year}-${s.classInfo?.class}-${s.classInfo?.section}`;
    const matchClass = selectedClass === "All" || classKey === selectedClass;

    return matchSearch && matchClass;
  });

  // 🔹 Download Excel
  const handleDownloadExcel = () => {
    if (!filteredStudents.length) {
      toast.warning("No students to download!");
      return;
    }

    const exportData = filteredStudents.map((s, i) => ({
      "#": i + 1,
      Username: s.username,
      Password: s.plain_password,
      School: s.classInfo?.school || "",
      Year: s.classInfo?.year || "",
      Class: s.classInfo?.class || "",
      Section: s.classInfo?.section || "",
      Created_At: new Date(s.createdAt).toLocaleDateString("en-IN"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    const filename =
      selectedClass === "All"
        ? "All_Students_List.xlsx"
        : `${selectedClass.replaceAll("-", "_")}_Students.xlsx`;

    XLSX.writeFile(workbook, filename);
  };

  // 🔹 Table Columns
  const columns = [
    { name: "#", selector: (row, i) => i + 1, width: "60px" },
    { name: "Username", selector: (row) => row.username, minWidth: "180px" },
    {
      name: "Password",
      selector: (row) => row.plain_password || "—",
      minWidth: "130px",
    },
    {
      name: "School",
      selector: (row) => row.classInfo?.school || "—",
      minWidth: "100px",
    },
    {
      name: "Year",
      selector: (row) => row.classInfo?.year || "—",
      width: "80px",
    },
    {
      name: "Class",
      selector: (row) => row.classInfo?.class || "—",
      width: "80px",
    },
    {
      name: "Section",
      selector: (row) => row.classInfo?.section || "—",
      width: "100px",
      cell: (row) => (
        <Badge bg="info" className="fs-6">
          {row.classInfo?.section || "—"}
        </Badge>
      ),
    },
    {
      name: "Actions",
      minWidth: "180px",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant="warning"
            title="Reset Password"
            onClick={() => handleResetPassword(row._id)}
          >
            <i className="bi bi-key"></i>
          </Button>
          <Button
            size="sm"
            variant="danger"
            title="Delete Student"
            onClick={() => {
              setDeleteTarget(row._id);
              setShowDeleteModal(true);
            }}
          >
            <i className="bi bi-trash"></i>
          </Button>
        </div>
      ),
    },
    {
      name: "Created At",
      selector: (row) =>
        new Date(row.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      width: "160px",
    },
  ];

  return (
    <div className="student-list-page pt-4 pb-3">
      <div className="container-xl">
        {loading ? (
          <Loader />
        ) : (
          <div className="info-wrapper bg-white rounded-4 p-3 shadow-sm">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div className="main-heading fs-4 fw-bold text-dark">
                🎓 Students List
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <div className="fs-6 text-primary fw-semibold">
                  Total: {filteredStudents.length}
                </div>

                <Form.Select
                  size="sm"
                  style={{ width: "200px" }}
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="All">All Classes</option>
                  {classes.map((cls, i) => (
                    <option key={i} value={cls}>
                      {cls.replaceAll("-", " ")}
                    </option>
                  ))}
                </Form.Select>

                <Button
                  variant="primary"
                  onClick={() => setShowImportModal(true)}
                >
                  <i className="bi bi-upload"></i> Import
                </Button>
                <Button variant="success" onClick={handleDownloadExcel}>
                  <i className="bi bi-download"></i> Download
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setDeleteTarget("all");
                    setShowDeleteModal(true);
                  }}
                >
                  <i className="bi bi-trash"></i> Delete All
                </Button>
              </div>
            </div>

            {/* Search Box */}
            <Form.Control
              type="text"
              placeholder="Search by username, class or section..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-3"
            />

            {/* Table */}
            <DataTable
              columns={columns}
              data={filteredStudents}
              highlightOnHover
              responsive
              pagination
              customStyles={dataTableCustomStyles}
              noDataComponent={<NoDataComponent />}
              striped
            />
          </div>
        )}
      </div>

      {/* Import Modal */}
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📥 Import Students</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Select Excel File</Form.Label>
          <Form.Control
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <small className="text-muted">
            Required columns: <b>School, Year, Class, Section, Roll No.</b>
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
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
              {deleteTarget === "all"
                ? `Are you sure you want to delete ${selectedClass === "All"
                  ? "ALL students?"
                  : `all students in ${selectedClass.replaceAll("-", " ")}?`
                }`
                : "Are you sure you want to delete this student?"}
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

export default InstituteDashboard;
