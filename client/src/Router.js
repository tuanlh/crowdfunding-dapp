import React from "react";
import { Route, Switch } from "react-router-dom";
import { Home, NotfoundPage, Helper } from "./components/MainPage";
import { Creation, Detail } from "./components/Campaign";
import { Wallet } from "./components/Wallet";
import IdentityUser from "./components/Identity/Register";
import CheckingIdentity from "./components/Identity/Checking";
import AdminPanel from "./components/Identity/AdminPanel";
import _ from "lodash";
// import Notification from './components/Identity/Notification';
export const listRouter = [
  {
    path: "/wallet",
    exact: true,
    component: Wallet,
    name: 'Wallet'
  },
  {
    path: "/create",
    exact: true,
    component: Creation,
    name: 'Create'
  },
  {
    path: "/help",
    exact: true,
    component: Helper,
    name: "Help"
  },
  {
    path: "/identity",
    exact: true,
    component: IdentityUser,
    name: "Identity"
  },
  {
    path: "/checknew",
    exact: true,
    component: CheckingIdentity,
    name: "Checking User"
  },
  {
    path: "/dashboard",
    exact: true,
    component: AdminPanel,
    name: "Dashboard"
  },
  {
    path: "/campaign/:id",
    exact: true,
    component: Detail,
    name: "Details"
  },
  {
    path: "/",
    exact: true,
    component: Home,
    name: "Home"
  }
];
const Router = () => (
  <Switch>
    {_.map(listRouter, (router, index) => {
      return (
        <Route
          path={router.path}
          exact={router.exact}
          component={router.component}
          key={index}
        />
      );
    })}
    <Route component={NotfoundPage} />
  </Switch>
);
export default Router;
