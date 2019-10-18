import React, { Component, Fragment } from 'react';
import { TextField, withStyles } from '@material-ui/core';

const useStyles = theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    // marginTop: theme.spacing(3), 
    width: "100%"
  },
})

class PublicIdentity extends Component {
  render() {
    const { handleChange, classes } = this.props
    return (
      <Fragment>
        <div className='position-relative form-group'>
          <TextField name='fullName'
            id='fullName'
            placeholder='Full Name'
            required
            label='Full Name'
            type='text'
            className={classes.textField} onChange={handleChange}
          />
        </div>
        <div className='position-relative form-group'>
          <TextField name='located'
            id='located'
            placeholder='Located'
            label='Located'
            required
            type='text'
            className={classes.textField} onChange={handleChange}
          />
        </div>
        <div className='position-relative form-group'>
          <TextField name='dob' id='dob'
            required type="date" className={classes.textField} InputLabelProps={{
              shrink: true,
            }}
            label='Date of Birth'
            onChange={handleChange}
          />
        </div>
      </Fragment>
    );
  }
}

export default withStyles(useStyles)(PublicIdentity);
