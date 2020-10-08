import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import { fetchUser } from "../actions";
import { Container } from 'rsuite'
import io from 'socket.io-client';

import Head from "./Header";
import Landing from "./Landing";
import Devices from "./Devices";

var socket = io.connect('ws://localhost:8000', {
    //forceNew : false,
    transports: ['websocket']
});

socket.emit("test", "dnfvndfkvnkdfn")

class App extends Component{
    componentDidMount() {
        this.props.fetchUser()
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

export default connect(mapStateToProps, {fetchUser})(App);
