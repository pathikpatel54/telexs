import React, { Component } from "react";
import { Form, FormGroup, FormControl, ControlLabel, InputPicker,Modal, Button, DatePicker, Alert, Icon, IconButton, Loader } from 'rsuite';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { addDevices, modifyDevices, clearError } from '../actions'

const styles = { display: 'block', marginBottom: 10 };
const typeData = [
  {
    "label": "Next Gen. Firewall",
    "value": "NGFW",
    "role": "Master"
  },
  {
    "label": "Proxy",
    "value": "Proxy",
    "role": "Master"
  },
  {
    "label": "Stateful Firewall",
    "value": "Stateful",
    "role": "Master"
  }
];

const vendorData = [
  {
    "label": "Checkpoint",
    "value": "Checkpoint",
    "role": "Master"
  },
  {
    "label": "PaloAlto Networks",
    "value": "PaloAlto",
    "role": "Master"
  },
  {
    "label": "Fortinet",
    "value": "Fortinet",
    "role": "Master"
  }
];

const renderField = ({
  name,
  label,
  type,
  style,
  accepter,
  input,
  placeholder,
  meta: { touched, error, warning }
}) => {

  return (
    <FormGroup style={{ marginBottom: '15px'}}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...input} name={name} type={type} style={style} accepter={accepter} placeholder={placeholder}/>
      {touched &&
        ((error && <span>{error}</span>) ||
          (warning && <span>{warning}</span>))}
    </FormGroup>
  )
}

const renderPicker = ({
  name,
  label,
  input,
  data,
  meta: { touched, error, warning }
}) => {
  return (
    <FormGroup>
      <ControlLabel>{label}</ControlLabel>
        <InputPicker
        {...input}
        size="md"
        data={data}
        style={styles}
        defaultValue={'PaloAlto'}
        name={name}
        />
      {touched &&
        ((error && <span>{error}</span>) ||
          (warning && <span>{warning}</span>))}
    </FormGroup>
    
  )
}

const renderDatePicker = ({
  name,
  label,
  input,
  meta: { touched, error, warning }
}) => {
  return (
    <FormGroup>
      <ControlLabel>{label}</ControlLabel>
        <DatePicker {...input} style={{ display:'block', width: '100%' }} name={name}/>
      {touched &&
        ((error && <span>{error}</span>) ||
          (warning && <span>{warning}</span>))}
    </FormGroup>
    
  )
}

const validate = values => {
  const errors = {}
  if (!values.ipAddress) {
    errors.ipAddress = 'IP Address is Required'
  } else if (!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(values.ipAddress)) {
    errors.ipAddress = 'IP Address entered is not valid'
  }
  if (!values.port) {
    errors.port = 'Port is Required'
  } else if (!/^()([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$/.test(values.port)) {
    errors.port = 'Port is not valid'
  }
  if (!values.hostname) {
    errors.hostname = 'Hostname is Required'
  }
  return errors
}

class ModalForm extends Component {
    constructor(props) {
      super(props);
      this.state = {
        show: false,
        notification: false
      };
      this.close = this.close.bind(this);
      this.submit = this.submit.bind(this);
      this.showForm = this.showForm.bind(this);
    }
    
    // shouldComponentUpdate(nextProps, nextState){
    //   return (
    //   (nextProps.selected !== this.props.selected) ||
    //   // (nextProps.form !== this.props.form) ||
    //   (nextProps.submitting !== this.props.submitting) ||
    //   // (nextProps.reset !== this.props.reset) ||
    //   (nextProps.pristine !== this.props.pristine) ||
    //   (nextProps.devices.adding !== this.props.devices.adding) ||
    //   (nextProps.devices.error !== this.props.devices.error) ||
    //   (nextState !== this.state)) ;
    // }

    close = () => {
      this.props.reset();
      this.setState({ show: false });
      this.props.resetSelected();
    }

    showForm = () => {
      this.setState({ show: true });
    }

    async submit(values) {
      if(this.props.selected) {
        Alert.info(<Loader content="Modifying Device..." />)
        await this.props.modifyDevices(values);
        if (!this.props.devices.adding && !this.props.devices.error) {
          Alert.close();
          Alert.success("Device Modified Successfully.", 5000);
          this.close();
          return
        } else if(this.props.devices.error) {
          if (typeof this.props.devices.error === 'string') {
            if(!this.state.notification) {
              Alert.closeAll();
              Alert.error(this.props.devices.error, 5000, () => {this.props.clearError(); this.setState({notification: false})});
              this.setState({notification: true});
            }
          }
        }
        this.close();
        return
      } else {
        Alert.info(<Loader content="Adding Device..." />)
        await this.props.addDevices(values);
        if (!this.props.devices.adding && !this.props.devices.error) {
          Alert.close();
          Alert.success("Device Added Successfully.", 5000);
          this.close();
          return
        } else if(this.props.devices.error) {
          if (typeof this.props.devices.error === 'string') {
            if(!this.state.notification) {
              Alert.closeAll();
              Alert.error(this.props.devices.error, 5000, () => {this.props.clearError(); this.setState({notification: false})});
              this.setState({notification: true});
            }
          }
        }
        this.close();
        return
      }
    }

    // renderNotifications = (err) => {
    //   if (typeof err === 'string') {
    //     if(!this.state.notification) {
    //       Alert.closeAll();
    //       Alert.error(err, 5000, () => {this.props.clearError(); this.setState({notification: false})});
    //       this.setState({notification: true});
    //     }
    //   }
    // }

    render() {
      const { handleSubmit, pristine, submitting} = this.props;
      
      return (
        <div>
          <Modal show={this.state.show || this.props.selected} onHide={this.close} size="xs">
            <Modal.Header>
              <Modal.Title>{this.props.selected ? "Modify Device" : this.props.children}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                fluid
                
              >
                <div className="flex-container">
                  <div style={{marginRight: '10px'}}>
                    <Field  name="ipAddress" label="IP Address" component={renderField} placeholder="x.x.x.x" />
                  </div>
                  <div style={{marginRight: '0px'}}>
                    <Field  name="port" label="Port" component={renderField} placeholder="1-65535" />
                  </div>
                </div>
                {/* <div className="flex-container" style={{ marginBottom: '15px'}}>
                  <div style={{marginRight: '20px'}}>
                    <Field  name="ipAddress" label="IP Address" component={renderField} />
                  </div>
                  <div style={{marginRight: '0px'}}> */}
                    <Field  name="hostName" label="Hostname" component={renderField} placeholder="e.g. hostname.domain.com" />
                  {/* </div>
                </div> */}
                {/* <FormGroup>
                  <ControlLabel>IP Address</ControlLabel>
                  <FormControl name="ipAddress" placeholder="Enter Device IP Address"/>
                </FormGroup> */}
                <div className="flex-container">
                  <div style={{marginRight: '10px'}}>
                    <Field  name="user" label="Admin Username" component={renderField} placeholder="Username" />
                  </div>
                  <div style={{marginRight: '0px'}}>
                    <Field  name="password" label="Password" component={renderField} placeholder="Password" />
                  </div>
                </div>

                <div className="flex-container" style={{ marginBottom: '15px'}}>
                  <div style={{marginRight: '10px'}}>
                  <Field  name="type" label="Type" component={renderPicker} data={typeData}/>
                  </div>
                  <div style={{marginRight: '0px'}}>
                  <Field  name="vendor" label="Vendor" component={renderPicker} data={vendorData}/>
                  </div>
                </div>

                <div className="flex-container" style={{ marginBottom: '15px'}}>
                  <div style={{marginRight: '10px', flexGrow: '1'}}>
                    <Field  name="eos" label="EOS" component={renderDatePicker} />
                  </div>
                  <div style={{marginRight: '0px', flexGrow: '1'}}>
                    <Field  name="eol" label="EOL" component={renderDatePicker} />
                  </div>
                </div>

                {/* <Field  name="type" label="Type" component={renderField} accepter={() => <InputPicker
                    size="md"
                    data={data}
                    style={styles}
                    defaultValue={'NGFW'}
                  />}/>
                <Field  name="vendor" label="Vendor" component={renderField}/> */}
                {/* <FormGroup>
                  <ControlLabel>Type</ControlLabel>
                  <FormControl name="type" accepter={() => <InputPicker
                    size="md"
                    data={data}
                    style={styles}
                    defaultValue={'NGFW'}
                  />}/>
                </FormGroup> */}
                <FormGroup>
                  <ControlLabel>Description</ControlLabel>
                  <FormControl
                    rows={5}
                    name="textarea"
                    componentClass="textarea"
                  />
                </FormGroup>
                </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={handleSubmit(this.submit)} appearance="primary" disabled={pristine || submitting}>
                Confirm
              </Button>
              <Button onClick={this.close} appearance="subtle" disabled={pristine || submitting}>
                Cancel
              </Button>
            </Modal.Footer>
            
          </Modal>{
            this.props.icon ? <IconButton
            appearance="subtle"
            onClick={this.showForm}
            icon={<Icon icon="edit2" />}
          /> :
            <Button onClick={this.showForm} >{this.props.children}</Button>
          }
          
          {/* {this.renderNotifications(this.props.devices.error)} */}
        </div>
      );
    }
  }

const mapStateToProps = ({ devices }, ownProps) => {
  console.log(ownProps.selected);
  return { devices, initialValues: ownProps.selected };
}

 export default connect(mapStateToProps, { addDevices, modifyDevices, clearError })(reduxForm({
    form: 'DeviceForm', // a unique identifier for this form
    validate, // <--- validation function given to redux-form
    enableReinitialize: true
    // warn // <--- warning function given to redux-form
  })(ModalForm))