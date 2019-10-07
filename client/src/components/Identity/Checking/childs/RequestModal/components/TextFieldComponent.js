import React, { Component, Fragment } from 'react';
import _ from 'lodash'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment';

const TextFieldComponent = ({ fieldName, labelName, IconComponent, dataUser, ...props }) => {
  let value = _.get(dataUser, [fieldName], '' )
  return (
    <TextField name={fieldName}
      id={fieldName}
      value={value}
      {...props}
      label={labelName}
      InputProps={{
        readOnly: true,
        startAdornment: (
          <InputAdornment position="start">
            {IconComponent}
          </InputAdornment>
        ),
      }}
      className='form-control'
    />
  )
}

export default TextFieldComponent
