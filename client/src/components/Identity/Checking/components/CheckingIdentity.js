import React, { Component, Fragment } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography
} from "@material-ui/core";
import { lightBlue } from "@material-ui/core/colors/";
import { withRouter } from "react-router-dom";
import _ from "lodash";
import getWeb3 from "../../../../utils/getWeb3";
import Identity from "../../../../contracts/Identity.json";
import RequestModal from "../childs/RequestModal";
import Loading from "../../../utils/Loading2/index";

const TableChild = ({ data, handleRequest }) => {
  let result = [];
  result = data.map((node, index) => {
    return (
      <TableRow key={index}>
        <TableCell component="th" scope="row">
          {node}
        </TableCell>
        <TableCell align="right">
          <Button
            variant="outlined"
            style={{
              width: "24.5%",
              color: lightBlue[300]
            }}
            onClick={() => handleRequest(node)}
          >
            View
          </Button>
        </TableCell>
      </TableRow>
    );
  });

  return result;
};

class CheckingIdentity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isOpenRequest: false,
      isLoading: true,
      dataUser: {},
      web3: null,
      account: null,
      contract: null
    };
    this.fileInput = React.createRef();
  }

  componentDidMount = async () => {
    try {
      const { account } = this.state;
      if (!_.isEmpty(account)) return;
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
      this.setState(
        {
          web3,
          account: accounts[0],
          contract: instance
        },
        () => {
          this.loadAccountInfo();
        }
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

  loadAccountInfo = () => {
    const { contract, account } = this.state;
    contract.methods
      .isVerifier(account)
      .call({
        from: account
      })
      .then(res => {
        if (res) {
          this.getUser();
        } else {
          this.props.history.push("/");
        }
      });
  };

  handleRequest = user_address => {
    this.showInfoUser(user_address).then(res => {
      this.setState(
        {
          dataUser: { ...res, user_address }
        },
        () => {
          this.handleModal("isOpenRequest");
        }
      );
    });
  };

  getUser = () => {
    const { account, contract } = this.state;
    contract.methods
      .getUsers()
      .call({
        from: account
      })
      .then(res => {
        this.setState({
          data: res,
          isLoading: false
        });
      });
  };

  showInfoUser = user_address => {
    const { contract, account } = this.state;
    return new Promise(resolve => {
      contract.methods
        .getIdentity(user_address)
        .call({
          from: account
        })
        .then(res => {
          resolve(res);
        });
    });
  };

  handleModal = name => {
    this.setState({
      [name]: !this.state[name]
    });
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  handleVerifiedUser = action => {
    const { contract, account, dataUser } = this.state;
    this.setState({
      isLoading: true
    });
    contract.methods
      .verify(dataUser.user_address, action)
      .send({
        from: account
      })
      .on("transactionHash", hash => {
        if (hash !== null) {
          const urlEtherum = "https://ropsten.etherscan.io/tx/";
          // show pop up information
          window.open(urlEtherum + hash);
          this.handleTransactionReceipt(hash);
          this.setState({
            isLoading: false
          });
        }
      })
      .on("error", err => {
        if (err !== null) {
          console.log("Error" + err);
          // this.setState({ isProcessing: false });
          // this.recaptcha.reset();
        }
      });
  };

  handleTransactionReceipt = async hash => {
    const { web3 } = this.state;
    let receipt = null;
    while (receipt === null) {
      receipt = await web3.eth.getTransactionReceipt(hash);
    }

    if (receipt.status === true) {
      console.log("---Success---");
    } else {
      console.log("--Failed---");
    }
  };

  render() {
    let { data, isOpenRequest, isLoading, dataUser } = this.state;
    const classes = makeStyles(theme => ({
      root: {
        width: "100%",
        marginTop: theme.spacing(5),
        overflowX: "auto"
      },
      table: {
        minWidth: 650
      }
    }));
    return (
      <Fragment>
        {isLoading && <Loading />}
        {!isLoading && (
          <div className="card">
            {/* <div className="card-header">Checking Identity</div> */}
            <div className="card-body" style={{ padding: "0px" }}>
              <Paper className={classes.root}>
                {_.isEmpty(data) && (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                    style={{
                      textAlign: "center",
                      fontSize: "1.5 em"
                    }}
                  >
                    Empty List
                  </Typography>
                )}
                {!_.isEmpty(data) && (
                  <Table className={classes.table}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Address</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableChild
                        data={data}
                        handleRequest={this.handleRequest}
                      />
                      {isOpenRequest && (
                        <RequestModal
                          isOpen={isOpenRequest}
                          dataUser={dataUser}
                          fileInput={this.fileInput}
                          handleModal={() => this.handleModal("isOpenRequest")}
                          privateKeyData={this.privateKeyData}
                          handleVerifiedUser={this.handleVerifiedUser}
                        />
                      )}
                    </TableBody>
                  </Table>
                )}
              </Paper>
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}

export default withRouter(CheckingIdentity);
