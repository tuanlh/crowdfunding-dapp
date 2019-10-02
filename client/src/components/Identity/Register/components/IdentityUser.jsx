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
import getWeb3 from "../../../../utils/getWeb3";
import Identity from "../../../../contracts/Identity.json";
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
      isLoading: true,
      isError: {},
      openModal: false,
      web3: null,
      account: null,
      contract: null
    };
    this.fileInput = React.createRef();
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Identity.networks[networkId];
      const instance = new web3.eth.Contract(
        Identity.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      await this.setState(
        { web3, account: accounts[0], contract: instance },
        this.loadAccountInfo
      );
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, account, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  loadAccountInfo = async () => {
    const { web3, account, contract } = this.state;
    this.setState({ isLoading: false });
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
          type: "error"
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
          this.sendDataToBlockChain(privateData);
        } else {
        }
        this.setState({
          isLoading: false
        });
      });
    }
  };

  sendDataToBlockChain = privateData => {
    console.log(privateData);
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
                  <Typography>Form dang ky thong tin </Typography>
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
                  <Button
                    variant="contained"
                    size="small"
                    color='primary'
                    onClick={this.handleSubmit}
                  >
                    <SaveIcon style={{
                      fontSize: '20px'
                    }}/>
                      &nbsp;Submit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </div>
      </Fragment>
    );
  }
}
