import React, { Component, Fragment } from 'react'
import { Card, Grid } from '@material-ui/core/';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import getAllVerifier from '../../../utils/modules/getAllVerifier'
import Loading from '../../../utils/Loading2';
import AddVerifier from './AddVerifier';
import './AdminPanel.scss'
class AdminPanel extends Component {

  constructor(props) {
    const { users } = props;
    super(props);
    this.state = {
      data: {},
      isLoading: true,
      web3: users.data.web3,
      account: users.data.account,
      contractIdentity: users.data.contractIdentity,
      listAddressVerifier: []
    }
  }

  componentDidMount() {
    this.loadAccountInfo()
  };

  loadAccountInfo = () => {
    const { contractIdentity, account } = this.state;
    contractIdentity.methods.isOwner().call({
      from: account
    }).then(res => {
      if (res) {
        getAllVerifier(contractIdentity, account).then(res => {
          this.setState({
            listAddressVerifier: res,
            isLoading: false
          })
        })
      }
      else {
        // deny access
        this.props.history.push('/')
      }
    })
  }

  renderData = () => {
    const { listAddressVerifier } = this.state
    if (_.isEmpty(listAddressVerifier)) return
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
    const { contractIdentity, account } = this.state;
    this.setState({
      isLoading: true
    })
    contractIdentity.methods.addVerifier(verifier.address, verifier.publicKey
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
    
    this.setState({
      isLoading: false
    })

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

export default withRouter(AdminPanel)
