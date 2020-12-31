import React from "react";
import { connect } from "react-redux";
import { Container, Panel, Row, Col, Progress } from 'rsuite';
import Header from "./Header";

const { Line } = Progress;

const Card = props => (
    <Panel {...props} shaded header={props.title} style={{marginRight: "2px", backgroundColor: "#1a1d24"}}>
        <Line showInfo={false} percent={props.percent} strokeColor={props.title === "Healthy Nodes" ? `#2b850d` : `#d62915`} style={{padding: "0px"}} />
    </Panel>
  );

const Instance = ({stat}) => {
    return(
        <Row style={{marginRight: "0px", marginTop: "15px", marginLeft: "10px"}}>
            <Col md={4} sm={12}>
                <Card title="Healthy Nodes" percent={(stat.true/(stat.true+stat.false))*100}/>
            </Col>
            <Col md={4} sm={12}>
                <Card title="Faulty Nodes" percent={(stat.false/(stat.true+stat.false))*100}/>
            </Col>
        </Row>
    )
}; 

const Landing = ({stat}) => {
    return (
        <Container>
            <Header>Dashboard</Header>
            <Instance stat={stat}/>
        </Container>
    )
}

const mapStateToProps = ({ status }) => {
    let stat = {
        true: 0,
        false: 0
    }
    for (const oId in status.data) {
        stat[status.data[oId].split(",")[0]]++;
    }
    return {stat};
}

export default connect(mapStateToProps)(Landing);