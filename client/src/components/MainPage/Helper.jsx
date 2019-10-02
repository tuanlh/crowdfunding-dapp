import React from 'react';
import { Card } from 'react-bootstrap';

const Helper = () =>
    <Card>
        <Card.Header><b>Tips Testing</b></Card.Header>
        <Card.Body>
            <Card.Text>
                To use this system, you have to install MetaMask extension.<br />
                Install MetaMask on <a href="https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/">Firefox</a>
                or <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en">Chrome</a>
                <br />
                You can use any testnet as such as Ropsten, Kovan, Rinkeby network
            </Card.Text>
        </Card.Body>
    </Card>

export default Helper;