import React, { useState } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/actions/userActions';

export const LogIn = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    const { loading, error } = useSelector((state) => state.userLogin);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        dispatch(loginUser({ email, password }, navigate));
    };

    return (
        <div className="auth-page login-page d-flex justify-content-center align-items-center min-vh-100 py-4">
            <div className="container-xl" style={{ maxWidth: '550px' }}>
                <div className="content-wrapper bg-theme1 border rounded-3 p-4">
                    <div className="logo-wrapper text-center mb-4 pb-3">
                        <img src={require('../../assets/images/logo.png')} alt="Logo" className="img-fluid" style={{ width: '136px' }} />
                    </div>
                    <div className="heading-wrapper text-dark mb-4">
                        <div className="fs-2 fw-bold font-roboto lh-sm mb-1">Welcome!</div>
                        <div className="subtitle fs-14 text-muted">Enter your login details below!</div>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3" controlId="userEmailId">
                            <Form.Label>Email ID<span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="Enter email" 
                                autoComplete='off' 
                                required 
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password<span className="text-danger">*</span></Form.Label>
                            <div className="position-relative">
                                <Form.Control 
                                    type={passwordVisible ? 'text' : 'password'} 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className='pe-5'
                                    placeholder="Enter password" 
                                    // minLength="8"
                                    // pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                                    // title="Must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character."
                                    autoComplete='new-password'
                                    required
                                />
                                <span 
                                    role="button" 
                                    className="position-absolute top-50 translate-middle-y text-secondary" 
                                    onClick={togglePasswordVisibility} 
                                    style={{ right: '10px' }}
                                >
                                    {passwordVisible ? <i className="bi bi-eye-slash-fill fs-16"></i> : <i className="bi bi-eye-fill fs-16"></i>}
                                </span>
                            </div>
                        </Form.Group>

                        <div className="d-flex gap-2 justify-content-between mb-3 pt-1">
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input fs-16 border-primary border-opacity-75" id="rememberMe" />
                                <label className="form-check-label" htmlFor="rememberMe" style={{ paddingTop: '2px' }}>Remember me</label>
                            </div>
                            <Link to={'/forgot-password'} className="btn-link text-decoration-none">Forgot Password</Link>
                        </div>

                        <div className="btn-wrapper mt-4">
                            <Button 
                                variant="primary" 
                                type="submit" 
                                className="w-100 btn-custom py-2"
                                disabled={loading}
                            >
                                {loading ? <Spinner animation="border" size="sm" /> : "Login"}
                            </Button>
                        </div>

                        <div className="text-center fs-14 text-muted mt-3">
                            Don't have an account? <Link to={'/signup'} className='btn-link fw-medium text-decoration-none'>Signup</Link>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
};
