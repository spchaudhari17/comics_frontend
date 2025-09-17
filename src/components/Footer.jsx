import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Form, InputGroup, Button } from 'react-bootstrap';

export const Footer = () => {
    return (
        <footer className="footer-wrapper bg-theme2 text-body">
            <div className="container-xl py-5">
                <Row className="gx-3 gy-4">
                    <Col md={12} lg={4}>
                        <div className="wrapper text-center text-md-start mx-auto mx-md-0" style={{ maxWidth: '380px' }}>
                            <div className="logo-wrapper mb-3">
                                <img src={require('../assets/images/logo.png')} alt="Logo" className="img-fluid" style={{ width: '80px' }} />
                            </div>
                            <div className="description mb-3">
                                <span className="fw-semibold">Kridemy</span> an AI-powered education platform that helps you learn and teach complex academic concepts through fun.
                            </div>
                            <div className="social-sec d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-2">
                                <Link to={"https://x.com/kridemy"} target='_blank'><img src={require('../assets/images/x.png')} className="img-fluid" alt="X" /></Link>
                                <Link to={"https://www.instagram.com/kridemy/"} target='_blank'><img src={require('../assets/images/instagram.png')} className="img-fluid" alt="Instagram" /></Link>
                                <Link to={"https://www.linkedin.com/company/kridemy/"} target='_blank'><img src={require('../assets/images/linkedin.png')} className="img-fluid" alt="Linkedin" /></Link>
                                <Link to={"https://www.tiktok.com/@kridemy?lang=en"} target='_blank'><img src={require('../assets/images/tiktok.png')} className="img-fluid" alt="Tiktok" /></Link>
                                <Link to={"https://www.reddit.com/r/Kridemy/"} target='_blank'><img src={require('../assets/images/reddit.png')} className="img-fluid" alt="Reddit" /></Link>
                            </div>
                        </div>
                    </Col>
                    <Col md={3} lg={2}>
                        <div className="wrapper text-center text-md-start">
                            <div className="menu-header fs-5 fw-bold text-warning mb-3">Quick Links</div>
                            <ul className="nav flex-column gap-2">
                                <li className="nav-item"><Link to={'/'} className="nav-link">Home</Link></li>
                                <li className="nav-item"><Link to={'/about'} className="nav-link">About Us</Link></li>
                                <li className="nav-item"><Link to={'/contact'} className="nav-link">Contact Us</Link></li>
                                <li className="nav-item"><Link to={'/faq'} className="nav-link">FAQ</Link></li>
                                <li className="nav-item"><Link to={'/privacy-policy'} className="nav-link">Privacy Policy</Link></li>
                            </ul>
                        </div>
                    </Col>
                    <Col md={3} lg={2}>
                        <div className="wrapper text-center text-md-start">
                            <div className="menu-header fs-5 fw-bold text-warning mb-3">Explore</div>
                            <ul className="nav flex-column gap-2">
                                <li className="nav-item"><Link to={'/our-library'} className="nav-link">Library</Link></li>
                                <li className="nav-item"><Link to={'/create-comic'} className="nav-link">Create Comic</Link></li>
                                <li className="nav-item"><Link to={'/for-student'} className="nav-link">For Student</Link></li>
                                <li className="nav-item"><Link to={'/for-teacher'} className="nav-link">For Teacher</Link></li>
                                <li className="nav-item"><Link to={'/for-parent'} className="nav-link">For Parent</Link></li>
                            </ul>
                        </div>
                    </Col>
                    <Col md={6} lg={4}>
                        <div className="wrapper text-center text-md-start mx-auto mx-md-0" style={{ maxWidth: '450px' }}>
                            <div className="menu-header fs-5 fw-bold text-warning mb-3">Our Newsletter</div>
                            <Form className="mb-4">
                                <Form.Group>
                                    {/* <Form.Label controlId="subscribe">Subscribe Now</Form.Label> */}
                                    <InputGroup>
                                        <Form.Control type="email" placeholder="Write your email here.." required />
                                        <Button variant="primary">Subscribe</Button>
                                    </InputGroup>
                                </Form.Group>
                            </Form>

                            {/* <div className="contact-number mb-2 pb-1">
                                <Link to={'tel:+1 8482398363'} className="d-inline-flex align-items-center gap-2 text-body text-decoration-none">
                                    <i class="bi bi-telephone-fill fs-5 lh-1"></i> +1 8482398363
                                </Link>
                            </div> */}
                            <div className="contact-email mb-2 pb-1">
                                <Link to={'mailto:customercare@kridemy.com'} className="d-inline-flex align-items-center gap-2 text-body text-decoration-none">
                                    <i class="bi bi-envelope-fill fs-5 lh-1"></i> customercare@kridemy.com
                                </Link>
                            </div>
                            <div className="contact-address d-inline-flex align-items-center gap-2">
                                <i className="bi bi-geo-alt-fill fs-5 lh-1"></i> New Brunswick, New Jersey, USA
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <div className="copyright-sec bg-primary py-3">
                <div className="container">
                    <div className="copyright-wrapper text-center text-white">
                        <div className="copyright-text">© 2025 Sham Insights LLC. All rights reserved.</div>
                        {/* <div className="designedBy">Web design by Sham Insights LLC.</div> */}
                    </div>
                </div>
            </div>
        </footer>
    )
}

