import React, { Component, Fragment } from "react";
import axios from "axios";
import _ from 'lodash'
import { Keccak } from "sha3";
import { Grid } from "@material-ui/core";

import CampaignInfo from "../childs/CampaignInfo/components/CampaignInfo.js";
import OwnerPanel from "../childs/OwnerPanel";
import BackerPanel from "../childs/BackerPanel";
import VerifierPanel from "../childs/VerifierPanel";

import DetailsPanel from '../childs/DetailsPanel'
import Loading from "../../../utils/Loading2";

import showNoti from "../../../utils/Notification";

import Campaigns from "../../../../contracts/Campaigns.json";
import Wallet from "../../../../contracts/Wallet.json";

import getWeb3 from "../../../../utils/getWeb3";
import Web3 from "web3";

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
        Account: users.data.contractWallet,
        Identity: users.data.contractIdentity,
        Disbursement: users.data.contractDisbursement
      },
      isComponentRemount: false,
      api_db: users.data.api_db,
      isVerified: false,
      numberStageToVoted: ''
    };
  }

  componentDidMount = async () => {
    const {
      match: { params },
      history,
    } = this.props;
    const id = parseInt(params.id);
    const { contract } = this.state
    if (isNaN(id)) {
      this.setState({ isLoading: false });
    } else {
      this.setState({ id: params.id });
      try {
        if (_.isEmpty(contract.Campaigns)) {
          let temp = await getWeb3()
          if (!temp.notMetaMask) {
            history.push({
              pathname: '/auth',
              state: { prePage: this.props.location.pathname }
            })
          } else {
            this.getCampaign(temp.notMetaMask)
          }
        } else {
          this.setState({}, this.getInfo);
          this.listenEventToUpdate();
        }
      } catch (error) {
        // Catch any errors for any of the above operations.
        console.error(error);
      }
    }
  };

  getCampaign = async (notMetaMask = false) => {
    try {
      // Get network provider and web3 instance.
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.REACT_APP_DEFAULT_NETWORK)
      );

      // Use web3 to get the user's accounts.
      const accounts = '0x41A418C946Fd3201b7b2b30B367De35b0c54A6ce';
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedCampaign = Campaigns.networks[networkId];
      const instanceCampaign = new web3.eth.Contract(
        Campaigns.abi,
        deployedCampaign && deployedCampaign.address
      );
      const deployedAccount = Wallet.networks[networkId];
      const instanceAccount = new web3.eth.Contract(
        Wallet.abi,
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
          account: accounts,
          contract: {
            Campaigns: instanceCampaign,
            Account: instanceAccount
          },
          notMetaMask,
          isComponentRemount: false,
          api_db
        },
        this.getInfo
      );
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  }

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
          this.loadDetailsContribute();
          collected = parseInt(collected);
          goal = parseInt(goal);
          finStatus = parseInt(finStatus);
          startDate = parseInt(startDate) * 1000;
          endDate = parseInt(endDate) * 1000;
          if (_.isEmpty(contract.Identity)) {
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
            this.setState({ isLoading: false });
          } else {
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
        }
      });

    contract.Campaigns.methods
      .getNumberOfDonors(id)
      .call({ from: account })
      .then(result => {
        this.setState({ numberOfInvestor: parseInt(result) });
      });

    // Get some info about account
    contract.Account.methods
      .getBalance(account)
      .call({ from: account })
      .then(result => {
        this.setState({ balance: parseInt(result) });
      });

    contract.Campaigns.methods
      .getDonation(id, account)
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
            d.name.trim() + d.short_description.trim() + d.description.trim() + (d.thumbnail_url).trim();
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

  loadDetailsContribute = () => {
    const { contract, id, account } = this.state
    if (_.isEmpty(contract.Disbursement)) return
    contract.Disbursement.methods.getInfo(id).call({ from: account }).then(res => {
      let numStage = parseInt(res[0])
      let amountArr = _.map(res[1], node => (parseInt(node)))
      let mode = res[2]
      let timeArr = _.map(res[3], node => (parseInt(node)))
      let agreedArr = _.map(res[4], node => (parseInt(node)))
      let detailsCampaign = {
        numStage,
        amountArr,
        mode,
        timeArr,
        agreedArr
      }
      this.setState({
        detailsCampaign
      })
    })
  }

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
      .donate(id, amount)
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
    contract.Campaigns.methods
      .verifyCampaign(id, value)
      .send({
        from: account
      })
      .then(res => {
        console.log(res);
      });
  };

  renderPanel = () => {
    const {
      campaign,
      numberOfInvestor,
      balance,
      tokenBacked,
      account,
      isVerified,
      contract,
      detailsCampaign
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
            contract={contract}
            detailsCampaign={detailsCampaign}
          />
        );
    }
  };

  handleChangeVoted = (e) => {
    const { detailsCampaign } = this.state
    let numberStageToVoted = +e.target.value
    if (numberStageToVoted < detailsCampaign.numStage) {
      this.setState({
        numberStageToVoted: numberStageToVoted
      })
    }
  }

  handleVoted = () => {
    const { numberStageToVoted, detailsCampaign, contract, id, account } = this.state
    if (!_.isNumber(numberStageToVoted) || numberStageToVoted >= detailsCampaign.numStage) {
      showNoti({
        type: 'error',
        message: 'Please check input stage to voted valid'
      })
      return
    }
    contract.Disbursement.methods.vote(id, numberStageToVoted, true).send({
      from: account
    })
  }

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
      detailsCampaign,
      numberStageToVoted,
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
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    {this.renderPanel()}
                  </Grid>
                  <Grid item xs={12}>
                    {
                      !_.isEmpty(detailsCampaign) &&
                      <DetailsPanel {...this.state}
                        handleChangeVoted={this.handleChangeVoted}
                        handleVoted={this.handleVoted}
                        numberStageToVoted={numberStageToVoted}
                      />
                    }
                  </Grid>
                </Grid>
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
