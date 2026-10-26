// =====================================================================
// Bundle apne aap cart me daalna
//
// Link: /marketPlaceDetails/<bundleId>?autoAdd=1
//   - WordPress marketplace ka "Add to cart"
//   - Logout user ne "Add to cart" dabaya -> login ke baad yahin wapas
//
// - Login hai                     -> cart me add -> /cart
// - Pehle se cart me hai          -> /cart
// - Login nahi hai                -> /login, login ke baad wapas yahin -> cart -> /cart
// - Apna bundle / pehle se kharida -> isi page pe raho + message
// - autoAdd=1 nahi hai            -> kuch nahi (normal page)
// =====================================================================

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../API";
import { trackClick } from "../utility/analytics";
import { isUserLoggedIn, saveReturnAfterLogin } from "../utility/authRedirect";
import { notifyCartUpdated } from "../utility/cartEvents";

const CART_ROUTE = "/cart";
const LOGIN_ROUTE = "/login";

const isValidBundleId = (id) => /^[a-f0-9]{24}$/i.test(id || "");
const isAlreadyInCartMessage = (message = "") => /already.*cart|cart.*already/i.test(message);

// Logout user ne "Add to cart" dabaya -> login, phir wapas aake apne aap cart me
export const goToLoginThenAddToCart = (navigate, bundleId) => {
    saveReturnAfterLogin(`/marketPlaceDetails/${bundleId}?autoAdd=1`);
    navigate(LOGIN_ROUTE);
};

export const useAutoAddToCart = (bundleId) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [autoAdding, setAutoAdding] = useState(false);
    const [autoAddMessage, setAutoAddMessage] = useState("");
    const startedRef = useRef(false); // StrictMode me do baar na chale

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("autoAdd") !== "1") return;
        if (startedRef.current) return;
        startedRef.current = true;

        // URL se autoAdd hata do (refresh / back pe dobara na chale)
        params.delete("autoAdd");
        const cleanSearch = params.toString();
        const cleanUrl = `${location.pathname}${cleanSearch ? `?${cleanSearch}` : ""}`;
        const fullUrl = `${location.pathname}${location.search}`;

        if (!isValidBundleId(bundleId)) {
            navigate(cleanUrl, { replace: true });
            return;
        }

        // 🔐 Login nahi hai -> login ke baad isi URL (autoAdd ke saath) pe wapas
        if (!isUserLoggedIn()) {
            saveReturnAfterLogin(fullUrl);
            trackClick("external_add_to_cart_login_required", { bundle_id: bundleId });
            navigate(LOGIN_ROUTE, { replace: true });
            return;
        }

        const addToCart = async () => {
            try {
                setAutoAdding(true);
                const { data } = await API.post("/user/addToCart", { bundleId });
                const message = data?.message || "";

                trackClick("external_add_to_cart_auto", {
                    bundle_id: bundleId,
                    result: data?.error ? "not_added" : "added",
                });

                if (!data?.error || isAlreadyInCartMessage(message)) {
                    notifyCartUpdated();
                    navigate(CART_ROUTE, { replace: true });
                    return;
                }

                // Apna bundle / pehle se kharida -> yahin raho
                navigate(cleanUrl, { replace: true });
                setAutoAddMessage(message || "This bundle couldn't be added to your cart.");
            } catch (err) {
                // Token expire -> dobara login, phir wapas
                if (err.response?.status === 401) {
                    saveReturnAfterLogin(fullUrl);
                    navigate(LOGIN_ROUTE, { replace: true });
                    return;
                }

                const message = err.response?.data?.message || "";
                if (isAlreadyInCartMessage(message)) {
                    navigate(CART_ROUTE, { replace: true });
                    return;
                }

                navigate(cleanUrl, { replace: true });
                setAutoAddMessage(message || "Could not add this bundle to your cart.");
            } finally {
                setAutoAdding(false);
            }
        };

        addToCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bundleId, location.search]);

    return { autoAdding, autoAddMessage, clearAutoAddMessage: () => setAutoAddMessage("") };
};
