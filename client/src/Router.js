import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { Home, NotfoundPage, Helper } from "./components/MainPage";
import { Creation, Detail } from "./components/Campaign";
import { Wallets } from "./components/Wallet";
import IdentityUser from "./components/Identity/Register";
import CheckingIdentity from "./components/Identity/Checking";
import AdminPanel from "./components/Identity/AdminPanel";
import Explore from "./components/Campaign/Explore";
import VerifierCampaigns from "./components/Campaign/Verifier";
import Contribute from './components/Campaign/Contribute'
import AuthMetaMask from "./components/AuthMetamask/index";
import _ from "lodash";
// import Notification from './components/Identity/Notification';
export const listRouter = [
  {
    path: "/wallet",
    exact: true,
    component: Wallets,
    name: "Wallets",
    isAuth: true
  },
  {
    path: "/create",
    exact: true,
    component: Creation,
    name: "Create",
    isAuth: true
  },
  {
    path: "/help",
    exact: true,
    component: Helper,
    name: "Help",
    isAuth: false
  },
  {
    path: "/identity",
    exact: true,
    component: IdentityUser,
    name: "Identity",
    isAuth: true
  },
  {
    path: "/checknew",
    exact: true,
    component: CheckingIdentity,
    name: "Checking User",
    isAuth: true
  },
  {
    path: "/dashboard",
    exact: true,
    component: AdminPanel,
    name: "Dashboard",
    isAuth: true
  },
  {
    path: "/explore",
    exact: true,
    component: Explore,
    name: "Explore",
    isAuth: false
  },
  {
    path: "/verifier-campaigin",
    exact: true,
    component: VerifierCampaigns,
    name: "Verifier Campaigns",
    isAuth: true
  },
  {
    path: "/campaign/:id",
    exact: true,
    component: Detail,
    name: "Details",
    isAuth: false
  },
  {
    path: "/contribute",
    exact: true,
    component: Contribute,
    name: "Contribute",
    isAuth: true
  },
  {
    path: "/auth",
    exact: true,
    component: AuthMetaMask,
    name: "",
    isAuth: false
  },
  {
    path: "/",
    exact: true,
    component: Home,
    name: "Home",
    isAuth: false
  }
];

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { users, location } = rest;
  return (
    <Route
      {...rest}
      render={props =>
        users.isAuth === true ? (
          <Component {...props} />
        ) : (
            <Redirect
              to={{
                pathname: "/auth",
                state: { prePage: location.pathname }
              }} />
          )
      }
    />
  );
};

const Router = props => {
  return (
    <Switch>
      {_.map(listRouter, (router, index) => {
        if (router.isAuth) {
          return (
            <PrivateRoute
              path={router.path}
              exact={router.exact}
              component={router.component}
              key={index}
              {...props}
            />
          );
        }
        else {
          return (
            <Route
              path={router.path}
              exact={router.exact}
              component={router.component}
              key={index}
            />
          );
        }
      })}
      <Route component={NotfoundPage} />
    </Switch>
  );
};
const mapStateToProps = state => {
  return {
    users: state.users
  };
};

export default connect(mapStateToProps)(Router);
