import { CHANGE_DEVICE_STATUS } from "../actions/types";

const INITIAL_STATE = {
    loading: false,
    data: null,
    error: null
}

export default (state=INITIAL_STATE, action) => {
    switch(action.type) {
        case CHANGE_DEVICE_STATUS:
            return { ...state, loading: false, error: false, data: action.payload };
        default:
            return state;
    }
}