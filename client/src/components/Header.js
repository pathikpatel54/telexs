import React from "react";
import { Navbar, Nav, Dropdown, Icon, Loader } from 'rsuite';
import ResponsiveNav from '@rsuite/responsive-nav';

const Header = (props) => {
    console.log(props.auth)
    return (
      <Navbar appearance="default">
      <Navbar.Header>
        <a href="#" className="navbar-brand logo">TELEXS</a>
      </Navbar.Header>
      <Navbar.Body>
        <ResponsiveNav>
          <ResponsiveNav.Item icon={<Icon icon="home" />} >Home</ResponsiveNav.Item>
          <ResponsiveNav.Item>News</ResponsiveNav.Item>
          <ResponsiveNav.Item>Products</ResponsiveNav.Item>
          <Dropdown title="About">
            <Dropdown.Item>Company</Dropdown.Item>
            <Dropdown.Item>Team</Dropdown.Item>
            <Dropdown.Item>Contact</Dropdown.Item>
          </Dropdown>
        </ResponsiveNav>
        <Nav pullRight>
          {props.auth.loading ? <Nav.Item><Loader speed="normal" content="normal" /></Nav.Item> : 
            (props.auth.error || !props.auth.data ? <Nav.Item href="/auth/google" icon={<Icon icon="google" />}>Sign-In with Google</Nav.Item> : 
                <Dropdown title={props.auth.data.name}>
                  <Dropdown.Item><a href="/api/logout">Logout</a></Dropdown.Item>
                </Dropdown>
            )
          }
        </Nav>
      </Navbar.Body>
    </Navbar>
    )
}

export default Header;