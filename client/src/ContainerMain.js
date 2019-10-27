import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import Router from './Router';
import Breadcrumb from './components/MainPage/Breadcrumb';
import { listRouter } from './Router.js'

const useStyles = makeStyles(theme => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    minHeight: 'calc(100vh - 140px)',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
}));

function ContainerMain() {
  const classes = useStyles();

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Breadcrumb appRoutes={listRouter}/>
      <Container maxWidth="xl" className={classes.container}>
        <Router />
      </Container>
    </main>
  );
}


export default ContainerMain
