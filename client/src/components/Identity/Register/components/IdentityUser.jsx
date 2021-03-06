import React, { Component, Fragment } from "react";
import _ from "lodash";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import SaveIcon from '@material-ui/icons/Save';
import {
  encryptText,
  encryptImage,
  encryptRSA,
} from "../../../utils/modules/crypto";
import { callPostIPFS } from "../../../utils/modules/IPFS";

import "../assets/signup.scss";

import ConfirmPassword from "./ConfirmPassword";
import Loading from "../../../utils/Loading2/index";
import Alert from "../../../utils/Alert";
import PrivateIdentity from "../childs/PrivateIdentity";
import PublicIdentity from "../childs/PublicIdentity";
import PreviewImage from "../childs/PreviewImage";
import getAllVerifier from '../../../utils/modules/getAllVerifier'
import showNoti from '../../../utils/Notification'
export default class IdentityUser extends Component {
  constructor(props) {
    super(props);
    const { users } = props;
    this.state = {
      openConfirm: false,
      data: {},
      buffer: "",
      imageArray: [],
      isLoading: true,
      isError: {},
      openModal: false,
      web3: users.data.web3,
      account: users.data.account,
      hasErrorPage: false,
      statusUser: 0,
      contractIdentity: users.data.contractIdentity,
    };
    this.fileInput = React.createRef();
  }

  componentDidMount = () => {
    this.loadAccountInfo()
  };

  componentDidCatch(error, info) {
    // Display fallback UI
    // this.setState({ hasError: true });
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, info);
    this.setState({
      hasErrorPage: true
    })
    showNoti({
      type: 'error'
    })
  }

  loadAccountInfo = async () => {
    const { account, contractIdentity } = this.state;
    contractIdentity.methods.getStatus(account).call({
      from: account
    }).then(res => {
      this.setState({
        statusUser: res
      })
    })
    getAllVerifier(contractIdentity, account).then(res => {
      let listVerifier = []
      _.map(res, node => {
        if (node.task <= 10) {
          listVerifier.push(node)
        }
      })
      this.setState({
        isLoading: false,
        listVerifier
      })
    })
  };

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

  toTimestamp = (strDate) => {
    var datum = Date.parse(strDate);
    return datum / 1000;
  }

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

  showError = (content, position, type = 'error') => {
    this.setState(
      {
        isError: {
          content: content,
          position: position,
          type: type
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
      return;
    }
    if (data.password !== data.rePassword) {
      this.showError("Password not match!", "bottom-center");
      return;
    } else {
      this.setState({
        isLoading: true
      });
      // private data need to encrypt
      // includes: ID card number, Phone number, ID Image, Email
      const keyPrivateData = ["idNumber", "phoneNumber", 'email'];
      let privateData = {};
      for (var key in data) {
        if (_.includes(keyPrivateData, key)) {
          privateData[key] = data[key];
          delete data[key];
        }
      }
      // encrypt password of user
      let serectKey = encryptRSA(Buffer.from(data.rePassword), data.pickVerifier.publicKey);
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
      // this.addVerifier()
      callPostIPFS({
        privateData: encryptData,
        dataEncryptedImage
      }).then(res => {
        delete data.rePassword;
        if (res.status === 200) {
          privateData = {
            ...data,
            ...{ hash: res.data.Hash },
            ...{ serectKey: serectKey.toString("base64") }
          };
          this.sendDataToBlockChain(privateData);
        } else {
          console.log('Error' + res)
        }
      });
    }
  };
  getPublicKeyVerifier = () => {
    const { contractIdentity, account, data } = this.state;
    contractIdentity.methods.getPubKey(data.pickVerifier.address).call({
      from: account
    }).then(res => {
      console.log(res)
    })
  }
  addVerifier = () => {
    const { contractIdentity, account, data } = this.state;
    let pickVerifier = data.pickVerifier
    contractIdentity.methods.addVerifier(pickVerifier.address, pickVerifier.publicKey
    ).send({
      from: account
    }).on('transactionHash', hash => {
      if (hash !== null) {
        this.handleTransactionReceipt(hash)
      }
    }).on('error', err => {
      if (err !== null) {
        // this.setState({ isProcessing: false });
        // this.recaptcha.reset();
      }
    })
  }

  handleTransactionReceipt = async (hash) => {
    const { web3 } = this.state;
    let receipt = null;
    while (receipt === null) {
      receipt = await web3.eth.getTransactionReceipt(hash);
    }

    if (receipt.status === true) {
      console.log('---Success---')
      this.showError("Success", "bottom-center", 'success');
    } else {
      console.log('--Failed---')
      this.showError("Failed", "bottom-center");
    }
  }

  sendDataToBlockChain = (data) => {
    const { contractIdentity, account } = this.state;
    contractIdentity.methods.registerIdentity(
      data.fullName,
      data.located,
      this.toTimestamp(data.dob),
      data.hash,
      data.serectKey,
      data.pickVerifier.address
    ).send({
      from: account
    }).on('transactionHash', hash => {
      if (hash !== null) {
        const urlEtherum = 'https://ropsten.etherscan.io/tx/'
        this.setState({
          isLoading: false
        });
        showNoti({
          details: 'Please wait transaction confirm'
        })
        // show pop up information
        window.open(urlEtherum + hash)
        this.handleTransactionReceipt(hash)
      }
    }).on('error', err => {
      this.setState({
        isLoading: false
      });
      if (err !== null) {
        console.log('Error' + err)
        // this.setState({ isProcessing: false });
        // this.recaptcha.reset();
      }
    })
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

  renderStatusUser = () => {
    const { statusUser } = this.state
    let styleStatus = ''
    switch (statusUser) {
      case 1:
        styleStatus = "Pending, please patience...";
        break;
      case 2:
        styleStatus = "Success. You dont have to do this anymore.";
        break;
      case 3:
        styleStatus = "Failed. Please contact us for more details.";
        break;
      default:
        break;
    }
    return (
      <div className="position-relative form-group" style={{ color: 'steelblue' }}>
        This status's profile: {styleStatus}
      </div>
    )
  }

  render() {
    const {
      openConfirm,
      isLoading,
      imageArray,
      isError,
      openModal,
      listVerifier,
      data,
      hasErrorPage,
      statusUser
    } = this.state;
    return (
      <Fragment>
        {hasErrorPage && <div />}
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
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <img
                src="https://github.githubassets.com/images/modules/site/home-illo-team.svg"
                alt=""
                className="d-block width-fit mx-auto"
                style={{
                  marginTop: "15px"
                }}
              ></img>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography>Information Registration Form</Typography>
                  <hr />
                  <Box>
                    <PublicIdentity handleChange={this.handleChange} />
                  </Box>
                  <Box>
                    <PrivateIdentity
                      handleChange={this.handleChange}
                      handleFileUpload={this.handleFileUpload}
                      fileInput={this.fileInput}
                      handleModal={this.handleModal}
                      listVerifier={listVerifier}
                      data={data}
                    />
                  </Box>
                  {
                    openModal && (
                      <PreviewImage
                        isOpen={openModal}
                        handleModal={this.handleModal}
                        imageArray={imageArray}
                      />
                    )}
                </CardContent>
                <CardActions
                  style={{ justifyContent: "center" }}
                >
                  {
                    statusUser === 0 &&
                    <Button
                      variant="contained"
                      size="small"
                      disabled={statusUser !== 0}
                      color='primary'
                      onClick={this.handleSubmit}
                    >
                      <SaveIcon style={{
                        fontSize: '20px'
                      }} />
                      &nbsp;Submit
                  </Button>
                  }
                  {
                    statusUser !== 0 &&
                    this.renderStatusUser()
                  }
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </div>
      </Fragment>
    );
  }
}
