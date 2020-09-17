import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import { fetchUser } from "../actions";
import { Container } from 'rsuite'

import Head from "./Header";
import Landing from "./Landing";

class App extends Component{
    componentDidMount() {
        this.props.fetchUser()
    }

    render() {
        return (
            <div className="show-fake-browser sidebar-page">
                <Container>
                    <Head auth={this.props.auth}/>
                    <BrowserRouter>
                        <React.Fragment>
                            <Route exact path="/" component={Landing} />
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
