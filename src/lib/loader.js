import { CirclesWithBar } from 'react-loader-spinner'

import React from 'react'

export const Loader = () => {
    return (
        <div className="position-absolute top-0 start-0 end-0 bottom-0 w-100 d-flex align-items-center justify-content-center bg-black bg-opacity-25"
            style={{ zIndex: 1055 }}>
            <CirclesWithBar
                className="postion-relative"
                height="75"
                width="75"
                color="#4fa94d"
                outerCircleColor="#4fa94d"
                innerCircleColor="#4fa94d"
                barColor="#4fa94d"
                ariaLabel="circles-with-bar-loading"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
            />
        </div>
    )
}

