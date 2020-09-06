import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";

import Header from "./Header";
import Index from "./Index";

class App extends Component{
    componentDidMount() {
        
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

export default App;
