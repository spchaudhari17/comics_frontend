import React from "react";

const ProfileDetails = () => {
  const userInfo = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  if (!userInfo) {
    return <h3 className="text-center mt-5">No user data found.</h3>;
  }

  return (
    <div className="container my-5" style={{ maxWidth: "700px" }}>
      <div className="content-wrapper bg-theme1 border p-4 rounded">

        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="profile-img-wrapper">
            <img
              src={
                userInfo.profile_pic
                  ? userInfo.profile_pic
                  : require("../../assets/images/avatar.png")
              }
              alt="Profile"
              className="rounded-circle border"
              style={{ width: "80px", height: "80px", objectFit: "cover" }}
            />
          </div>

          <div>
            <h4 className="mb-1 text-capitalize">
              {userInfo.firstname} {userInfo.lastname}
            </h4>
            <div className="text-muted fs-14">{userInfo.email}</div>
          </div>
        </div>

        {/* Personal Info */}
        <h5 className="fw-bold mb-3">Personal Information</h5>
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <label className="fw-semibold">First Name</label>
            <div className="text-muted">{userInfo.firstname || "-"}</div>
          </div>
          <div className="col-md-6 mb-3">
            <label className="fw-semibold">Last Name</label>
            <div className="text-muted">{userInfo.lastname || "-"}</div>
          </div>

          <div className="col-md-6 mb-3">
            <label className="fw-semibold">Username</label>
            <div className="text-muted">{userInfo.username || "Not set"}</div>
          </div>

          <div className="col-md-6 mb-3">
            <label className="fw-semibold">User Type</label>
            <div className="text-muted text-capitalize">
              {userInfo.userType === "user" ? "Teacher" : userInfo.userType}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <h5 className="fw-bold mb-3">Contact Details</h5>
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <label className="fw-semibold">Email</label>
            <div className="text-muted">{userInfo.email}</div>
          </div>

          <div className="col-md-6 mb-3">
            <label className="fw-semibold">Mobile</label>
            <div className="text-muted">
              {userInfo.countryCode} {userInfo.mobileNumber || ""}
            </div>
          </div>
        </div>

        {/* Account Info */}
        <h5 className="fw-bold mb-3">Account Details</h5>
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <label className="fw-semibold">Created At</label>
            <div className="text-muted">
              {new Date(userInfo.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <label className="fw-semibold">Email Verified</label>
            <div className="text-muted">
              {userInfo.is_emailVerified === 1 ? "Yes" : "No"}
            </div>
          </div>
        </div>





      </div>
    </div>
  );
};

export default ProfileDetails;
