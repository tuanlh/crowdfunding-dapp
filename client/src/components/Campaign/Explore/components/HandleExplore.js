import React, { Component, Fragment } from "react";
import { withStyles } from "@material-ui/core/styles";
import Campaign from "../childs/Campaign/components/Campaign";
import { Grid } from "@material-ui/core";
import _ from "lodash";
const styles = theme => ({
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  }
});

class Explore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      campaigns: props.campaigns,
      mergedList: []
    };
  }

  renderCampaign = () => {
    const { data, campaigns } = this.state;
    let result = _.map(data, (node, index) => {
      if(_.isEmpty(node)) return
      let nodeCampaign = _.find(campaigns, { id: node.id })
      return (
        <Grid item xs={4} key={index}>
          <Campaign
            key={index}
            data={node}
            campaigns={nodeCampaign}
          />
        </Grid>
      );
    });
    return result;
  };

  render() {
    const { data, campaigns } = this.state;
    console.log(1);
    return (
      <Fragment>
        <Grid container spacing={2}>
          {this.renderCampaign()}
        </Grid>
      </Fragment>
    );
  }
}

export default withStyles(styles)(Explore);
