import axios from "axios"
import { FETCH_USER_ERROR, FETCH_USER_SUCCESS } from "./types"

export const fetchUser = () => async dispatch => {
    try {
        response = await axios.get("/api/user")
            dispatch({ type: FETCH_USER_SUCCESS})
    } catch (e) {
        return dispatch({ type: FETCH_USER_ERROR, payload: e })
    }
}