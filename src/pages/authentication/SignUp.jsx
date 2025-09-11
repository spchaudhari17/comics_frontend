import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './authentication.scss';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../redux/actions/userActions';

export const SignUp = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector(state => state.userRegister);


    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPassVisible, setConfirmPassVisible] = useState(false);
    const [phone, setPhone] = useState('');

    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        username: '',
        userType: '',
        countryCode: '+91',
        mobileNumber: ''
    });

    const togglePassVisibility = () => setPasswordVisible(!passwordVisible);
    const toggleConfirmPassVisibility = () => setConfirmPassVisible(!confirmPassVisible);

    // Phone number change handler
    const handleOnChange = (value, country) => {
        setPhone(value);
        setFormData(prev => ({
            ...prev,
            countryCode: `+${country.dialCode}`,
            mobileNumber: value.slice(country.dialCode.length)
        }));
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            // await dispatch(registerUser({ ...formData, password: newPassword }, (email) => {
            //     navigate("/OtpVerification", { state: { email } });
            // }));

            await dispatch(registerUser({ ...formData, password: newPassword }));
            // only redirect if registration succeeds
            navigate("/OtpVerification", { state: { email: formData.email } });

            setFormData({
                firstname: '',
                lastname: '',
                email: '',
                username: '',
                userType: '',
                countryCode: '+91',
                mobileNumber: ''
            });
            setNewPassword('');
            setConfirmPassword('');
            setPhone('');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='auth-page SignUp-page d-flex justify-content-center align-items-center min-vh-100 py-4'>
            <div className="container-xl" style={{ maxWidth: '750px' }}>
                <div className="content-wrapper bg-theme1 border">
                    <div className="logo-wrapper text-center mb-4 pb-1">
                        <img src={require('../../assets/images/logo.png')} alt="Logo" className="img-fluid" />
                    </div>
                    <div className="heading-wrapper text-dark mb-4">
                        <div className="fs-4 fw-bold font-roboto lh-sm mb-1">Create an account</div>
                        <div className="subtitle fs-14 text-muted">Enter all required details below to create your account!</div>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3 mb-3">
                            <Col md={6}>
                                <Form.Group controlId="FirstName">
                                    <Form.Label>First Name<span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter first name"
                                        value={formData.firstname}
                                        onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                                        autoComplete='off'
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="LastName">
                                    <Form.Label>Last Name<span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter last name"
                                        value={formData.lastname}
                                        onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                                        autoComplete='off'
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="EmailID">
                                    <Form.Label>Email<span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        autoComplete='off'
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="Username">
                                    <Form.Label>Username<span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        autoComplete='off'
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="UserType">
                                    <Form.Label>User Type<span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={formData.userType}
                                        onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled>Select user type</option>
                                        <option value="Student">Student</option>
                                        <option value="Teacher">Teacher</option>
                                        <option value="Content Creater">Content Creater</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="PhoneNumber">
                                    <Form.Label>Phone Number<span className="text-danger">*</span></Form.Label>
                                    <PhoneInput
                                        country={"in"}
                                        value={phone}
                                        onChange={handleOnChange}
                                        countryCodeEditable={false}
                                        inputClass="w-100 py-2"
                                        dropdownClass="text-start"
                                        placeholder='Enter phone number'
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formPassword">
                                    <Form.Label>Password<span className="text-danger">*</span></Form.Label>
                                    <div className="position-relative">
                                        <Form.Control
                                            type={passwordVisible ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter the 8 digit password"
                                            minLength={8} maxLength={30}
                                            // pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                                            // title="Must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character."
                                            autoComplete='new-password'
                                            required
                                        />
                                        <span role="button" className="position-absolute top-50 translate-middle-y text-secondary"
                                            onClick={togglePassVisibility} style={{ right: '10px' }}>
                                            {passwordVisible
                                                ? <i className="bi bi-eye-slash-fill fs-16"></i>
                                                : <i className="bi bi-eye-fill fs-16"></i>}
                                        </span>
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="ConfirmPassword">
                                    <Form.Label>Confirm Password<span className="text-danger">*</span></Form.Label>
                                    <div className="position-relative">
                                        <Form.Control
                                            type={confirmPassVisible ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Enter the 8 digit password"
                                            minLength={8} maxLength={30}
                                            // pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                                            // title="Must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character."
                                            autoComplete='new-password'
                                            required
                                        />
                                        <span role="button" className="position-absolute top-50 translate-middle-y text-secondary"
                                            onClick={toggleConfirmPassVisibility} style={{ right: '10px' }}>
                                            {confirmPassVisible
                                                ? <i className="bi bi-eye-slash-fill fs-16"></i>
                                                : <i className="bi bi-eye-fill fs-16"></i>}
                                        </span>
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="form-check fs-6 mb-3">
                            <input type="checkbox" className="form-check-input fs-16 border-primary border-opacity-75" id="conditionAgreement" />
                            <label className="form-check-label text-body" htmlFor="conditionAgreement" style={{ paddingTop: '2px' }}>
                                Agree to the Terms and Privacy
                            </label>
                        </div>

                        <div className="btn-wrapper mt-4">
                            <Button type="submit" variant="primary" className="w-100 btn-custom py-2" disabled={loading}>
                                {loading ? 'Signing Up...' : 'Sign Up'}
                            </Button>
                        </div>

                        <div className="text-center fs-14 text-muted mt-3">
                            Already registered? <Link to={'/login'} className='btn-link fw-medium text-decoration-none'>Sign In</Link>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
};
