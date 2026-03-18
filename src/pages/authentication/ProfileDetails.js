import React, { useState } from "react";
import API from "../../API";
import { toast } from "react-toastify"; // Make sure react-toastify is installed

const ProfileDetails = () => {
  const [userInfo, setUserInfo] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  if (!userInfo) {
    return <h3 className="text-center mt-5">No user data found.</h3>;
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid image type. Allowed: jpeg, png, gif, webp, svg");
      return;
    }

    // Validate file size (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile image size cannot be greater than 2 MB");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('profile_pic', file);

    try {
      const response = await API.post('/user/updatePic', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.error === false) {
        // Update user info in localStorage
        const updatedUser = {
          ...userInfo,
          profile_pic: response.data.profile_pic
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserInfo(updatedUser);
        toast.success("Profile image updated successfully!");
      } else {
        toast.error(response.data.message || "Failed to update profile image");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: "700px" }}>
      <div className="content-wrapper bg-theme1 border p-4 rounded">

        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="profile-img-wrapper position-relative">
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

            {/* Pencil Icon for Image Upload */}
            <label
              htmlFor="profile-image-upload"
              className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 shadow-sm"
              style={{
                cursor: loading ? "not-allowed" : "pointer",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "translate(10%, 10%)",
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? (
                <div className="spinner-border spinner-border-sm" style={{ width: "14px", height: "14px" }} />
              ) : (
                <i className="bi bi-pencil-fill" style={{ fontSize: "14px" }}></i>
              )}
              <input
                type="file"
                id="profile-image-upload"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                onChange={handleImageUpload}
                style={{ display: "none" }}
                disabled={loading}
              />
            </label>
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