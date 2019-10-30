import React, { Component, Fragment } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button
} from "@material-ui/core/";
import { faInfo } from '@fortawesome/free-solid-svg-icons'
import { red, blue, orange } from "@material-ui/core/colors";
import { withStyles } from "@material-ui/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const customStyle = theme => ({
  denyBtn: {
    color: red[300],
    margin: theme.spacing(1)
  },
  allowBtn: {
    color: blue[500],
    margin: theme.spacing(1)
  },
  noti: {
    color: orange[400]
  }
});

class VerifierPanel extends Component {
  render() {
    const { classes, handleConfirm } = this.props;
    return (
      <Fragment>
        <Card>
          <CardContent>
            <div>
              <Typography className={classes.noti}>
                <FontAwesomeIcon icon={faInfo} /> &nbsp;
                This is project need to confirm
              </Typography>
              <div style={{ textAlign: 'center' }}>
                <Button
                  className={classes.allowBtn}
                  onClick={() => handleConfirm(true)}
                  variant="outlined"
                >
                  Allow
                    </Button>
                <Button
                  className={classes.denyBtn}
                  onClick={() => handleConfirm(false)}
                  variant="outlined"
                >
                  Deny
                    </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Fragment>
    );
  }
}

export default withStyles(customStyle)(VerifierPanel);
