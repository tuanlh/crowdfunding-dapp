import React from "react";
import { Link } from "react-router-dom";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import {
  AccountBalanceWallet,
  Home,
  FeaturedPlayListSharp,
  // Dashboard,
  Help,
  Info,
  PermIdentityTwoTone
} from "@material-ui/icons";

import "./styles.scss";

const navStyles = { textDecoration: "none", color: "#000" };
const listItemStyles = {};
const iconStyles = { fontSize: 20, color: "#000" };

export const mainListItems = (
  <div>
    <Link to="/" style={navStyles}>
      <ListItem button style={listItemStyles}>
        <ListItemIcon>
          <Home style={iconStyles} />
        </ListItemIcon>
        <ListItemText primary="Home" className="muiSideMenu" />
      </ListItem>
    </Link>
    {/* <Link to="/dashboard" style={navStyles}>
      <ListItem button style={listItemStyles}>
        <ListItemIcon>
          <Dashboard style={iconStyles} />
        </ListItemIcon>
        <ListItemText primary="Dashboard" className="muiSideMenu" />
      </ListItem>
    </Link> */}
     <Link to="/identity" style={navStyles}>
      <ListItem button style={listItemStyles}>
        <ListItemIcon>
          <PermIdentityTwoTone style={iconStyles} />
        </ListItemIcon>
        <ListItemText primary="Dashboard" className="muiSideMenu" />
      </ListItem>
    </Link>
    <Link to="/wallet" style={navStyles}>
      <ListItem button style={listItemStyles}>
        <ListItemIcon>
          <AccountBalanceWallet style={iconStyles} />
        </ListItemIcon>
        <ListItemText primary="Wallet" className="muiSideMenu" />
      </ListItem>
    </Link>
    <Link to="/feature" style={navStyles}>
      <ListItem button style={listItemStyles}>
        <ListItemIcon>
          <FeaturedPlayListSharp style={iconStyles} />
        </ListItemIcon>
        <ListItemText primary="Feature" className="muiSideMenu" />
      </ListItem>
    </Link>
    <Link to="/help" style={navStyles}>
      <ListItem button style={listItemStyles}>
        <ListItemIcon>
          <Help style={iconStyles} />
        </ListItemIcon>
        <ListItemText primary="Help" className="muiSideMenu" />
      </ListItem>
    </Link>
    <Link to="/about" style={navStyles}>
      <ListItem button style={listItemStyles}>
        <ListItemIcon>
          <Info style={iconStyles} />
        </ListItemIcon>
        <ListItemText primary="About" className="muiSideMenu" />
      </ListItem>
    </Link>
  </div>
);
