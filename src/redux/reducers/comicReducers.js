import {
  SET_COMIC_STATUS_REQUEST,
  SET_COMIC_STATUS_SUCCESS,
  SET_COMIC_STATUS_FAIL,
} from "../constants/comicConstants";

export const comicStatusReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_COMIC_STATUS_REQUEST:
      return { loading: true };

    case SET_COMIC_STATUS_SUCCESS:
      return { loading: false, success: true, comic: action.payload };

    case SET_COMIC_STATUS_FAIL:
      return { loading: false, error: action.payload };

    default:
      return state;
  }
};
