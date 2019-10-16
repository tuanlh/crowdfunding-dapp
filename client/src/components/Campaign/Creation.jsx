import React, { Component } from "react";
import Campaigns from "../../contracts/Campaigns.json";
import Identity from "../../contracts/Identity.json";
// import { Row, Col, Alert, Form, Button, Spinner } from 'react-bootstrap';
import { Keccak } from "sha3";
import axios from "axios";
import { Grid } from "@material-ui/core/";
//import ReactMarkdown from 'react-markdown';
import getWeb3 from "../../utils/getWeb3";
import Loading from "../utils/Loading2";
import Helper from "./Create/Helper.js";
import FormCreate from "./Create/FormCreate.js";
import showNoti from "../utils/Notification/";

class Creation extends Component {
  state = {
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

  handleClick = dataProps => {
    let inputName = dataProps.name;
    let inputDesc = dataProps.desc;
    let inputShortDesc = dataProps.short_desc;
    let inputThumbnail = dataProps.thumbnail;
    let recaptchaRespone = dataProps.recaptchaRespone;
    let inputGoal = dataProps.goal;
    let inputTime = dataProps.time;
    const { contract, account, api_db } = this.state;

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
        captcha: recaptchaRespone
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
                }
              });
          } else {
            this.setState({ isProcessing: false });
            alert(respone.data.error_msg);
          }
        } else {
          this.setState({ isProcessing: false });
          alert("Error with post data to server, please try again");
        }
      })
      .catch(function(error) {
        this.setState({ isProcessing: false });
        console.log(error);
      });
  };

  handleTransactionReceipt = async hash => {
    const { web3 } = this.state;
    let receipt = null;
    while (receipt === null) {
      receipt = await web3.eth.getTransactionReceipt(hash);
    }

    if (receipt.status === true) {
      this.setState({ isSucceed: true });
      console.log("true");
    } else {
      this.setState({ isFailed: true });
      console.log("failed");
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
            <FormCreate sendDataToParents={this.handleClick} />
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
