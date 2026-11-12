import React, { useEffect, useState } from "react";
import API from "../../API";
import { toast } from "react-toastify"; // Make sure react-toastify is installed
import "../MyAccount/MyAccount.scss";

const BIO_MAX_LENGTH = 500;
const BACKGROUND_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const BACKGROUND_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const PROFILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

const ROLE_LABELS = { user: "Teacher", admin: "Admin", moderator: "Moderator", parent: "Parent", student: "Student" };

// Profile ka data + saare update handlers.
// MyAccount me banner aur Profile tab dono ek hi state share karte hain.
export const useProfile = () => {
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
    event.target.value = ""; // same file dobara select ho sake
    if (!file) return;

    // Validate file type
    if (!PROFILE_TYPES.includes(file.type)) {
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

  return {
    userInfo,
    loading,
    bgLoading,
    isEditingBio,
    setIsEditingBio,
    bioDraft,
    setBioDraft,
    bioSaving,
    startEditBio,
    handleBioSave,
    handleBackgroundUpload,
    handleBackgroundDelete,
    handleImageUpload
  };
};

// ===== Upar wala banner: cover image (ya brand gradient) + avatar + naam =====
export const ProfileBanner = ({ profile }) => {
  const { userInfo, loading, bgLoading, handleBackgroundUpload, handleBackgroundDelete, handleImageUpload } = profile;
  if (!userInfo) return null;

  const fullName = [userInfo.firstname, userInfo.lastname].filter(Boolean).join(" ") || userInfo.username || "User";
  const roleLabel = ROLE_LABELS[userInfo.userType] || userInfo.userType;

  return (
    <div className="ma-banner">
      <div
        className="ma-cover"
        style={userInfo.background_image
          ? { background: `url("${userInfo.background_image}") center / cover no-repeat` }
          : undefined}
      >
        <div className="ma-cover-actions">
          <label
            htmlFor="background-image-upload"
            className={`ma-cover-btn ${bgLoading ? "is-busy" : ""}`}
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
              className="ma-cover-btn"
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

      <div className="ma-identity">
        <div className="ma-avatar">
          <img
            src={userInfo.profile_pic || require("../../assets/images/avatar.png")}
            alt="Profile"
          />

          {/* Pencil Icon for Image Upload */}
          <label
            htmlFor="profile-image-upload"
            className={`ma-avatar-edit ${loading ? "is-busy" : ""}`}
            title="Change profile photo"
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" style={{ width: "14px", height: "14px" }} />
            ) : (
              <i className="bi bi-pencil-fill"></i>
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

        <div className="ma-identity-text">
          <h1 className="text-capitalize">{fullName}</h1>
          <div className="ma-email">{userInfo.email}</div>
          <div className="ma-badges">
            {roleLabel && <span className="ma-badge"><i className="bi bi-person-badge"></i>{roleLabel}</span>}
            {userInfo.is_emailVerified === 1 && (
              <span className="ma-badge ma-badge-success"><i className="bi bi-patch-check-fill"></i>Verified</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="ma-info-item">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

// ===== Profile tab: bio + personal / contact / account details =====
export const ProfileInfo = ({ profile }) => {
  const { userInfo, isEditingBio, setIsEditingBio, bioDraft, setBioDraft, bioSaving, startEditBio, handleBioSave } = profile;
  if (!userInfo) return null;

  return (
    <div className="ma-profile-info">
      {/* Bio */}
      <div className="ma-section-head">
        <h5>About Me</h5>
        {!isEditingBio && (
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={startEditBio}>
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
          <div className={`ma-bio ${userInfo.bio ? "" : "is-empty"}`}>
            {userInfo.bio || "No bio added yet."}
          </div>
        )}
      </div>

      <h5 className="ma-group-title">Personal Information</h5>
      <div className="ma-info-grid">
        <InfoItem label="First Name" value={userInfo.firstname || "-"} />
        <InfoItem label="Last Name" value={userInfo.lastname || "-"} />
        <InfoItem label="Username" value={userInfo.username || "Not set"} />
        <InfoItem label="User Type" value={ROLE_LABELS[userInfo.userType] || userInfo.userType || "-"} />
      </div>

      <h5 className="ma-group-title">Contact Details</h5>
      <div className="ma-info-grid">
        <InfoItem label="Email" value={userInfo.email || "-"} />
        <InfoItem label="Mobile" value={`${userInfo.countryCode || ""} ${userInfo.mobileNumber || ""}`.trim() || "-"} />
      </div>

      <h5 className="ma-group-title">Account Details</h5>
      <div className="ma-info-grid mb-0">
        <InfoItem
          label="Created At"
          value={userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : "-"}
        />
        <InfoItem label="Email Verified" value={userInfo.is_emailVerified === 1 ? "Yes" : "No"} />
      </div>
    </div>
  );
};

// /my-profile route: banner + details ek saath
const ProfileDetails = () => {
  const profile = useProfile();

  if (!profile.userInfo) {
    return <h3 className="text-center mt-5">No user data found.</h3>;
  }

  return (
    <div className="ma-page">
      <div className="container my-5" style={{ maxWidth: "760px" }}>
        <ProfileBanner profile={profile} />
        <div className="ma-content mt-4">
          <ProfileInfo profile={profile} />
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
