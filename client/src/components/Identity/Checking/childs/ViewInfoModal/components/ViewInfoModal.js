import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
class ViewInfoModal extends Component {
  render() {
    const { isOpen, handleModal } = this.props
    return (
      <Modal isOpen={isOpen} toggle={handleModal} size={'lg'} >
        <ModalHeader toggle={handleModal}>Put Your Key</ModalHeader>
        <ModalBody style={{ textAlign: 'center' }}>
          <p>Test</p>
        </ModalBody>
        <ModalFooter>
          <Button color='primary' onClick={handleModal}>Okay</Button>{' '}
        </ModalFooter>
      </Modal>
    );
  }
}

export default ViewInfoModal;