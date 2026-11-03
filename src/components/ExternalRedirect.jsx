import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Spinner } from "react-bootstrap";

// Purane app URL -> shop.kridemy.com ka page.
// replace() taaki browser "Back" dabane pe redirect loop me na fase.
// Query string (?utm_source=... jaisa) aage pass ho jata hai.
const ExternalRedirect = ({ to }) => {
    const { search } = useLocation();

    useEffect(() => {
        window.location.replace(to + search);
    }, [to, search]);

    return (
        <div className="d-flex flex-column align-items-center justify-content-center gap-2 py-5 text-muted">
            <Spinner animation="border" size="sm" />
            <span>Redirecting...</span>
        </div>
    );
};

export default ExternalRedirect;
