import React from "react";
import { Container, Header, Content } from 'rsuite';

const Landing = () => {
    return (
        <Container>
            <Header style={{ marginLeft: '2em', marginTop: '1em'}}>
              <h2 >Dashboard</h2>
            </Header>
            <Content style={{ marginLeft: '2em'}}>Content</Content>
        </Container>
    )
}

export default Landing;