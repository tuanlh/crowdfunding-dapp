import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import TextField from '@material-ui/core/TextField'
class RequestModal extends Component {
  render() {
    const { isOpen, handleModal, handleChange } = this.props
    return (
      <Modal isOpen={isOpen} toggle={handleModal} size={'lg'} >
          <ModalHeader toggle={handleModal}>Put Your Key</ModalHeader>
          <ModalBody style={{ textAlign: 'center' }}>
            <TextField
             name='Public Key'
             label='Public Key'
             id='publicKey'
             onChange={handleChange}
             placeholder='Public Key'
             required
             className='form-control'
            />
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onClick={handleModal}>Okay</Button>{' '}
          </ModalFooter>
        </Modal>
    );
  }
}

export default RequestModal;