import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import InformationIndentity from '../childs/InformationIndentity'
import _ from 'lodash'
import { decryptText, decrypt } from '../../modules/crypto'
import { callGetIPFS } from '../../modules/IPFS'
import PreviewImage from '../../IdentityUser/childs/PreviewImage';
// pass 123123123
const data = {
  "fullName": "123",
  "located": "123",
  "email": "123",
  "privateData": "cf8282515acfff8bc28f7c44ed87a916aa62c415ea837f1aa0e91a07496238cb504cfcab9df2265b9afdf76b9399259263",
  "hashImage": "QmeA1EvzasjHWPWQ8jaywd9KyUh8Ek9cg3YY2rpDS1w44D"
}
export default class Notification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        addressVertifier: '0xaaa',
        publicKey: '999999',
      },
      countNoti: 1,
      openPopper: false,
      openInforIdentity: false,
      password: '',
      imageArray: [],
      openPreview: false
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

  handleChangePassword = (e) => {
    this.setState({
      password: e.target.value
    })
  }

  handleDialogAccept = async (password) => {
    // encrypt data
    const keyPrivateData = ['hashImage', 'privateData']
    let privateData = ''
    let imageArray = []
    let publicData = {}
    debugger
    try {
      for (var key in data) {
        if (!_.includes(keyPrivateData, key)) {
          publicData[key] = data[key]
        }
      }
      privateData = decryptText(data.privateData, password)
      // decrypt image
      await callGetIPFS(data.hashImage).then(res => {
        imageArray = this.decryptImage(res.data, privateData)
        // encrypt with public key of Vertifier
        this.encryptWithPublicKey(privateData, publicData, imageArray)
      })
    } catch (error) {
      console.log(error)
    }
  }

  encryptWithPublicKey = (privateData, publicData, imageArray) => {
    console.log(privateData, publicData, imageArray)
    // we encrypt with key of vertifier
    // this key = public key + key as a plain text of vertifier
    // use aes to encrypt
    // keep public data
  }

  decryptImage = (imageEncrypted) => {
    const { password } = this.state

    let dataEncryptedImage = []
    _.map(imageEncrypted, encryptedImage => {
      dataEncryptedImage.push(
        decrypt(encryptedImage.data, password)
      )
    })
    return dataEncryptedImage
  }

  handleModal = () => {
    this.setState({
      openPreview: !this.state.openPreview
    })
  }

  render() {
    const { data, countNoti, openPopper, openInforIdentity, password, imageArray, openPreview } = this.state
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
            handleChange={this.handleChangePassword}
            data={data}
            password={password}
            handleDialogAccept={this.handleDialogAccept}
          />
        }
        {
          openPreview && <PreviewImage
            imageArray={imageArray}
            isOpen={openPreview}
            handleModal={this.handleModal}
          />
        }
      </span>
    )
  }
}
