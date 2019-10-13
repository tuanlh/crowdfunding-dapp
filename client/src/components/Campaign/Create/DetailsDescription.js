import React, { Component, Fragment } from "react";
import ReactMarkdown from "react-markdown";
import _ from 'lodash'
import {
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@material-ui/core";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";

export default class DetailsDescription extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      isOpenMarkDown: false
    };
  }

  handleChangeText = e => {
    this.setState({
      text: e.target.value
    });
  };

  handleShowMarkDown = () => {
    this.setState({
      isOpenMarkDown: !this.state.isOpenMarkDown
    });
  };

  render() {
    const { text, isOpenMarkDown } = this.state;
    return (
      <Fragment>
        <label className="MuiFormLabel-root">Description</label>
        <div style={{ display: "flex", alignItems: "center" }}>
          <TextareaAutosize
            rows={10}
            aria-label="maximum height"
            placeholder="Tell me a story"
            value={text}
            onChange={this.handleChangeText}
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
        <Dialog
          open={isOpenMarkDown}
          onClose={this.handleShowMarkDown}
          maxWidth={''}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Preview
          </DialogTitle>
          <DialogContent>
            {
              _.isEmpty(text) && <span>Nothing to preview</span>
            }
            {
              !_.isEmpty(text) && <ReactMarkdown source={text} />
            }
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
