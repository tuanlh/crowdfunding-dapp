import React, { Component, Fragment } from 'react'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
export default class InformationIndentity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPassword: false
    }
  }
  handleClickShowPassword = () => {
    this.setState({
      showPassword: !this.state.showPassword
    })
  }

  render() {
    const { showPassword } = this.state
    const { open, handleDialog, data, handleChange, password, handleDialogAccept } = this.props
    return (
      <Fragment>
        <Dialog open={open} onClose={handleDialog} aria-labelledby='form-dialog-title'>
          <DialogTitle id='form-dialog-title'>Request Verify Information</DialogTitle>
          <DialogContent>
            <Fragment>
              <TextField
                id='addressVertifier'
                label='Address Vertifier'
                defaultValue={data.addressVertifier}
                margin='normal'
                InputProps={{
                  readOnly: true,
                }}
                variant='filled'
              />
              <TextField
                id='publicKey'
                label='Public Key'
                defaultValue={data.publicKey}
                margin='normal'
                InputProps={{
                  readOnly: true,
                }}
                variant='filled'
              />
            </Fragment>
          </DialogContent>
          <DialogContent>
            <TextField
              id='password'
              variant='filled'
              type={showPassword ? 'text' : 'password'}
              label='Password'
              value={password}
              style={{ width: '100%' }}
              onChange={(e) => handleChange(e)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      aria-label='toggle password visibility'
                      onClick={this.handleClickShowPassword}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialog} color='primary'>
              Cancel
          </Button>
            <Button onClick={() => handleDialogAccept(password)} color='primary'>
              Submit
          </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    )
  }
}
