import { FETCH_DEVICES, FETCH_DEVICES_ERROR, FETCH_DEVICES_SUCCESS } from "../actions/types";

const INITIAL_STATE = {
    data: null,
    error: null,
    loading: false
}

export default (state=INITIAL_STATE, action) => {
    switch(action.type) {
        case FETCH_DEVICES:
            return { ...state, loading: true };
        case FETCH_DEVICES_SUCCESS:
            return { ...state, loading: false, error: null, data: action.payload };
        case FETCH_DEVICES_ERROR:
            return { ...state, loading: false, error: action.payload, data: null };
        default:
            return state;
    }
}