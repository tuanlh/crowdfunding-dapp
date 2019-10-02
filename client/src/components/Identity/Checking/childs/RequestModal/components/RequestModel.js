import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import TextField from '@material-ui/core/TextField'
// import { makeStyles } from '@material-ui/core/styles';

class RequestModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      privateData: ''
    }
  }


  handleFileUpload = (e) => {
    let files = e.target.files[0]
    let reader = new FileReader();
    reader.onload = (e) => {
      this.setState({
        privateData: e.target.result
      })
    }
    reader.readAsText(files);
  }

  handleChangeData = (e) => {
    this.setState({
      privateData: e.target.value
    })
  }

  handleDataModal = () => {
    const { handleModal, privateKeyData } = this.props
    const { privateData } = this.state
    privateKeyData(privateData)
    handleModal()
  }

  render() {
    const { privateData } = this.state
    const { isOpen, handleModal } = this.props
    return (
      <Modal isOpen={isOpen} toggle={handleModal} size={'lg'} >
        <ModalHeader toggle={handleModal}>Put Your Key</ModalHeader>
        <ModalBody>
          <div>
            <TextField
              name='Private Key'
              label='Private Key'
              id='privateKey'
              onChange={this.handleChangeData}
              placeholder='Private Key'
              value={privateData}
              className='form-control'
            />
          </div>
          <div>
            <div style={{ margin: '20px 0px' }}>Or</div>
            <input id='image-file' type='file'
              onChange={this.handleFileUpload}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color='primary' onClick={this.handleDataModal}>Okay</Button>{' '}
        </ModalFooter>
      </Modal>
    );
  }
}

export default RequestModal;