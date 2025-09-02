
import {
    ADMIN_COMIC_LIST_REQUEST,
    ADMIN_COMIC_LIST_SUCCESS,
    ADMIN_COMIC_LIST_FAIL,
    ADMIN_COMIC_UPDATE_STATUS_REQUEST,
    ADMIN_COMIC_UPDATE_STATUS_SUCCESS,
    ADMIN_COMIC_UPDATE_STATUS_FAIL,
} from "../constants/adminComicsConstants";


// List Comics Reducer
export const adminComicListReducer = (state = { comics: [] }, action) => {
    switch (action.type) {
        case ADMIN_COMIC_LIST_REQUEST:
            return { loading: true, comics: [] };
        case ADMIN_COMIC_LIST_SUCCESS:
            return { loading: false, comics: action.payload.comics };
        case ADMIN_COMIC_LIST_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};

// Update Status Reducer
export const adminComicUpdateStatusReducer = (state = {}, action) => {
    switch (action.type) {
        case ADMIN_COMIC_UPDATE_STATUS_REQUEST:
            return { loading: true };
        case ADMIN_COMIC_UPDATE_STATUS_SUCCESS:
            return { loading: false, success: true, comic: action.payload };
        case ADMIN_COMIC_UPDATE_STATUS_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};
