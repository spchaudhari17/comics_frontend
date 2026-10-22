// src/utility/comicPdf.js
// Comic ki poori PDF (pages + FAQ + Did You Know + Quiz + Hardcore Quiz + Kridemy watermark)
// backend se download karna. My Comics, Comic Details, Reader sab jagah use ho sakta hai.

import API from "../API";

// Windows/Mac file names me ye characters allowed nahi
const toFileName = (name) =>
    (name || "comic").replace(/[\\/:*?"<>|]/g, "").trim() || "comic";

export const downloadComicPdf = async (comicId, title) => {
    const res = await API.get(`/user/comic-pdf/${comicId}`, { responseType: "blob" });

    const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${toFileName(title)}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// responseType blob hai, isliye backend ka error message bhi blob me aata hai
export const getPdfErrorMessage = async (err, fallback = "Failed to download PDF") => {
    try {
        const text = await err.response?.data?.text();
        return JSON.parse(text).message || fallback;
    } catch {
        return fallback;
    }
};