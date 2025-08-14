import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { verifyOtp } from '../../redux/actions/userActions';

const OtpVerification = () => {
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.userOtpVerify);

  const handleVerify = (e) => {
    e.preventDefault();

    if (!email || !otp) {
      toast.error('Please fill all fields.');
      return;
    }

    dispatch(verifyOtp({ email, otp }, navigate));
  };

  return (
    <div className="auth-page otp-page d-flex justify-content-center align-items-center min-vh-100 py-4">
      <div className="container-xl">
        <div
          className="card border-0 rounded-3 shadow w-100 mx-auto px-3 px-sm-5 py-5"
          style={{ maxWidth: '550px' }}
        >
          <div className="fs-2 fw-bold text-center lh-1 mb-4">OTP Verification</div>

          <Form onSubmit={handleVerify}>
            {error && <div className="alert alert-danger">{error}</div>}

            <Form.Group className="mb-3">
              <Form.Label>Email<span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                readOnly
                style={{
                  backgroundColor: "#e9ecef",
                  cursor: "not-allowed"
                }}

              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>OTP<span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter OTP"
                autoComplete="off"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="btn-custom w-100 mt-2 py-2"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
