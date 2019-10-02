import React, { Component, Fragment } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import _ from 'lodash'
// import Typography from '@material-ui/core/Typography';
import CustomButton from '../childs/CustomButton'
import RequestModal from '../childs/RequestModal';
import ViewInfoModal from '../childs/ViewInfoModal';

import { backgrimageView, backgrimageReq } from '../moudles/const'
import { decryptText, decryptImage, decryptRSA } from '../../../utils/modules/crypto'
import { callGetIPFS } from '../../../utils/modules/IPFS'

import Loading from "../../../utils/Loading2/index";

const TableChild = ({ data, handleShowInfor, handleRequest }) => {
  let result = []
  result = data.map((node, index) => {
    return (
      <TableRow key={index}>
        <TableCell component='th' scope='row'>
          {node.address}
        </TableCell>
        <TableCell align='right'>{node.fullName}</TableCell>
        <TableCell align='right'>{node.status}</TableCell>
        <TableCell align='right'>
          {
            node.status !== 'pending' &&
            <CustomButton
              variant='contained'
              backgrimage={backgrimageView}
              onClick={() => handleShowInfor(node.address)}
            >
              View
            </CustomButton>
          }
          {
            node.status === 'pending' &&
            <CustomButton
              variant='contained'
              backgrimage={backgrimageReq}
              style={{
                width: '24.5%'
              }}
              onClick={() => handleRequest(node)}
            >
              Request
            </CustomButton>
          }
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
      data: [
        {
          address: '0x1234',
          fullName: "Thanh Tung",
          located: "HCM",
          email: "123123",
          privateData: "95c5c7a39cab25f631eaff1e0c35ab15d9be28c55187cf0d2cc8bcb1bfe5532287536791417f7869a0469162",
          hashImage: "QmQGydH2DAyGt98xbEodpThysdazpvfjjiy2d6UDbUGFGE",
          serectKey: "Fmotgzhme7eAKSV1Q+R6SvLhLPBgsixnYO/tbYirxc578KjC3vX8CyAp3LarFM87wHXq1xRufBTDV2v6m5YbcaG2OPS0ndFWAXmvemNEMg6smkYnrrN31TVlwd3uRsuk5ViFWVeert57lroHoy+COFzHmf/o+Lfz3NO49LZOZX8=",
          status: 'pending'
        },
        {
          address: '0x1456',
          fullName: 'NVB',
          status: 'success'
        },
        {
          address: '0x1789',
          fullName: 'NVC',
          status: 'failed'
        },
        {
          address: '0x1334',
          fullName: 'NVD',
          status: 'confirming'
        }
      ],
      isOpenRequest: false,
      isOpenView: false,
      isLoading: false,
      dataPicked: {}
    }
    this.fileInput = React.createRef();
  }
  handleShowInfor = (node_address) => {
    console.log('handle show infor', node_address)
    this.handleModal('isOpenView')
  }

  handleRequest = (node) => {
    this.setState({
      dataPicked: node
    })
    this.handleModal('isOpenRequest')
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

  privateKeyData = async (privateKey) => {
    const { dataPicked } = this.state

    this.setState({
      isLoading: true
    })

    let data = _.cloneDeep(dataPicked)
    // get secrect key
    let secrectKey = decryptRSA(Buffer.from(data.serectKey, 'base64'), privateKey).toString()

    // encrypt data
    const keyPrivateData = ['hashImage', 'privateData']
    let privateData = ''
    let imageArray = []
    let publicData = {}
    try {
      for (var key in data) {
        if (!_.includes(keyPrivateData, key)) {
          publicData[key] = data[key]
        }
      }
      privateData = decryptText(data.privateData, secrectKey)
      // decrypt image
      await callGetIPFS(data.hashImage).then(res => {
        imageArray = this.decryptImageData(res.data, secrectKey)
        console.log(privateData)
        this.setState({
          imageArray,
          isLoading: false,
          // openPreview: true,
        })
      })
    } catch (error) {
      console.log(error)
    }
  }

  decryptImageData = (imageEncrypted, secrectKey) => {

    let dataEncryptedImage = []
    _.map(imageEncrypted, encryptedImage => {
      dataEncryptedImage.push(
        decryptImage(encryptedImage.data, secrectKey)
      )
    })
    return dataEncryptedImage
  }

  render() {
    let { data, isOpenRequest, isOpenView, isLoading } = this.state
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
            <div className='card-header' >234</div>
            <div className='card-body' style={{ padding: '0px' }}>
              <Paper className={classes.root}>
                <Table className={classes.table}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Address</TableCell>
                      <TableCell align='right'>Name</TableCell>
                      <TableCell align='right'>Status</TableCell>
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
