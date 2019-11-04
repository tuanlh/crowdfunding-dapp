import React, { Component } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@material-ui/core";
import _ from "lodash";
class PreviewImage extends Component {
  render() {
    const { isOpen, imageArray, handleModal } = this.props;
    return (
      <Dialog
        open={isOpen}
        onClose={handleModal}
        maxWidth={"lg"}
        fullWidth={true}
      >
        <DialogTitle>Preview Image</DialogTitle>
        <DialogContent style={{ textAlign: "center" }}>
          {_.isEmpty(imageArray) && <div>Nothing to preview</div>}
          {imageArray.map((imageURI, index) => (
            <img
              className="photo-uploaded"
              src={imageURI}
              key={index}
              alt=""
              style={{
                width: "80%",
                height: "75%"
              }}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleModal}>
            Okay
          </Button>{" "}
        </DialogActions>
      </Dialog>
    );
  }
}

export default PreviewImage;
