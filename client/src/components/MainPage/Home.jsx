import React, { Component, Fragment } from "react";
import { withStyles } from "@material-ui/styles";
import Container from "@material-ui/core/Container";
import { MainHome } from "./ChildsHome/";

const styles = theme => ({
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  },
});
class Home extends Component {
  render() {
    const { classes } = this.props;
    return (
      <Fragment>
        <div className={classes.heroContent}>
          <Container maxWidth="sm">
            <MainHome />
          </Container>
        </div>
      </Fragment>
    );
  }
}

export default withStyles(styles)(Home);
