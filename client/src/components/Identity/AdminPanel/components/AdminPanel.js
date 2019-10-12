import React, { Component, Fragment } from 'react'
import { Card, Grid } from '@material-ui/core/';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import _ from 'lodash'

import getAllVerifier from '../../../utils/modules/getAllVerifier'
import Loading from '../../../utils/Loading2';
import getWeb3 from "../../../../utils/getWeb3";
import Identity from "../../../../contracts/Identity.json";
import AddVerifier from './AddVerifier';
import './AdminPanel.scss'
export default class AdminPanel extends Component {
  constructor(props) {
    console.log('asd')
    super(props);
    this.state = {
      data: {},
      web3: '',
      account: '',
      contract: '',
      isLoading: true,
      listAddressVerifier: []
    }
  }

  async componentDidMount() {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Identity.networks[networkId];
      const instance = new web3.eth.Contract(
        Identity.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState(
        { web3, account: accounts[0], contract: instance},
        this.loadAccountInfo
      );
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, account, or contract. Check console for details.`
      );
      console.error(error);
    }
  };
  loadAccountInfo = () => {
    const { contract, account } = this.state;
    contract.methods.isOwner().call({
      from: account
    }).then(res => {
      if(res) {
        getAllVerifier(contract, account).then(res => {
          this.setState({
            listAddressVerifier: res,
            isLoading: false
          })
        })
      }
      else {
        // deny access
      }
    })
  }

  renderData = () => {
    const { listAddressVerifier } = this.state
    if(_.isEmpty(listAddressVerifier)) return
    let result = listAddressVerifier.map((verifier) => (
      <TableRow key={verifier.address}>
        <TableCell component="th" scope="row">
          {verifier.address}
        </TableCell>
        <TableCell align="right">{verifier.publicKey}</TableCell>
        <TableCell align="right">{verifier.task}</TableCell>
      </TableRow>
    ))
    return result
  }
  handleAddVerifier = (verifier) => {
    const { contract, account } = this.state;
    contract.methods.addVerifier(verifier.address, verifier.publicKey
    ).send({
      from: account
    }).on('transactionHash', hash => {
      if (hash !== null) {
        this.handleTransactionReceipt(hash)
      }
    }).on('error', err => {
      if (err !== null) {
        // this.setState({ isProcessing: false });
        // this.recaptcha.reset();
      }
    })
  }

  handleTransactionReceipt = async (hash) => {
    const { web3 } = this.state;
    let receipt = null;
    while (receipt === null) {
      receipt = await web3.eth.getTransactionReceipt(hash);
    }

    if (receipt.status === true) {
      console.log('---Success---')
      // this.showError("Success", "bottom-center", 'success');
    } else {
      console.log('--Failed---')
      // this.showError("Failed", "bottom-center");       
    }
  }

  render() {
    const { isLoading } = this.state
    return (
      <Fragment>
        {
          isLoading && <Loading />
        }
        {
          !isLoading &&
          <Grid container spacing={3} className='admin-panel'>
            <Grid item xs={12}>
              <AddVerifier handleAddVerifier={this.handleAddVerifier} />
            </Grid>
            <Grid item xs={12}>
              <Card>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Address</TableCell>
                      <TableCell align="right">Public Key</TableCell>
                      <TableCell align="right">Task Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      this.renderData()
                    }
                  </TableBody>
                </Table>
              </Card>
            </Grid>
          </Grid>
        }
      </Fragment>
    )
  }
}
