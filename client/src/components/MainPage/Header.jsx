import React, { Fragment } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router";
import clsx from "clsx";

import MenuIcon from "@material-ui/icons/Menu";
import MaterialDrawer from './HeaderChilds/MaterialDrawer'
const drawerWidth = 240;
const useStyles = makeStyles(theme => ({
  toolbar: {
    paddingRight: 24 // keep right padding when drawer closed
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: 28,
    [theme.breakpoints.up("sm")]: {
      marginLeft: -20
    }
  },
  menuButtonHidden: {
    display: "none"
  },
  title: {
    flexGrow: 1
  }
}));
function Header(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const { location } = props
  let showDrawer = location.pathname !== '/'
  return (
    <Fragment>
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, open && classes.appBarShift)}
      >
        <Toolbar className={classes.toolbar}>
         {  showDrawer && <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
            >
              <MenuIcon />
          </IconButton>}
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Crowdfunding DApp
          </Typography>
        </Toolbar>
      </AppBar>
      {
        showDrawer &&
        <MaterialDrawer handleDrawerClose={handleDrawerClose} open={open}/>
      }
    </Fragment>
  );
}

export default withRouter(Header);
