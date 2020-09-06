import { FETCH_USER, FETCH_USER_SUCCESS, FETCH_USER_ERROR } from "../actions/types";

const INITIAL_STATE = {
    data: null,
    loading: false,
    error: null
}

export default (state=INITIAL_STATE, action) => {
    switch(action.type) {
        case FETCH_USER:
            return { ...state, loading: true };
        case FETCH_USER_SUCCESS:
            return { ...state, loading: false, error: false, data: action.payload };
        case FETCH_USER_ERROR:
            return { ...state, loading: false, error: action.payload, data: null };
        default:
            return state;
    }
}