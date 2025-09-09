import React from 'react'
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'

export const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="pageNotFound py-3">
      <div className="container-xxl">
        <div className="no-data-wrapper bg-white rounded-4 px-3 py-5">
          <div className="text-center mx-auto" style={{ maxWidth: '600px' }}>
            <img src={require('../assets/images/404.png')} alt="404 Page" className="img-fluid w-100 mb-4" style={{ maxWidth: '350px' }} />
            <div className="display-3 text-danger lh-1 mb-1" style={{ fontWeight: '800' }}>404</div>
            <div className="fs-5 fw-semibold mb-1">Page not Found</div>
            <div className="small text-muted">Oops! The page you are looking for does not exist. It might have been moved or delete.</div>
            <div className="btn-wrapper text-center mt-4">
              <Button variant="primary" className="btn-custom fw-medium" onClick={() => navigate('/')}><i className="bi bi-arrow-left me-2"></i>Back to Home</Button>
            </div>
          </div>
        </div>
      </div>
    </div> 
  )
}