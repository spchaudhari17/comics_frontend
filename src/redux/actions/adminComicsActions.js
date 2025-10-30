
import API from "../../API";

import {
    ADMIN_COMIC_LIST_REQUEST,
    ADMIN_COMIC_LIST_SUCCESS,
    ADMIN_COMIC_LIST_FAIL,
    ADMIN_COMIC_UPDATE_STATUS_REQUEST,
    ADMIN_COMIC_UPDATE_STATUS_SUCCESS,
    ADMIN_COMIC_UPDATE_STATUS_FAIL,

} from "../constants/adminComicsConstants";


//  Fetch All Comics (Admin)
export const listAllComicsAdmin = (country = "") => async (dispatch, getState) => {
    try {
        dispatch({ type: ADMIN_COMIC_LIST_REQUEST });

        // const { data } = await API.get("/admin/comics");

        const query = country ? `?country=${encodeURIComponent(country)}` : "";
        const { data } = await API.get(`/admin/comics${query}`);


        dispatch({ type: ADMIN_COMIC_LIST_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: ADMIN_COMIC_LIST_FAIL,
            payload: error.message,
        });
    }
};

// Update Comic Status (Admin)
export const updateComicStatus = (id, status) => async (dispatch, getState) => {
    try {
        dispatch({ type: ADMIN_COMIC_UPDATE_STATUS_REQUEST });

        const { data } = await API.post("/admin/comics/status", { id, status });

        dispatch({ type: ADMIN_COMIC_UPDATE_STATUS_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: ADMIN_COMIC_UPDATE_STATUS_FAIL,
            payload: error.message,
        });
    }
};
