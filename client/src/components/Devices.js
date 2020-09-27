import React, { Component } from 'react';
import { connect } from "react-redux";
import { Container, Header, Content, Table, Popover, Whisper, Checkbox, Dropdown, IconButton, Icon, Divider } from 'rsuite';
import { fetchDevices } from "../actions";
import { fakedata as fakeData } from '../Placeholders/fakeData';


const { Cell, Column, HeaderCell } = Table;

const NameCell = ({ rowData, dataKey, ...props }) => {
    const speaker = (
      <Popover title="Description">
        <p>
          <b>Hostname:</b> {`${rowData.hostName}`}{' '}
        </p>
        <p>
          <b>IPAddress:</b> {rowData.ipAddress}{' '}
        </p>
        <p>
          <b>Type:</b> {rowData.type}{' '}
        </p>
        <p>
          <b>Vendor:</b> {rowData.vendor}{' '}
        </p>
        <p>
          <b>Model:</b> {rowData.model}{' '}
        </p>
        <p>
          <b>Version:</b> {rowData.version}{' '}
        </p>
      </Popover>
    );
  
    return (
      <Cell {...props}>
        <Whisper placement="bottom" speaker={speaker}>
          <div>{rowData[dataKey].toLocaleString()}</div>
        </Whisper>
      </Cell>
    );
  };
  
  const ImageCell = ({ rowData, dataKey, ...props }) => (
    <Cell {...props} style={{ padding: 0 }}>
      <div
        style={{
          width: 40,
          height: 40,
          background: '#f5f5f5',
          borderRadius: 20,
          marginTop: 2,
          overflow: 'hidden',
          display: 'inline-block'
        }}
      >
        <img src={rowData[dataKey]} width="44" />
      </div>
    </Cell>
  );
  
  const CheckCell = ({ rowData, onChange, checkedKeys, dataKey, ...props }) => (
    <Cell {...props} style={{ padding: 0 }}>
      <div style={{ lineHeight: '46px' }}>
        <Checkbox
          value={rowData[dataKey]}
          inline
          onChange={onChange}
          checked={checkedKeys.some(item => item === rowData[dataKey])}
        />
      </div>
    </Cell>
  );
  
  const Menu = ({ onSelect }) => (
    <Dropdown.Menu onSelect={onSelect}>
      <Dropdown.Item eventKey={3}>Download As...</Dropdown.Item>
      <Dropdown.Item eventKey={4}>Export PDF</Dropdown.Item>
      <Dropdown.Item eventKey={5}>Export HTML</Dropdown.Item>
      <Dropdown.Item eventKey={6}>Settings</Dropdown.Item>
      <Dropdown.Item eventKey={7}>About</Dropdown.Item>
    </Dropdown.Menu>
  );
  
  const MenuPopover = ({ onSelect, ...rest }) => (
    <Popover {...rest} full>
      <Menu onSelect={onSelect} />
    </Popover>
  );
  
  let tableBody;
  
class CustomWhisper extends React.Component {
    constructor(props) {
      super(props);
      this.handleSelectMenu = this.handleSelectMenu.bind(this);
    }
    handleSelectMenu(eventKey, event) {
      console.log(eventKey);
      this.trigger.hide();
    }
    render() {
      return (
        <Whisper
          placement="autoVerticalStart"
          trigger="click"
          triggerRef={ref => {
            this.trigger = ref;
          }}
          container={() => {
            return tableBody;
          }}
          speaker={<MenuPopover onSelect={this.handleSelectMenu} />}
        >
          {this.props.children}
        </Whisper>
      );
    }
  }
  
const ActionCell = ({ rowData, dataKey, ...props }) => {
    function handleAction() {
      alert(`id:${rowData[dataKey]}`);
    }
    return (
      <Cell {...props} className="link-group">
        <IconButton
          appearance="subtle"
          onClick={handleAction}
          icon={<Icon icon="edit2" />}
        />
        <Divider vertical />
        <CustomWhisper>
          <IconButton appearance="subtle" icon={<Icon icon="more" />} />
        </CustomWhisper>
      </Cell>
    );
};
  
const data = fakeData.filter((v, i) => i < 20);
  
class CustomColumnTable extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        checkedKeys: [],
        data: this.props.data
      };
      this.handleCheckAll = this.handleCheckAll.bind(this);
      this.handleCheck = this.handleCheck.bind(this);
    }
    handleCheckAll(value, checked) {
      const checkedKeys = checked ? this.props.data.map(item => item.objectID) : [];
      this.setState({
        checkedKeys
      });
    }
    handleCheck(value, checked) {
      const { checkedKeys } = this.state;
      const nextCheckedKeys = checked
        ? [...checkedKeys, value]
        : checkedKeys.filter(item => item !== value);
  
      this.setState({
        checkedKeys: nextCheckedKeys
      });
    }
    render() {
      const { data, checkedKeys } = this.state;
  
      let checked = false;
      let indeterminate = false;
  
      if (checkedKeys.length === data.length) {
        checked = true;
      } else if (checkedKeys.length === 0) {
        checked = false;
      } else if (checkedKeys.length > 0 && checkedKeys.length < data.length) {
        indeterminate = true;
      }
  
      return (
        <div>
          <Table
            height={700}
            data={data}
            id="table"
            bodyRef={ref => {
              tableBody = ref;
            }}
          >
            <Column width={50} align="center">
              <HeaderCell style={{ padding: 0 }}>
                <div style={{ lineHeight: '40px' }}>
                  <Checkbox
                    inline
                    checked={checked}
                    indeterminate={indeterminate}
                    onChange={this.handleCheckAll}
                  />
                </div>
              </HeaderCell>
              <CheckCell
                dataKey="objectID"
                checkedKeys={checkedKeys}
                onChange={this.handleCheck}
              />
            </Column>

            <Column width={160} align="center">
              <HeaderCell>Status</HeaderCell>
              <NameCell dataKey="ipAddress" />
            </Column>
  
            <Column width={160}>
              <HeaderCell>Hostname</HeaderCell>
              <NameCell dataKey="hostName" />
            </Column>

            <Column width={160}>
              <HeaderCell>Type</HeaderCell>
              <NameCell dataKey="type" />
            </Column>

            <Column width={160}>
              <HeaderCell>Vendor</HeaderCell>
              <NameCell dataKey="vendor" />
            </Column>

            <Column width={160}>
              <HeaderCell>Model</HeaderCell>
              <NameCell dataKey="model" />
            </Column>

            <Column width={160}>
              <HeaderCell>Version</HeaderCell>
              <NameCell dataKey="version" />
            </Column>
  
            <Column width={200}>
              <HeaderCell>Action</HeaderCell>
              <ActionCell dataKey="objectID" />
            </Column>
          </Table>
        </div>
      );
    }
}

class Devices extends Component{
    componentDidMount() {
        this.props.fetchDevices();
    }

    render() {
        console.log(this.props.devices)
        return (
            <Container>
                <Header style={{ marginLeft: '2em'}}>
                    <h2 >Devices</h2>
                </Header>
                <Content style={{ marginLeft: '2em'}}>
                  {this.props.devices.data ? <CustomColumnTable data={this.props.devices.data}></CustomColumnTable> : ''}
                  
                </Content>
            </Container>
        );
    }
}

const mapStateToProps = ({ devices }) => {
    return { devices };
}

export default connect(mapStateToProps, { fetchDevices })(Devices);