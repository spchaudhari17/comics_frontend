import React, { useEffect, useState } from "react";
import API from "../../API";
import { toast } from "react-toastify"; // Make sure react-toastify is installed

const BIO_MAX_LENGTH = 500;
const BACKGROUND_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const BACKGROUND_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

const ProfileDetails = () => {
  const [userInfo, setUserInfo] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState(false);
  const [bgLoading, setBgLoading] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [bioSaving, setBioSaving] = useState(false);

  // localStorage + state dono update karo
  const saveUser = (patch) => {
    setUserInfo((prev) => {
      const updatedUser = { ...prev, ...patch };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  // Purane login wale user ke paas bio / background_image localStorage me nahi hoga -> server se lao
  useEffect(() => {
    if (!userInfo) return;
    API.get("/user/getProfile")
      .then(({ data }) => {
        if (data?.error === false && data.data) {
          saveUser({
            profile_pic: data.data.profile_pic || "",
            background_image: data.data.background_image || "",
            bio: data.data.bio || ""
          });
        }
      })
      .catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!userInfo) {
    return <h3 className="text-center mt-5">No user data found.</h3>;
  }

  const handleBackgroundUpload = async (event) => {
    const file = event.target.files[0];
    event.target.value = ""; // same file dobara select ho sake
    if (!file) return;

    if (!BACKGROUND_TYPES.includes(file.type)) {
      toast.error("Invalid image type. Allowed: jpeg, png, gif, webp");
      return;
    }

    if (file.size > BACKGROUND_MAX_SIZE) {
      toast.error("Background image size cannot be greater than 5 MB");
      return;
    }

    setBgLoading(true);

    const formData = new FormData();
    formData.append('background_image', file);

    try {
      const response = await API.post('/user/updateBackgroundImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.error === false) {
        saveUser({ background_image: response.data.background_image });
        toast.success("Background image updated successfully!");
      } else {
        toast.error(response.data.message || "Failed to update background image");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Background upload error:", error);
    } finally {
      setBgLoading(false);
    }
  };

  const handleBackgroundDelete = async () => {
    if (!window.confirm("Remove your background image?")) return;

    setBgLoading(true);
    try {
      const response = await API.post('/user/deleteBackgroundImage');

      if (response.data.error === false) {
        saveUser({ background_image: "" });
        toast.success("Background image removed");
      } else {
        toast.error(response.data.message || "Failed to remove background image");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Background delete error:", error);
    } finally {
      setBgLoading(false);
    }
  };

  const startEditBio = () => {
    setBioDraft(userInfo.bio || "");
    setIsEditingBio(true);
  };

  const handleBioSave = async () => {
    const cleanBio = bioDraft.trim();

    if (cleanBio.length > BIO_MAX_LENGTH) {
      toast.error(`Bio cannot be longer than ${BIO_MAX_LENGTH} characters`);
      return;
    }

    setBioSaving(true);
    try {
      const response = await API.post('/user/updateBio', { bio: cleanBio });

      if (response.data.error === false) {
        saveUser({ bio: response.data.bio });
        setIsEditingBio(false);
        toast.success(response.data.message || "Bio updated successfully!");
      } else {
        toast.error(response.data.message || "Failed to update bio");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Bio update error:", error);
    } finally {
      setBioSaving(false);
    }
  };

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
        saveUser({ profile_pic: response.data.profile_pic });
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
      <div className="content-wrapper bg-theme1 border rounded overflow-hidden">

        {/* Background / Cover Image */}
        <div
          className="position-relative"
          style={{
            height: "180px",
            background: userInfo.background_image
              ? `url("${userInfo.background_image}") center / cover no-repeat`
              : "linear-gradient(135deg, #F59E0B 0%, #FDE68A 100%)"
          }}
        >
          <div className="position-absolute top-0 end-0 m-2 d-flex gap-2">
            <label
              htmlFor="background-image-upload"
              className="btn btn-sm btn-light shadow-sm d-flex align-items-center gap-1 mb-0"
              style={{ cursor: bgLoading ? "not-allowed" : "pointer", opacity: bgLoading ? 0.7 : 1 }}
            >
              {bgLoading ? (
                <span className="spinner-border spinner-border-sm" style={{ width: "14px", height: "14px" }} />
              ) : (
                <i className="bi bi-camera-fill"></i>
              )}
              <span className="d-none d-sm-inline">
                {userInfo.background_image ? "Change cover" : "Add cover"}
              </span>
              <input
                type="file"
                id="background-image-upload"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleBackgroundUpload}
                style={{ display: "none" }}
                disabled={bgLoading}
              />
            </label>

            {userInfo.background_image && (
              <button
                type="button"
                className="btn btn-sm btn-light shadow-sm"
                onClick={handleBackgroundDelete}
                disabled={bgLoading}
                title="Remove cover"
                aria-label="Remove cover"
              >
                <i className="bi bi-trash"></i>
              </button>
            )}
          </div>
        </div>

        <div className="p-4 pt-0">

        <div className="d-flex align-items-end gap-3 mb-4" style={{ marginTop: "-40px" }}>
          <div className="profile-img-wrapper position-relative">
            <img
              src={
                userInfo.profile_pic
                  ? userInfo.profile_pic
                  : require("../../assets/images/avatar.png")
              }
              alt="Profile"
              className="rounded-circle bg-white shadow-sm"

              style={{ width: "88px", height: "88px", objectFit: "cover", border: "4px solid #fff" }}
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

        {/* Bio */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h5 className="fw-bold mb-0">About Me</h5>
          {!isEditingBio && (
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={startEditBio}>
              <i className="bi bi-pencil me-1"></i>
              {userInfo.bio ? "Edit" : "Add bio"}
            </button>
          )}
        </div>

        <div className="mb-4">
          {isEditingBio ? (
            <>
              <textarea
                className="form-control"
                rows={4}
                maxLength={BIO_MAX_LENGTH}
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                placeholder="Tell students and parents a little about yourself, what you teach and your experience..."
                disabled={bioSaving}
                autoFocus
              />
              <div className="d-flex align-items-center justify-content-between mt-2">
                <small className="text-muted">{bioDraft.length}/{BIO_MAX_LENGTH}</small>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setIsEditingBio(false)}
                    disabled={bioSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={handleBioSave}
                    disabled={bioSaving}
                  >
                    {bioSaving && <span className="spinner-border spinner-border-sm me-1" />}
                    Save
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-muted" style={{ whiteSpace: "pre-line" }}>
              {userInfo.bio || "No bio added yet."}
            </div>
          )}
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
    </div>
  );
};

export default ProfileDetails;