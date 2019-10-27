import React, { Component, Fragment } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
} from "@material-ui/core/";
import { red, blue, cyan } from '@material-ui/core/colors'
import { withStyles } from "@material-ui/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const customStyle = theme => ({
  warning: {
    color: red[300]
  },
  success: {
    color: blue[500]
  },
  withdrawBtn: {
    color: cyan[300]
  }
});

class OwnerPanel extends Component {
  render() {
    const { classes, campaign, handleWithdraw, numberOfInvestor } = this.props;
    return (
      <Fragment>
        <Card>
          <CardHeader>
            <b>
              <FontAwesomeIcon icon="cog" /> Panel
            </b>
          </CardHeader>
          <CardContent>
            <div>
              <p>
                <FontAwesomeIcon icon="user" />
                <b> Backers:</b> {numberOfInvestor}
              </p>
              {campaign.fundEnabled ? (
                <Typography className={classes.warning}>
                  Campaign is during, you don't have any access
                </Typography>
              ) : campaign.status === 1 ? (
                <Typography className={classes.warning}>
                  Campaign is failed, you don't have any access
                </Typography>
              ) : campaign.finStatus === 2 ? (
                <Typography className={classes.warning}>
                  Campaign is paid, you don't have any access
                </Typography>
              ) : (
                <Typography className={classes.success}>
                  Campaign is success, you can call a withdraw for campaign
                  <Button className={classes.withdrawBtn} onClick={handleWithdraw}>
                    Withdraw
                  </Button>
                </Typography>
              )}
            </div>
          </CardContent>
        </Card>
      </Fragment>
    );
  }
}

export default withStyles(customStyle)(OwnerPanel);
