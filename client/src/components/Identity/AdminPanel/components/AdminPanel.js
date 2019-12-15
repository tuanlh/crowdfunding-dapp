import React, { Component, Fragment } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Card, Grid, Fab
} from "@material-ui/core";
import { withRouter } from 'react-router-dom'
import RemoveRedEyeOutlinedIcon from '@material-ui/icons/RemoveRedEyeOutlined'

import _ from 'lodash'

import getAllVerifier from '../../../utils/modules/getAllVerifier'
import Loading from '../../../utils/Loading2';
import AddVerifier from './AddVerifier';
import showNoti from "../../../utils/Notification";

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
      listAddressVerifier: [],
      isOpenModal: false,
      pubPick: ''
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

  handleShowPub = (data) => {
    this.setState({
      pubPick: data,
      isOpenModal: true
    })
  }

  renderData = () => {
    const { listAddressVerifier } = this.state
    if (_.isEmpty(listAddressVerifier)) return
    let result = listAddressVerifier.map((verifier, index) => (
      <TableRow key={verifier.address}>
        <TableCell component="th" scope="row">
          {verifier.address}
        </TableCell>
        <TableCell>
          <Fab color="primary" aria-label="add"  onClick={() => this.handleShowPub(verifier.publicKey)} size={'small'}>
            <RemoveRedEyeOutlinedIcon />
          </Fab>
        </TableCell>
        <TableCell>{verifier.task}</TableCell>
      </TableRow>
    ))
    return result
  }

  handleAddVerifier = (verifier) => {
    const { contractIdentity, account } = this.state;

    contractIdentity.methods.addVerifier(verifier.address, verifier.publicKey
    ).send({
      from: account
    }).on('transactionHash', hash => {
      if (hash !== null) {
        showNoti({
          details: 'Please wait transaction confirm'
        })
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
      showNoti({})
      // this.showError("Success", "bottom-center", 'success');
    } else {
      showNoti({
        type: 'error'
      })

      console.log('--Failed---')
      // this.showError("Failed", "bottom-center");       
    }

  }
  handleModal = () => {
    this.setState({
      isOpenModal: !this.state.isOpenModal
    })
  }
  render() {
    const { isLoading, isOpenModal, pubPick } = this.state
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
                      <TableCell>Public Key</TableCell>
                      <TableCell>Task Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      this.renderData()
                    }
                  </TableBody>
                </Table>
              </Card>
              <Dialog
                open={isOpenModal}
                onClose={this.handleModal}
              >
                <DialogTitle>Public Key</DialogTitle>
                <DialogContent>
                  {pubPick}
                </DialogContent>
                <DialogActions>
                  <Button color="primary" onClick={this.handleModal}>
                    Okay
                  </Button>{" "}
                </DialogActions>
              </Dialog>
            </Grid>
          </Grid>
        }
      </Fragment>
    )
  }
}

export default withRouter(AdminPanel)
