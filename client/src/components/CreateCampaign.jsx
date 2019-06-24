import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Recaptcha from 'react-recaptcha';
import Campaigns from '../contracts/Campaigns.json';
import { Row, Col, Card, Alert, Form, Button, Spinner } from 'react-bootstrap';
//import ReactMarkdown from 'react-markdown';
import getWeb3 from '../utils/getWeb3';
import Loading from './utils/Loading';
import { callAPIPost } from './action'
class CreateCampaign extends Component {
  state = {
    inputName: '',
    inputGoal: '',
    inputDesc: '',
    inputTime: '',
    isValidName: false,
    isValidGoal: false,
    isValidDesc: false,
    isValidTime: false,
    nameEnter: false,
    goalEnter: false,
    descEnter: false,
    timeEnter: false,
    loading: true,
    isProcessing: false,
    isSucceed: false,
    isFailed: false,
    web3: null,
    account: null,
    contract: null,
    isValidCaptcha: false,
    keyCaptcha: ''
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Campaigns.networks[networkId];
      const instance = new web3.eth.Contract(
        Campaigns.abi,
        deployedNetwork && deployedNetwork.address,
      );
      this.setState({ web3, account: accounts[0], contract: instance, loading: false });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  handleInput = (e) => {
    let value = e.target.value.trim();
    switch (e.target.id) {
      case 'name':
        if (!this.state.nameEnter) this.setState({ nameEnter: true });
        if (value.length >= 30 && value.length <= 300) {
          this.setState({ isValidName: true });
          this.setState({ inputName: value });
        } else {
          this.setState({ isValidName: false });
        }
        break;
      case 'goal':
        if (!this.state.goalEnter) this.setState({ goalEnter: true });
        value = parseInt(value);
        if (value >= 1000 && value <= 1000000000) {
          this.setState({ isValidGoal: true });
          this.setState({ inputGoal: value });
        } else {
          this.setState({ isValidGoal: false });
        }
        break;
      case 'desc':
        if (!this.state.descEnter) this.setState({ descEnter: true });
        if (value.length >= 250 && value.length <= 10000) {
          this.setState({ isValidDesc: true });
          this.setState({ inputDesc: value });
        } else {
          this.setState({ isValidDesc: false });
        }
        break;
      case 'time':
        if (!this.state.timeEnter) this.setState({ timeEnter: true });
        value = parseInt(value);
        if (value >= 1 && value <= 180) {
          this.setState({ isValidTime: true });
          this.setState({ inputTime: value });
        } else {
          this.setState({ isValidTime: false });
        }
        break;
      default:

        break;
    }
  };

  handleClick = () => {
    if (this.state.isValidName &&
      this.state.isValidDesc &&
      this.state.isValidGoal &&
      this.state.isValidTime) {
      const { inputName, inputGoal, inputTime, contract, account } = this.state;
      this.setState({ isProcessing: true, isFailed: false, isSucceed: false });
      // db
      callAPIPost('/content', JSON.stringify({
        keyCaptcha: this.state.keyCaptcha,
        content: this.state.inputDesc})
      ).then(res => {
        if (res.success) {
        // start campaign
          // contract.methods.createCampaign(inputName, inputTime, inputGoal).send({
          //   from: account
          // }).on('transactionHash', hash => {
          //   if (hash !== null) {
          //     this.handleTransactionReceipt(hash)
          //   }
          // }).on('error', err => {
          //   if (err !== null) {
          //     this.setState({ isProcessing: false });
          //   }
          // });
        }
      })
    }
  };

  handleTransactionReceipt = async (hash) => {
    const { web3 } = this.state;
    let receipt = null;
    while (receipt === null) {
      receipt = await web3.eth.getTransactionReceipt(hash);
    }

    if (receipt.status === true) {
      this.setState({ isSucceed: true });
    } else {
      this.setState({ isFailed: true });
    }
    this.setState({ isProcessing: false });
  };

  verifyCallback = (res) => {
    this.setState({
      isValidCaptcha: true,
      keyCaptcha: res
    })
  }
  callback = () => {
    console.log('Connect captcha successfully')
  }
  render() {
    if (!this.state.web3) {
      return <Loading text="Loading Web3, account, and contract..." />;
    }

    const Helper = <Card>
      <Card.Header>
        <b><FontAwesomeIcon icon="sticky-note" /> Notes</b>
      </Card.Header>
      <Card.Body>
        <Card.Text>
          <b>Notes 1:</b> A newly created campaign will need to wait for accept.
          The status of the campaign will be PENDING.
          During this time the campaign will not be able to perform any transactions.
          <b>In current, for testing, we set default for new campaign is Accepted.</b>
        </Card.Text>
        <Card.Text>
          <b>Notes 2:</b> After the campaign was accepted, investors can invest for campaign.
           You (creator campaign) only can withdraw amount of campaign if campaign successful
        </Card.Text>
        <Card.Text>
          <b>Notes 3:</b> A succeed campaign is reach goal and meet deadline.
        </Card.Text>
        <Card.Text>
          <b>Notes 4:</b> Any investors also can claim refund during campaign and when campaign failed. But NOT in succeed campaign
        </Card.Text>
      </Card.Body>
    </Card>;

    const requiredChar = <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>;
    const succeedState = this.state.isSucceed && (
      <Row className="pt-2">
        <Col>
          <Alert variant="success">
            <Spinner animation="grow" variant="success"  size="sm" /> Successfully!! Your campaign has been created. Please wait for us verify your campaign before public
          </Alert>
        </Col>
      </Row>
    );

    const failedState = this.state.isFailed && (
      <Row className="pt-2">
        <Col>
          <Alert variant="danger">
            <Spinner animation="grow" variant="danger"  size="sm"/> Your request has been reverted.
          </Alert>
        </Col>
      </Row>
    );

    const form = <Card>
      <Card.Header><b><FontAwesomeIcon icon="edit" /> Create campaign</b></Card.Header>
      <Card.Body>
        <Form>
          <Form.Group controlId="name">
            <Form.Label>{requiredChar} Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name of campaign"
              isInvalid={!this.state.isValidName && this.state.nameEnter}
              isValid={this.state.isValidName && this.state.nameEnter}
              onChange={this.handleInput} />
            <Form.Text className="text-muted">
              Min: 30, Max: 300 characters
          </Form.Text>
          </Form.Group>
          <Form.Group controlId="desc">
            <Form.Label>{requiredChar} Desciption</Form.Label>
            <Form.Control
              as="textarea"
              rows="3"
              isInvalid={!this.state.isValidDesc && this.state.descEnter}
              isValid={this.state.isValidDesc && this.state.descEnter}
              onChange={this.handleInput} />
            <Form.Text className="text-muted">
              Min: 250, Max: 10000 characters. You can type as Markdown format.
          </Form.Text>
          </Form.Group>
          <Form.Group controlId="goal">
            <Form.Label>{requiredChar} Goal</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter goal of campaign"
              isInvalid={!this.state.isValidGoal && this.state.goalEnter}
              isValid={this.state.isValidGoal && this.state.goalEnter}
              onChange={this.handleInput} />
            <Form.Text className="text-muted">
              Goal range: 100.000-1.000.000.000 (Testing: min 1000 tokens)
          </Form.Text>
          </Form.Group>
          <Form.Group controlId="time">
            <Form.Label>{requiredChar} Deadline</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter number of days"
              isInvalid={!this.state.isValidTime && this.state.timeEnter}
              isValid={this.state.isValidTime && this.state.timeEnter}
              onChange={this.handleInput} />
            <Form.Text className="text-muted">
              This is time end campaign (days). Range: 15 - 180 days (In testing, min: 1 minutes)
          </Form.Text>
          </Form.Group>
          <Form.Group controlId='re-captcha'>
            <Recaptcha
              sitekey="6LdUIaoUAAAAAND9ELqEtMbROc_IJ6StJOwWnrZg"
              render="explicit"
              onloadCallback={this.callback}
              verifyCallback={this.verifyCallback}
            />
          </Form.Group>
          <Button
            variant="success"
            onClick={this.handleClick}
            disabled={
              !(this.state.isValidName &&
                this.state.isValidDesc &&
                this.state.isValidGoal &&
                this.state.isValidTime &&
                this.state.isValidCaptcha &&
                !this.state.isProcessing)}>
            <FontAwesomeIcon icon="plus-circle" /> CREATE
        </Button>
        </Form>
      </Card.Body>
    </Card>;
    return (
      <div>
        {this.state.isProcessing && <Loading text="Pending..." />}
        {succeedState}
        {failedState}
        <Row className="pt-1">
          <Col sm={12} md={12} lg={9} xl={9}>
            {form}
          </Col>
          <Col sm={12} md={12} lg={3} xl={3}>
            {Helper}
          </Col>
        </Row>
      </div>
    );
  }
}

export default CreateCampaign;
