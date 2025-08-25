
import API from "../../API";

import {
    SET_COMIC_STATUS_REQUEST,
    SET_COMIC_STATUS_SUCCESS,
    SET_COMIC_STATUS_FAIL,
} from "../constants/comicConstants";


export const setComicStatus = (comicId, comicStatus) => async (dispatch, getState) => {
    try {
        dispatch({ type: SET_COMIC_STATUS_REQUEST });

        const { data } = await API.post("/user/comics/set-status", { comicId, comicStatus });

        dispatch({
            type: SET_COMIC_STATUS_SUCCESS,
            payload: data.comic,
        });
    } catch (error) {
        dispatch({
            type: SET_COMIC_STATUS_FAIL,
            payload:
                error.response?.data?.error || error.message || "Something went wrong",
        });
    }
};
