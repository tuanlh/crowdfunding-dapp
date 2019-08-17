import React, { Component, Fragment } from 'react'
// import $ from 'jquery'
import _ from 'lodash'
import axios from 'axios'
import serialize from 'form-serialize'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { encryptText, decryptText, encryptImage, decryptImage } from './crypto'
import '../assets/signup.scss'
import ConfirmPassword from './ConfirmPassword'

const loadScript = require('load-script');
const scripts = [
  "/aes.js"
]
export default class SignUp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openConfirm: false,
      data: [],
      buffer: ''
    }
    toast.configure()
    this.fileInput = React.createRef();
  }
  
  validateBeforeConfirm = () => {
    let p = {...this.state}
    delete p.errors
    let errors = []
    for (var key in p) {
      if (p.hasOwnProperty(key)) {
          if(_.isNil(p[key]) || _.isEmpty(p[key])) {
            errors.push(key)
          }
      }
    }
    return errors
  }

  handleSubmit = (e) => {
    e.preventDefault()
    let formRegis = document.querySelector('#regisUser')
    let formData = serialize(formRegis, { hash: true })
    this.setState({
      data: formData
    })
    // show pop up to confirm password
    this.handleShowConfirm()
  }

  handleShowConfirm = () => {
    this.setState({
      openConfirm: !this.state.openConfirm
    })
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleDataConfirm = (rePassword) => {
    const { data } = this.state
    if(data.password !== rePassword) {
      toast.error('Password not match!', {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true
        });
    } else {
      // private data need to encrypt
      // includes: ID card number, Phone number, ID Image
      const keyPrivateData = ['idNumber', 'phoneNumber']
      let privateData = {}
      for (var key in data) {
        if(_.includes(keyPrivateData, key)) {
          privateData[key] = data[key]
          delete data[key]
        }
      }
      // encrypt private data
      let encryptData = encryptText(JSON.stringify(privateData), rePassword)
      delete data.password
      // send data to backend
      privateData = {...data, ...{privateData: encryptData}}
      // console.log(encryptData)
      // console.log(encr)
      // let decr = decryptText(encryptData, '123')
      // console.log(decr)
    }
  }

  handleFileUpload = async (e) => {
    var files = e.target.files[0]
    
    var reader = new FileReader();
    reader.onload = async function(e){
      // var encryptFile = await encryptImage(e.target.result, '123123123')
      // console.log(encryptFile)
      var decryptedFile = await decryptImage(e.target.result, '123123123')
        // .toString(window.CryptoJS.enc.Latin1)
      var a = document.createElement('a');
      // encrypt
      // a.setAttribute('href', 'data:application/octet-stream,' + encryptFile);
      // a.setAttribute('download', 'test2.jpeg');
      // decrypt
      // a.setAttribute('href', decryptedFile);
      // a.setAttribute('download', 'test2.jpeg');

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // upload ipfs
      // const headers = {
      //   'Content-Type': 'multipart/form-data',
      // }
      // let formData = new FormData()
      // formData.append('file', encryptFile)
      // axios.post('https://ipfs.infura.io:5001/api/v0/add?pin=false', formData , {
      //     headers: headers
      //   })
      //   .then(
      //     res => console.log(res.data.hash),
      //     err => console.log(err)
      //   )
    }
    // encrypt
    reader.readAsDataURL(files);
    //decrypt
    // reader.readAsText(files);

    // })
  }
  captureFile = (e) => {
    console.log('capture')
    e.preventDefault()
    const file = e.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer.from(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }
  render() {
    const {  openConfirm } = this.state
    return (
      <Fragment>
        {
          openConfirm && 
          <ConfirmPassword
            openConfirm={openConfirm}
            handleDataConfirm={this.handleDataConfirm}
            handleShowConfirm={this.handleShowConfirm}
          />
        }
        <div className='container-fluid __signUp'>
          <div className='animated fadeIn'>
            <div className='card'>
              <div className='card-header'></div>
              <div className='card-body'>
                <cite>Build forms in React, without the tears</cite> with{' '}
                <cite>Dead simple Object schema validation</cite>
                <hr />
                <div className='row'>
                  <div className='col-lg-6'>
                    <form noValidate name='simpleForm' id='regisUser'
                      onSubmit={this.handleSubmit}>
                      <div className='position-relative form-group'>
                        <label htmlFor='fullName'> Name </label>
                        <span className='required'> * </span>
                        <input name='fullName'
                          id='fullName'
                          placeholder='Full Name'
                          required
                          type='text'
                          className='form-control' onChange={this.handleChange}
                        />
                      </div>
                      <div className='position-relative form-group'>
                        <label htmlFor='located'> Located </label>
                        <span className='required'> * </span>
                        <input name='located'
                          id='located'
                          placeholder='Located'
                          required
                          type='text'
                          className='form-control' onChange={this.handleChange}
                        />
                      </div>
                      <div className='position-relative form-group'>
                        <label> Email </label>
                        <span className='required'> * </span>
                        <input type='email'
                          className='form-control'
                          onChange={this.handleChange} name='email'
                          required placeholder='Enter a valid email address'
                          id='email'
                        />
                      </div>
                      <div className='position-relative form-group'>
                        <label > ID Card Number </label>
                        <span className='required'> * </span>
                        <input name='idNumber' id='idNumber' placeholder='ID Number'
                          minLength='9' required className='form-control'
                          onChange={this.handleChange}
                        />
                      </div>
                      <div className='position-relative form-group'> 
                        <label > Upload File </label>
                        <span className='required'> * </span>
                        <input id='image-file' type='file' ref={this.fileInput}
                          multiple onChange={this.handleFileUpload}/>
                      </div>
                      <div className='position-relative form-group'>
                        <label > Phone Number </label>
                        <span className='required'> * </span>
                        <input name='phoneNumber' id='phoneNumber' placeholder='Phone Number'
                          minLength='9' required className='form-control'
                          onChange={this.handleChange}
                        />
                      </div>
                      <div className='position-relative form-group'>
                        <div>
                          <label> Password </label>
                          <span className='required'> * </span>
                          <input name='password' id='password'
                            required type='password' className='form-control'
                            placeholder='Password'
                            onChange={this.handleChange}
                        />
                      </div>
                      </div>
                      <div className='position-relative form-group'>
                        <button type='submit' className='mr-1 btn btn-primary'>Submit</button>
                        <button type='reset' className='mr-1 btn btn-danger'>Reset</button>
                      </div>
                    </form>
                  </div>
                  <div className='col-lg-6'>
                    <div className='bg-secondary card'>
                      Terms of conditions
                    </div>
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