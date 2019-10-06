import React, { Component, Fragment } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import _ from 'lodash'
import getWeb3 from "../../../../utils/getWeb3";
import Identity from "../../../../contracts/Identity.json";
// import Typography from '@material-ui/core/Typography';
import CustomButton from '../childs/CustomButton'
import RequestModal from '../childs/RequestModal';
import ViewInfoModal from '../childs/ViewInfoModal';

import { backgrimageView, backgrimageReq } from '../moudles/const'

import Loading from "../../../utils/Loading2/index";

const TableChild = ({ data, handleShowInfor, handleRequest }) => {
  let result = []
  result = data.map((node, index) => {
    return (
      <TableRow key={index}>
        <TableCell component='th' scope='row'>
          {node}
        </TableCell>
        <TableCell align='right'>
          <CustomButton
            variant='contained'
            backgrimage={backgrimageReq}
            style={{
              width: '24.5%'
            }}
            onClick={() => handleRequest(node)}
          >
            View
          </CustomButton>
        </TableCell>
      </TableRow>
    )
  })

  return result
}

export default class CheckingIdentity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isOpenRequest: false,
      isOpenView: false,
      isLoading: true,
      dataUser: {},
      web3: null,
      account: null,
      contract: null
    }
    this.fileInput = React.createRef();

  }

  componentDidMount = async () => {
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
      this.setState({
        web3,
        account: accounts[0],
        contract: instance
      }, () => {
        this.loadAccountInfo()
      });
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
    this.getUser()
  };

  handleShowInfor = (node_address) => {
    console.log('handle show infor', node_address)
    this.handleModal('isOpenView')
  }

  handleRequest = (user_address) => {
    this.showInfoUser(user_address).then(res => {
      this.setState({
        dataUser: res
      }, () => {
        this.handleModal('isOpenRequest')
      })
    })
  }

  getUser = () => {
    const { web3, account, contract } = this.state
    contract.methods.getUsers().call({
      from: account
    }).then(res => {
      this.setState({
        data: res,
        isLoading: false
      })
    })
  }

  showInfoUser = (user_address) => {
    const { contract, account } = this.state
    return new Promise(resolve => {
      contract.methods.getIdentity(user_address).call({
        from: account
      }).then(res => {
        resolve(res)
      })
    })
  }

  handleModal = (name) => {
    console.log('modal')
    this.setState({
      [name]: !this.state[name]
    })
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  render() {
    let { data, isOpenRequest, isOpenView, isLoading, dataUser } = this.state
    const classes = makeStyles(theme => ({
      root: {
        width: '100%',
        marginTop: theme.spacing(5),
        overflowX: 'auto',
      },
      table: {
        minWidth: 650,
      },
    }));
    return (
      <Fragment>
        {
          isLoading && <Loading />
        }
        {
          !isLoading && <div className='card'>
            <div className='card-header'>234</div>
            <div className='card-body' style={{ padding: '0px' }}>
              <Paper className={classes.root}>
                <Table className={classes.table}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Address</TableCell>
                      <TableCell align='right'>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableChild
                      data={data}
                      handleShowInfor={this.handleShowInfor}
                      handleRequest={this.handleRequest}
                    />
                    {
                      isOpenRequest && <RequestModal
                        isOpen={isOpenRequest}
                        dataUser={dataUser}
                        fileInput={this.fileInput}
                        handleModal={() => this.handleModal('isOpenRequest')}
                        privateKeyData={this.privateKeyData}
                      />
                    }
                    {
                      isOpenView && <ViewInfoModal
                        isOpen={isOpenView}
                        handleModal={() => this.handleModal('isOpenView')}
                      />
                    }
                  </TableBody>
                </Table>
              </Paper>
            </div>
          </div>
        }
      </Fragment>
    )
  }
}
