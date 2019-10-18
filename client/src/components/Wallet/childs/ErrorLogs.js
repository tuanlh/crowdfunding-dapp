import React, { Component } from 'react'
import {
  Card,
  Grid,
  CardContent,
  CardHeader,
  withStyles,
  TextField,
  Typography,
  Button
} from "@material-ui/core/";
import _ from "lodash";
const useStyles = theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: "100%"
  },
});

class ErrorLogs extends Component {
  render() {
    return (
      <div>

      </div>
    )
  }
}

export default withStyles(useStyles)(ErrorLogs);
