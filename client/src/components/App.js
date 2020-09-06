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
        console.log(this.props.auth)
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

const mapStateToProps = ({ auth }) => {
    return { auth }
}

export default connect(mapStateToProps, {fetchUser})(App);
