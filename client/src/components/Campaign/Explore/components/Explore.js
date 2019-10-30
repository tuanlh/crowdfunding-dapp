import React, { Component, Fragment } from "react";
import { withRouter } from "react-router";
import { withStyles } from "@material-ui/core/styles";
import axios from "axios";
import { Keccak } from "sha3";
import _ from "lodash";

import Loading from "../../../utils/Loading2";
import HandleExplore from "./HandleExplore";
import StepperExplore from "../childs/StepperExplore/components/StepperExplore";

const styles = theme => ({
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  }
});

class Explore extends Component {
  constructor(props) {
    super(props);
    const { users } = props;
    this.state = {
      numberOfCampaign: 0,
      campaigns: [],
      page: {
        limit: 4,
        firstIndex: 0,
        lastIndex: 0
      },
      data: [],
      //api_db_set: null,
      api_db: users.data.api_db,
      loaded: 0,
      web3: users.data.web3,
      account: users.data.account,
      contract: users.data.contractCampaigns,
      contractIdentity: users.data.contractIdentity,
      isLoading: true,
      activeStep: 0,
      chunkData: [],
      currentData: []
    };
  }

  componentDidMount = async () => {
    this.loadContractInfo();
  };

  loadContractInfo = async () => {
    const { account, contract } = this.state;
    const numberOfCampaign = parseInt(
      await contract.methods.length().call({ from: account })
    );
    if (numberOfCampaign > 0) {
      this.getCampaignFirst(numberOfCampaign).then(campaigns => {
        this.loadCampaign(campaigns);
      });
    } else {
      this.setState({ isLoading: false });
    }
  };
  getCampaignFirst = numberOfCampaign => {
    return new Promise(resolve => {
      let campaigns = [];
      for (let i = 0; i < numberOfCampaign; i++) {
        this.getCampaign(i).then(campaign => {
          campaign.id = i
          campaigns.push(campaign);
          if (campaigns.length === numberOfCampaign) {
            resolve(campaigns);
          }
        });
      }
    });
  };
  getCampaign = index => {
    return new Promise(resolve => {
      const { account, contract, contractIdentity } = this.state;
      resolve(contract.methods.getInfo(index).call({ from: account }));
    });
  };
  loadCampaign = campaigns => {
    let campaignAfterBuild = [];
    let count = 0;
    _.map(campaigns, (node) => {
      this.buildCampagin(node, node.id).then(res => {
        if(!_.isEmpty(res)) {
          campaignAfterBuild.push(res);
        }
        count++;
        if(count === campaigns.length) {
          this.setState({
            campaigns: campaignAfterBuild,
            isLoading: false
          })
        }
      });
    });

  };
  buildCampagin = (campaign, index) => {
    return new Promise(resolve => {
      const { account, contractIdentity } = this.state;
      let { startDate, endDate, goal, collected, owner, finStatus, ref, hashIntegrity } = campaign;
      finStatus = parseInt(finStatus);
      contractIdentity.methods
        .isVerified(account)
        .call({
          from: account
        })
        .then(isVerified => {
          if (finStatus > 0 || isVerified) {
            this.loadDataOfCampaign(index, ref, hashIntegrity);
            collected = parseInt(collected);
            goal = parseInt(goal);
            startDate = parseInt(startDate) * 1000;
            endDate = parseInt(endDate) * 1000;
            const stt = this.getStatus(endDate, goal, collected);
            let statusChr = ["During", "Failed", "Succeed"][stt];
            const progress = this.getProgress(collected, goal);
            resolve({
              id: index,
              start: startDate,
              end: endDate,
              goal: goal,
              collected: collected,
              owner: owner,
              status: statusChr,
              progress: progress
            });
          } else {
            resolve(null);
          }
        });
    });
  };
  loadDataOfCampaign = async (index, ref, hash_integrity) => {
    let { data, api_db } = this.state;
    if (!data.hasOwnProperty(index)) {
      axios.get(api_db + "campaign/" + ref).then(response => {
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
            // const result_hash = hashEngine.digest("hex");
            // if (result_hash === hash_integrity) {
            data[index] = response.data;
            data[index].id = index;
            this.setState({ data }, () => {
              this.handlePaginator();
            });
            // }
          }
        }
      });
    }
  };

  printData = (index, property) => {
    const { data } = this.state;
    if (data.hasOwnProperty(index)) {
      if (hasOwnProperty.call(data[index], property)) {
        return data[index][property];
      } else {
        if (property === "thumbnail_url") {
          return "/default-thumbnail.jpg";
        } else {
          return "[Field not found]";
        }
      }
    } else {
      return "Loading...";
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

  handlePaginator = () => {
    let { data } = this.state;
    let chunkData = _.chunk(data, 9);
    let currentData = chunkData[0];
    this.setState({
      chunkData,
      currentData
    });
  };

  handleNext = isNextPage => {
    let { activeStep, chunkData } = this.state;
    isNextPage ? (activeStep += 1) : (activeStep -= 1);
    this.setState({
      activeStep,
      currentData: chunkData[activeStep]
    });
  };

  render() {
    const {
      campaigns,
      isLoading,
      activeStep,
      chunkData,
      currentData,
    } = this.state;
    return (
      <Fragment>
        {isLoading && <Loading />}
        {!isLoading && (
          <Fragment>
            <HandleExplore
              data={currentData}
              campaigns={campaigns}
              key={Math.random()}
            />
            <div>
              <StepperExplore
                handleNext={() => this.handleNext(true)}
                handleBack={() => this.handleNext(false)}
                activeStep={activeStep}
                data={chunkData}
              />
            </div>
          </Fragment>
        )}
      </Fragment>
    );
  }
}

export default withStyles(styles)(withRouter(Explore));
