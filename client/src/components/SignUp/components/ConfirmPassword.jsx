import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label } from 'reactstrap'

export default class ConfirmPassword extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      rePassword: ''
    }
  }
  
  handleChange = (e) => {
    this.setState({
      rePassword: e.target.value
    })
  }

  handleDataConfirm = () => {
    const { handleDataConfirm } = this.props
    handleDataConfirm(this.state.rePassword)
  }

  render() {
    const { openConfirm, handleShowConfirm } = this.props
    const { rePassword } = this.state
    return (
      <div>
        <Modal isOpen={openConfirm} className={this.props.className}>
          <ModalHeader toggle={handleShowConfirm} >Confirm Password</ModalHeader>
          <ModalBody>
            <Label>Please confirm password again</Label>
            <input
              required type='password' className='form-control'
              placeholder='Re-password'
              value={rePassword}
              onChange={this.handleChange}
            />
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
