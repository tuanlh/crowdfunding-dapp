import React, { Component, Fragment } from "react";
import _ from "lodash";
import {
  encryptText,
  encryptImage,
  encryptRSA,
  decryptRSA
} from "../../../utils/modules/crypto";
import { callPostIPFS } from "../../../utils/modules/IPFS";

import "../assets/signup.scss";

import ConfirmPassword from "./ConfirmPassword";
import Loading from "../../../utils/Loading2/index";
import Alert from "../../../utils/Alert";
import PrivateIdentity from "../childs/PrivateIdentity";
import PublicIdentity from "../childs/PublicIdentity";
import PreviewImage from "../childs/PreviewImage";
const publicKey = `
-----BEGIN PUBLIC KEY-----
MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgHkC+ACofieuCxMdlnIKioUkJDsq
3lboRGsaLml5tpANYP77hMdhY0/tBKPWc+IaXdLki7b2jttosHO7pRSjz/4CuIlO
veDhMR26erEu0Z+N1Noo6Ey/ZzWll8b6HbbudVR0cwVaKYv09/2dwCssPBl1rA4q
RjUz13I6fISeYcA1AgMBAAE=
-----END PUBLIC KEY-----`;
export default class IdentityUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openConfirm: false,
      data: {},
      buffer: "",
      imageArray: [],
      isLoading: false,
      isError: {},
      openModal: false
    };
    this.fileInput = React.createRef();
  }

  validateBeforeConfirm = () => {
    let p = { ...this.state };
    delete p.errors;
    let errors = [];
    for (var key in p) {
      if (p.hasOwnProperty(key)) {
        if (_.isNil(p[key]) || _.isEmpty(p[key])) {
          errors.push(key);
        }
      }
    }
    return errors;
  };

  handleSubmit = e => {
    e.preventDefault();
    this.handleShowConfirm();
  };

  handleShowConfirm = () => {
    this.setState({
      openConfirm: !this.state.openConfirm
    });
  };

  handleChange = e => {
    let name = e.target.name;
    let value = e.target.value;
    const { data } = this.state;
    data[name] = value;
    this.setState({
      data,
      [e.target.name]: e.target.value
    });
  };

  showError = (content, position) => {
    this.setState(
      {
        isError: {
          content: content,
          position: position,
          type: 'error'
        }
      },
      () => {
        this.setState({
          isError: {}
        });
      }
    );
  };

  handleDataConfirm = () => {
    const { data, imageArray } = this.state;
    this.handleShowConfirm();
    if (_.isEmpty(imageArray) || _.isNil(imageArray)) {
      this.showError("Not upload image yet", "bottom-center");
      return
    }
    if (data.password !== data.rePassword) {
      this.showError("Password not match!", "bottom-center");
      return
    } else {
      // private data need to encrypt
      // includes: ID card number, Phone number, ID Image
      const keyPrivateData = ["idNumber", "phoneNumber"];
      let privateData = {};
      for (var key in data) {
        if (_.includes(keyPrivateData, key)) {
          privateData[key] = data[key];
          delete data[key];
        }
      }
      // encrypt password of user
      let serectKey = encryptRSA(Buffer.from(data.rePassword), publicKey);
      // encrypt private data
      let encryptData = encryptText(
        JSON.stringify(privateData),
        data.rePassword
      );
      delete data.password;
      // encrypt image
      let dataEncryptedImage = [];
      imageArray.forEach(image => {
        dataEncryptedImage.push(encryptImage(image, data.rePassword));
      });
      this.setState({
        isLoading: true
      });
      callPostIPFS(dataEncryptedImage).then(res => {
        delete data.rePassword;
        if (res.status === 200) {
          privateData = {
            ...data,
            ...{ privateData: encryptData },
            ...{ hashImage: res.data.Hash },
            ...{ serectKey: serectKey.toString("base64") }
          };
          console.log(privateData);
        } else {
        }
        this.setState({
          isLoading: false
        });
      });
      // send data to backend
      // privateData = { ...data, ...{ privateData: encryptData } }
      // console.log(encryptData)
      // console.log(encr)
      // let decr = decryptText(encryptData, '123')
      // console.log(decr)
    }
  };

  convertToBuffer = async result => {
    //file is converted to a buffer to prepare for uploading to IPFS
    const buffer = await Buffer.from(result);
    //set this buffer - using es6 syntax
    // this.setState({ buffer });
    return buffer;
  };

  handleFileUpload = e => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      Promise.all(
        files.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = ev => {
              resolve(this.convertToBuffer(ev.target.result));
            };
            reader.onerror = ev => {
              reject(ev);
            };
            reader.readAsDataURL(file);
          });
        })
      ).then(
        images => {
          console.log(images);
          /* Once all promises are resolved, update state with image URI array */
          this.setState({ imageArray: images });
        },
        error => {
          console.error(error);
        }
      );
    }
  };

  handleModal = () => {
    this.setState({
      openModal: !this.state.openModal
    });
  };

  render() {
    const {
      openConfirm,
      isLoading,
      imageArray,
      isError,
      openModal
    } = this.state;
    return (
      <Fragment>
        {isLoading && <Loading isLoading />}
        {openConfirm && (
          <ConfirmPassword
            openConfirm={openConfirm}
            handleDataConfirm={this.handleDataConfirm}
            handleShowConfirm={this.handleShowConfirm}
          />
        )}
        {!_.isEmpty(isError) && <Alert data={isError} />}
        <div className="__signUp">
          <div className="animated fadeIn">
            <div className="card">
              <div className="card-header"></div>
              <div className="card-body">
                <cite>Form dang ky thong tin </cite>
                <hr />
                <div className="row">
                  <div className="col-lg-6">
                    <PublicIdentity handleChange={this.handleChange} />
                  </div>
                  <div className="col-lg-6">
                    <PrivateIdentity
                      handleChange={this.handleChange}
                      handleFileUpload={this.handleFileUpload}
                      fileInput={this.fileInput}
                      handleModal={this.handleModal}
                    />
                    {openModal && (
                      <PreviewImage
                        isOpen={openModal}
                        handleModal={this.handleModal}
                        imageArray={imageArray}
                      />
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div className="position-relative form-group">
                    <button
                      onClick={this.handleSubmit}
                      className="mr-1 btn btn-primary"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
