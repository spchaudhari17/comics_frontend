import React from 'react';

export const NoDataComponent = () => {
    return (
        <div className="noData-wrapper bg-white rounded-4 px-3 py-5">
            <div className="text-center">
                <img src={require('../assets/images/no-data.jpg')} alt="404 Page" className="img-fluid w-100" style={{ maxWidth: '400px' }} />
                <div className='fs-5 fw-bold text-danger mt-3'>Sorry no record Found !</div>
                <div className='small text-muted'>Whoops... this information is not available for a moment.</div>
            </div>
        </div>
    )
}

