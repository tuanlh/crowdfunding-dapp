import React, { Component, Fragment } from 'react'
// import $ from 'jquery'
import _ from 'lodash'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { encryptText, decryptText, encryptImage, decryptImage } from './crypto'
import { callIPFS } from '../modules/IPFS'
import '../assets/signup.scss'
import ConfirmPassword from './ConfirmPassword'
import Loading from '../../utils/Loading2/index'
export default class SignUp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openConfirm: false,
      data: {},
      buffer: '',
      imageArray: [],
      isLoading: false
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

  handleDataConfirm = (rePassword) => {
    const { data, imageArray } = this.state
    if(!imageArray.length) {
      return
    }
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
      let dataEncryptedImage = []
      imageArray.forEach(image => {
        dataEncryptedImage.push(
          encryptImage(image, rePassword)
        )
      })
      dataEncryptedImage.splice(0, 0, 'crownfuding-dapp')
      this.setState({
        isLoading: true
      })
      callIPFS(dataEncryptedImage).then(res => {
        if(res.status === 200) {
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

      // console.log(encryptData)
      // console.log(encr)
      // let decr = decryptText(encryptData, '123')
      // console.log(decr)
    }
  }

  handleFileUpload = (e) => {
    if(e.target.files) {
      const files = Array.from(e.target.files)
      Promise.all(files.map(file => {
        return (new Promise((resolve,reject) => {
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
        this.setState({ imageArray : images })
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
  render() {
    const {  openConfirm, isLoading } = this.state
    return (
      <Fragment>
        {
          isLoading && <Loading isLoading/>
        }
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
                      { 
                        this.state.imageArray.map(imageURI => 
                        (<img className="photo-uploaded" src={imageURI} key={Math.random()} />)) 
                      }
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
                          accept="image/*"
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