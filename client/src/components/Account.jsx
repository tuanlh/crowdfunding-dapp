import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TokenSystem from "../contracts/TokenSystem.json";
import { Row, Col, Card, CardDeck, Alert, ListGroup, Form, InputGroup, Button, Badge } from 'react-bootstrap';
import getWeb3 from "../utils/getWeb3";
import QRCode from 'qrcode.react';
import TimeFormatter from './utils/TimeFormatter';
import Loading from './utils/Loading';
import Paginator from './utils/Paginator';

class Account extends Component {
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

  handleChange = (e) => {
    if (e.target.value !== '') {
      const amountToken = parseInt(e.target.value);
      if (isNaN(amountToken)) {
        e.target.value = '';
        this.setState({ amountToken: 0, amountEth: 0 });
        return;
      }
      const amountEth = amountToken * this.state.price;
      this.setState({
        amountEth,
        amountToken
      });
    } else {
      this.setState({ amountToken: 0, amountEth: 0 });
    }

  };

  handleDeposit = async () => {
    const { wei, amountToken, granularity, account, contract } = this.state;
    const amount = amountToken * granularity;
    if (amount > wei) {
      alert('You do not have enough ETH');
      return;
    }
    if (amount <= 0) {
      alert('You must ENTER number token that you want deposit');
      return;
    }
    this.resetForm();
    this.setState({ isProcessing: true });
    contract.methods.deposit().send({
      from: account,
      value: amount
    }).on('transactionHash', hash => {
      console.log(hash);
      if (hash !== null) {
        this.handleTransactionReceipt(hash)
      }
    }).on('error', err => {
      if (err !== null) {
        this.setState({ isProcessing: false });
      }
    });

  };

  handleWithdraw = async () => {
    const { token, amountToken, account, contract } = this.state;
    if (amountToken > token) {
      alert('You do not have enough Token');
      return;
    }
    if (amountToken === 0) {
      alert('You must ENTER number token that you want withdraw');
      return;
    }
    this.resetForm();
    this.setState({ isProcessing: true });
    contract.methods.withdraw(amountToken).send({
      from: account
    }).on('transactionHash', hash => {
      if (hash !== null) {
        this.handleTransactionReceipt(hash);
      }
    });
  };

  handleTransactionReceipt = async (hash) => {
    const { web3 } = this.state;
    let receipt = null;
    while (receipt === null) {
      receipt = await web3.eth.getTransactionReceipt(hash);
    }

    if (receipt.status === false) {
      alert('Your transaction have been revert');
    }
    this.setState({ isProcessing: false });
  };

  resetForm = async () => {
    this.setState({ amountToken: 0, amountEth: 0 }); // reset
    this.refs.inputToken.value = '';
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
    const renderAccountInfo = <Card>
      <Card.Header><b><FontAwesomeIcon icon="user" /> Your account</b></Card.Header>
      <Card.Body className="p-1 m-1">
        <ListGroup>
          <ListGroup.Item>
            <FontAwesomeIcon icon="coins" />
            <b> Your token:</b> <Badge variant="danger">{this.state.token}</Badge>
          </ListGroup.Item>
          <ListGroup.Item>
            <FontAwesomeIcon icon="tag" /> <b>Price:</b> {this.state.price} ETH
          </ListGroup.Item>
          <ListGroup.Item>
            <FontAwesomeIcon icon={['fab', 'ethereum']} /> <b>Your balance:</b> {this.state.eth} ETH
          </ListGroup.Item>
          <ListGroup.Item>
            <FontAwesomeIcon icon="address-card" /> <b>Your address: </b> {this.state.account}
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>;

    const renderAccountAction = <Card bg>
      <Card.Header>
        <b><FontAwesomeIcon icon="cart-plus" /> Deposit/Withdraw</b>
      </Card.Header>
      <Card.Body className="p-1 m-1">
        {this.state.loading === false ? (<div>
          <InputGroup>
            <Form.Control
              type="number"
              placeholder="Number of tokens"
              ref='inputToken'
              onChange={this.handleChange} />
            <InputGroup.Append>
              <InputGroup.Text>{this.state.amountEth + " ETH"}</InputGroup.Text>
              <Button variant="primary" onClick={this.handleDeposit}>Deposit</Button>
              <Button variant="secondary" onClick={this.handleWithdraw}>Withdraw</Button>
            </InputGroup.Append>
          </InputGroup>
          <Row className="pt-3">
            <Col sm={3}>
              Or send ETH to:
            </Col>
            <Col sm={5}>
              <Form.Control readOnly type="text" defaultValue={this.state.contract.address} />
            </Col>
            <Col sm={4}>
              <QRCode value={this.state.contract.address} />
            </Col>
          </Row>
        </div>
        ) : (
            <Alert variant="warning"><FontAwesomeIcon icon="spinner" pulse /> Loading...</Alert>
          )}
      </Card.Body>
    </Card>;

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

    return (
      <div>
        {this.state.isLoading && <Loading text="Loading account info..." />}
        {this.state.isProcessing && <Loading text="Pending..." />}
        <Row className="pt-1">
          <Col>
            <CardDeck>
              {renderAccountInfo}
              {renderAccountAction}
            </CardDeck>
          </Col>
          {/* <Col sm={12} md={12} lg={6} xl={6} className="pt-1">
            {renderAccountInfo}
          </Col>
          <Col sm={12} md={12} lg={6} xl={6} className="pt-1">
            {renderAccountAction}
          </Col> */}
        </Row>
        <Row>
          <Col className="pt-1">
            {renderEventLogs}
          </Col>
        </Row>
      </div>
    );
  };


}

export default Account;
