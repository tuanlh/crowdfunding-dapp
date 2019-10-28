import React, { Component, Fragment } from "react";
import axios from "axios";
import { Keccak } from "sha3";

import Campaigns from "../../../../contracts/Campaigns.json";
import TokenSystem from "../../../../contracts/TokenSystem.json";
import getWeb3 from "../../../../utils/getWeb3";
import Loading from "../../../utils/Loading2";
import CampaignInfo from "../childs/CampaignInfo/components/CampaignInfo.js";
import { Grid } from "@material-ui/core";
import OwnerPanel from "../childs/OwnerPanel/components/OwnerPanel.js";
import BackerPanel from "../childs/BackerPanel/index.js";

class Detail extends Component {
  state = {
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
    web3: null,
    account: null,
    contract: {},
    isComponentRemount: false,
    api_db: null
  };

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
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedCampaign = Campaigns.networks[networkId];
        const instanceCampaign = new web3.eth.Contract(
          Campaigns.abi,
          deployedCampaign && deployedCampaign.address
        );
        const deployedAccount = TokenSystem.networks[networkId];
        const instanceAccount = new web3.eth.Contract(
          TokenSystem.abi,
          deployedAccount && deployedAccount.address
        );

        const api_db_default = "http://" + window.location.hostname + ":8080/";
        const api_db =
          !hasOwnProperty.call(
            process.env,
            "REACT_APP_STORE_CENTRALIZED_API"
          ) || process.env.REACT_APP_STORE_CENTRALIZED_API === ""
            ? api_db_default
            : process.env.REACT_APP_STORE_CENTRALIZED_API;

        this.setState(
          {
            web3,
            account: accounts[0],
            contract: {
              Campaigns: instanceCampaign,
              Account: instanceAccount
            },
            isComponentRemount: false,
            api_db
          },
          this.getInfo
        );
        this.listenEventToUpdate();
        window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`
        );
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
          if (finStatus > 0) {
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
            this.setState({ campaign, isExist: true });
          }
        }
        this.setState({ isLoading: false });
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

  render() {
    if (!this.state.web3) {
      return <Loading text="Loading web3, account, contract" />;
    }
    const {
      campaign,
      isExist,
      extData,
      isLoading,
      campaignStatusChr,
      numberOfInvestor,
      balance,
      tokenBacked
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
                {campaign.owner === this.state.account ? (
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
                )}
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
