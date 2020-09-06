import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import { fetchUser } from "../actions";

import Header from "./Header";
import Index from "./Index";

class App extends Component{
    componentDidMount() {
        this.props.fetchUser()
    }

    render() {
        return (
            <BrowserRouter>
                <React.Fragment>
                    <Header />
                    <Route exact path="/" component={Index} />
                </React.Fragment>
            </BrowserRouter>
        )
    }
}

export default connect(null, {fetchUser})(App);
