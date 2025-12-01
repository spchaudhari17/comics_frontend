import React, { useEffect, useState } from "react";
import { Badge, Form, Modal, Button } from "react-bootstrap";
import DataTable from "react-data-table-component";
import dataTableCustomStyles from "../../assets/styles/dataTableCustomStyles";
import { NoDataComponent } from "../../components/NoDataComponent";
import { Loader } from "../../lib/loader";
import API from "../../API";
import { toast } from "react-toastify";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [roleFilter, setRoleFilter] = useState("all");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedUserInfo, setSelectedUserInfo] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);


  const handleCloseInfo = () => setShowInfoModal(false);



  const handleClose = () => setShowDeleteModal(false);

  const userInfo = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // Fetch All Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await API.get("/admin/getAllUsers");

      if (data.success) {
        setUsers(data.data);
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Assign/Remove Moderator
  const handleModeratorToggle = async (userId) => {
    try {
      const { data } = await API.post("/admin/assign-moderator", { user_id: userId });

      if (!data.error) {
        toast.success(data.message);
        fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating role");
    }
  };

  // Toggle Unlimited Access
  const handleUnlimitedToggle = async (userId, currentValue) => {
    try {
      const { data } = await API.post("/admin/unlimited", {
        userId,
        isUnlimited: !currentValue  // toggle
      });

      if (data.success) {
        toast.success(data.message);
        fetchUsers(); // refresh list
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
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
        fetchUsers();
        handleClose();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  // Filter Users
  const filteredUsers = users.filter((u) => {
    const searchTerm = search.toLowerCase();

    const matchSearch =
      (u.username && u.username.toLowerCase().includes(searchTerm)) ||
      (u.email && u.email.toLowerCase().includes(searchTerm));

    const matchRole = roleFilter === "all" ? true : u.userType === roleFilter;

    return matchSearch && matchRole;
  });


  // Table Columns
  const columns = [
    {
      name: "#",
      selector: (row, index) => (currentPage - 1) * perPage + index + 1,
      width: "60px",
    },
    {
      name: "Name",
      selector: (row) => row.firstname + " " + (row.lastname || ""),
      sortable: true,
      minWidth: "180px",
    },
    {
      name: "Username",
      selector: (row) => row.username || row.email,
      sortable: true,
      minWidth: "220px",
    },
    {
      name: "User Type",
      selector: (row) => row.userType,
      sortable: true,
      minWidth: "50px",
      cell: (row) => <Badge bg="info">{row.userType || "N/A"}</Badge>,
    },
    {
      name: "Joined On",
      selector: (row) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
      minWidth: "50px",
    },
    {
      name: "Actions",
      minWidth: "350px",
      cell: (row) => (
        <div className="d-flex gap-2">


          {/* Toggle Moderator */}
          {userInfo.userType === "admin" && row.userType === "user" && (
            <button
              className="btn btn-sm btn-success d-flex align-items-center gap-1"
              onClick={() => handleModeratorToggle(row._id)}
            >
              <i className="bi bi-person-plus"></i>
              Assign Moderator
            </button>
          )}

          {/* Remove Moderator (only admin can remove) */}
          {userInfo.userType === "admin" && row.userType === "moderator" && (
            <button
              className="btn btn-sm btn-warning d-flex align-items-center gap-1"
              onClick={() => handleModeratorToggle(row._id)}
            >
              <i className="bi bi-person-dash"></i>
              Remove Moderator
            </button>
          )}

          {/* Unlimited Access Toggle (Only admin → only for normal user) */}
          {(userInfo.userType === "admin" &&
            (row.userType === "user" || row.userType === "admin")) && (

              <button
                className={`btn btn-sm ${row.isUnlimited ? "btn-warning" : "btn-success"
                  } d-flex align-items-center gap-1`}
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





          {/* View Info Button */}
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
          {userInfo?.userType === "admin" && row.userType !== "admin" && (
            <button
              className="btn btn-sm btn-danger d-flex align-items-center gap-1"
              onClick={() => handleDeleteOpen(row._id)}
            >
              <i className="bi bi-trash3"></i>
            </button>
          )}

        </div>
      ),
    },
  ];

  return (
    <div className="all-users-page pt-4 pb-3">
      <div className="container-xl">
        {loading ? (
          <Loader />
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <div className="info-wrapper bg-white rounded-4 p-3">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="main-heading">All Users -</div>
              <div className="fs-5 fw-semibold text-primary">
                Total Users: {filteredUsers.length}
              </div>
            </div>

            {/* Search Box */}
            <div className="mb-3 d-flex gap-2">

              {/* Role Filter - 50% Width */}
              <Form.Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-50"
              >
                <option value="all">All</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">User</option>
                <option value="student">Student</option>
              </Form.Select>

              {/* Search Box - 50% Width */}
              <Form.Control
                type="text"
                placeholder="Search by username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-50"
              />

            </div>


            {/* Users Table */}
            <div className="table-responsive table-custom-wrapper">
              <DataTable
                columns={columns}
                data={filteredUsers}
                highlightOnHover
                responsive
                pagination
                customStyles={dataTableCustomStyles}
                noDataComponent={<NoDataComponent />}
                striped
                onChangePage={(page) => setCurrentPage(page)}
                onChangeRowsPerPage={(rows) => setPerPage(rows)}
              />
            </div>
          </div>
        )}
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
              <p><strong>Joined On: </strong> {new Date(selectedUserInfo.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseInfo}>Close</Button>
        </Modal.Footer>
      </Modal>


      {/* Delete Modal */}
      <Modal show={showDeleteModal} centered onHide={handleClose}>
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
              <Button variant="secondary" className="px-4 py-2" onClick={handleClose}>
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
