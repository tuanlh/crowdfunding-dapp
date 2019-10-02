import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label } from 'reactstrap'

export default class ConfirmPassword extends React.PureComponent {
  handleDataConfirm = () => {
    const { handleDataConfirm } = this.props
    handleDataConfirm()
  }

  render() {
    const { openConfirm, handleShowConfirm } = this.props
    return (
      <div>
        <Modal isOpen={openConfirm} className={this.props.className}>
          <ModalHeader toggle={handleShowConfirm} >Terms</ModalHeader>
          <ModalBody>
            <Label>Terms</Label>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onClick={this.handleDataConfirm}>Do Something</Button>{' '}
            <Button color='secondary' onClick={handleShowConfirm} >Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

ConfirmPassword.propTypes = {
  openConfirm: PropTypes.bool,
  handleDataConfirm: PropTypes.func,
  handleShowConfirm: PropTypes.func,
}
