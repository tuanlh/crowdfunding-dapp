import React, { Component, Fragment } from 'react'
// import $ from 'jquery'
import _ from 'lodash'
// import axios from 'axios'
import { encryptText, decryptText, encryptImage, decryptImage } from './crypto'
import { callIPFS } from '../modules/IPFS'

import '../assets/signup.scss'

import ConfirmPassword from './ConfirmPassword'
import Loading from '../../../utils/Loading2/index'
import Alert from '../../../utils/Alert'
import PrivateIdentity from '../childs/PrivateIdentity'
import PublicIdentity from '../childs/PublicIdentity'
import PreviewImage from '../childs/PreviewImage'
export default class IdentityUser extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openConfirm: false,
      data: {},
      buffer: '',
      imageArray: [],
      isLoading: false,
      isError: {},
      openModal: false,
    }
    this.fileInput = React.createRef();
  }

  validateBeforeConfirm = () => {
    let p = { ...this.state }
    delete p.errors
    let errors = []
    for (var key in p) {
      if (p.hasOwnProperty(key)) {
        if (_.isNil(p[key]) || _.isEmpty(p[key])) {
          errors.push(key)
        }
      }
    }
    return errors
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.handleShowConfirm()
  }

  handleShowConfirm = () => {
    this.setState({
      openConfirm: !this.state.openConfirm
    })
  }

  handleChange = (e) => {
    let name = e.target.name
    let value = e.target.value
    const { data } = this.state
    data[name] = value
    this.setState({
      data,
      [e.target.name]: e.target.value
    })
  }

  handleDataConfirm = () => {
    const { data, imageArray } = this.state
    this.handleShowConfirm()
    if (!imageArray.length) {
      this.setState({
        isError: {
          content: 'Not upload image yet',
          position: 'bottom-center'
        }
      }, () => {
        this.setState({
          isError: {}
        })
      })
    }
    if (data.password !== data.rePassword) {
      this.setState({
        isError: {
          content: 'Password not match!',
          position: 'bottom-center'
        }
      }, () => {
        this.setState({
          isError: {}
        })
      })
    } else {
      // private data need to encrypt
      // includes: ID card number, Phone number, ID Image
      const keyPrivateData = ['idNumber', 'phoneNumber']
      let privateData = {}
      for (var key in data) {
        if (_.includes(keyPrivateData, key)) {
          privateData[key] = data[key]
          delete data[key]
        }
      }
      // encrypt private data
      let encryptData = encryptText(JSON.stringify(privateData), data.rePassword)
      delete data.password
      let dataEncryptedImage = []
      imageArray.forEach(image => {
        dataEncryptedImage.push(
          encryptImage(image, data.rePassword)
        )
      })
      dataEncryptedImage.splice(0, 0, 'crownfuding-dapp')
      this.setState({
        isLoading: true
      })
      callIPFS(dataEncryptedImage).then(res => {
        if (res.status === 200) {
          privateData = {
            ...data,
            ...{ privateData: encryptData },
            ...{ hashImage: res.data.Hash }
          }
          console.log(privateData)
        } else {

        }
        this.setState({
          isLoading: false
        })
      })
      // send data to backend
      // privateData = { ...data, ...{ privateData: encryptData } }
      // console.log(encryptData)
      // console.log(encr)
      // let decr = decryptText(encryptData, '123')
      // console.log(decr)
    }
  }

  handleFileUpload = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      Promise.all(files.map(file => {
        return (new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            resolve(ev.target.result)
          }
          reader.onerror = (ev) => {
            reject(ev)
          }
          reader.readAsDataURL(file)
        }));
      }))
        .then(images => {
          /* Once all promises are resolved, update state with image URI array */
          this.setState({ imageArray: images })
        }, error => {
          console.error(error);
        });
    }
    // let files = e.target.files[0]
    // let reader = new FileReader();
    // reader.onload = (e) => {
    //   this.setState({
    //     imgPreview: e.target.result
    //   })
    //   // var encryptFile = encryptText(e.target.result, '123123123')
    //   // console.log(encryptFile)
    //   // var decryptedFile = decryptText(e.target.result, '123123123')

    //   // return decryptedFile
    // }
    // // encrypt
    // reader.readAsDataURL(files);
    // //decrypt
    // // reader.readAsText(files);
    // // })
  }
  handleModal = () => {
    this.setState({
      openModal: !this.state.openModal
    })
  }
  render() {
    const { openConfirm, isLoading, imageArray, isError, openModal } = this.state
    return (
      <Fragment>
        {
          isLoading && <Loading isLoading />
        }
        {
          openConfirm &&
          <ConfirmPassword
            openConfirm={openConfirm}
            handleDataConfirm={this.handleDataConfirm}
            handleShowConfirm={this.handleShowConfirm}
          />
        }
        {
          !_.isEmpty(isError) && <Alert data={isError} />
        }
        <div className='__signUp'>
          <div className='animated fadeIn'>
            <div className='card'>
              <div className='card-header'></div>
              <div className='card-body'>
                <cite>Form dang ky thong tin </cite>
                <hr />
                <div className='row'>
                  <div className='col-lg-6'>
                    <PublicIdentity
                      handleChange={this.handleChange}
                    />
                  </div>
                  <div className='col-lg-6'>
                    <PrivateIdentity
                      handleChange={this.handleChange}
                      handleFileUpload={this.handleFileUpload}
                      fileInput={this.fileInput}
                      handleModal={this.handleModal}
                    />
                    {
                      openModal && <PreviewImage
                        isOpen={openModal}
                        handleModal={this.handleModal}
                        imageArray={imageArray}
                      />
                    }
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className='position-relative form-group'>
                    <button
                      onClick={this.handleSubmit}
                      className='mr-1 btn btn-primary'>Submit</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    )
  }
}