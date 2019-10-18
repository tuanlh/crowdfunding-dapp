import React, { Component, Fragment } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TokenSystem from "../../contracts/TokenSystem.json";
import { Row, Col, Card, CardDeck, Alert, ListGroup, Form, InputGroup, Button, Badge } from 'react-bootstrap';
import { Grid } from "@material-ui/core/";
import AccountInfo from './childs/AccountInfo'
import AccountAction from "./childs/AccountAction.js";

import getWeb3 from "../../utils/getWeb3";
import TimeFormatter from '../utils/TimeFormatter';
import Loading from '../utils/Loading2';
import Paginator from '../utils/Paginator';
import ErrorLogs from "./childs/ErrorLogs.js";

class Wallet extends Component {
  state = {
    eth: 0, // balance of user form as ETH
    wei: 0, // balance of user form as Wei
    token: 0, // balance of user form as token
    amountToken: 0, // amount to buy form as token
    amountEth: 0, // amount to buy form as ETH
    price: 0,
    granularity: 0,
    logs: [],
    page: {
      limit: 5,
      firsIndex: 0,
      lastIndex: 0,
    },
    loading: true,
    isProcessing: false,
    web3: null,
    account: null,
    contract: null
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = TokenSystem.networks[networkId];
      const instance = new web3.eth.Contract(
        TokenSystem.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      await this.setState({ web3, account: accounts[0], contract: instance }, this.loadAccountInfo);
      this.listenEventLogs();
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, account, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  loadAccountInfo = async () => {
    const { web3, account, contract } = this.state;

    contract.methods.getMyBalance().call({ from: account })
      .then(token => {
        this.setState({ token: parseInt(token) });
      });

    contract.methods.granularity().call()
      .then(granularity => {
        const price = web3.utils.fromWei(granularity.toString(), "ether");
        this.setState({ granularity, price });
      });

    web3.eth.getBalance(account, (err, balance) => {
      if (err !== 'underfine') {
        const eth = web3.utils.fromWei(balance, "ether");
        this.setState({ eth, wei: balance });
      } else {
        console.log(err);
      }
    });
    this.setState({ loading: false });
  };


  listenEventLogs = async () => {
    const { account, contract, web3 } = this.state;
    const currentBlock = await web3.eth.getBlock('latest');

    // list history log
    contract.events.allEvents({
      fromBlock: 0,
      toBlock: currentBlock.number
    }, (error, result) => {
      if (error === false && result !== null) {
        if (
          result.returnValues.from === account ||
          result.returnValues.to === account
        ) {
          this.writeLogs(result);
        }
      }
    });

    // list new log
    contract.events.allEvents({
      fromBlock: 'latest'
    }, (error, result) => {
      if (error === false && result !== null) {
        if (
          result.returnValues.from === account ||
          result.returnValues.to === account
        ) {
          this.writeLogs(result);
          this.loadAccountInfo();
        }
      }
    });
  };

  writeLogs = async (e) => {
    const { web3 } = this.state;
    let logs = this.state.logs;
    web3.eth.getBlock(e.blockNumber).then(block => {
      const timestamp = parseInt(block.timestamp) * 1000;
      const amount = web3.utils.fromWei(e.returnValues.amount.toString(), "ether");
      logs.push({
        id: e.id,
        timestamp,
        did: e.event.toLowerCase(),
        amount,
        txHash: e.transactionHash
      });
      this.setState({ logs });
      this.handlePaginator(1);
    });
  };

  handlePaginator = (current) => {
    let { page } = this.state;
    page.lastIndex = current * page.limit;
    page.firstIndex = page.lastIndex - page.limit;
    this.setState({ page });
  };


  render() {
    if (!this.state.web3) {
      return <Loading text="Loading Web3, account, and contract..." />;
    }

    let logs = [...this.state.logs];
    logs.sort((prev, next) => next.timestamp - prev.timestamp);
    logs = logs.slice(this.state.page.firstIndex, this.state.page.lastIndex);
    const renderEventLogs = <Card>
      <Card.Header><FontAwesomeIcon icon="calendar" /> <b>Event Logs</b></Card.Header>
      <Card.Body>
        <ListGroup>
          {this.state.logs.length > 0 ?
            (
              logs.map(log => <ListGroup.Item key={log.id}>
                <FontAwesomeIcon icon="clock" />
                <span className="text-muted"> [<TimeFormatter time={log.timestamp} />] </span>
                You {log.did} {log.amount} ETH
                  <small className="text-muted"> (txHash {log.txHash})</small>
              </ListGroup.Item>)
            ) : (
              <Alert variant="warning">Logs empty</Alert>
            )
          }
        </ListGroup>
      </Card.Body>
      {this.state.logs.length >= this.state.page.limit && (
        <Card.Footer>
          <Paginator
            numberOfItem={this.state.logs.length}
            limit={this.state.page.limit}
            callback={this.handlePaginator} />
        </Card.Footer>
      )}
    </Card>;
    const { account, eth, price, token, isLoading, isProcessing, contract } = this.state
    console.log(this.state)
    return (
      <Fragment>
        { isLoading && <Loading text="Loading account info..." />}
        { isProcessing && <Loading text="Pending..." />}
        {
          !isLoading &&
          <Fragment>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <AccountInfo
                  data={{
                    account, eth, price, token
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <AccountAction key={price} {...this.state}
                />
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={9}>
                <ErrorLogs {...this.state} />
              </Grid>
            </Grid>
          </Fragment>
        }
        {/* <Row className="pt-1">
          <Col>
            <CardDeck>
              {renderAccountInfo}
              {renderAccountAction}
            </CardDeck>
          </Col> */}
        {/* <Col sm={12} md={12} lg={6} xl={6} className="pt-1">
            {renderAccountInfo}
          </Col>
          <Col sm={12} md={12} lg={6} xl={6} className="pt-1">
            {renderAccountAction}
          </Col> */}
        {/* </Row>
        <Row>
          <Col className="pt-1">
            {renderEventLogs}
          </Col>
        </Row> */}
      </Fragment>
    );
  };


}

export default Wallet;
