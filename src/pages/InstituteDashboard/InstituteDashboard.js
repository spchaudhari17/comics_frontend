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
  const [showAddByUsernameModal, setShowAddByUsernameModal] = useState(false);
  const [studentUsername, setStudentUsername] = useState("");

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    School: "",
    Year: "",
    Class: "",
    Section: "",
    RollNo: "",
    Country: "",
  });

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

  // Remove States (replacing delete)
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null); // 'all' or studentId
  const [removing, setRemoving] = useState(false);
  const [removeType, setRemoveType] = useState('single'); // 'single' or 'all'

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
        const uniqueSchools = [...new Set(data.data.map((s) => s.classInfo?.school).filter(Boolean))];
        setSchools(uniqueSchools);

        // Unique Countries
        const uniqueCountries = [...new Set(data.data.map((s) => s.classInfo?.country).filter(Boolean))];
        setCountries(uniqueCountries);

        // Unique Classes
        const uniqueClasses = [
          ...new Set(
            data.data
              .map(
                (s) =>
                  `${s.classInfo?.school}-${s.classInfo?.year}-${s.classInfo?.class}-${s.classInfo?.section}`
              )
              .filter(Boolean)
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

      if (res.data.error) {
        toast.error(res.data.message);
      } else {
        // Show detailed message about new vs linked students
        const message = res.data.message;
        const newCount = res.data.createdStudents || 0;
        const linkedCount = res.data.linkedExistingStudents || 0;

        toast.success(
          `${message}. ${newCount} new, ${linkedCount} linked from existing.`
        );

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
      if (!res.data.error) {
        toast.success(`Password reset successful! New password: ${res.data.newPassword}`);
        // Update the specific student's password in UI
        setStudents(prev => prev.map(s =>
          s._id === studentId
            ? { ...s, plain_password: res.data.newPassword }
            : s
        ));
      }
    } catch {
      toast.error("Error resetting password");
    }
  };

  // Remove student(s) - UPDATED: using remove APIs
  const handleRemoveConfirm = async () => {
    if (!removeTarget) return;
    setRemoving(true);

    try {
      if (removeTarget === "all") {
        // Remove all students from this teacher's classroom
        const res = await API.post("/user/removeAllStudents", {
          filter: selectedClass === "All" ? undefined : selectedClass,
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
        } else {
          toast.error(res.data.message);
        }
      } else {
        // Remove single student from this teacher's classroom
        const res = await API.post("/user/removeStudent", {
          studentId: removeTarget,
        });

        if (!res.data.error) {
          toast.success("Student removed from your classroom");

          // 🧹 Optimistically remove from UI
          setStudents((prev) => prev.filter((s) => s._id !== removeTarget));
        } else {
          toast.error(res.data.message);
        }
      }

      // Background re-fetch to sync (optional, but safe)
      setTimeout(fetchStudents, 500);

    } catch (e) {
      toast.error(e.response?.data?.message || "Error removing student(s)");
    } finally {
      setRemoving(false);
      setShowRemoveModal(false);
      setRemoveTarget(null);
    }
  };

  // addSingleStudent
  const handleAddStudent = async () => {
    // Validate all fields
    const requiredFields = ['School', 'Year', 'Class', 'Section', 'RollNo'];
    const missingField = requiredFields.find(field => !newStudent[field]?.trim());

    if (missingField) {
      return toast.error(`${missingField} is required`);
    }

    try {
      const res = await API.post("/user/add-student", newStudent);

      if (res.data.error) {
        toast.error(res.data.message);
      } else {
        toast.success(res.data.message || "Student Added Successfully!");
        setShowAddModal(false);
        fetchStudents();
        setNewStudent({
          School: "",
          Year: "",
          Class: "",
          Section: "",
          RollNo: "",
          Country: "",
        });
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Error adding student");
    }
  };

  const handleAddStudentByUsername = async () => {
    if (!studentUsername.trim()) {
      return toast.warning("Please enter student username");
    }

    try {
      const res = await API.post("/user/add-student-by-username", {
        username: studentUsername,
      });

      if (res.data.error) {
        toast.error(res.data.message);
      } else {
        toast.success("Student added to your classroom!");
        setShowAddByUsernameModal(false);
        setStudentUsername("");
        fetchStudents();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Error adding student");
    }
  };

  // Filter Logic
  const filteredStudents = students.filter((s) => {
    const term = search.toLowerCase();

    const matchSearch =
      s.username?.toLowerCase().includes(term) ||
      s.classInfo?.class?.toLowerCase().includes(term) ||
      s.classInfo?.section?.toLowerCase().includes(term) ||
      s.classInfo?.school?.toLowerCase().includes(term);

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
      Password: s.plain_password || "********",
      School: s.classInfo?.school || "-",
      Year: s.classInfo?.year || "-",
      Class: s.classInfo?.class || "-",
      Section: s.classInfo?.section || "-",
      RollNo: s.classInfo?.rollNo || "-",
      Country: s.classInfo?.country || "-",
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
    { name: "Username", selector: (row) => row.username, sortable: true },
    { name: "Password", selector: (row) => row.plain_password || "••••••••", sortable: true },
    { name: "School", selector: (row) => row.classInfo?.school || "-", sortable: true },
    { name: "Year", selector: (row) => row.classInfo?.year || "-", sortable: true },
    { name: "Class", selector: (row) => row.classInfo?.class || "-", sortable: true },
    {
      name: "Section",
      selector: (row) => row.classInfo?.section || "-",
      cell: (row) => row.classInfo?.section ? <Badge bg="info">{row.classInfo.section}</Badge> : "-",
    },
    {
      name: "Roll No",
      selector: (row) => row.classInfo?.rollNo || "-",
      width: "100px"
    },
    { name: "Country", selector: (row) => row.classInfo?.country || "-", sortable: true },
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

          <Button
            size="sm"
            variant="warning"
            onClick={() => handleResetPassword(row._id)}
            title="Reset password"
          >
            <i className="bi bi-key"></i>
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setRemoveTarget(row._id);
              setRemoveType('single');
              setShowRemoveModal(true);
            }}
            title="Remove from my classroom"
          >
            <i className="bi bi-person-x"></i>
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
  const studentsLimit = subscription.studentsLimit || 0;

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
              <h4 className="fw-bold">🎓 My Students</h4>
              <div className="d-flex gap-2 flex-wrap">
                <Badge bg={isStudentLimitReached ? "danger" : "success"} className="px-3 py-2">
                  Students: {studentsUsed} {!isUnlimited && `/ ${studentsLimit}`}
                  {isUnlimited && " (Unlimited)"}
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

                <Button
                  variant="primary"
                  onClick={() => setShowImportModal(true)}
                  disabled={isStudentLimitReached}
                  title={isStudentLimitReached ? "Student limit reached" : "Import students from Excel"}
                >
                  <i className="bi bi-upload"></i> Import
                </Button>

                <Button
                  variant="dark"
                  onClick={() => setShowAddModal(true)}
                  disabled={isStudentLimitReached}
                  title={isStudentLimitReached ? "Student limit reached" : "Add new student"}
                >
                  <i className="bi bi-person-plus"></i> Add
                </Button>

                <Button
                  variant="info"
                  onClick={() => setShowAddByUsernameModal(true)}
                  title="Add existing student by username"
                >
                  <i className="bi bi-person-check"></i> Add by Username
                </Button>

                <Button variant="success" onClick={handleDownloadExcel} title="Download filtered students">
                  <i className="bi bi-download"></i> Download
                </Button>

                <Button
                  variant="danger"
                  onClick={() => {
                    setRemoveTarget("all");
                    setRemoveType('all');
                    setShowRemoveModal(true);
                  }}
                  disabled={students.length === 0}
                  title="Remove all students from my classroom"
                >
                  <i className="bi bi-person-x"></i> Remove All
                </Button>
              </div>
            </div>

            {/* Search */}
            <Form.Control
              type="text"
              placeholder="Search by username, school, class or section..."
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
              paginationPerPage={perPage}
              paginationRowsPerPageOptions={[10, 20, 50, 100]}
            />

            {/* Show total count */}
            <div className="text-muted mt-2">
              Showing {filteredStudents.length} of {students.length} students
            </div>
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
          <small className="text-muted d-block mt-2">
            Required columns: <b>School, Year, Class, Section, Roll No., Country</b>
          </small>
          <small className="text-muted d-block">
            Note: Existing students will be linked to your classroom automatically.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={uploading || !file} onClick={handleUpload}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Single Student Modal */}
      <Modal show={showAddModal} centered onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>➕ Add New Student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>School <span className="text-danger">*</span></Form.Label>
            <Form.Control
              value={newStudent.School}
              placeholder="Enter school name e.g. ABC"
              required
              onChange={(e) =>
                setNewStudent({ ...newStudent, School: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Year <span className="text-danger">*</span></Form.Label>
            <Form.Control
              value={newStudent.Year}
              placeholder="Enter Year (e.g. 2024)"
              required
              onChange={(e) =>
                setNewStudent({ ...newStudent, Year: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Class <span className="text-danger">*</span></Form.Label>
            <Form.Control
              value={newStudent.Class}
              placeholder="Enter Class (e.g. 10)"
              required
              onChange={(e) =>
                setNewStudent({ ...newStudent, Class: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Section <span className="text-danger">*</span></Form.Label>
            <Form.Control
              value={newStudent.Section}
              placeholder="Enter Section (e.g. A)"
              required
              onChange={(e) =>
                setNewStudent({ ...newStudent, Section: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Roll No <span className="text-danger">*</span></Form.Label>
            <Form.Control
              value={newStudent.RollNo}
              placeholder="Enter Roll number"
              required
              onChange={(e) =>
                setNewStudent({ ...newStudent, RollNo: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Country</Form.Label>
            <Form.Control
              value={newStudent.Country}
              placeholder="Enter Country (default: IN)"
              onChange={(e) =>
                setNewStudent({ ...newStudent, Country: e.target.value })
              }
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddStudent}>
            Add Student
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add by Username Modal */}
      <Modal
        show={showAddByUsernameModal}
        centered
        onHide={() => setShowAddByUsernameModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>🔎 Add Student by Username</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group>
            <Form.Label>Student Username</Form.Label>
            <Form.Control
              placeholder="Enter student username"
              value={studentUsername}
              onChange={(e) => setStudentUsername(e.target.value)}
            />
            <small className="text-muted d-block mt-2">
              Enter an existing student's username to add them to your classroom.
              The student will then appear in your students list.
            </small>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddByUsernameModal(false)}
          >
            Cancel
          </Button>

          <Button variant="primary" onClick={handleAddStudentByUsername}>
            Add to My Classroom
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Remove Confirmation Modal - UPDATED */}
      <Modal show={showRemoveModal} centered onHide={() => setShowRemoveModal(false)}>
        <Modal.Body>
          <div className="content-wrapper text-center">
            <div
              className="icon-cover d-flex align-items-center justify-content-center bg-warning bg-opacity-10 rounded-circle mx-auto mb-3"
              style={{ height: "50px", width: "50px" }}
            >
              <i className="bi bi-person-x fs-4 text-warning"></i>
            </div>
            <div className="fs-18 fw-semibold lh-sm">
              {removeTarget === "all" ? (
                selectedClass === "All" ? (
                  "Remove ALL students from your classroom?"
                ) : (
                  `Remove all students from ${selectedClass.replaceAll("-", " ")}?`
                )
              ) : (
                "Remove this student from your classroom?"
              )}
            </div>
            <div className="text-muted small mt-2">
              This will only remove them from your view. The student account will still exist in the system and can be re-added later.
            </div>
            <div className="btn-wrapper d-flex flex-wrap justify-content-center gap-2 mt-4">
              <Button
                variant="secondary"
                className="px-4 py-2"
                onClick={() => setShowRemoveModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="warning"
                className="px-4 py-2"
                onClick={handleRemoveConfirm}
                disabled={removing}
              >
                {removing ? "Removing..." : "Yes, Remove"}
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default InstituteDashboard;