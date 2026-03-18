import API from "../../API";



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
        if (!data.error) {
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("user", JSON.stringify(data.data));

            dispatch({ type: USER_LOGIN_SUCCESS, payload: data.data });
            // navigate("/create-comic");

            const userType = data.data.userType;

            //  ROLE BASED REDIRECT HERE
            if (userType === "admin" || userType === "moderator") {
                navigate("/super-admin");
            }
            else if (userType === "parent") {
                navigate("/parent/manage-children");
            }
            else {
                navigate("/create-comic"); // normal user
            }
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

        // localStorage.setItem("token", data.data.token);
        // localStorage.setItem("user", JSON.stringify(data.data));

        dispatch({ type: USER_VERIFY_OTP_SUCCESS, payload: data.data });
        navigate("/login");
        window.location.reload();

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
