import axios from "axios";
import { 
    FETCH_USER_ERROR, 
    FETCH_USER_SUCCESS, 
    FETCH_USER, 
    FETCH_DEVICES, 
    FETCH_DEVICES_SUCCESS, 
    FETCH_DEVICES_ERROR, 
    CHANGE_DEVICE_STATUS,
    ADD_DEVICES,
    ADD_DEVICES_SUCCESS,
    ADD_DEVICES_ERROR,
    CLEAR_ERROR,
    DELETE_DEVICES,
    DELETE_DEVICES_SUCCESS,
    DELETE_DEVICES_ERROR
} from "./types";
let count = 0;
let socketStore;

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

export const deleteDevices = (devices) => async dispatch => {
    dispatch({ type: DELETE_DEVICES });
    try {
        const responses = devices.map((device) => {
            const response = axios.delete(`/api/device/${device}`);
            return response;
        })
        await Promise.all(responses)
        return dispatch({ type: DELETE_DEVICES_SUCCESS, payload: devices })
    } catch(e) {
        return dispatch({ type: DELETE_DEVICES_ERROR, payload: e })
    }
}

export const clearError = () => async dispatch => {
    return dispatch({ type: CLEAR_ERROR });
}

export const addDevices = (data) => async dispatch => {
    dispatch({ type: ADD_DEVICES });
    try{
        const response = await axios.post("/api/devices", data);
        // socketStore.send(JSON.stringify({ eventName: "addDevice" }))
        return dispatch({ type: ADD_DEVICES_SUCCESS, payload: response.data });
    } catch(e) {
        return dispatch({ type: ADD_DEVICES_ERROR, payload: e });
    }
}

export const socketSub = (socket) => async dispatch => {
    socketStore = socket;
    socketStore.onopen = () => {
        socketStore.send(JSON.stringify({ eventName: "subscribe" }));
    }

    socketStore.onmessage = (evt) => {
        const event = JSON.parse(evt.data)
        switch(event.eventName) {
            case "deviceStatus":
                dispatch({ type: CHANGE_DEVICE_STATUS, payload: event.payload });
                break;
            default:
                console.log(event);
        }
    }

    socketStore.onclose = () => {
        if (count <= 4) {
            console.log("Re-connecting Socket");
            const socket = new WebSocket("ws://localhost:5000/api/socket");
            socketSub(socket)(dispatch);
            count++;
        }
    }
}