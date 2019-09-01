import React, { Component, Fragment } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CustomButton from '../childs/CustomButton'
import { backgrimageView, backgrimageReq } from '../moudles/const'
const TableChild = ({data}) => {
  let result = []
  result = data.map((node,index) => {
    return (
    <TableRow key={index}>
        <TableCell component="th" scope="row">
          {node.address}
        </TableCell>
        <TableCell align="right">{node.name}</TableCell>
        <TableCell align="right">{node.status}</TableCell>
        <TableCell align="right">
          {
            node.status !== 'pending' &&
            <CustomButton variant="contained" backgrimage={backgrimageView}>
              View
            </CustomButton>
          }
          {
            node.status === 'pending' && 
            <CustomButton variant="contained" backgrimage={backgrimageReq}
            style={{
              width: '25%'
            }}
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
      data : [
        {
          address: '0x1234',
          name: 'NVA',
          status: 'pending'
        },
        {
          address: '0x1456',
          name: 'NVB',
          status: 'success'
        },
        {
          address: '0x1789',
          name: 'NVC',
          status: 'failed'
        },
        {
          address: '0x1334',
          name: 'NVD',
          status: 'confirming'
        }
      ]
    }
  }
  
  render() {
    let { data } = this.state
    const classes = makeStyles(theme => ({
      root: {
        width: '100%',
        marginTop: theme.spacing(3),
        overflowX: 'auto',
      },
      table: {
        minWidth: 650,
      },
    }));

    return (
      <Fragment>
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Address</TableCell>
                <TableCell align="right">Name</TableCell>
                <TableCell align="right">Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableChild data={data} />
            </TableBody>
          </Table>
        </Paper>
      </Fragment>
    )
  }
}
