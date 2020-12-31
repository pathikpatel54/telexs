import React from "react";
import { connect } from "react-redux";
import { Nav, Navbar, Dropdown, Loader} from "rsuite";
import { useHistory } from "react-router-dom";

const Header = (props) => {
    const { auth } = props;
    const history = useHistory();

    return (
        <Navbar appearance="inverse">
            <Navbar.Header>
            <a href="#" className="navbar-brand logo">{props.children}</a>
            </Navbar.Header>
            <Navbar.Body>
            <Nav>
                {/* <Nav.Item icon={<Icon icon="home" />} >Home</Nav.Item> */}
                {/* <Nav.Item>Add</Nav.Item>
                <Nav.Item>Delete</Nav.Item> */}
                {/* <Dropdown title="About">
                <Dropdown.Item>Company</Dropdown.Item>
                <Dropdown.Item>Team</Dropdown.Item>
                <Dropdown.Item>Contact</Dropdown.Item>
                </Dropdown> */}
            </Nav>
            <Nav pullRight>


                {auth.data ? 
                    <Dropdown title={auth.data.name}>
                        <Dropdown.Item>Help</Dropdown.Item>
                        <Dropdown.Item>Settings</Dropdown.Item>
                        <Dropdown.Item onClick={() => window.location = '/api/logout'}>Sign Out</Dropdown.Item>
                    </Dropdown>
                : auth.loading ? <Nav.Item><Loader /></Nav.Item> : <Nav.Item onClick={() => window.location = '/auth/google'}>
                    Login with Google
                </Nav.Item>
                }
            </Nav>
            </Navbar.Body>
        </Navbar>
    )
}

const mapStateToProps = ({ auth }) => {
    return { auth };
}

export default connect(mapStateToProps)(Header);