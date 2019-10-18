import React, { Component, Fragment } from "react";
import {
  Card,
  Grid,
  CardContent,
  CardHeader,
  withStyles,
  TextField,
  Typography,
  Button
} from "@material-ui/core/";
import QRCode from 'qrcode.react';
import _ from "lodash";
import clsx from "clsx";
import { ShoppingCart } from "@material-ui/icons";
import Loading from "../../utils/Loading2";
import showNoti from "../../utils/Notification";
const useStyles = theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    // marginTop: theme.spacing(3), 
    width: "100%"
  },
  button: {
    margin: theme.spacing(1),
  },
  typo: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: 0,
    width: "100%"
  }
});
class AccountAction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amountToken: '',
      amountEth: 0,
      price: '',
      isLoading: false
    };
  }

  handleChange = e => {
    if (e.target.value !== "") {
      const amountToken = parseInt(e.target.value);
      if (isNaN(amountToken)) {
        e.target.value = "";
        this.setState({ amountToken: 0, amountEth: 0 });
        return;
      }
      const amountEth = amountToken * this.props.price;
      this.setState({
        amountEth: +amountEth,
        amountToken: +amountToken
      });
    } else {
      this.setState({ amountToken: '', amountEth: 0 });
    }
  };

  handleDeposit = async () => {
    const { wei, granularity, account, contract } = this.props;
    const { amountToken } = this.state
    const amount = amountToken * granularity;
    if (amount > wei) {
      showNoti({
        type: 'error',
        details: 'You do not have enough ETH'
      })
      return;
    }
    if (amount <= 0) {
      showNoti({
        type: 'error',
        details: 'You must ENTER number token that you want deposit'
      })
      return;
    }
    // this.resetForm();
    this.setState({ isLoading: true });
    contract.methods.deposit().send({
      from: account,
      value: amount
    }).on('transactionHash', hash => {
      console.log(hash);
      if (hash !== null) {
        this.handleTransactionReceipt(hash)
      }
    }).on('error', err => {
      if (err !== null) {
        this.setState({ isLoading: false });
      }
    });
  };

  handleWithdraw = async () => {
    const { token, account, contract } = this.props;
    const { amountToken } = this.state
    if (amountToken > token) {
      showNoti({
        type: 'error',
        details: 'You do not have enough Token'
      })
      return;
    }
    if (amountToken === 0) {
      showNoti({
        type: 'error',
        details: 'You must ENTER number token that you want withdraw'
      })
      return;
    }
    // this.setState({ isLoading: true });
    contract.methods.withdraw(amountToken).send({
      from: account
    }).on('transactionHash', hash => {
      if (hash !== null) {
        this.handleTransactionReceipt(hash);
      }
    });
  };

  handleTransactionReceipt = async (hash) => {
    const { web3 } = this.props;
    let receipt = null;
    while (receipt === null) {
      receipt = await web3.eth.getTransactionReceipt(hash);
    }

    if (receipt.status === false) {
      showNoti({
        type: 'error',
        details: 'Your transaction have been revert'
      })
    } else {
      showNoti()
    }
    this.setState({ isLoading: false });
  };

  render() {
    const { classes, contract } = this.props;
    const { amountToken, amountEth, isLoading } = this.state;
    return (
      <Fragment>
        {
          isLoading && <Loading />
        }
        <Card>
          <CardHeader
            avatar={<ShoppingCart />}
            title="Deposit/Withdraw"
            classes={{
              title: classes.titleText
            }}
            style={{
              paddingBottom: "0px"
            }}
          />
          <CardContent style={{
            paddingTop: "0px"
          }}>
            <TextField
              label="Token"
              id="token"
              placeholder="Enter goal of campaign"
              type="number"
              value={amountToken}
              onChange={this.handleChange}
              margin="normal"
              className={classes.textField}
              helperText={clsx(
                amountToken !== '' && `${amountToken} Tokens = ${amountEth} Eth`,
                amountToken === '' && `0 Tokens = ${amountEth} Eth`
              )}
              required
              InputLabelProps={{
                shrink: true
              }}
            />
            <div style={{ textAlign: 'center' }}>
              <Button size="small" variant="outlined" color="primary" className={classes.button}
                onClick={this.handleDeposit}>
                Deposit
              </Button>
              <Button size="small" variant="outlined" color="secondary" className={classes.button}
                onClick={this.handleWithdraw}
              >
                Withdraw
              </Button>
            </div>
            <Typography className={classes.typo}>Or send ETH to:</Typography>
            <Grid container spacing={3}>
              <Grid item xs={9}>
                <TextField readOnly type="text" defaultValue={contract.address}
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={3}>
                <QRCode value={contract.address} size={80} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Fragment>
    );
  }
}
export default withStyles(useStyles)(AccountAction);
