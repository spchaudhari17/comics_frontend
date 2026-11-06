// =====================================================================
// Marketing pages ab shop.kridemy.com (website) pe hain.
// App ke purane URLs (/, /about, /for-teacher ...) yahan redirect hote hain.
// Shop pe naya page / URL badle to sirf yahi file badlo.
// =====================================================================

export const SHOP_URL = "https://shop.kridemy.com";

export const SHOP_PAGES = {
    home: `${SHOP_URL}/`,
    about: `${SHOP_URL}/about-us/`,
    forTeachers: `${SHOP_URL}/for-teachers/`,
    studentsParents: `${SHOP_URL}/students-parent/`,
    forCreators: `${SHOP_URL}/for-creators/`,
    marketplace: `${SHOP_URL}/Marketplace/`,
    blog: `${SHOP_URL}/blog/`,
    support: `${SHOP_URL}/support/`,
};

// Header / footer social icons (shop jaisa)
export const SOCIAL_LINKS = [
    { id: "facebook", label: "Facebook", icon: "bi-facebook", url: "https://www.facebook.com/profile.php?id=61585839615448" },
    { id: "youtube", label: "YouTube", icon: "bi-youtube", url: "https://www.youtube.com/@Kridemy" },
    { id: "x", label: "X", icon: "bi-twitter-x", url: "https://x.com/kridemy" },
    { id: "instagram", label: "Instagram", icon: "bi-instagram", url: "https://www.instagram.com/kridemy_official/" },
    { id: "linkedin", label: "LinkedIn", icon: "bi-linkedin", url: "https://www.linkedin.com/company/kridemy/" },
    { id: "tiktok", label: "TikTok", icon: "bi-tiktok", url: "https://www.tiktok.com/@kridemy" },
];

export const SUPPORT_EMAIL = "customercare@kridemy.com";
