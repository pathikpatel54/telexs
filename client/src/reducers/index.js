import { combineReducers } from "redux";
import authReducer from "./authReducer";
import devicesReducer from "./devicesReducer";
import statsReducer from "./statsReducer";
import { reducer as formReducer } from 'redux-form'

export default combineReducers({
    auth: authReducer,
    devices: devicesReducer,
    status: statsReducer,
    form: formReducer
})