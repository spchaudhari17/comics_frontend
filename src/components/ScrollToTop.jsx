import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AOS from "aos";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0); // always scroll to top

        // Refresh AOS so animations reset and worked after scroll to top
        setTimeout(() => {
            AOS.refresh();
        }, 300);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
