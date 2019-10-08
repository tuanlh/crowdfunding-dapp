import React, { Component, Fragment } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { faIdCard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  AccountCircle,
  AddLocation,
  CalendarToday,
  VpnKey,
  ContactPhone
} from "@material-ui/icons/";
import Button from "@material-ui/core/Button";
import _ from "lodash";
import Loading from "../../../../../utils/Loading2";
import "../assets/RequestModal.scss";
import { callGetIPFS } from "../../../../../utils/modules/IPFS";
import {
  decryptText,
  decryptImage,
  decryptRSA
} from "../../../../../utils/modules/crypto";
import TextFieldComponent from "./TextFieldComponent";
// import { makeStyles } from '@material-ui/core/styles';

class RequestModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      privateKey: "",
      isLoading: false,
      isError: false,
      imageArray: [],
      privateDataUser: ""
    };
  }

  handleFileUpload = e => {
    let files = e.target.files[0];
    let reader = new FileReader();
    reader.onload = e => {
      this.setState({
        privateKey: e.target.result
      });
    };
    reader.readAsText(files);
  };

  handleChangeData = e => {
    this.setState({
      privateKey: e.target.value
    });
  };


  handleDecryptData = async () => {
    const { privateKey } = this.state;
    const { dataUser } = this.props;
    if (_.isEmpty(privateKey)) {
      this.setState({
        isError: true
      });
      return;
    }

    this.setState({
      isLoading: true,
      isError: false
    });
    let data = _.cloneDeep(dataUser);
    // get secrect key
    let secrectKey = decryptRSA(
      Buffer.from(data.shareKey, "base64"),
      privateKey
    ).toString();

    // encrypt data
    // const keyPrivateData = ["hashImage", "privateKey", "email"];
    let privateDataUser = "";
    let imageArray = [];
    try {
      // privateKeyUser = decryptText(data.privData, secrectKey)
      // decrypt image
      await callGetIPFS(data.privData).then(res => {
        imageArray = this.decryptImageData(
          res.data.dataEncryptedImage,
          secrectKey
        );
        privateDataUser = JSON.parse(decryptText(res.data.privateData, secrectKey));
        this.setState({
          imageArray,
          privateDataUser,
          isLoading: false
          // openPreview: true,
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  decryptImageData = (imageEncrypted, secrectKey) => {
    let dataEncryptedImage = [];
    _.map(imageEncrypted, encryptedImage => {
      dataEncryptedImage.push(decryptImage(encryptedImage.data, secrectKey));
    });
    return dataEncryptedImage;
  };

  renderStatus = (status) => {
    let styleStatus = ''
    switch (status) {
      case 1:
        styleStatus = 'pending'
        break;
      case 2:
        styleStatus = 'success'
        break
      case 3:
        styleStatus = 'failed'
        break
      default:
        break;
    }
    return (
      <div className='position-relative form-group'>
        This status's profile: <span className={styleStatus}>{styleStatus}</span>
      </div>
    )
  }

  render() {
    const { privateKey, isLoading, isError, privateDataUser, imageArray } = this.state;
    const { isOpen, handleModal, dataUser, handleVerifiedUser } = this.props;
    return (
      <Modal
        isOpen={isOpen}
        toggle={handleModal}
        size={"lg"}
        className="request-modal"
      >
        <ModalHeader toggle={handleModal}>User's Information</ModalHeader>
        <ModalBody>
          {isLoading && <Loading />}
          {!_.isEmpty(dataUser) && (
            <Fragment>
              {this.renderStatus(dataUser.status)}
              <div className="position-relative form-group">
                <TextFieldComponent
                  fieldName="name"
                  labelName="Full Name"
                  dataUser={dataUser}
                  IconComponent={<AccountCircle />}
                />
              </div>
              <div className="position-relative form-group">
                <TextFieldComponent
                  fieldName="located"
                  labelName="Located"
                  dataUser={dataUser}
                  IconComponent={<AddLocation />}
                />
              </div>
              <div className="position-relative form-group">
                <TextFieldComponent
                  fieldName="dob"
                  labelName="Date of birth"
                  value={new Date(dataUser.dob * 1000).toDateString()}
                  dataUser={dataUser}
                  IconComponent={<CalendarToday />}
                />
              </div>
              <cite>
                To see user's private data, please input your private key
              </cite>
              <div style={{ display: "flex" }}>
                <TextFieldComponent
                  labelName="Private Key"
                  value={privateKey}
                  IconComponent={<VpnKey />}
                />
                <div style={{ display: "flex", marginTop: "20px" }}>
                  <input
                    id="image-file"
                    type="file"
                    onChange={this.handleFileUpload}
                  />
                </div>
                <div style={{ marginTop: "12px" }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="medium"
                    onClick={this.handleDecryptData}
                  >
                    Encrypt
                  </Button>
                </div>
              </div>
            </Fragment>
          )}
          {isError && <span className="required">Private Key is required</span>}
          <Fragment>
            {!_.isEmpty(privateDataUser) &&
              <Fragment>
                <div className="position-relative form-group">
                  <TextFieldComponent
                    fieldName="email"
                    labelName="Email"
                    dataUser={privateDataUser}
                    IconComponent={<CalendarToday />}
                  />
                </div>
                <div className="position-relative form-group">
                  <TextFieldComponent
                    fieldName="idNumber"
                    labelName="ID Number"
                    dataUser={privateDataUser}
                    IconComponent={<FontAwesomeIcon icon={faIdCard} />}
                  />
                </div>
                <div className="position-relative form-group">
                  <TextFieldComponent
                    fieldName="phoneNumber"
                    labelName="Phone number"
                    dataUser={privateDataUser}
                    IconComponent={<ContactPhone />}
                  />
                </div>
                <div className="position-relative form-group">
                  {
                    imageArray.map((imageURI, index) =>
                      (
                        <img
                          className="photo-uploaded"
                          src={imageURI} key={index}
                          alt=""
                          style={{
                            width: '90%',
                            height: '75%'
                          }}
                        />
                      )
                    )
                  }
                </div>
              </Fragment>
            }
          </Fragment>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => handleVerifiedUser(true)}>
            Allow
          </Button>{" "}
          <Button color="secondary" onClick={() => handleVerifiedUser(false)}>
            Reject
          </Button>{" "}
        </ModalFooter>
      </Modal>
    );
  }
}

export default RequestModal;
