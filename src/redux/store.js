import { createStore, applyMiddleware, combineReducers } from "redux";
import { thunk } from "redux-thunk";
import { composeWithDevTools } from "@redux-devtools/extension"
import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer } from "redux-persist";
import { userLoginReducer, userOtpVerifyReducer, userRegisterReducer } from "./reducers/userReducers";
import { adminComicListReducer, adminComicUpdateStatusReducer } from "./reducers/adminComicsReducer";
import {comicStatusReducer} from "./reducers/comicReducers"


const rootReducer = combineReducers({

    userRegister: userRegisterReducer,
    userLogin: userLoginReducer,
    userOtpVerify: userOtpVerifyReducer,
    comicStatus: comicStatusReducer,

    adminComicList: adminComicListReducer,
    adminComicUpdateStatus: adminComicUpdateStatusReducer,

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
