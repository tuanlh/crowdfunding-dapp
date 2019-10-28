import React, { Component, Fragment } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";
import _ from "lodash";
import Campaign from "../childs/Campaign/components/Campaign";

const styles = theme => ({
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  }
});

class Explore extends Component {
  renderCampaign = () => {
    const { data, campaigns } = this.props;
    let result = _.map(data, (node, index) => {
      if (_.isEmpty(node)) return;
      let nodeCampaign = _.find(campaigns, { id: node.id });
      return (
        <Grid item xs={4} key={index}>
          <Campaign key={index} data={node} campaigns={nodeCampaign} />
        </Grid>
      );
    });
    return result;
  };

  render() {
    const { data, campaigns } = this.props;
    let listEmpty = data.length === 0 || campaigns.length === 0;
    return (
      <Fragment>
        {listEmpty && (
          <Typography
            variant="body2"
            color="textSecondary"
            component="p"
            style={{
              textAlign: "center"
            }}
          >
            Empty List
          </Typography>
        )}
        {!listEmpty && (
          <Grid container spacing={2}>
            {this.renderCampaign()}
          </Grid>
        )}
      </Fragment>
    );
  }
}

export default withStyles(styles)(Explore);
