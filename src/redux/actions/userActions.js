import API from "../../API";
import { consumeReturnAfterLogin, getHomeForUserType } from "../../utility/authRedirect";



import {
    USER_REGISTER_REQUEST,
    USER_REGISTER_SUCCESS,
    USER_REGISTER_FAIL,
    USER_LOGIN_REQUEST,
    USER_LOGIN_SUCCESS,
    USER_LOGIN_FAIL,
    USER_LOGOUT,
    USER_VERIFY_OTP_REQUEST,
    USER_VERIFY_OTP_SUCCESS,
    USER_VERIFY_OTP_FAIL,
    USER_CLEAR_ERROR,
} from '../constants/userConstants';


// ✅ Token mil gaya -> user ko login karo aur sahi page pe bhejo
// (login, OTP verify aur signup, teeno yahi use karte hain)
// Agar user "Add to cart" jaise kaam se login pe aaya tha to wapas wahin,
// warna role ke hisaab se default page
export const finishLogin = (userData, dispatch, navigate) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData));

    dispatch({ type: USER_LOGIN_SUCCESS, payload: userData });

    if (navigate) {
        const returnTo = consumeReturnAfterLogin();
        navigate(returnTo || getHomeForUserType(userData.userType), { replace: true });
    }
};

export const registerUser = (userData) => async (dispatch) => {
    try {
        dispatch({ type: USER_REGISTER_REQUEST });

        const { data } = await API.post('/user/register', userData);

        if (data.error) {
            dispatch({ type: USER_REGISTER_FAIL, payload: data.message });
            return Promise.reject(data.message);
        }

        dispatch({ type: USER_REGISTER_SUCCESS, payload: data });
        return Promise.resolve(data);
    } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        dispatch({ type: USER_REGISTER_FAIL, payload: errMsg });
        return Promise.reject(errMsg);
    }
};

export const clearError = () => (dispatch) => {
    dispatch({ type: USER_CLEAR_ERROR });
};


export const loginUser = (formData, navigate) => async (dispatch) => {
    try {
        dispatch({ type: USER_LOGIN_REQUEST });

        const { data } = await API.post(`/user/login`, formData,
            { headers: { "Content-Type": "application/json" } }
        );

        // CASE 1: Email not verified (Backend sends OTP)
        if (data.error && data.data?.is_emailVerified === 0) {
            dispatch({ type: USER_LOGIN_FAIL, payload: data.message });

            // Redirect to OTP page
            navigate("/OtpVerification", {
                state: { email: data.data.email }
            });

            return; // stop here
        }

        //  CASE 2: Login success
        // (pehle se "Add to cart" jaisa kaam pending hai to wahin, warna role based page)
        if (!data.error) {
            finishLogin(data.data, dispatch, navigate);
        } else {
            dispatch({ type: USER_LOGIN_FAIL, payload: data.message });
        }
    } catch (error) {
        dispatch({
            type: USER_LOGIN_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};



export const verifyOtp = (formData, navigate) => async (dispatch) => {
    try {
        dispatch({ type: USER_VERIFY_OTP_REQUEST });

        const { data } = await API.post(
            "/user/verify_otp", formData,
            { headers: { "Content-Type": "application/json" } }
        );

        if (data.error) {
            dispatch({ type: USER_VERIFY_OTP_FAIL, payload: data.message });
            return;
        }

        dispatch({ type: USER_VERIFY_OTP_SUCCESS, payload: data.data });

        // ✅ Backend token de raha hai -> seedha login, dobara login page nahi
        if (data.data?.token) {
            finishLogin(data.data, dispatch, navigate);
            return;
        }

        // Token nahi aaya (purana backend) -> pehle jaisa login page
        navigate("/login", { replace: true });

    } catch (error) {
        dispatch({
            type: USER_VERIFY_OTP_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};



export const logoutUser = () => (dispatch) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch({ type: USER_LOGOUT });
};
