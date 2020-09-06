import axios from "axios"
import { FETCH_USER_ERROR, FETCH_USER_SUCCESS, FETCH_USER } from "./types"

export const fetchUser = () => async dispatch => {
    dispatch({ type: FETCH_USER })
    try {
        const response = await axios.get("/api/user")
        dispatch({ type: FETCH_USER_SUCCESS, payload: response.data})
    } catch (e) {
        return dispatch({ type: FETCH_USER_ERROR, payload: e })
    }
}