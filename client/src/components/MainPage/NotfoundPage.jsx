import React from 'react';
import clsx from 'clsx';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  image: {
    // backgroundImage: 'url(https://source.unsplash.com/random)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: "rgba(0,0,0,0)",
    backgroundBlendMode: "multiply",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  footer: {
    position: "absolute",
    color: "#fff",
    bottom: 0,
    textAlign: "center",
    width: "100vw"
  },
  textError: {
    // color: "rgba(255,255,255,1)",
    paddingBottom: theme.spacing(1)
  },
  textError404: {
    fontSize: 178,
    fontWeight: "700"
  }
}));

export default function Error404() {
  const classes = useStyles();

  return (
    <Grid container component="main">
      <CssBaseline />
      <Grid item xs={12} className={classes.image}>
        <Box>
          <Typography className={clsx(classes.textError, classes.textError404)}>404</Typography>
        </Box>
        <Box>
          <Typography variant="h4" className={clsx(classes.textError)}>Page not found :(
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1" className={clsx(classes.textError)}>Ooooups! Looks like you got lost
          </Typography>
        </Box>
      </Grid>
      <Box className={classes.footer} paddingBottom={2}>
      </Box>
    </Grid>
  );
}
