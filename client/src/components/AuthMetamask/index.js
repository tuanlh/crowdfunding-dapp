import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { withRouter } from 'react-router-dom'
//import ReactMarkdown from 'react-markdown';
import getWeb3 from "../../utils/getWeb3";
import Campaigns from "../../contracts/Campaigns.json";
import Identity from "../../contracts/Identity.json";
import TokenSystem from "../../contracts/TokenSystem.json";
import { authUser } from "../../actions/index";
import Loading from "../utils/Loading2";
class AuthMetamask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isProcessing: false,
      web3: null,
      account: null,
      contract: null,
      api_db: null,
      contractIdentity: null,
      isError: {},
      isAuth: props.isAuth
    }
  }

  componentDidMount = async () => {
    try {
      const { authUser } = this.props;
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      // campagins
      const deployedNetwork = Campaigns.networks[networkId];
      const instanceCampaigns = new web3.eth.Contract(
        Campaigns.abi,
        deployedNetwork && deployedNetwork.address
      );
      // identity
      const deployedNetworkIdentity = Identity.networks[networkId];
      const instanceIdentity = new web3.eth.Contract(
        Identity.abi,
        deployedNetworkIdentity && deployedNetworkIdentity.address
      );
      // token system
      const deployedTokenSystem = TokenSystem.networks[networkId];
      const instanceTokenSystem = new web3.eth.Contract(
        TokenSystem.abi,
        deployedTokenSystem && deployedTokenSystem.address
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
          contractCampaigns: instanceCampaigns,
          contractIdentity: instanceIdentity,
          contractTokenSystem: instanceTokenSystem,
          isLoading: false,
          api_db,
        },
        isAuth: true
      });
      // this.props.history.goBack()
      this.props.history.push('/explore')
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };
  render() {
    const { users } = this.props
    return (
      <Fragment>
        {
          !users.isAuth && <Loading />
        }
      </Fragment>
    );
  }
}
const mapStateToProps = state => {
  return {
    users: state.users,
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
)(withRouter(AuthMetamask));
