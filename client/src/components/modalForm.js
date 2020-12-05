import React, { Component } from "react";
import { Form, FormGroup, FormControl, ControlLabel, InputPicker,Modal, Button, DatePicker, Alert } from 'rsuite';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { addDevices, clearError } from '../actions'

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
    <FormGroup>
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
        show: false
      };
      this.close = this.close.bind(this);
      this.open = this.open.bind(this);
      this.submit = this.submit.bind(this);
    }
    shouldComponentUpdate(nextProps, nextState){
      return (nextProps.form !== this.props.form) ||
      (nextProps.submitting !== this.props.submitting) ||
      (nextProps.reset !== this.props.reset) || 
      (nextProps.pristine !== this.props.pristine) || 
      (nextProps.devices.error !== this.props.devices.error) || 
      (nextState !== this.state) ;
    }
    close() {
      this.props.reset();
      this.setState({ show: false });
    }
    open() {
      this.setState({ show: true });
    }

    submit(values) {
      this.props.addDevices(values)
    }

    renderNotifications = (err) => {
      if (typeof err === 'string') {
        Alert.error(err, 5000, () => {this.props.clearError()})
      }
    }

    render() {
      const { handleSubmit, pristine, submitting} = this.props;
      return (
        <div>
          <Modal show={this.state.show} onHide={this.close} size="xs">
            <Modal.Header>
              <Modal.Title>{this.props.children}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                fluid
                
              >
                <div className="flex-container" style={{ marginBottom: '15px'}}>
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
                    <Field  name="hostname" label="Hostname" component={renderField} placeholder="e.g. hostname.domain.com" />
                  {/* </div>
                </div> */}
                {/* <FormGroup>
                  <ControlLabel>IP Address</ControlLabel>
                  <FormControl name="ipAddress" placeholder="Enter Device IP Address"/>
                </FormGroup> */}
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
            
          </Modal>
          <Button onClick={this.open} >{this.props.children}</Button>
          {this.renderNotifications(this.props.devices.error)}
        </div>
      );
    }
  }

const mapStateToProps = ({ devices }) => {
  return { devices };
}

 export default connect(mapStateToProps, { addDevices, clearError })(reduxForm({
    form: 'DeviceForm', // a unique identifier for this form
    validate, // <--- validation function given to redux-form
    // warn // <--- warning function given to redux-form
  })(ModalForm))