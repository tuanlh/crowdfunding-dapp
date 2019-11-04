import React from 'react';
import _ from 'lodash'
import TextField from '@material-ui/core/TextField'
import { withStyles } from "@material-ui/styles";
import InputAdornment from '@material-ui/core/InputAdornment';
const customStyle = theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(3),
    width: '100%'
  },
})
const TextFieldComponent = ({ classes, fieldName, labelName, IconComponent, dataUser, ...props }) => {
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
      className={classes.textField}
    />
  )
}

export default withStyles(customStyle)(TextFieldComponent)
