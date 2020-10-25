import { combineReducers } from "redux"
import authReducer from "./authReducer"
import devicesReducer from "./devicesReducer"
import statsReducer from "./statsReducer"

export default combineReducers({
    auth: authReducer,
    devices: devicesReducer,
    status: statsReducer
})