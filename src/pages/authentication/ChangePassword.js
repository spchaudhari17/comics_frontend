import React, { useState } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API from '../../API';
import { toast } from "react-toastify";


const ChangePassword = () => {
    const navigate = useNavigate();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [oldVisible, setOldVisible] = useState(false);
    const [newVisible, setNewVisible] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const token = localStorage.getItem("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

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
            }
        } catch (err) {

            toast.error(err.response?.data?.message || "Something went wrong");
        }

        setLoading(false);
    };

    return (
        <div className="auth-page login-page d-flex justify-content-center py-4">
            <div className="container" style={{ maxWidth: '550px' }}>
                <div className="content-wrapper bg-theme1 border">

                    <div className="heading-wrapper text-dark mb-4">
                        <div className="fs-4 fw-bold font-roboto lh-sm mb-1">Change Password</div>
                        <div className="subtitle fs-14 text-muted">Update your account password</div>
                    </div>

                    <Form onSubmit={handleSubmit}>
                        {/* OLD PASSWORD */}
                        <Form.Group className="mb-3">
                            <Form.Label>Old Password <span className="text-danger">*</span></Form.Label>
                            <div className="position-relative">
                                <Form.Control
                                    type={oldVisible ? "text" : "password"}
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Enter old password"
                                    className="pe-5"
                                    required
                                />
                                <span
                                    role="button"
                                    className="position-absolute top-50 translate-middle-y text-secondary"
                                    style={{ right: "10px" }}
                                    onClick={() => setOldVisible(!oldVisible)}
                                >
                                    {oldVisible ? (
                                        <i className="bi bi-eye-slash-fill fs-16"></i>
                                    ) : (
                                        <i className="bi bi-eye-fill fs-16"></i>
                                    )}
                                </span>
                            </div>
                        </Form.Group>

                        {/* NEW PASSWORD */}
                        <Form.Group className="mb-3">
                            <Form.Label>New Password <span className="text-danger">*</span></Form.Label>
                            <div className="position-relative">
                                <Form.Control
                                    type={newVisible ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="pe-5"
                                    required
                                />
                                <span
                                    role="button"
                                    className="position-absolute top-50 translate-middle-y text-secondary"
                                    style={{ right: "10px" }}
                                    onClick={() => setNewVisible(!newVisible)}
                                >
                                    {newVisible ? (
                                        <i className="bi bi-eye-slash-fill fs-16"></i>
                                    ) : (
                                        <i className="bi bi-eye-fill fs-16"></i>
                                    )}
                                </span>
                            </div>
                        </Form.Group>

                        <div className="btn-wrapper mt-4">
                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100 btn-custom py-2"
                                disabled={loading}
                            >
                                {loading ? <Spinner animation="border" size="sm" /> : "Update Password"}
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
