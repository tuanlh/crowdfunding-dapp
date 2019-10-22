import React, { Component, Fragment } from 'react'
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/styles";

const styles = theme => ({
  icon: {
    marginRight: theme.spacing(2)
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  },
  heroButtons: {
    marginTop: theme.spacing(4)
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8)
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  cardMedia: {
    paddingTop: "56.25%" // 16:9
  },
  cardContent: {
    flexGrow: 1
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6)
  },
  button: {
    margin: theme.spacing(1),
  },
});

class MainHome extends Component {
  render() {
    const { classes } = this.props
    return (
      <Fragment>
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="textPrimary"
          gutterBottom
        >
          Crownfunding
            </Typography>
        <Typography
          variant="h5"
          align="center"
          color="textSecondary"
          paragraph
        >
          To live in this life, one needs a soul. For what, you know? <br />
        </Typography>
        <div className={classes.heroButtons}>
          <Grid container spacing={2} justify="center">
            <Grid item>
              <Link to="/create" style={{ textDecoration: 'none' }}>
                <Button variant="contained" color="primary" className={classes.button}>
                  Start campaign
                    </Button>
              </Link>
              <Link to="/explore" style={{ textDecoration: 'none' }} className={classes.button}>
                <Button variant="contained" color="primary">
                  Explore campaign
                </Button>
              </Link>
            </Grid>
          </Grid>
        </div>
      </Fragment>
    )
  }
}

export default withStyles(styles)(MainHome);

