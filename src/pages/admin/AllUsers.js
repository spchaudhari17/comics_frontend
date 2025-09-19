import React, { useEffect, useState } from "react";
import { Badge, Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import dataTableCustomStyles from "../../assets/styles/dataTableCustomStyles";
import { NoDataComponent } from "../../components/NoDataComponent";
import { Loader } from "../../lib/loader";
import API from "../../API";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // API call
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

  // Filter users by username or email
  const filteredUsers = users.filter((u) => {
    const searchTerm = search.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(searchTerm)) ||
      (u.email && u.email.toLowerCase().includes(searchTerm))
    );
  });

  // Table columns
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
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
      minWidth: "150px",
      cell: (row) => <Badge bg="info">{row.userType || "N/A"}</Badge>,
    },
    {
      name: "Joined On",
      selector: (row) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
      minWidth: "150px",
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
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="main-heading">All Users -</div>
              <div className="fs-5 fw-semibold text-primary">
                Total Users: {users.length}
              </div>
            </div>

            {/* Search Box */}
            <div className="mb-3">
              <Form.Control
                type="text"
                placeholder="Search by username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
