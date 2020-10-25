import axios from "axios";
import { FETCH_USER_ERROR, FETCH_USER_SUCCESS, FETCH_USER, FETCH_DEVICES, FETCH_DEVICES_SUCCESS, FETCH_DEVICES_ERROR, CHANGE_DEVICE_STATUS } from "./types";

export const fetchUser = () => async dispatch => {
    dispatch({ type: FETCH_USER });
    try {
        const response = await axios.get("/api/user");
        dispatch({ type: FETCH_USER_SUCCESS, payload: response.data});
    } catch (e) {
        return dispatch({ type: FETCH_USER_ERROR, payload: e });
    }
}

export const fetchDevices = () => async dispatch => {
    dispatch({ type: FETCH_DEVICES });
    try {
        const response = await axios.get("/api/devices");
        return dispatch({ type: FETCH_DEVICES_SUCCESS, payload: response.data });
    } catch(e) {
        return dispatch({ type: FETCH_DEVICES_ERROR, payload: e });
    }
}

export const socketSub = (socket) => async dispatch => {
    socket.onopen = () => {
        socket.send(JSON.stringify({ eventName: "subscribe" }));
    }

    socket.onmessage = (evt) => {
        const event = JSON.parse(evt.data)
        switch(event.eventName) {
            case "deviceStatus":
                dispatch({ type: CHANGE_DEVICE_STATUS, payload: event.payload });
                break;
            default:
                console.log(event);
        }
    }
}