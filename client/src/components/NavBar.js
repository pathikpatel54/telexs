import React, { Component } from "react";
import { Navbar, Nav, Dropdown, Icon, Loader, Sidebar, Sidenav } from 'rsuite';
import { withRouter } from 'react-router-dom';

const headerStyles = {
  padding: 18,
  fontSize: 16,
  height: 56,
  background: '#34c3ff',
  color: ' #fff',
  whiteSpace: 'nowrap',
  overflow: 'hidden'
};

const iconStyles = {
  width: 56,
  height: 56,
  lineHeight: '56px',
  textAlign: 'center'
};

const NavToggle = ({ expand, onChange, auth }) => {
  return (
    <Navbar appearance="default" className="nav-toggle">
      <Navbar.Body>
        {/* <Nav>
          {auth.data ? 
            <Dropdown
            placement="topStart"
            trigger="click"
            renderTitle={children => {
              return <Icon style={iconStyles} icon="cog" />;
            }}
          >
            <Dropdown.Item>Help</Dropdown.Item>
            <Dropdown.Item>Settings</Dropdown.Item>
            <Dropdown.Item><a href='/api/logout'>Sign Out</a></Dropdown.Item>
          </Dropdown>
          : auth.loading ? <Loader /> : 
          expand ? <Nav.Item>
            <a href="/auth/google">Sign In with Google</a>
          </Nav.Item> : <a href='/auth/google'><Icon style={iconStyles} icon="google" /></a>
          }
          
          
        </Nav> */}
        <Nav pullRight>
          <Nav.Item onClick={onChange} style={{ width: 56, textAlign: 'center' }}>
            <Icon icon={expand ? 'angle-left' : 'angle-right'} />
          </Nav.Item>
        </Nav>
      </Navbar.Body>
    </Navbar>
  );
};

class Head extends Component {
  state = {
      expand: false,
      active: 1
  }

  componentDidMount() {
    const {pathname} = this.props.location;
    switch(pathname) {
      case "/devices" || "/Devices":
        this.setState({active: 2});
        break;
      default:
        this.setState({active: 1})
    }
  }

  handleToggle = () => {
    this.setState({
      expand: !this.state.expand
    });
  }

  handleSelect = (active) => {
    this.setState({
      active
    })
  }
  
  render() {
    const { expand, active } = this.state;
    console.log(this.props.auth)
    return (
      <React.Fragment>
          <Sidebar
            style={{ display: 'flex', flexDirection: 'column', height: '100vh'}}
            width={expand ? 260 : 56}
            collapsible
          >
            <Sidenav.Header>
              <div style={headerStyles}>
                <Icon icon="logo-analytics" size="lg" style={{ verticalAlign: 0, marginRight:"5px" }} />
                <span>TELEXS</span>
              </div>
            </Sidenav.Header>
            <Sidenav
              expanded={expand}
              defaultOpenKeys={['3']}
              appearance="default"
              style={{flexGrow: '8'}}
            >
              <Sidenav.Body>
                <Nav>
                  <Nav.Item onClick={() => {this.props.history.push("/"); return this.handleSelect(1)}} eventKey="1" active={active === 1 ? true : false} icon={<Icon icon="dashboard" />}>
                    Dashboard
                  </Nav.Item>
                  <Nav.Item onClick={() => {this.props.history.push("/devices"); return this.handleSelect(2)}} eventKey="2" active={active === 2 ? true : false} icon={<Icon icon="group" />}>
                    Devices
                  </Nav.Item>
                  <Dropdown
                    eventKey="3"
                    trigger="hover"
                    title="Advanced"
                    icon={<Icon icon="magic" />}
                    placement="rightStart"
                    
                  >
                    <Dropdown.Item onSelect={() => this.handleSelect(31)} active={active === 31 ? true : false} eventKey="3-1">Geo</Dropdown.Item>
                    <Dropdown.Item onSelect={() => this.handleSelect(32)} active={active === 32 ? true : false} eventKey="3-2">Devices</Dropdown.Item>
                    <Dropdown.Item onSelect={() => this.handleSelect(33)} active={active === 33 ? true : false} eventKey="3-3">Brand</Dropdown.Item>
                    <Dropdown.Item onSelect={() => this.handleSelect(34)} active={active === 34 ? true : false} eventKey="3-4">Loyalty</Dropdown.Item>
                    <Dropdown.Item onSelect={() => this.handleSelect(35)} active={active === 35 ? true : false} eventKey="3-5">Visit Depth</Dropdown.Item>
                  </Dropdown>
                  <Dropdown
                    eventKey="4"
                    trigger="hover"
                    title="Settings"
                    icon={<Icon icon="gear-circle" />}
                    placement="rightStart"
                    active={active === 4 ? true : false}
                  >
                    <Dropdown.Item onSelect={() => this.handleSelect(41)} active={active === 41 ? true : false} eventKey="4-1">Applications</Dropdown.Item>
                    <Dropdown.Item onSelect={() => this.handleSelect(42)} active={active === 42 ? true : false} eventKey="4-2">Websites</Dropdown.Item>
                    <Dropdown.Item onSelect={() => this.handleSelect(43)} active={active === 43 ? true : false} eventKey="4-3">Channels</Dropdown.Item>
                    <Dropdown.Item onSelect={() => this.handleSelect(44)} active={active === 44 ? true : false} eventKey="4-4">Tags</Dropdown.Item>
                    <Dropdown.Item onSelect={() => this.handleSelect(45)} active={active === 45 ? true : false} eventKey="4-5">Versions</Dropdown.Item>
                  </Dropdown>
                </Nav>
              </Sidenav.Body>
            </Sidenav>
            <NavToggle expand={expand} onChange={this.handleToggle} auth={this.props.auth} />
          </Sidebar>
        </React.Fragment>
    );
  }
}

export default withRouter(Head);