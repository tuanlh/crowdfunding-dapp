import React from "react";
import { Card, Typography, CardHeader, CardContent } from "@material-ui/core";

const Helper = () => (
  <Card>
    <CardHeader title="Tips Testing" />
    <CardContent>
      <Typography variant="body2" color="textSecondary" component="p">
        To use this system, you have to install MetaMask extension.
        <br />
        Install MetaMask on{" "}
        <a href="https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/">
          Firefox {" "}
        </a>
        or {" "}
        <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en">
          Chrome
        </a>
        <br />
        You can use any testnet as such as Ropsten, Kovan, Rinkeby network
      </Typography>
    </CardContent>
  </Card>
);

export default Helper;
