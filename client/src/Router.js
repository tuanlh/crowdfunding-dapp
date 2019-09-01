import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import Account from './components/Account';
import Notfound from './components/NotfoundPage';
import Campaign from './components/Campaign';
import CreateCampaign from './components/CreateCampaign';
import IdentityUser from './components/IdentityUser';
import CheckingIdentity from './components/CheckingIdentity';
const Router = () =>
    <Switch>
        <Route path='/account' exact component={Account} />
        <Route path='/create' exact component={CreateCampaign} />
        <Route path='/identity' exact component={IdentityUser} />
        <Route path='/checknew' exact component={CheckingIdentity} />
        <Route path='/campaign/:id' exact component={Campaign} />
        <Route path='/' exact component={Home} />
        <Route component={Notfound} />
    </Switch>
export default Router;
