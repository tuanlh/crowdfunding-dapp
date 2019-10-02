import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Home, NotfoundPage, Helper } from './components/MainPage';
import { Creation, Detail } from './components/Campaign';
import {Wallet} from './components/Wallet';
import IdentityUser from './components/Identity/IdentityUser';
import CheckingIdentity from './components/Identity/CheckingIdentity';
import Notification from './components/Identity/Notification';
const Router = () =>
    <Switch>
        <Route path='/wallet' exact component={Wallet} />
        <Route path='/create' exact component={Creation} />
        <Route path='/help' exact component={Helper} />
        <Route path='/identity' exact component={IdentityUser} />
        <Route path='/checknew' exact component={CheckingIdentity} />
        <Route path='/notification' exact component={Notification} />
        <Route path='/campaign/:id' exact component={Detail} />
        <Route path='/' exact component={Home} />
        <Route component={NotfoundPage} />
    </Switch>
export default Router;
