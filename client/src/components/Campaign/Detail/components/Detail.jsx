import React, { Component, Fragment } from "react";
import axios from "axios";
import { Keccak } from "sha3";

import Loading from "../../../utils/Loading2";
import CampaignInfo from "../childs/CampaignInfo/components/CampaignInfo.js";
import { Grid } from "@material-ui/core";
import OwnerPanel from "../childs/OwnerPanel/components/OwnerPanel.js";
import BackerPanel from "../childs/BackerPanel/index.js";
import VerifierPanel from "../childs/VerifierPanel/components/VerifierPanel.js";

class Detail extends Component {
  constructor(props) {
    super(props);
    const { users } = props;
    this.state = {
      id: null,
      campaign: {},
      extData: {},
      campaignStatusChr: ["During", "Failed", "Succeed"],
      isExist: false,
      isLoading: true,
      balance: 0,
      tokenBacked: 0,
      amount: 0,
      numberOfInvestor: 0,
      web3: users.data.web3,
      account: users.data.account,
      contract: {
        Campaigns: users.data.contractCampaigns,
        Account: users.data.contractTokenSystem,
        Identity: users.data.contractIdentity
      },
      isComponentRemount: false,
      api_db: users.data.api_db,
      isVerified: false
    };
  }

  componentDidMount = async () => {
    const {
      match: { params }
    } = this.props;
    const id = parseInt(params.id);
    if (isNaN(id)) {
      this.setState({ isLoading: false });
    } else {
      this.setState({ id: params.id });
      try {
        this.setState({}, this.getInfo);
        this.listenEventToUpdate();
      } catch (error) {
        // Catch any errors for any of the above operations.
        console.error(error);
      }
    }
  };

  getInfo = async () => {
    const { id, account, contract } = this.state;
    this.setState({ isLoading: true });

    // get some info about campaign
    contract.Campaigns.methods
      .getInfo(id)
      .call({ from: account })
      .then(result => {
        if (result !== null) {
          let {
            name,
            startDate,
            endDate,
            goal,
            collected,
            owner,
            finStatus,
            ref,
            hashIntegrity
          } = result;
          this.loadDataOfCampaign(ref, hashIntegrity);
          collected = parseInt(collected);
          goal = parseInt(goal);
          finStatus = parseInt(finStatus);
          startDate = parseInt(startDate) * 1000;
          endDate = parseInt(endDate) * 1000;
          contract.Identity.methods
            .isVerified(account)
            .call({
              from: account
            })
            .then(isVerified => {
              if (finStatus > 0 || isVerified) {
                const status = this.getStatus(endDate, goal, collected);
                const progress = this.getProgress(collected, goal);
                const fundEnabled = status === 0 && finStatus === 1;
                const available = fundEnabled ? goal - collected : 0;
                const campaign = {
                  name,
                  startDate,
                  endDate,
                  goal,
                  collected,
                  owner,
                  status,
                  progress,
                  finStatus,
                  fundEnabled,
                  available
                };
                this.setState({ campaign, isExist: true, isVerified });
              }
              this.setState({ isLoading: false });
            });
        }
      });

    contract.Campaigns.methods
      .getNumberOfInvestors(id)
      .call({ from: account })
      .then(result => {
        this.setState({ numberOfInvestor: parseInt(result) });
      });

    // Get some info about account
    contract.Account.methods
      .getMyBalance()
      .call({ from: account })
      .then(result => {
        this.setState({ balance: parseInt(result) });
      });

    contract.Campaigns.methods
      .getInvest(id, account)
      .call({ from: account })
      .then(result => {
        this.setState({ tokenBacked: parseInt(result) });
      });
  };

  loadDataOfCampaign = async (ref, hash_integrity) => {
    let extData = {};
    axios.get(this.state.api_db + "campaign/" + ref).then(response => {
      if (response.status === 200) {
        if (
          hasOwnProperty.call(response.data, "name") &&
          hasOwnProperty.call(response.data, "description") &&
          hasOwnProperty.call(response.data, "short_description") &&
          hasOwnProperty.call(response.data, "thumbnail_url")
        ) {
          const d = response.data;
          const temp =
            d.name + d.short_description + d.description + d.thumbnail_url;
          const hashEngine = new Keccak(256);
          hashEngine.update(temp);
          const result_hash = hashEngine.digest("hex");
          if (result_hash === hash_integrity) {
            extData = response.data;
            this.setState({ extData });
          }
        }
      }
    });
  };

  printData = property => {
    const { extData } = this.state;
    if (hasOwnProperty.call(extData, property)) {
      return extData[property];
    } else {
      if (property === "thumbnail_url") {
        return "/default-thumbnail.jpg";
      } else {
        return "[Field not found]";
      }
    }
  };

  getStatus = (deadline, goal, collected) => {
    if (Date.now() < deadline) {
      return 0; //during
    } else {
      if (collected < goal) {
        return 1; //failed
      } else {
        return 2; //succeed
      }
    }
  };

  getProgress = (collected, goal) => {
    const percent = parseInt((collected * 100) / goal);
    let state = "info";
    if (percent >= 80) {
      state = "danger";
    } else if (percent >= 60) {
      state = "warning";
    } else if (percent >= 40) {
      state = "success";
    }
    return { percent, state };
  };

  listenEventToUpdate = async () => {
    const { contract } = this.state;
    contract.Campaigns.events.allEvents(
      {
        fromBlock: "latest"
      },
      (error, result) => {
        if (error === false && result !== null) {
          this.getInfo(); // update front-end when new event emitted
        }
      }
    );
  };

  handleChange = e => {
    if (e.target.value !== "") {
      const amount = parseInt(e.target.value);
      if (isNaN(amount)) {
        e.target.value = "";
        this.setState({ amount: 0 });
        return;
      }
      this.setState({ amount });
    } else {
      this.setState({ amount: 0 });
    }
  };

  handleFund = async () => {
    const { id, amount, balance, account, contract } = this.state;
    if (amount > balance) {
      alert("You do not have enough tokens");
      return;
    }
    if (amount <= 0) {
      alert("You must ENTER number token that you want deposit");
      return;
    }
    this.setState({ isProcessing: true });
    contract.Campaigns.methods
      .invest(id, amount)
      .send({
        from: account
      })
      .on("transactionHash", hash => {
        if (hash !== null) {
          // this.resetForm();
          this.handleTransactionReceipt(hash);
        }
      })
      .on("error", err => {
        if (err !== null) {
          this.setState({ isProcessing: false });
        }
      });
  };

  handleRefund = async () => {
    const { id, amount, tokenBacked, account, contract } = this.state;
    if (amount > tokenBacked) {
      alert("You can only enter the current value that you currently have");
      return;
    }
    if (amount <= 0) {
      alert("You must ENTER number token that you want deposit");
      return;
    }
    this.setState({ isProcessing: true });
    contract.Campaigns.methods
      .claimRefund(id, amount)
      .send({
        from: account
      })
      .on("transactionHash", hash => {
        if (hash !== null) {
          // this.resetForm();
          this.handleTransactionReceipt(hash);
        }
      })
      .on("error", err => {
        if (err !== null) {
          this.setState({ isProcessing: false });
        }
      });
  };

  handleWithdraw = async () => {
    const { id, account, contract } = this.state;

    this.setState({ isProcessing: true });
    contract.Campaigns.methods
      .endCampaign(id)
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
  };

  handleTransactionReceipt = async hash => {
    const { web3 } = this.state;
    let receipt = null;
    while (receipt === null) {
      receipt = await web3.eth.getTransactionReceipt(hash);
    }

    if (receipt.status === false) {
      alert("Your transaction have been revert");
    }
    this.setState({ isProcessing: false });
  };

  resetForm = async () => {
    this.setState({ amount: 0 }); // reset
    this.refs.amount.value = "";
  };
  handleConfirm = value => {
    const { id, account, contract } = this.state;
    if(value) {
      contract.Campaigns.methods
      .acceptCampaign(id)
      .send({
        from: account
      })
      .then(res => {
        console.log(res);
      });
    }
  };
  renderPanel = () => {
    const {
      campaign,
      numberOfInvestor,
      balance,
      tokenBacked,
      account,
      isVerified
    } = this.state;
    if (campaign.finStatus === 0 && isVerified) {
      // return panel of user
      return <VerifierPanel handleConfirm={this.handleConfirm} />;
    } else {
      return campaign.owner === account ? (
        <OwnerPanel
          numberOfInvestor={numberOfInvestor}
          campaign={campaign}
          handleWithdraw={this.handleWithdraw}
        />
      ) : (
        <BackerPanel
          tokenBacked={tokenBacked}
          numberOfInvestor={numberOfInvestor}
          campaign={campaign}
          handleFund={this.handleFund}
          handleRefund={this.handleRefund}
          handleChange={this.handleChange}
          balance={balance}
        />
      );
    }
  };

  render() {
    if (!this.state.web3) {
      return <Loading text="Loading web3, account, contract" />;
    }
    const {
      campaign,
      isExist,
      extData,
      isLoading,
      campaignStatusChr
    } = this.state;
    return (
      <Fragment>
        {isLoading && <Loading />}
        {!isLoading && isExist && (
          <Fragment>
            <Grid container spacing={3}>
              <Grid item xs={8}>
                {isExist && (
                  <CampaignInfo
                    extData={extData}
                    campaign={campaign}
                    campaignStatusChr={campaignStatusChr}
                  />
                )}
              </Grid>
              <Grid item xs={4}>
                {this.renderPanel()}
              </Grid>
            </Grid>
          </Fragment>
        )}
        {!isLoading && !isExist && <div>ID campaign does not exist</div>}
      </Fragment>
    );
  }
}

export default Detail;
