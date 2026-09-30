import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../utility/analytics";

const AnalyticsTracker = () => {
    const location = useLocation();
    const lastPath = useRef(null);

    useEffect(() => {
        const path = location.pathname;

        // Prevent duplicate page_view for the same path
        if (lastPath.current === path) {
            return;
        }

        lastPath.current = path;

        trackPageView(path);
    }, [location.pathname]);

    return null;
};

export default AnalyticsTracker;