import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Campaigns from "../../contracts/Campaigns.json";
import Identity from "../../contracts/Identity.json";
// import { Row, Col, Alert, Form, Button, Spinner } from 'react-bootstrap';
import { Keccak } from "sha3";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import { Card, Grid } from "@material-ui/core/";
//import ReactMarkdown from 'react-markdown';
import getWeb3 from "../../utils/getWeb3";
import Loading from "../utils/Loading2";
import validate from "url-validator";
import Helper from "./Create/Helper.js";
import FormCreate from "./Create/FormCreate.js";

class Creation extends Component {
  recaptcha = null;
  state = {
    inputName: "",
    inputGoal: "",
    inputDesc: "",
    inputShortDesc: "",
    inputThumbnail: "",
    inputTime: "",
    recaptchaRespone: "",
    isValidName: false,
    isValidGoal: false,
    isValidDesc: false,
    isValidShortDesc: false,
    isValidThumbnail: false,
    isValidTime: false,
    nameEnter: false,
    goalEnter: false,
    descEnter: false,
    shortDescEnter: false,
    thumbnailEnter: false,
    timeEnter: false,
    loading: true,
    isProcessing: false,
    isSucceed: false,
    isFailed: false,
    web3: null,
    account: null,
    contract: null,
    api_db: null,
    contractIdentity: null
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Campaigns.networks[networkId];
      const instance = new web3.eth.Contract(
        Campaigns.abi,
        deployedNetwork && deployedNetwork.address
      );
      const deployedNetworkIdentity = Identity.networks[networkId];
      const instanceIdentity = new web3.eth.Contract(
        Identity.abi,
        deployedNetworkIdentity && deployedNetworkIdentity.address
      );
      const api_db_default = "http://" + window.location.hostname + ":8080/";
      const api_db =
        !hasOwnProperty.call(process.env, "REACT_APP_STORE_CENTRALIZED_API") ||
        process.env.REACT_APP_STORE_CENTRALIZED_API === ""
          ? api_db_default
          : process.env.REACT_APP_STORE_CENTRALIZED_API;
      this.setState(
        {
          web3,
          account: accounts[0],
          contract: instance,
          loading: false,
          api_db,
          contractIdentity: instanceIdentity
        },
        () => {
          const { contractIdentity, account } = this.state;
          console.log(account);
          contractIdentity.methods
            .isVerifier(account)
            .call({
              from: account
            })
            .then(res => {
              console.log(res);
            });
        }
      );
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  handleInput = e => {
    let value = e.target.value.trim();
    switch (e.target.id) {
      case "name":
        if (!this.state.nameEnter) this.setState({ nameEnter: true });
        if (value.length >= 30 && value.length <= 300) {
          this.setState({ isValidName: true, inputName: value });
        } else {
          this.setState({ isValidName: false });
        }
        break;
      case "goal":
        if (!this.state.goalEnter) this.setState({ goalEnter: true });
        value = parseInt(value);
        if (value >= 1000 && value <= 1000000000) {
          this.setState({ isValidGoal: true, inputGoal: value });
        } else {
          this.setState({ isValidGoal: false });
        }
        break;
      case "desc":
        if (!this.state.descEnter) this.setState({ descEnter: true });
        if (value.length >= 250 && value.length <= 10000) {
          this.setState({ isValidDesc: true, inputDesc: value });
        } else {
          this.setState({ isValidDesc: false });
        }
        break;
      case "short_desc":
        if (!this.state.shortDescEnter) this.setState({ shortDescEnter: true });
        if (value.length >= 100 && value.length <= 300) {
          this.setState({ isValidShortDesc: true, inputShortDesc: value });
        } else {
          this.setState({ isValidShortDesc: false });
        }
        break;
      case "thumbnail":
        if (!this.state.thumbnailEnter) this.setState({ thumbnailEnter: true });
        const url = validate(value);
        if (url === false) {
          this.setState({ isValidThumbnail: false });
        } else {
          this.setState({ isValidThumbnail: true, inputThumbnail: url });
        }
        break;
      case "time":
        if (!this.state.timeEnter) this.setState({ timeEnter: true });
        value = parseInt(value);
        if (value >= 1 && value <= 180) {
          this.setState({ isValidTime: true, inputTime: value });
        } else {
          this.setState({ isValidTime: false });
        }
        break;
      default:
        break;
    }
  };

  handleCaptchaResponseChange = respone => {
    this.setState({
      recaptchaRespone: respone
    });
  };

  handleClick = () => {
    if (
      this.state.isValidName &&
      this.state.isValidDesc &&
      this.state.isValidShortDesc &&
      this.state.isValidThumbnail &&
      this.state.isValidGoal &&
      this.state.isValidTime &&
      (this.state.recaptchaRespone !== "" ||
        process.env.REACT_APP_RECAPTCHA_ENABLE === "0")
    ) {
      const {
        inputName,
        inputDesc,
        inputShortDesc,
        inputThumbnail,
        inputGoal,
        inputTime,
        contract,
        account,
        api_db
      } = this.state;
      this.setState({ isProcessing: true, isFailed: false, isSucceed: false });

      // compute hash to store information of campaign to DB
      const temp = inputName + Date.now() + Math.random();
      const integrity_data =
        inputName + inputShortDesc + inputDesc + inputThumbnail;
      const hashEngine = new Keccak(256);
      hashEngine.update(temp);
      const ref = hashEngine.digest("hex");
      hashEngine.reset();
      hashEngine.update(integrity_data);
      const integrity_hash = hashEngine.digest("hex");

      axios
        .post(api_db + "campaign", {
          // upload data to DB before send to blockchain
          id: ref,
          name: inputName,
          description: inputDesc,
          short_description: inputShortDesc,
          thumbnail_url: inputThumbnail,
          captcha: this.state.recaptchaRespone
        })
        .then(respone => {
          if (respone.status === 200) {
            if (respone.data.success === true) {
              contract.methods
                .createCampaign(inputTime, inputGoal, ref, integrity_hash)
                .send({
                  from: account
                })
                .on("transactionHash", hash => {
                  if (hash !== null) {
                    this.handleTransactionReceipt(hash);
                  }
                })
                .on("error", err => {
                  if (err !== null) {
                    this.setState({ isProcessing: false });
                    this.recaptcha.reset();
                  }
                });
            } else {
              this.setState({ isProcessing: false });
              this.recaptcha.reset();
              alert(respone.data.error_msg);
            }
          } else {
            this.setState({ isProcessing: false });
            this.recaptcha.reset();
            alert("Error with post data to server, please try again");
          }
        })
        .catch(function(error) {
          this.setState({ isProcessing: false });
          this.recaptcha.reset();
          console.log(error);
        });
    }
  };

  handleTransactionReceipt = async hash => {
    const { web3 } = this.state;
    let receipt = null;
    while (receipt === null) {
      receipt = await web3.eth.getTransactionReceipt(hash);
    }

    if (receipt.status === true) {
      this.setState({ isSucceed: true });
    } else {
      this.setState({ isFailed: true });
    }
    this.setState({ isProcessing: false });
  };

  render() {
    if (!this.state.web3) {
      return <Loading text="Loading Web3, account, and contract..." />;
    }

    // const requiredChar = <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>;
    // const succeedState = this.state.isSucceed && (
    //   <Row className="pt-2">
    //     <Col>
    //       <Alert variant="success">
    //         <Spinner animation="grow" variant="success" size="sm" /> Successfully!! Your campaign has been created. Please wait for us verify your campaign before public
    //       </Alert>
    //     </Col>
    //   </Row>
    // );

    // const failedState = this.state.isFailed && (
    //   <Row className="pt-2">
    //     <Col>
    //       <Alert variant="danger">
    //         <Spinner animation="grow" variant="danger" size="sm" /> Your request has been reverted.
    //       </Alert>
    //     </Col>
    //   </Row>
    // );

    return (
      <div>
        {this.state.isProcessing && <Loading text="Pending..." />}
        {/* {succeedState} */}
        {/* {failedState} */}
        <Grid container spacing={3}>
          <Grid item xs={9}>
            <FormCreate />
          </Grid>
          <Grid item xs={3}>
            <Helper />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default Creation;
