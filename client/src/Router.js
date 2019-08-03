import React from "react";
import { Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import Account from './components/Account';
import Notfound from './components/NotfoundPage';
import Campaign from './components/Campaign';
import CreateCampaign from './components/CreateCampaign';
import SignUp from './components/SignUp'
const Router = () =>
    <Switch>
        <Route path='/account' exact component={Account} />
        <Route path='/create' exact component={CreateCampaign} />
        <Route path='/signup' exact component={SignUp} />
        <Route path='/campaign/:id' exact component={Campaign} />
        <Route path='/' exact component={Home} />
        <Route component={Notfound} />
    </Switch>
export default Router;
