import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import ReduxThunk from "redux-thunk";

import App from "./components/App";
import reducers from "./reducers"

import 'rsuite/dist/styles/rsuite-dark.css'

const store = createStore(reducers, applyMiddleware(ReduxThunk));

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>
    ,document.querySelector("#root"));