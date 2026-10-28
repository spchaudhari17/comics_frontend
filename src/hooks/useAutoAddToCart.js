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
import { toast } from "react-toastify";
import API from "../API";
import { trackClick } from "../utility/analytics";
import { isUserLoggedIn, saveReturnAfterLogin } from "../utility/authRedirect";
import { notifyCartUpdated } from "../utility/cartEvents";

const CART_ROUTE = "/cart";
const LOGIN_ROUTE = "/login";

const isValidBundleId = (id) => /^[a-f0-9]{24}$/i.test(id || "");
const isAlreadyInCartMessage = (message = "") => /already/i.test(message) && /cart/i.test(message);

// Debug ke liye (browser console me "[autoAdd]" se filter karo)
const log = (...args) => console.info("[autoAdd]", ...args);

// Backend ka message kuch bhi ho, cart me sach me hai ya nahi, yahan se pakka pata chalega
const isBundleInCart = async (bundleId) => {
    try {
        const { data } = await API.get("/user/cart");
        return (data?.data || []).some(
            (item) => String(item.bundleId?._id || item.bundleId) === String(bundleId)
        );
    } catch {
        return false;
    }
};

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

        log("start", { bundleId, loggedIn: isUserLoggedIn() });

        // URL se autoAdd hata do (refresh / back pe dobara na chale)
        params.delete("autoAdd");
        const cleanSearch = params.toString();
        const cleanUrl = `${location.pathname}${cleanSearch ? `?${cleanSearch}` : ""}`;
        const fullUrl = `${location.pathname}${location.search}`;

        if (!isValidBundleId(bundleId)) {
            log("invalid bundle id", bundleId);
            navigate(cleanUrl, { replace: true });
            return;
        }

        // 🔐 Login nahi hai -> login ke baad isi URL (autoAdd ke saath) pe wapas
        if (!isUserLoggedIn()) {
            log("not logged in -> login");
            toast.info("Please log in. We'll add this bundle to your cart right after.");
            saveReturnAfterLogin(fullUrl);
            trackClick("external_add_to_cart_login_required", { bundle_id: bundleId });
            navigate(LOGIN_ROUTE, { replace: true });
            return;
        }

        const goToCart = (text) => {
            notifyCartUpdated();
            if (text) toast.success(text);
            navigate(CART_ROUTE, { replace: true });
        };

        // Add nahi hua -> agar fir bhi cart me hai to cart, warna yahin message
        const handleNotAdded = async (message) => {
            if (isAlreadyInCartMessage(message) || (await isBundleInCart(bundleId))) {
                log("already in cart -> /cart");
                goToCart("This bundle is already in your cart.");
                return;
            }

            // Apna bundle / pehle se kharida / koi aur wajah -> yahin raho
            log("not added:", message);
            navigate(cleanUrl, { replace: true });
            const text = message || "This bundle couldn't be added to your cart.";
            setAutoAddMessage(text);
            toast.warning(text);
        };

        const addToCart = async () => {
            try {
                setAutoAdding(true);
                const { data } = await API.post("/user/addToCart", { bundleId });
                log("addToCart response", data);

                trackClick("external_add_to_cart_auto", {
                    bundle_id: bundleId,
                    result: data?.error ? "not_added" : "added",
                });

                if (!data?.error) {
                    goToCart("Added to cart 🛒");
                    return;
                }

                await handleNotAdded(data?.message || "");
            } catch (err) {
                log("addToCart error", err.response?.status, err.response?.data || err.message);

                // Token expire -> dobara login, phir wapas
                if (err.response?.status === 401) {
                    toast.info("Your session expired. Please log in again.");
                    saveReturnAfterLogin(fullUrl);
                    navigate(LOGIN_ROUTE, { replace: true });
                    return;
                }

                await handleNotAdded(err.response?.data?.message || "");
            } finally {
                setAutoAdding(false);
            }
        };

        addToCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bundleId, location.search]);

    return { autoAdding, autoAddMessage, clearAutoAddMessage: () => setAutoAddMessage("") };
};
