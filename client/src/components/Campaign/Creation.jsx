import React, { Component } from "react";
import { Keccak } from "sha3";
import axios from "axios";
import _ from "lodash";
import { connect } from "react-redux";
import { Grid } from "@material-ui/core/";
import Loading from "../utils/Loading2";
import Helper from "./Create/Helper.js";
import FormCreate from "./Create/FormCreate.js";
import showNoti from "../utils/Notification/";
import showActionNoti from "../utils/Notification/ActionNoti";
import Alert from "../utils/Alert";
class Creation extends Component {
  constructor(props) {
    super(props);
    const { users } = props;
    this.state = {
      isProcessing: false,
      web3: users.data.web3,
      account: users.data.account,
      contract: users.data.contractCampaigns,
      api_db: users.data.api_db,
      contractIdentity: users.data.contractIdentity,
      isError: {}
    };
  }

  componentDidMount = async () => {
    const { contractIdentity, account } = this.state;
    contractIdentity.methods
      .isVerified(account)
      .call({
        from: account
      })
      .then(res => {
        if (res === false) {
          showActionNoti().then(res => {
            if (res) {
              this.props.history.push("/identity");
            }
          });
        }
      });
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

    // this.setState({ isProcessing: true })
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
                  this.showNotification(
                    "",
                    "",
                    "Your campaign has been created. Please wait for us verify your campaign before public"
                  );
                  this.handleTransactionReceipt(hash);
                }
              })
              .on("error", err => {
                if (err !== null) {
                  this.showNotification("error", "Error from transaction", err);
                }
              });
          } else {
            this.showNotification(
              "error",
              "Error from backend",
              JSON.stringify(respone.data.error_msg)
            );
          }
        } else {
          this.showNotification(
            "error",
            "Error with post data to server",
            "Please try again"
          );
        }
      })
      .catch(error => {
        console.log(error);
        // this.showNotification(
        //   "error",
        //   "Error from backend. See console to more details",
        //   "Please try again"
        // );
      })
      .finally(() => {
        // this.setState({
        //   isProcessing: false,
        // })
      });
  };

  showNotification = (type, msg, details) => {
    return showNoti({
      type,
      message: msg,
      details
    });
  };

  handleTransactionReceipt = async hash => {
    const { web3 } = this.state;
    let receipt = null;
    while (receipt === null) {
      receipt = await web3.eth.getTransactionReceipt(hash);
    }
    // this.setState({ isProcessing: false });
    if (receipt.status === true) {
      this.showNotification();
    } else {
      this.showNotification("error", "Your request has been reverted.");
    }
  };

  render() {
    const { isError } = this.state;
    if (!this.state.web3) {
      return <Loading text="Loading Web3, account, and contract..." />;
    }
    return (
      <div>
        {this.state.isProcessing && <Loading text="Pending..." />}
        {!_.isEmpty(isError) && <Alert data={isError} />}
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

const mapStateToProps = state => {
  return {
    users: state.users
  };
};

export default connect(mapStateToProps)(Creation);
