import React, { Component, Fragment } from "react";
import ReactMarkdown from "react-markdown";
import _ from "lodash";
import {
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@material-ui/core";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import clsx from "clsx";

export default class DetailsDescription extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      isOpenMarkDown: false
    };
  }

  handleChangeText = e => {
    const { sendToParents } = this.props;
    this.setState({
      text: e.target.value
    });
    sendToParents(e.target.value);
  };

  handleShowMarkDown = () => {
    this.setState({
      isOpenMarkDown: !this.state.isOpenMarkDown
    });
  };

  render() {
    const { text, isOpenMarkDown } = this.state;
    const { error } = this.props;
    return (
      <Fragment>
        <label
          className={clsx("MuiFormLabel-root", error && "error")}
          style={{ fontSize: "13px" }}
        >
          Description
        </label>
        <div style={{ display: "flex", alignItems: "center" }}>
          <TextareaAutosize
            rows={10}
            aria-label="maximum height"
            placeholder="Tell me a story"
            value={text}
            onChange={this.handleChangeText}
            error
            style={{ width: "100%", resize: "vertical" }}
          />
          <Button
            variant="outlined"
            color="primary"
            onClick={this.handleShowMarkDown}
          >
            Preview
          </Button>
        </div>
        <p
          className={clsx(
            "MuiFormHelperText-root Mui-required",
            error && "error"
          )}
        >
          Min: 250, Max: 10000 characters. You can type as Markdown format.
        </p>
        <Dialog
          open={isOpenMarkDown}
          onClose={this.handleShowMarkDown}
          maxWidth={false}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Preview</DialogTitle>
          <DialogContent>
            {_.isEmpty(text) && <span>Nothing to preview</span>}
            {!_.isEmpty(text) && <ReactMarkdown source={text} />}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleShowMarkDown} color="primary">
              Agree
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    );
  }
}
