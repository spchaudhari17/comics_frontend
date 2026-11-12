import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API from '../../API';
import { toast } from "react-toastify";
import "./authentication.scss";

// Password field: left me lock icon, right me show/hide button
const PasswordField = ({ label, value, onChange, placeholder, visible, onToggle, isInvalid, feedback, autoComplete }) => (
    <Form.Group className="mb-3">
        <Form.Label>{label} <span className="text-danger">*</span></Form.Label>
        <div className="cp-input">
            <i className="bi bi-lock cp-input-icon" aria-hidden="true"></i>
            <Form.Control
                type={visible ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                isInvalid={isInvalid}
                required
            />
            <button
                type="button"
                className="cp-eye"
                onClick={onToggle}
                aria-label={visible ? "Hide password" : "Show password"}
            >
                <i className={`bi ${visible ? "bi-eye-slash" : "bi-eye"}`}></i>
            </button>
        </div>
        {isInvalid && <div className="cp-feedback">{feedback}</div>}
    </Form.Group>
);

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [oldVisible, setOldVisible] = useState(false);
    const [newVisible, setNewVisible] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);

    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token");

    // Confirm tabhi check karo jab user ne kuch likha ho
    const mismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;
    const sameAsOld = newPassword.length > 0 && newPassword === oldPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mismatch || sameAsOld) return;

        setLoading(true);

        try {
            const res = await API.post(
                "/user/changePassword",
                {
                    old_password: oldPassword,
                    password: newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.data.error) {
                toast.error(res.data.message);
            } else {
                toast.success(res.data.message);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        }

        setLoading(false);
    };

    return (
        <div className="auth-page change-password-page">
            <div className="container-xl">
                <div className="cp-card">
                    <div className="cp-head">
                        <span className="cp-icon"><i className="bi bi-shield-lock-fill"></i></span>
                        <h1>Change Password</h1>
                        <p>Keep your Kridemy account safe with a strong password.</p>
                    </div>

                    <Form onSubmit={handleSubmit}>
                        <PasswordField
                            label="Current Password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Enter current password"
                            visible={oldVisible}
                            onToggle={() => setOldVisible(!oldVisible)}
                            autoComplete="current-password"
                        />

                        <PasswordField
                            label="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            visible={newVisible}
                            onToggle={() => setNewVisible(!newVisible)}
                            isInvalid={sameAsOld}
                            feedback="New password must be different from the current one."
                            autoComplete="new-password"
                        />

                        <PasswordField
                            label="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            visible={confirmVisible}
                            onToggle={() => setConfirmVisible(!confirmVisible)}
                            isInvalid={mismatch}
                            feedback="Passwords do not match."
                            autoComplete="new-password"
                        />

                        <ul className="cp-tips">
                            <li><i className="bi bi-check2-circle"></i>Use at least 8 characters</li>
                            <li><i className="bi bi-check2-circle"></i>Mix letters, numbers and symbols</li>
                        </ul>

                        <Button
                            variant="primary"
                            type="submit"
                            className="w-100 btn-custom"
                            disabled={loading || mismatch || sameAsOld}
                        >
                            {loading ? <Spinner animation="border" size="sm" /> : "Update Password"}
                        </Button>
                    </Form>

                    <div className="text-center mt-4">
                        <Link to="/my-account" className="cp-back">
                            <i className="bi bi-arrow-left"></i> Back to My Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
