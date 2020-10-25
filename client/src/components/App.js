import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import { fetchUser, socketSub } from "../actions";
import { Container } from 'rsuite'

import Head from "./Header";
import Landing from "./Landing";
import Devices from "./Devices";

const socket = new WebSocket("ws://localhost:5000/api/socket")

class App extends Component{
    componentDidMount() {
        this.props.fetchUser()
        this.props.socketSub(socket)
    }

    render() {
        return (
            <div className="show-fake-browser sidebar-page">
                <Container>
                    <BrowserRouter>
                        <React.Fragment>
                            <Head auth={this.props.auth}/>
                            <Route exact path="/" component={Landing} />
                            <Route exact path="/devices" component={Devices} />
                        </React.Fragment>
                    </BrowserRouter>
                </Container>
            </div>
        )
    }
}

const mapStateToProps = ({ auth }) => {
    return { auth }
}

export default connect(mapStateToProps, {fetchUser, socketSub})(App);
