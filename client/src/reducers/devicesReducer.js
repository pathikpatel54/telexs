import { 
    ADD_DEVICES,
    ADD_DEVICES_ERROR, 
    ADD_DEVICES_SUCCESS, 
    CLEAR_ERROR,
    MODIFY_DEVICE,
    DELETE_DEVICES, 
    DELETE_DEVICES_SUCCESS, 
    FETCH_DEVICES, 
    FETCH_DEVICES_ERROR, 
    FETCH_DEVICES_SUCCESS, 
    MODIFY_DEVICE_SUCCESS
} from "../actions/types";

const INITIAL_STATE = {
    adding: false,
    modifying: false,
    data: null,
    error: null,
    loading: false
}

export default (state=INITIAL_STATE, action) => {
    switch(action.type) {
        case FETCH_DEVICES:
            return { ...state, loading: true };
        case FETCH_DEVICES_SUCCESS:
            return { ...state, loading: false, adding: false, modifying: false, error: null, data: action.payload };
        case FETCH_DEVICES_ERROR:
            return { ...state, loading: false, adding: false, modifying: false, error: action.payload, data: null };
        case ADD_DEVICES:
            return { ...state, loading: false, adding: true, modifying: false, error: null };
        case ADD_DEVICES_SUCCESS:
            // if (state.data.some((dev) => dev.objectID === action.payload.objectID)) {
            //     return state
            // }
            return { ...state, loading: false, adding: false, modifying: false, error: null, data: state.data.concat(action.payload)}
        case ADD_DEVICES_ERROR:
                // if (state.data.some((dev) => dev.objectID === action.payload.objectID)) {
                //     return state
                // }
            console.log(action.payload.response.status)
            if (action.payload.response.status === 409) {
                if (state.data.some((dev) => dev.objectID === action.payload.response.data.objectID)) {
                    return { ...state, loading: false, error: "Device Already Exists in your list." }
                }
                return { ...state, loading: false, adding: false, modifying: false, error: "Device Already Exists in database...Adding it to your list.", data: state.data.concat(action.payload.response.data) }
            } else if (action.payload.response.status === 401) {
                return { ...state, loading: false, adding: false, modifying: false, error: "You are not Authorized to Perform this operation." }
            }
            return { ...state, loading: false, adding: false, modifying: false, error: action.payload };

        case MODIFY_DEVICE:
            return {...state, loading: false, adding: false, modifying: true, error: null };
        case MODIFY_DEVICE_SUCCESS:
            const modifiedData = state.data.map((device) => {
                if (device.objectID === action.payload.objectID) {
                    return action.payload;
                }
                return device;
            });
            console.log(modifiedData);
            return {...state, loading: false, adding: false, modifying: false, data: modifiedData, error: null };
        case DELETE_DEVICES_SUCCESS:
            return { ...state, loading: false, adding: false, modifying: false, error: null, data: state.data.filter((device) => !action.payload.includes(device.objectID))}
        case CLEAR_ERROR:
            return { ...state, loading: false, adding: false, modifying: false, error: null };
        default:
            return state;
    }
}