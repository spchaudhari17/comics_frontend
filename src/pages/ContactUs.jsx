import React, { useState } from 'react';
import { Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import API from '../API';


export const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+91",
    role: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", msg: "" });

  // handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", msg: "" });

    try {
      await API.post("/user/contact", formData);
      setFeedback({ type: "success", msg: "Thank you! Your message has been sent." });
      setFormData({ name: "", email: "", phone: "", role: "", message: "" }); // reset
    } catch (err) {
      setFeedback({
        type: "danger",
        msg: err.response?.data?.error || "Failed to send message. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ContactUs-Page">
      {/* Breadcrumb Banner Section */}
      <section className="breadcrumb-banner-section py-5">
        <div className="container-xl position-relative z-1">
          <div className="page-header text-white text-uppercase text-center">
            <div className="section-heading text-white mb-2">Contact Us</div>
            <ul className="list-unstyled d-flex justify-content-center gap-2 mb-0">
              <li className="text-white">Home</li>
              <li><span>/</span></li>
              <li className="text-warning">Contact</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-sec py-5">
        <div className="container-xl my-md-4">
          <div className="heading-wrapper text-center mx-auto mb-4 pb-2 pb-md-4" style={{ maxWidth: '600px' }}>
            <div className="label-heading mb-2">Need Help?</div>
            <div className="section-heading mb-2">Get In Touch With Us</div>
          </div>

          <Row className="gx-3 gx-md-4 gx-lg-5 gy-5">
            <Col lg={6}>
              {/* Info boxes same as before */}
              <div className="multiple-cards-wrapper h-100 d-grid gap-4 grid-cols-1 grid-md-cols-2">
                {/* Website */}
                <div className="info-box animate-bounce-effect h-100 d-flex flex-column align-items-center justify-content-center text-center border rounded-4 shadow px-3 py-4">
                  <div className="icon d-flex align-items-center justify-content-center bg-primary bg-opacity-25 rounded-circle mb-4" style={{ height: '50px', width: '50px' }}>
                    <i className="fs-4 bi bi-globe text-primary"></i>
                  </div>
                  <div className="details">
                    <div className="fs-16 fw-semibold text-black mb-1">Our Website</div>
                    <p className="fs-14 text-muted m-0">https://kridemy.com/</p>
                  </div>
                </div>
                {/* Call */}
                <div className="info-box animate-bounce-effect h-100 d-flex flex-column align-items-center justify-content-center text-center border rounded-4 shadow px-3 py-4">
                  <div className="icon d-flex align-items-center justify-content-center bg-success bg-opacity-25 rounded-circle mb-4" style={{ height: '50px', width: '50px' }}>
                    <i className="fs-4 bi bi-headset text-success"></i>
                  </div>
                  <div className="details">
                    <div className="fs-16 fw-semibold text-black mb-1">Call Us On</div>
                    {/* <p className="fs-14 text-muted m-0">+1 (999) 888-0000</p> */}
                  </div>
                </div>
                {/* Email */}
                <div className="info-box animate-bounce-effect h-100 d-flex flex-column align-items-center justify-content-center text-center border rounded-4 shadow px-3 py-4">
                  <div className="icon d-flex align-items-center justify-content-center bg-info bg-opacity-25 rounded-circle mb-4" style={{ height: '50px', width: '50px' }}>
                    <i className="fs-4 bi bi-envelope-fill text-info"></i>
                  </div>
                  <div className="details">
                    <div className="fs-16 fw-semibold text-black mb-1">Email Us</div>
                    <p className="fs-14 text-muted m-0">customercare@kridemy.com</p>
                  </div>
                </div>
                {/* Location */}
                <div className="info-box animate-bounce-effect h-100 d-flex flex-column align-items-center justify-content-center text-center border rounded-4 shadow px-3 py-4">
                  <div className="icon d-flex align-items-center justify-content-center bg-danger bg-opacity-25 rounded-circle mb-4" style={{ height: '50px', width: '50px' }}>
                    <i className="fs-4 bi bi-geo-alt-fill text-danger"></i>
                  </div>
                  <div className="details">
                    <div className="fs-16 fw-semibold text-black mb-1">Our Location</div>
                    <p className="fs-14 text-muted m-0">New Brunswick, New Jersey, USA</p>
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={6}>
              <Form className="contact-form-wrapper d-flex flex-column gap-3" onSubmit={handleSubmit}>
                {feedback.msg && (
                  <Alert variant={feedback.type}>{feedback.msg}</Alert>
                )}
                <div className="form-group">
                  <Form.Control
                    type="text"
                    className="border bg-light px-3 py-3"
                    placeholder="Enter your name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <Form.Control
                    type="email"
                    className="border bg-light px-3 py-3"
                    placeholder="Enter your email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <PhoneInput
                    defaultCountry="IN"
                    countryCodeEditable={true}
                    name="phone"
                    value={formData.phone}
                    onChange={(value) => setFormData({ ...formData, phone: value })}
                    inputClass="w-100 h-auto border bg-light pe-3 py-3"
                    inputStyle={{
                      lineHeight: "1.5",
                    }}
                    dropdownClass="text-start"
                    placeholder='Enter phone number'
                    required
                  />
                </div>
                {/* <div className="form-group">
                  <Form.Control
                    type="tel"
                    className="border bg-light px-3 py-3"
                    placeholder="Enter phone number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div> */}
                <div className="form-group">
                  <Form.Select
                    className="border bg-light px-3 py-3"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Who are you ?</option>
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Parent">Parent</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </div>
                <div className="form-group">
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="message"
                    className="border bg-light px-3 py-3"
                    placeholder="Write message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="btn-wrapper">
                  <Button
                    type="submit"
                    className="btn btn-custom w-100 py-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Sending...
                      </>
                    ) : (
                      <>Submit Now <i className="bi bi-arrow-right"></i></>
                    )}
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </div>
      </section>

      {/* Location Map Section */}
      <section className="location-map">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d24275.292909952877!2d-74.4614855175898!3d40.48828017138096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c3c355f06a92a5%3A0x25925506798e230c!2sNew%20Brunswick%2C%20NJ%2C%20USA!5e0!3m2!1sen!2sin!4v1757600137845!5m2!1sen!2sin"
          className="w-100 d-block border"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ height: '50vh' }}
        ></iframe>
      </section>
    </div>
  );
};
