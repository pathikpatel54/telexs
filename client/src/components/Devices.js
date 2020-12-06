import React, { Component } from 'react';
import { connect } from "react-redux";
import { Container, 
  Header, 
  Content, 
  Table, 
  Popover, 
  Whisper, 
  Checkbox, 
  Dropdown, 
  IconButton, 
  Icon, 
  Divider, 
  Progress, 
  Button,
  InputGroup,
  Input
} from 'rsuite';
import { fetchDevices, deleteDevices } from "../actions";
import ModalForm from "./modalForm";
const { Line } = Progress;
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
      <Whisper placement="right" speaker={speaker}>
        {dataKey === 'status' ? <div>{rowData[dataKey] != null ?<Icon icon='circle' style={rowData[dataKey].split(",")[0] === 'true' ? {color: '#2b850d'} : {color: '#d62915'}} /> : ''}</div>:
          <div>{rowData[dataKey]}</div>
        }
      </Whisper>
    </Cell>
  );
};

const CpuCell = ({ rowData, dataKey, ...props }) => {
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
  const cpu = rowData[dataKey] ? rowData[dataKey].split(",")[1] ? Number(rowData[dataKey].split(",")[1]) : 0 : 0
  let strokeColor = '';
  if (cpu >= 0 && cpu <= 40) {
    strokeColor = '#2b850d'
  } else if (cpu > 40 && cpu <= 80) {
    strokeColor = '#eb9d17'
  } else if(cpu > 80 ) {
    strokeColor = '#d62915'
  }

  return (
    <Cell {...props}>
      <Whisper placement="right" speaker={speaker}>
        {dataKey === 'status' ? <div>{rowData[dataKey] != null ? <Line percent={Number(rowData[dataKey].split(",")[1])} strokeColor={strokeColor} /> : ''}</div>:
          <div>{rowData[dataKey]}</div>
        }
      </Whisper>
    </Cell>
  );
};

const MemCell = ({ rowData, dataKey, ...props }) => {
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
  const memory = rowData[dataKey] ? Number(rowData[dataKey].split(",")[4])/Number(rowData[dataKey].split(",")[3]) ? Math.round((Number(rowData[dataKey].split(",")[4])/Number(rowData[dataKey].split(",")[3]))*100) : 0 : 0
  let strokeColor = '';
  if (memory >= 0 && memory <= 40) {
    strokeColor = '#2b850d'
  } else if (memory > 40 && memory <= 80) {
    strokeColor = '#eb9d17'
  } else if(memory > 80 ) {
    strokeColor = '#d62915'
  }
  return (
    <Cell {...props}>
      <Whisper placement="right" speaker={speaker}>
        {dataKey === 'status' ? <div>{rowData[dataKey] != null ? <Line percent={memory} strokeColor={strokeColor} /> : ''}</div>:
          <div>{rowData[dataKey]}</div>
        }
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
        style={{marginBottom: "8px"}}
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

class CustomColumnTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedKeys: []
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

  getChecked = () => {
    return this.state.checkedKeys;
  }

  removeChecked = () => {
    this.setState({ checkedKeys: []});
  }

  render() {
    const { checkedKeys } = this.state;
    const { data } = this.props;

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
          height={window.innerHeight - 100}
          style={{marginRight: '25px', marginBottom: '20px'}}
          data={data}
          id="table"
          bodyRef={ref => {
            tableBody = ref;
          }}
          headerHeight={50}
          shouldUpdateScroll={false}
        >
          <Column width={50} align="center">
            <HeaderCell style={{ padding: 0, fontSize: '17px' }}>
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
            <HeaderCell style={{ fontSize: '17px'}}>Status</HeaderCell>
            <NameCell style={{paddingTop: "10px"}} dataKey="status" />
          </Column>

          <Column width={160} align="center">
            <HeaderCell style={{ fontSize: '17px'}}>CPU</HeaderCell>
            <CpuCell style={{paddingTop: "3px"}} dataKey="status" />
          </Column>

          <Column width={160} align="center">
            <HeaderCell style={{ fontSize: '17px'}}>Memory</HeaderCell>
            <MemCell style={{paddingTop: "3px"}} dataKey="status" />
          </Column>

          <Column width={160}>
            <HeaderCell style={{ fontSize: '17px'}}>Hostname</HeaderCell>
            <NameCell style={{paddingTop: "10px"}} dataKey="hostName" />
          </Column>

          <Column width={160}>
            <HeaderCell style={{ fontSize: '17px'}}>Type</HeaderCell>
            <NameCell style={{paddingTop: "10px"}} dataKey="type" />
          </Column>

          <Column width={160}>
            <HeaderCell style={{ fontSize: '17px'}}>Vendor</HeaderCell>
            <NameCell style={{paddingTop: "10px"}} dataKey="vendor" />
          </Column>

          <Column width={160}>
            <HeaderCell style={{ fontSize: '17px'}}>Model</HeaderCell>
            <NameCell style={{paddingTop: "10px"}} dataKey="model" />
          </Column>

          <Column width={160}>
            <HeaderCell style={{ fontSize: '17px'}}>Version</HeaderCell>
            <NameCell style={{paddingTop: "10px"}} dataKey="version" />
          </Column>

          <Column width={200}>
            <HeaderCell style={{ fontSize: '17px'}}>Action</HeaderCell>
            <ActionCell style={{paddingTop: "5px"}} dataKey="objectID" />
          </Column>
        </Table>
      </div>
    );
  }
}

class Devices extends Component{
  
  constructor(props) {
    super(props);
    this.state = {
      ipf: ""
    }
    this.child = React.createRef();
  }
  
  componentDidMount() {
      this.props.fetchDevices();
  }

  onDeleteClick = () => {
    const checked = this.child.current.getChecked();
    this.props.deleteDevices(checked);
    this.child.current.removeChecked();
  }

  render() {
      const { data } = this.props.devices;
      return (
          <Container>
              <Header style={{ marginLeft: '2em', marginTop: '1em', marginRight: '2em'}} className="flex-container">
                  <div style={{display: "flex", justifyContent: "flex-start"}}>
                    <div>
                    <ModalForm>Add Device</ModalForm>
                    </div>
                    <div>
                    <Button style={{ marginLeft: "10px"}} onClick={this.onDeleteClick}>Delete Selected</Button>
                    </div>
                  </div>
                  <div>
                    <InputGroup inside style={{width: 250}}>
                      <Input placeholder="Search for IP..." value={this.state.ipf} onChange={(val) => this.setState({ipf: val})}/>
                      <InputGroup.Addon>
                        <Icon icon="search"/>
                      </InputGroup.Addon>
                    </InputGroup>
                  </div>
              </Header>
              <Content style={{ marginLeft: '2em', marginTop: '1em'}}>
                {data ? <CustomColumnTable ref={this.child} data={this.state.ipf ? data.filter((device) => device.ipAddress.includes(this.state.ipf)): data}></CustomColumnTable> : ''}
              </Content>
          </Container>
      );
  }
}

const mapStateToProps = ({ devices, status }, ) => {
    const { data } = devices;
    if(data && status.data) {
      devices.data = data.map((device) => {
        device.status = status.data[device.objectID];
        return device;
      });
    }
    return { devices, status };
}

export default connect(mapStateToProps, { fetchDevices, deleteDevices })(Devices);