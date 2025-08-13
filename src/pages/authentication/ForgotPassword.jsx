import React, { useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setconfirmPassword] = useState('');

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPassVisible, setconfirmPassVisible] = useState(false);

    const togglePassVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };
    const toggleConfirmPassVisibility = () => {
        setconfirmPassVisible(!confirmPassVisible);
    };

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        // Send OTP to the email
        setStep(2); // Go to OTP input
    };

    const handleOtpSubmit = (e) => {
        e.preventDefault();
        // Verify OTP
        setStep(3); // Go to new password input
    };

    const handleNewPasswordSubmit = (e) => {
        e.preventDefault();
        // Reset password logic
        alert('Password has been reset!');
    };
    return (
        <div className='auth-page forgotPassword-page d-flex justify-content-center align-items-center min-vh-100 py-4'>
            <div className="container-xl" style={{ maxWidth: '550px' }}>
                <div className="content-wrapper bg-theme1 rounded-3 shadow">
                    {step === 1 && (
                        <Form onSubmit={handleEmailSubmit}>
                            <div className="heading-wrapper text-dark mb-4 pb-2">
                                <div className="fs-2 fw-bold font-roboto lh-sm mb-1">Forgot Password</div>
                                <div className="fs-14 text-muted">Kindly enter the Email Address tied to your account, we would help you to reset your password</div>
                            </div>
                            <Form.Group className="mb-3" controlId="formEmail">
                                <Form.Label>Email address<span className="text-danger">*</span></Form.Label>
                                <Form.Control type="email" placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="off" required
                                />
                            </Form.Group>
                            <div className="btn-wrapper mt-4 pt-2">
                                <Row className="g-2 gx-md-3">
                                    <Col>
                                        <Button type="button" variant="secondary" className="w-100 btn-custom d-flex align-items-center justify-content-center px-3" onClick={() => navigate('/login')}>
                                            Back to login
                                        </Button>
                                    </Col>
                                    <Col>
                                        <Button type="submit" variant="primary" className="w-100 btn-custom d-flex align-items-center justify-content-center px-3">Send OTP</Button>
                                    </Col>
                                </Row>
                            </div>
                        </Form>
                    )}
                    {step === 2 && (
                        <Form onSubmit={handleOtpSubmit}>
                            <div className="heading-wrapper text-dark mb-4 pb-2">
                                <div className="fs-2 fw-bold font-roboto lh-sm mb-1">Enter OTP</div>
                                <div className="fs-14 text-muted">An 4 digit code has been sent to your <span className="text-primary fw-semibold">+91 9083990020</span></div>
                            </div>
                            <Form.Group className="mb-3" controlId="formOtp">
                                <Form.Label>Enter OTP<span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" placeholder="Enter OTP" maxLength={4}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    autoComplete="off" required
                                />
                            </Form.Group>
                            <div className="btn-wrapper mt-4 pt-2">
                                <Button variant="primary" type="submit" className="btn-custom w-100 py-2">Verify OTP</Button>
                            </div>
                        </Form>
                    )}
                    {step === 3 && (
                        <Form onSubmit={handleNewPasswordSubmit}>
                            <div className="heading-wrapper text-dark mb-4 pb-2">
                                <div className="fs-2 fw-bold font-roboto lh-sm mb-1">Reset Password</div>
                                <div className="fs-14 text-muted">Enter your new password to regain access.</div>
                            </div>
                            <Form.Group className="mb-4" controlId="formNewPassword">
                                <Form.Label>New Password<span className="text-danger">*</span></Form.Label>
                                <div className="position-relative">
                                    <Form.Control type={passwordVisible ? 'text' : 'password'} placeholder="Please enter the 8 digit password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoComplete='new-password' required
                                    />
                                    <span role="button" className="position-absolute top-50 translate-middle-y text-secondary" onClick={togglePassVisibility} style={{ right: '10px' }}>
                                        {passwordVisible ? <i className="bi bi-eye-slash-fill fs-16"></i> : <i className="bi bi-eye-fill fs-16"></i>}
                                    </span>
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="formConfirmPassword">
                                <Form.Label>Confirm Password<span className="text-danger">*</span></Form.Label>
                                <div className="position-relative">
                                    <Form.Control type={confirmPassVisible ? 'text' : 'password'} placeholder="Please enter the 8 digit password"
                                        value={confirmPassword}
                                        onChange={(e) => setconfirmPassword(e.target.value)}
                                        autoComplete='new-password' required
                                    />
                                    <span role="button" className="position-absolute top-50 translate-middle-y text-secondary" onClick={toggleConfirmPassVisibility} style={{ right: '10px' }}>
                                        {confirmPassVisible ? <i className="bi bi-eye-slash-fill fs-16"></i> : <i className="bi bi-eye-fill fs-16"></i>}
                                    </span>
                                </div>
                            </Form.Group>
                            <div className="btn-wrapper">
                                <Button variant="primary" type="submit" className="btn-custom w-100 py-2" onClick={() => navigate('/login')}>Submit</Button>
                            </div>
                        </Form>
                    )}
                </div>
            </div>
        </div>
    )
}
