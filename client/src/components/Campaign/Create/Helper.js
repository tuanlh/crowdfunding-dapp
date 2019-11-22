import React, { Component, Fragment } from "react";
import { Card, CardHeader, CardContent, Typography } from "@material-ui/core/";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStickyNote } from "@fortawesome/free-solid-svg-icons";
import { withStyles } from '@material-ui/styles';
const customStyle = theme => ({
  titleText: {
    fontWeight: "bold",
    fontSize: '18px'
  }
})
class Helper extends Component {
  render() {
    const { classes } = this.props
    return (
      <Fragment>
        <Card>
          <CardHeader
            avatar={<FontAwesomeIcon icon={faStickyNote} />}
            title="Notes"
            classes={{
              title: classes.titleText
            }}
          />
          <CardContent>
            <Typography>
              <b>Notes 1:</b> A newly created campaign will need to wait for
              accept. The status of the campaign will be PENDING. During this
              time the campaign will not be able to perform any transactions.
              <br />
              <b>
                In current, for testing, we set default for new campaign is
                Accepted.
              </b>
            </Typography>
            <br />
            <Typography>
              <b>Notes 2:</b> After the campaign was accepted, investors can
              donate for campaign. You (creator campaign) only can withdraw
              amount of campaign if campaign successful
            </Typography>
            <br />
            <Typography>
              <b>Notes 3:</b> A succeed campaign is reach goal and meet
              deadline.
            </Typography>
            <br />
            <Typography>
              <b>Notes 4:</b> Any investors also can claim refund during
              campaign and when campaign failed. But NOT in succeed campaign
            </Typography>
          </CardContent>
        </Card>
      </Fragment>
    );
  }
}

export default withStyles(customStyle)(Helper)
