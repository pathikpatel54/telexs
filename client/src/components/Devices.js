import React, { Component } from 'react';
import { Container, Header, Content } from 'rsuite';

class Devices extends Component{
    render() {
        return (
            <Container>
            <Header style={{ marginLeft: '2em'}}>
              <h2 >Devices</h2>
            </Header>
            <Content style={{ marginLeft: '2em'}}>Content</Content>
        </Container>
        );
    }
}

export default Devices;