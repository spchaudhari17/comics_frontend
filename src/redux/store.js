import { createStore, applyMiddleware, combineReducers } from "redux";
import { thunk } from "redux-thunk";
import { composeWithDevTools } from "@redux-devtools/extension"
import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer } from "redux-persist";
import { userLoginReducer, userOtpVerifyReducer, userRegisterReducer } from "./reducers/userReducers";


const rootReducer = combineReducers({

    userRegister: userRegisterReducer,
    userLogin: userLoginReducer,
    userOtpVerify: userOtpVerifyReducer,

});

const persistConfig = {
    key: "root",
    storage,
    whitelist: [""],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(persistedReducer, composeWithDevTools(applyMiddleware(thunk)));

const persistor = persistStore(store);

export { store, persistor };
