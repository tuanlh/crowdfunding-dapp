import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { withRouter } from 'react-router-dom'
//import ReactMarkdown from 'react-markdown';
import getWeb3 from "../../utils/getWeb3";
import Campaigns from "../../contracts/Campaigns.json";
import Identity from "../../contracts/Identity.json";
import { authUser } from "../../actions/index";
class Test extends Component {
  state = {
    isProcessing: false,
    web3: null,
    account: null,
    contract: null,
    api_db: null,
    contractIdentity: null,
    isError: {}
  };
  componentDidMount = async () => {
    try {
      const { authUser } = this.props;
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
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
      authUser({
        data: {
          web3,
          account: accounts[0],
          contract: instance,
          loading: false,
          api_db,
          contractIdentity: instanceIdentity
        },
        isAuth: true
      });
      this.props.history.goBack()
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };
  render() {
    console.log(this.props)
    return (
      <Fragment>
        asda
        {"sdf"}
      </Fragment>
    );
  }
}
const mapStateToProps = state => {
  return {
    state
  };
};

const mapDispatchToProps = dispatch => {
  return {
    authUser: (isAuth, data) => dispatch(authUser(isAuth, data))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Test));
