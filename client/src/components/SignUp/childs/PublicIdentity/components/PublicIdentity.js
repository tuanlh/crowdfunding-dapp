import React, { Component, Fragment } from 'react';
import { TextField } from '@material-ui/core';


class PublicIdentity extends Component {
  render() {
    const { handleChange } = this.props
    return (
      <Fragment>
        <div className='position-relative form-group'>
          <TextField name='fullName'
            id='fullName'
            placeholder='Full Name'
            required
            label='Full Name'
            type='text'
            className='form-control' onChange={handleChange}
          />
        </div>
        <div className='position-relative form-group'>
          <TextField name='located'
            id='located'
            placeholder='Located'
            label='Located'
            required
            type='text'
            className='form-control' onChange={handleChange}
          />
        </div>
        <div className='position-relative form-group'>
          <TextField type='email'
            className='form-control'
            onChange={handleChange} name='email'
            required placeholder='Enter a valid email address'
            id='email'
            label='Email'
          />
        </div>
        <div className='position-relative form-group'>
          <TextField id='pass' name='password' id='password'
            required type='password' className='form-control'
            label='Password'
            onChange={handleChange}
          />
        </div>
      </Fragment>
    );
  }
}

export default PublicIdentity;
