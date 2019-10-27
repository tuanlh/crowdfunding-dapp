import React, { Component, Fragment } from 'react';
import { TextField, withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import RemoveRedEyeOutlinedIcon from '@material-ui/icons/RemoveRedEyeOutlined'
import _ from 'lodash'

const useStyles = theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1), 
    width: "100%"
  },
  button: {
    margin: theme.spacing(1),
  },
  input: {
    display: 'none',
  },
})

class PrivateIdentity extends Component {
  render() {
    const { handleChange, fileInput, handleFileUpload, handleModal, listVerifier, data, classes } = this.props
    return (
      <Fragment>
        <div className='position-relative form-group'>
          <TextField type='email'
            className={classes.textField}
            onChange={handleChange} name='email'
            required placeholder='Enter a valid email address'
            id='email'
            label='Email'
          />
        </div>
        <div className='position-relative form-group'>
          <TextField name='idNumber' id='idNumber' placeholder='ID Number'
            minLength='9' required className={classes.textField}
            onChange={handleChange}
            label='ID Card Number'
          />
        </div>
        <div className='position-relative form-group'>
          <TextField name='phoneNumber' id='phoneNumber' placeholder='Phone Number'
            minLength='9' required className={classes.textField} label='Phone Number'
            type='number'
            onChange={handleChange}
          />
        </div>
        <div className='position-relative form-group'>
          <TextField name='password' id='password'
            required type='password' className={classes.textField}
            label='Password'
            onChange={handleChange}
          />
        </div>
        <div className='position-relative form-group'>
          <TextField name='rePassword' id='rePassword'
            required type='password' className={classes.textField}
            label='rePassword'
            onChange={handleChange}
          />
        </div>
        <div className='position-relative form-group'>
          <FormControl style={{ width: '100%' }} required className={classes.textField}>
            <InputLabel htmlFor="verifier-required">Address Verifier</InputLabel>
            <Select
              value={data.pickVerifier || ''}
              onChange={handleChange}
              name="pickVerifier"
              inputProps={{
                id: 'verifier-required',
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {
                _.map(listVerifier, verifier => {
                  return (
                    <MenuItem key={verifier.address} value={verifier}>
                      {verifier.address}
                    </MenuItem>
                  )
                })
              }
            </Select>
          </FormControl>
        </div>
        <div className='position-relative form-group'
          style={{
            margin: '30px 0px 0px',
            textAlign: 'center'
          }}
        >
          <input id='image-file' type='file' ref={fileInput}
            accept="image/*"
            style={{
              display: 'none'
            }}
            multiple onChange={handleFileUpload}
          />
          <label htmlFor="image-file">
            <Button variant="contained" component="span" className={classes.button}>
              <AttachFileIcon /> Upload File
            </Button>
          </label>
          <label style={{ marginLeft: '25px' }}>
            <Button
              variant="contained"
              component="span"
              className={classes.button}
              onClick={handleModal}>
              <RemoveRedEyeOutlinedIcon />&nbsp;Priview File
            </Button>
          </label>
        </div>
      </Fragment>
    );
  }
}

export default withStyles(useStyles)(PrivateIdentity);
