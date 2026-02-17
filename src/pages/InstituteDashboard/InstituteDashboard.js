import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Badge } from "react-bootstrap";
import DataTable from "react-data-table-component";
import dataTableCustomStyles from "../../assets/styles/dataTableCustomStyles";
import { NoDataComponent } from "../../components/NoDataComponent";
import { Loader } from "../../lib/loader";
import API from "../../API";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const InstituteDashboard = () => {
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(true);


  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);


  // Filters
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("All");
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("All");
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("All");

  // Import States
  const [showImportModal, setShowImportModal] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Delete States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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


  // Get all students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/user/get-students");

      if (!data.error) {
        setStudents(data.data);

        // Unique Schools
        const uniqueSchools = [...new Set(data.data.map((s) => s.classInfo?.school))];
        setSchools(uniqueSchools);

        // Unique Countries
        const uniqueCountries = [...new Set(data.data.map((s) => s.classInfo?.country))];
        setCountries(uniqueCountries);

        // Unique Classes
        const uniqueClasses = [
          ...new Set(
            data.data.map(
              (s) =>
                `${s.classInfo?.school}-${s.classInfo?.year}-${s.classInfo?.class}-${s.classInfo?.section}`
            )
          ),
        ];
        setClasses(uniqueClasses);
      }
    } catch (err) {
      toast.error("Error loading students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Upload Excel
  const handleUpload = async () => {
    if (!file) return toast.warning("Please select an Excel file first.");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await API.post("/user/bulk-register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.error) toast.error(res.data.message);
      else {
        toast.success("Students imported successfully!");
        setShowImportModal(false);
        setFile(null);
        fetchStudents();
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Reset Password
  const handleResetPassword = async (studentId) => {
    if (!window.confirm("Reset this student's password?")) return;

    try {
      const res = await API.post("/user/reset-student-password", { studentId });
      if (!res.data.error) toast.success(`New Password: ${res.data.newPassword}`);
      fetchStudents();
    } catch {
      toast.error("Error resetting password");
    }
  };

  // Delete student(s)
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

  // Filter Logic
  const filteredStudents = students.filter((s) => {
    const term = search.toLowerCase();

    const matchSearch =
      s.username.toLowerCase().includes(term) ||
      s.classInfo?.class?.toLowerCase().includes(term) ||
      s.classInfo?.section?.toLowerCase().includes(term);

    const classKey = `${s.classInfo?.school}-${s.classInfo?.year}-${s.classInfo?.class}-${s.classInfo?.section}`;
    const matchClass = selectedClass === "All" || classKey === selectedClass;

    const matchSchool = selectedSchool === "All" || s.classInfo?.school === selectedSchool;

    const matchCountry =
      selectedCountry === "All" || s.classInfo?.country === selectedCountry;

    return matchSearch && matchClass && matchSchool && matchCountry;
  });

  // Excel Download
  const handleDownloadExcel = () => {
    if (!filteredStudents.length) return toast.warning("No students to download!");

    const exportData = filteredStudents.map((s, i) => ({
      "#": i + 1,
      Username: s.username,
      Password: s.plain_password,
      School: s.classInfo?.school,
      Year: s.classInfo?.year,
      Class: s.classInfo?.class,
      Section: s.classInfo?.section,
      Country: s.classInfo?.country,
      Created_At: new Date(s.createdAt).toLocaleDateString("en-IN"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    const filename =
      selectedSchool !== "All"
        ? `${selectedSchool}_Students.xlsx`
        : selectedClass !== "All"
          ? `${selectedClass.replaceAll("-", "_")}_Students.xlsx`
          : selectedCountry !== "All"
            ? `${selectedCountry}_Students.xlsx`
            : "All_Students.xlsx";

    XLSX.writeFile(workbook, filename);
  };

  const columns = [
    { name: "#", selector: (row, index) => (currentPage - 1) * perPage + index + 1, width: "60px" },
    { name: "Username", selector: (row) => row.username },
    { name: "Password", selector: (row) => row.plain_password },
    { name: "School", selector: (row) => row.classInfo?.school },
    { name: "Year", selector: (row) => row.classInfo?.year },
    { name: "Class", selector: (row) => row.classInfo?.class },
    {
      name: "Section",
      selector: (row) => row.classInfo?.section,
      cell: (row) => <Badge bg="info">{row.classInfo?.section}</Badge>,
    },
    {
      name: "Roll No",
      selector: (row) => row.classInfo?.rollNo || "—",
      width: "100px"
    },

    { name: "Country", selector: (row) => row.classInfo?.country },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">

          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate(`/activity/${row._id}`)}
            title="View learning activity"
          >
            <i className="bi bi-graph-up-arrow"></i>
          </Button>

          <Button size="sm" variant="warning" onClick={() => handleResetPassword(row._id)}>
            <i className="bi bi-key"></i>
          </Button>
          <Button
            size="sm"
            variant="danger"
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
  ];

  if (subLoading) {
    return (
      <div className="text-center py-5">
        <Loader />
        <p>Checking subscription…</p>
      </div>
    );
  }


  if (!subscription?.hasSubscription || subscription.planType === "FREE") {
    return (
      <div className="container py-5 text-center">
        <h3>🚫 Dashboard Access Locked</h3>
        <p className="text-muted">
          You need an active Dashboard or Bundle subscription to manage students.
        </p>
        <Button onClick={() => navigate("/subscriptions-plan")}>
          Upgrade Plan
        </Button>
      </div>
    );
  }


  const studentsUsed = students.length;
  const studentsLimit = subscription.studentsLimit;

  const isUnlimited = subscription.planType === "UNLIMITED";

  const isStudentLimitReached =
    !isUnlimited &&
    studentsLimit > 0 &&
    studentsUsed >= studentsLimit;




  return (
    <div className="student-list-page pt-4 pb-3">
      <div className="container-xl">
        {loading ? (
          <Loader />
        ) : (
          <div className="info-wrapper bg-white rounded-4 p-3 shadow-sm">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h4 className="fw-bold">🎓 Students List</h4>
              <div className="d-flex gap-2 flex-wrap">
                <div className="text-primary fw-semibold mt-3">
                  Total: {filteredStudents.length}
                </div>

                <Badge bg={isStudentLimitReached ? "danger" : "success"}>
                  Students: {studentsUsed} / {studentsLimit}
                </Badge>


                {/* School Filter */}
                <Form.Select
                  size="sm"
                  style={{ width: "160px" }}
                  value={selectedSchool}
                  onChange={(e) => {
                    setSelectedSchool(e.target.value);
                    setSelectedClass("All");
                  }}
                >
                  <option value="All">All Schools</option>
                  {schools.map((s, i) => (
                    <option key={i} value={s}>
                      {s}
                    </option>
                  ))}
                </Form.Select>

                {/* Class Filter - Auto filtered by School */}
                <Form.Select
                  size="sm"
                  style={{ width: "160px" }}
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="All">All Classes</option>
                  {classes
                    .filter(
                      (cls) =>
                        selectedSchool === "All" || cls.startsWith(selectedSchool)
                    )
                    .map((cls, i) => (
                      <option key={i} value={cls}>
                        {cls.replaceAll("-", " ")}
                      </option>
                    ))}
                </Form.Select>

                {/* Country Filter */}
                <Form.Select
                  size="sm"
                  style={{ width: "150px" }}
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="All">All Countries</option>
                  {countries.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </Form.Select>

                {/* <Button variant="primary" onClick={() => setShowImportModal(true)}>
                  <i className="bi bi-upload"></i> Import
                </Button> */}

                <Button
                  variant="primary"
                  onClick={() => setShowImportModal(true)}
                  disabled={isStudentLimitReached}
                >
                  <i className="bi bi-upload"></i>{" "}
                  {isStudentLimitReached ? "Student Limit Reached" : "Import"}
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

            {/* Search */}
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
              customStyles={dataTableCustomStyles}
              pagination
              responsive
              highlightOnHover
              striped
              noDataComponent={<NoDataComponent />}
              onChangePage={(page) => setCurrentPage(page)}
              onChangeRowsPerPage={(rows) => setPerPage(rows)}
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
            Required columns: <b>School, Year, Class, Section, Roll No., Country</b>
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={uploading} onClick={handleUpload}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation */}
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
