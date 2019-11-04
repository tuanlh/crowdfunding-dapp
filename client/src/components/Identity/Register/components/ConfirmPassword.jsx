import React, { Fragment } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@material-ui/core";

export default class ConfirmPassword extends React.PureComponent {
  handleDataConfirm = () => {
    const { handleDataConfirm } = this.props;
    handleDataConfirm();
  };

  render() {
    const { openConfirm, handleShowConfirm } = this.props;
    return (
      <Fragment>
        <Dialog
          open={openConfirm}
          onClose={handleShowConfirm}
          className={this.props.className}
          maxWidth={"sm"}
          fullWidth={true}
        >
          <DialogTitle>Terms</DialogTitle>
          <DialogContent>
            <label>Terms</label>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.handleDataConfirm}>
              Do Something
            </Button>{" "}
            <Button color="secondary" onClick={handleShowConfirm}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    );
  }
}

ConfirmPassword.propTypes = {
  openConfirm: PropTypes.bool,
  handleDataConfirm: PropTypes.func,
  handleShowConfirm: PropTypes.func
};
