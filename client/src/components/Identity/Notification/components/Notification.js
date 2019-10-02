import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import InformationIndentity from '../childs/InformationIndentity'
import _ from 'lodash'
import { decryptText, decryptImage, decryptRSA } from '../../../utils/modules/crypto'
import { callGetIPFS } from '../../../utils/modules/IPFS'
import PreviewImage from '../../IdentityUser/childs/PreviewImage';
// pass 123123123
const data = {
  "fullName":"Thanh Tung",
  "located":"HCM",
  "email":"123123",
  "privateData":"95c5c7a39cab25f631eaff1e0c35ab15d9be28c55187cf0d2cc8bcb1bfe5532287536791417f7869a0469162",
  "hashImage":"QmQGydH2DAyGt98xbEodpThysdazpvfjjiy2d6UDbUGFGE",
  "serectKey":"Fmotgzhme7eAKSV1Q+R6SvLhLPBgsixnYO/tbYirxc578KjC3vX8CyAp3LarFM87wHXq1xRufBTDV2v6m5YbcaG2OPS0ndFWAXmvemNEMg6smkYnrrN31TVlwd3uRsuk5ViFWVeert57lroHoy+COFzHmf/o+Lfz3NO49LZOZX8="
}
const privateKey = `
-----BEGIN RSA PRIVATE KEY-----
MIICWgIBAAKBgHkC+ACofieuCxMdlnIKioUkJDsq3lboRGsaLml5tpANYP77hMdh
Y0/tBKPWc+IaXdLki7b2jttosHO7pRSjz/4CuIlOveDhMR26erEu0Z+N1Noo6Ey/
ZzWll8b6HbbudVR0cwVaKYv09/2dwCssPBl1rA4qRjUz13I6fISeYcA1AgMBAAEC
gYACnGPJb9k49fJbOTozv7J5aOw3MpeVfHFtdiUmNXAQ75j2J2sX+ivwX4bIGipp
6HO5xyCUlAFFDp8wAA5xwY8NPh8KrivWMFxqFqDUdrudVCWDo8fi4WdYfMzWKECH
RIlj/bWnvGlqHsuh+WTDEmrO1Jz5sgp6zi3HUw5jKxodgQJBAOKbBj0OwVtT0D4z
M+yvtF6e2Kq+B6LE5Dgfh5ZEoQDJcC1ZENDN0YlVWz+682EfRUpeh/fv/EEbFmE3
i+1cDxECQQCItXIxdGYYZy3LaVQPECo7XplWa7Brh4r5XDFu8uGYGSX6w4Pp1DV+
gkTC6UCh2xBhpufHIB4It73TKn97j+blAkB0ntPXGIDqP3gsiq1uYf6xs45OUP4d
BrdtKszcyPUTMphIvk2pKENuKj+LzOr0UOOYIo5XS2rHFumtnqikv3wBAkBPJORw
VxfIJuuvKFI+yjf42QJissOW7Qh65nHD7p7GBEEllM0osO8rR1VxlcISMhWgwxTK
BgD9QQqHVsIpEZ01AkAdBlodXHS6WQBdRNKS7h+JGJKBYlyf1eSFacZxPk9v25uv
9j7buVilDtCoJyg9F8wUrsPKKZ0P+g1DB2n1NNiJ
-----END RSA PRIVATE KEY-----`;
export default class Notification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        addressVertifier: '0xaaa',
        publicKey: `MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgHkC+ACofieuCxMdlnIKioUkJDsq
        3lboRGsaLml5tpANYP77hMdhY0/tBKPWc+IaXdLki7b2jttosHO7pRSjz/4CuIlO
        veDhMR26erEu0Z+N1Noo6Ey/ZzWll8b6HbbudVR0cwVaKYv09/2dwCssPBl1rA4q
        RjUz13I6fISeYcA1AgMBAAE=`,
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
  // as a verifier
  handleDialogAccept = async (password) => {
    // get secrect key
    let secrectKey = decryptRSA(Buffer.from(data.serectKey, 'base64'), privateKey).toString()

    // encrypt data
    const keyPrivateData = ['hashImage', 'privateData']
    let privateData = ''
    let imageArray = []
    let publicData = {}
    // debugger
    try {
      for (var key in data) {
        if (!_.includes(keyPrivateData, key)) {
          publicData[key] = data[key]
        }
      }
      privateData = decryptText(data.privateData, secrectKey)
      // decrypt image
      await callGetIPFS(data.hashImage).then(res => {
        imageArray = this.decryptImageData(res.data, secrectKey)
        console.log(privateData)
        this.setState({
          imageArray,
          openPreview: true,          
        })
      })
    } catch (error) {
      console.log(error)
    }
  }

  decryptImageData = (imageEncrypted, secrectKey) => {

    let dataEncryptedImage = []
    _.map(imageEncrypted, encryptedImage => {
      dataEncryptedImage.push(
        decryptImage(encryptedImage.data, secrectKey)
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
