import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Campaigns from "../contracts/Campaigns.json";
import TokenSystem from "../contracts/TokenSystem.json";
import { Row, Col, Card, Alert, ProgressBar, ListGroup, InputGroup, Form, Button } from 'react-bootstrap';
import getWeb3 from "../utils/getWeb3";
import TimeFormatter from './utils/TimeFormatter';
import Loading from './utils/Loading';

class Campaign extends Component {
  state = {
    id: null,
    campaign: {},
    campaignStatusChr: ['During', 'Failed', 'Succeed'],
    isExist: false,
    isLoading: true,
    balance: 0,
    tokenBacked: 0,
    amount: 0,
    numberOfInvestor: 0,
    web3: null,
    account: null,
    contract: {},
    isComponentRemount: false
  };

  componentDidMount = async () => {
    console.log('component did mount');
    const { match: { params } } = this.props;
    const id = parseInt(params.id);
    if (isNaN(id)) {
      this.setState({ isLoading: false });
    } else {
      this.setState({ id: params.id });
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
        console.log('web3 loaded');
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedCampaign = Campaigns.networks[networkId];
        const instanceCampaign = new web3.eth.Contract(
          Campaigns.abi,
          deployedCampaign && deployedCampaign.address,
        );
        const deployedAccount = TokenSystem.networks[networkId];
        const instanceAccount = new web3.eth.Contract(
          TokenSystem.abi,
          deployedAccount && deployedAccount.address,
        );

        this.setState({
          web3,
          account: accounts[0],
          contract: {
            Campaigns: instanceCampaign,
            Account: instanceAccount
          },
          isComponentRemount: false
        },
          this.getInfo
        );
        this.listenEventToUpdate();
        window.ethereum.on('accountsChanged', () => {
          window.location.reload();
        });
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    }
  };

  getInfo = async () => {
    const { id, account, contract } = this.state;
    this.setState({ isLoading: true });

    // get some info about campaign
    contract.Campaigns.methods.getInfo(id).call({ from: account })
      .then(result => {
        if (result !== null) {
          let { name, startDate, endDate, goal, collected, owner, finStatus } = result;
          collected = parseInt(collected);
          goal = parseInt(goal);
          finStatus = parseInt(finStatus);
          startDate = parseInt(startDate) * 1000;
          endDate = parseInt(endDate) * 1000;
          if (finStatus > 0) {
            const status = this.getStatus(endDate, goal, collected);
            const progress = this.getProgress(collected, goal);
            const fundEnabled = status === 0 && finStatus === 1;
            const available = fundEnabled ? goal - collected : 0;
            const campaign = {
              name, startDate, endDate, goal, collected, owner, status, progress, finStatus, fundEnabled, available
            };
            this.setState({ campaign, isExist: true });
          }
        }
        this.setState({ isLoading: false });
      });

    contract.Campaigns.methods.getNumberOfInvestors(id).call({ from: account })
      .then(result => {
        this.setState({ numberOfInvestor: parseInt(result) });
      });

    // Get some info about account
    contract.Account.methods.getMyBalance().call({ from: account })
      .then(result => {
        this.setState({ balance: parseInt(result) });
      });

    contract.Campaigns.methods.getInvest(id, account).call({ from: account })
      .then(result => {
        this.setState({ tokenBacked: parseInt(result) });
      });

  };

  getStatus = (deadline, goal, collected) => {
    if (Date.now() < deadline) {
      return 0; //during
    } else {
      if (collected < goal) {
        return 1; //failed
      } else {
        return 2; //succeed
      }
    }
  };

  getProgress = (collected, goal) => {
    const percent = parseInt(collected * 100 / goal);
    let state = 'info';
    if (percent >= 80) {
      state = 'danger';
    } else if (percent >= 60) {
      state = 'warning';
    } else if (percent >= 40) {
      state = 'success';
    }
    return { percent, state };
  };

  listenEventToUpdate = async () => {
    const { contract } = this.state;
    contract.Campaigns.events.allEvents({
      fromBlock: 'latest'
    }, (error, result) => {
      if (error === false && result !== null) {
        this.getInfo(); // update front-end when new event emitted
      }
    });
  };

  handleChange = (e) => {
    if (e.target.value !== '') {
      const amount = parseInt(e.target.value);
      if (isNaN(amount)) {
        e.target.value = '';
        this.setState({ amount: 0 });
        return;
      }
      this.setState({ amount })
    } else {
      this.setState({ amount: 0 });
    }
  };

  handleFund = async () => {
    const { id, amount, balance, account, contract } = this.state;
    if (amount > balance) {
      alert('You do not have enough tokens');
      return;
    }
    if (amount <= 0) {
      alert('You must ENTER number token that you want deposit');
      return;
    }
    this.setState({ isProcessing: true });
    contract.Campaigns.methods.invest(id, amount).send({
      from: account
    }).on('transactionHash', hash => {
      if (hash !== null) {
        this.resetForm();
        this.handleTransactionReceipt(hash);
      }
    }).on('error', err => {
      if (err !== null) {
        this.setState({ isProcessing: false });
      }
    });
  };

  handleRefund = async () => {
    const { id, amount, tokenBacked, account, contract } = this.state;
    if (amount > tokenBacked) {
      alert('You can only enter the current value that you currently have');
      return;
    }
    if (amount <= 0) {
      alert('You must ENTER number token that you want deposit');
      return;
    }
    this.setState({ isProcessing: true });
    contract.Campaigns.methods.claimRefund(id, amount).send({
      from: account
    }).on('transactionHash', hash => {
      if (hash !== null) {
        this.resetForm();
        this.handleTransactionReceipt(hash);
      }
    }).on('error', err => {
      if (err !== null) {
        this.setState({ isProcessing: false });
      }
    });
  };

  handleWithdraw = async () => {
    const { id, account, contract } = this.state;

    this.setState({ isProcessing: true });
    contract.Campaigns.methods.endCampaign(id).send({
      from: account
    }).on('transactionHash', hash => {
      if (hash !== null) {
        this.handleTransactionReceipt(hash);
      }
    }).on('error', err => {
      if (err !== null) {
        this.setState({ isProcessing: false });
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
    this.setState({ amount: 0 }); // reset
    this.refs.amount.value = '';
  };

  render() {
    if (!this.state.web3) {
      return <Loading text="Loading web3, account, contract" />;
    }
    const { campaign } = this.state;
    const renderCampaignInfo = this.state.isExist && (
      <Card>
        <Card.Header>
          <b><FontAwesomeIcon icon="parachute-box" /> {campaign.name}</b>
        </Card.Header>
        <Card.Body className="p-1">
          <ListGroup>
            <ListGroup.Item>
              <b><FontAwesomeIcon icon="user-tie" /> Owner:</b> {campaign.owner}
            </ListGroup.Item>
            <ListGroup.Item>
              <b><FontAwesomeIcon icon="calendar-plus" /> Created: </b>
              <TimeFormatter time={campaign.startDate} />
            </ListGroup.Item>
            <ListGroup.Item>
              <b><FontAwesomeIcon icon="calendar-check" /> Deadline: </b>
              <TimeFormatter time={campaign.endDate} />
            </ListGroup.Item>
            <ListGroup.Item><b><FontAwesomeIcon icon="signal" /> Progress: </b>
              {campaign.collected} / {campaign.goal} tokens ({this.state.campaignStatusChr[campaign.status]})
            <ProgressBar now={campaign.progress.percent} label={`${campaign.progress.percent}%`} variant={campaign.progress.state} />
            </ListGroup.Item>
          </ListGroup>

        </Card.Body>
      </Card>
    );


    const renderBackerPanel = this.state.isExist && <Card>
      <Card.Header>
        <FontAwesomeIcon icon="life-ring" />
        <b> Back this project</b>
      </Card.Header>
      <Card.Body className="p-1">
        <ListGroup>
          {this.state.tokenBacked > 0 && (
            <ListGroup.Item>
              <FontAwesomeIcon icon="money-bill" /> You have backed <b>{this.state.tokenBacked}</b> tokens
            </ListGroup.Item>
          )}
          <ListGroup.Item>
            <FontAwesomeIcon icon="user" />
            <b> Backers:</b> {this.state.numberOfInvestor}
          </ListGroup.Item>
          <ListGroup.Item>
            <FontAwesomeIcon icon="cart-plus" />
            <b> Available:</b> {campaign.available} tokens
          </ListGroup.Item>
          {
            campaign.fundEnabled && (
              <ListGroup.Item>
                <InputGroup>
                  <Form.Control
                    type="number"
                    placeholder="Number of tokens"
                    ref='amount'
                    onChange={this.handleChange} />
                  <InputGroup.Append>
                    {campaign.available > 0 && (
                      <Button variant="success" onClick={this.handleFund}>Fund</Button>
                    )}
                    {this.state.tokenBacked > 0 && (
                      <Button variant="secondary" onClick={this.handleRefund}>Refund</Button>
                    )}
                  </InputGroup.Append>
                </InputGroup>
              </ListGroup.Item>
            )
          }

          <ListGroup.Item>
            <FontAwesomeIcon icon="coins" />
            <b> Your token:</b> {this.state.balance}
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>;

    const renderOwnerPanel = <Card>
      <Card.Header>
        <b><FontAwesomeIcon icon="cog" /> Panel</b>
      </Card.Header>
      <Card.Body>
        <ListGroup>
          <ListGroup.Item>
            <FontAwesomeIcon icon="user" />
            <b> Backers:</b> {this.state.numberOfInvestor}
            </ListGroup.Item>
          {campaign.fundEnabled ?
            <ListGroup.Item variant="warning">Campaign is during, you don't have any access</ListGroup.Item>
            : (campaign.status === 1 ? (
              <ListGroup.Item variant="warning">Campaign is failed, you don't have any access</ListGroup.Item>
            ) : (
                campaign.finStatus === 2 ? (
                  <ListGroup.Item variant="warning">Campaign is paid, you don't have any access</ListGroup.Item>
                ) : (
                    <ListGroup.Item variant="success">
                      Campaign is success, you can call a withdraw for campaign
                <Button variant="danger" onClick={this.handleWithdraw}>Withdraw</Button>
                    </ListGroup.Item>
                  )
              ))
          }
        </ListGroup>
      </Card.Body>
    </Card>;

    return (
      this.state.isLoading ? (
        <Loading />
      ) : (
          this.state.isExist ? (
            <div>
              {this.state.isProcessing && (
                <Loading text="Pending..." />
              )}
              <Row className="pt-1">
                <Col sm={12} md={12} lg={7} xl={7}>
                  {renderCampaignInfo}
                </Col>
                <Col sm={12} md={12} lg={5} xl={5}>
                  {campaign.owner === this.state.account ?
                    renderOwnerPanel : renderBackerPanel
                  }
                </Col>
              </Row>
            </div>

          ) : (
              <Row className="pt-1">
                <Col sm={12}>
                  <Alert variant="danger">ID campaign does not exist</Alert>
                </Col>
              </Row>
            )
        )
    );
  }
}

export default Campaign;
