import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Badge } from "react-bootstrap";
import DataTable from "react-data-table-component";
import dataTableCustomStyles from "../../assets/styles/dataTableCustomStyles";
import { NoDataComponent } from "../../components/NoDataComponent";
import { Loader } from "../../lib/loader";
import API from "../../API";
import { toast } from "react-toastify";
import * as XLSX from "xlsx"; // ✅ added

const InstituteDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 🔹 Fetch all students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/user/get-students");
      if (!data.error) {
        setStudents(data.data);
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
      console.error(e);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Download Excel (table export)
  const handleDownloadExcel = () => {
    if (!students.length) {
      toast.warning("No students to download!");
      return;
    }

    // Prepare clean data for export
    const exportData = students.map((s, i) => ({
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
    XLSX.writeFile(workbook, "Students_List.xlsx"); // ✅ downloads instantly
  };

  // 🔹 Search filter
  const filteredStudents = students.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.username.toLowerCase().includes(term) ||
      s.classInfo?.class?.toString().toLowerCase().includes(term) ||
      s.classInfo?.section?.toLowerCase().includes(term)
    );
  });

  // 🔹 Table Columns
  const columns = [
    { name: "#", selector: (row, i) => i + 1, width: "60px" },
    {
      name: "Username",
      selector: (row) => row.username,
      sortable: true,
      minWidth: "200px",
    },
    {
      name: "Password",
      selector: (row) => row.plain_password || "—",
      minWidth: "160px",
    },
    {
      name: "School",
      selector: (row) => row.classInfo?.school || "—",
      minWidth: "150px",
    },
    {
      name: "Year",
      selector: (row) => row.classInfo?.year || "—",
      width: "100px",
    },
    {
      name: "Class",
      selector: (row) => row.classInfo?.class || "—",
      width: "100px",
    },
    {
      name: "Section",
      selector: (row) => row.classInfo?.section || "—",
      width: "120px",
      cell: (row) => (
        <Badge bg="info" className="fs-6">
          {row.classInfo?.section || "—"}
        </Badge>
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
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <div className="info-wrapper bg-white rounded-4 p-3 shadow-sm">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="main-heading fs-4 fw-bold text-dark">
                🎓 Students List
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="fs-6 text-primary fw-semibold">
                  Total: {students.length}
                </div>

                <Button
                  variant="primary"
                  className="d-flex align-items-center gap-2"
                  onClick={() => setShowImportModal(true)}
                >
                  <i className="bi bi-upload"></i> Import Students
                </Button>

                <Button
                  variant="success"
                  className="d-flex align-items-center gap-2"
                  onClick={handleDownloadExcel}
                >
                  <i className="bi bi-download"></i> Download Excel
                </Button>

              </div>
            </div>

            {/* Search Box */}
            <div className="mb-3">
              <Form.Control
                type="text"
                placeholder="Search by username, class or section..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Students Table */}
            <div className="table-responsive table-custom-wrapper">
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
          </div>
        )}
      </div>

      {/* Import Modal */}
      <Modal
        show={showImportModal}
        onHide={() => setShowImportModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>📥 Import Students</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <Form.Label>Select Excel File</Form.Label>
            <Form.Control
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <small className="text-muted">
              Required columns: <b>School, Year, Class, Section, Roll No.</b>
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InstituteDashboard;
