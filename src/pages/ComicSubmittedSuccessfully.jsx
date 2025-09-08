import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

export const ComicSubmittedSuccessfully = () => {
    const navigate = useNavigate();
    return (
        <div className="auth-page comic-successful-page pt-5 pb-3">
            <div className="container" style={{ maxWidth: '550px' }}>
                <div className="content-wrapper bg-theme1 border text-center">
                    <div className="heading-wrapper text-dark mb-4 pb-2">
                        <div className="icon mb-4"><i className="bi bi-patch-check-fill display-3 text-success"></i></div>
                        <div className="fs-3 fw-bold font-roboto lh-sm mb-2">Comic Published Successfully!</div>
                        <div className="subtitle fs-14 text-muted">Your comic is now live. Share it with the world and let your audience enjoy your creativity.</div>
                    </div>
                    <div className="btn-wrapper">
                        <Button variant="primary" type="submit" className="btn-custom font-roboto rounded-pill w-100 py-2" onClick={()=> navigate('/home')}><i className="bi bi-house-door-fill"></i> Back to Home</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
