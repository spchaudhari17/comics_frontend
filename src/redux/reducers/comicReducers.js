import {
  SET_COMIC_STATUS_REQUEST,
  SET_COMIC_STATUS_SUCCESS,
  SET_COMIC_STATUS_FAIL,
    DELETE_COMIC_REQUEST,
  DELETE_COMIC_SUCCESS,
  DELETE_COMIC_FAIL,
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


const initialState = {
  loading: false,
  success: false,
  error: null,
  message: null,
};

export const deleteComicReducer = (state = initialState, action) => {
  switch (action.type) {
    case DELETE_COMIC_REQUEST:
      return { ...state, loading: true, success: false, error: null };
    case DELETE_COMIC_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        message: action.payload,
      };
    case DELETE_COMIC_FAIL:
      return { ...state, loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};
