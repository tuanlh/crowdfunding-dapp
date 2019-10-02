import React, { Component, Fragment } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import InformationIndentity from '../childs/InformationIndentity'

export default class Notification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        addressVertifier: '0xaaa',
        publicKey: '999999'
      },
      countNoti: 1,
      openPopper: false,
      openInforIdentity: false
    }
  }
  handlePopper = () => {
    this.setState({
      openPopper: !this.state.openPopper
    })
  }
  handleShowNotification = () => {
    this.setState({
      openInforIdentity: !this.state.openInforIdentity,
      openPopper: false
    })
  }
  render() {
    const { data, countNoti, openPopper, openInforIdentity } = this.state
    return (
      <span style={{ float: 'right' }}>
        <FontAwesomeIcon icon="bell" onClick={this.handlePopper} id='popoverNoti' />
        <Popover placement="bottom" isOpen={openPopper} target="popoverNoti" toggle={this.handlePopper}>
          <PopoverHeader>Notification</PopoverHeader>
          <PopoverBody onClick={
            this.handleShowNotification
          }>You have {countNoti} request identity. Click here for details</PopoverBody>
        </Popover>
        {
          openInforIdentity &&
          <InformationIndentity
            open={openInforIdentity}
            handleDialog={this.handleShowNotification}
          />
        }
      </span>
    )
  }
}
