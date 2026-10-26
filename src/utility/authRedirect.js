// =====================================================================
// Login ke baad kahan bhejna hai
//
// Jab logout user koi aisa kaam karta hai jisme login chahiye (jaise
// "Add to cart"), hum yahan yaad rakhte hain ki login ke baad use wapas
// kahan bhejna hai. Login / OTP verify / signup, teeno isi ko use karte hain.
// =====================================================================

export const RETURN_AFTER_LOGIN_KEY = "returnAfterLogin";

export const isUserLoggedIn = () =>
    !!localStorage.getItem("token") && !!localStorage.getItem("user");

export const saveReturnAfterLogin = (path) => {
    if (path) localStorage.setItem(RETURN_AFTER_LOGIN_KEY, path);
};

// Ek baar padhke hata do. Sirf apni site ke path (dusri site pe redirect se bachao)
export const consumeReturnAfterLogin = () => {
    const returnTo = localStorage.getItem(RETURN_AFTER_LOGIN_KEY);
    localStorage.removeItem(RETURN_AFTER_LOGIN_KEY);
    return returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : null;
};

// Role ke hisaab se default page (pehle loginUser me tha)
export const getHomeForUserType = (userType) => {
    if (userType === "admin" || userType === "moderator") return "/super-admin";
    if (userType === "parent") return "/parent/manage-children";
    return "/create-comic";
};
