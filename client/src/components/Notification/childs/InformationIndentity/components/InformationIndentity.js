import React, { Component, Fragment } from 'react'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
export default class InformationIndentity extends Component {
  constructor(props) {
    super(props);
    
  }
  
  render() {
    const { open, handleDialog } = this.props
    return (
      <Fragment>
        <Dialog open={open} onClose={handleDialog} aria-labelledby='form-dialog-title'>
          <DialogTitle id='form-dialog-title'>Subscribe</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To subscribe to this website, please enter your email address here. We will send updates
              occasionally.
          </DialogContentText>
            <TextField
              autoFocus
              margin='dense'
              id='name'
              label='Email Address'
              type='email'
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialog} color='primary'>
              Cancel
          </Button>
            <Button onClick={handleDialog} color='primary'>
              Subscribe
          </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    )
  }
}
