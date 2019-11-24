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
import RequestModal from "../childs/RequestModal";
import Loading from "../../../utils/Loading2/index";
import showNoti from '../../../utils/Notification'

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
    const { users } = props;
    this.state = {
      data: [],
      isOpenRequest: false,
      isLoading: true,
      dataUser: {},
      web3: users.data.web3,
      account: users.data.account,
      contractIdentity: users.data.contractIdentity,
    };
    this.fileInput = React.createRef();
  }

  componentDidMount = () => {
    this.loadAccountInfo();
  };

  loadAccountInfo = () => {
    const { contractIdentity, account } = this.state;
    contractIdentity.methods
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
    const { account, contractIdentity } = this.state;
    contractIdentity.methods
      .getUsersRequested()
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
    const { contractIdentity, account } = this.state;
    return new Promise(resolve => {
      contractIdentity.methods
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
    const { contractIdentity, account, dataUser } = this.state;
    this.setState({
      isLoading: true
    });
    contractIdentity.methods
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
          showNoti({
            details: 'Please wait transaction confirm'
          })
          this.setState({
            isLoading: false,
            isOpenRequest: false
          });
        }
      })
      .on("error", err => {
        this.setState({
          isLoading: false,
          isOpenRequest: false
        });
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
