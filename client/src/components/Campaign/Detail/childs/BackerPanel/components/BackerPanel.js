import React, { Component, Fragment } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  TextField
} from "@material-ui/core/";
import { blue, cyan } from "@material-ui/core/colors";
import { withStyles } from "@material-ui/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const customStyle = theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(3),
    width: '100%'
  },
  btnFund: {
    color: blue[500],
    margin: theme.spacing(1),
  },
  btnRefund: {
    color: cyan[500],
    margin: theme.spacing(1),
  }
})
class BackerPanel extends Component {
  render() {
    const {
      classes,
      tokenBacked,
      numberOfInvestor,
      campaign,
      handleFund,
      handleRefund,
      balance,
      handleChange
    } = this.props;
    return (
      <Fragment>
        <Card>
          <CardHeader>
            <FontAwesomeIcon icon="life-ring" />
            <b> Back this project</b>
          </CardHeader>
          <CardContent className="p-1">
            <div>
              {tokenBacked > 0 && (
                <p>
                  <FontAwesomeIcon icon="money-bill" /> You have backed{" "}
                  <b>{tokenBacked}</b> tokens
                </p>
              )}
              <p>
                <FontAwesomeIcon icon="user" />
                <b> Backers:</b> {numberOfInvestor}
              </p>
              <p>
                <FontAwesomeIcon icon="cart-plus" />
                <b> Available:</b> {campaign.available} tokens
              </p>
              {campaign.fundEnabled && (
                <div>
                  <TextField
                    type="number"
                    placeholder="Number of tokens"
                    ref="amount"
                    onChange={handleChange}
                    className={classes.textField}
                  />
                  <div>
                    {campaign.available > 0 && (
                      <Button onClick={handleFund} className={classes.btnFund} variant="outlined">
                        Fund
                      </Button>
                    )}
                    {tokenBacked > 0 && (
                      <Button onClick={handleRefund} className={classes.btnRefund} variant="outlined">
                        Refund
                      </Button>
                    )}
                  </div>
                </div>
              )}
              <p>
                <FontAwesomeIcon icon="coins" />
                <b> Your token:</b> {balance}
              </p>
            </div>
          </CardContent>
        </Card>
      </Fragment>
    );
  }
}

export default withStyles(customStyle)(BackerPanel)
