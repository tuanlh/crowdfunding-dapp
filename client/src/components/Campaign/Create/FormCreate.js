import React, { Component, Fragment } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import _ from "lodash";
import {
  Card,
  Grid,
  CardContent,
  CardHeader,
  TextField,
  withStyles,
  Typography,
  Button
} from "@material-ui/core/";
import validate from "url-validator";
import { Send } from "@material-ui/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import DetailsDescription from "./DetailsDescription";
const useStyles = theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(3),
    width: "100%"
  },
  titleText: {
    fontWeight: "bold",
    fontSize: "18px"
  },
  centerButton: {
    textAlign: "center",
    marginTop: theme.spacing(3)
  }
});
class FormCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recaptchaRespone: null,
      error: {},
      data: {}
    };
    this.recaptcha = null;
  }

  dataDetailsDecription = e => {
    let value = e
    let inputIsError = true
    if (value.length >= 250 && value.length <= 10000) inputIsError = false;
    this.setState(prevState => ({
      data: {
        ...prevState.data,
        ['desc']: value
      },
      error: {
        ...prevState.error,
        ['desc']: inputIsError
      }
    }));
  };

  handleCaptchaResponseChange = respone => {
    this.setState({
      recaptchaRespone: respone
    });
  };
  handleInput = e => {
    let inputIsError = true;
    let idInput = e.target.id;
    let value = e.target.value.trim();

    switch (idInput) {
      case "name":
        if (value.length >= 30 && value.length <= 300) inputIsError = false;
        break;
      case "goal":
        value = parseInt(value);
        if (value >= 100000 && value <= 1000000000) inputIsError = false;
        break;
      case "short_desc":
        if (value.length >= 100 && value.length <= 300) inputIsError = false;
        break;
      case "thumbnail":
        const url = validate(value);
        if (url === value) inputIsError = false;
        break;
      case "time":
        value = parseInt(value);
        if (value >= 15 && value <= 180) inputIsError = false;
        break;
      default:
        break;
    }
    this.setState(prevState => ({
      data: {
        ...prevState.data,
        [idInput]: value
      },
      error: {
        ...prevState.error,
        [idInput]: inputIsError
      }
    }));
  };

  handleSubmitForm = () => {
    console.log("submit");
  };

  render() {
    const { error } = this.state;
    const { classes } = this.props;
    return (
      <Fragment>
        <Card>
          <CardHeader
            avatar={<FontAwesomeIcon icon={faEdit} />}
            title="Create campaign"
            classes={{
              title: classes.titleText
            }}
          />
          <CardContent>
            <form autoComplete="off" onSubmit={this.handleSubmitForm}>
              <TextField
                label="Name"
                id="name"
                placeholder="Enter name of campaign"
                margin="normal"
                type="text"
                onChange={this.handleInput}
                error={error["name"]}
                className={classes.textField}
                helperText="Min: 30, Max: 300 characters"
                required
                InputLabelProps={{
                  shrink: true
                }}
              />
              <TextField
                label="Short desciption"
                id="short_desc"
                placeholder="Enter short description"
                margin="normal"
                error={error["short_desc"]}
                className={classes.textField}
                onChange={this.handleInput}
                inputProps={{ min: "100", max: "300" }}
                helperText="Min: 100, Max: 300 characters. Short description as slogan of campaign, it will be display on homepage."
                required
                InputLabelProps={{
                  shrink: true
                }}
              />
              <div className={classes.textField} style={{ width: "100%" }}>
                <DetailsDescription
                  sendToParents={this.dataDetailsDecription}
                  id="desc"
                  error={error['desc']}
                />
              </div>
              <TextField
                label="Image thumbnail url"
                id="thumbnail"
                placeholder="Enter url of thumbnail image"
                margin="normal"
                error={error["thumbnail"]}
                type="url"
                onChange={this.handleInput}
                className={classes.textField}
                helperText="Thumbnail image is best with size 286x180"
                required
                InputLabelProps={{
                  shrink: true
                }}
              />
              <TextField
                label="Goal"
                id="goal"
                placeholder="Enter goal of campaign"
                type="number"
                error={error["goal"]}
                inputProps={{ min: "100000", max: "1000000000" }}
                onChange={this.handleInput}
                margin="normal"
                className={classes.textField}
                helperText="Goal range: 100.000-1.000.000.000 (Testing: min 1000 tokens)"
                required
                InputLabelProps={{
                  shrink: true
                }}
              />
              <TextField
                label="Deadline"
                id="time"
                placeholder="Enter number of days"
                margin="normal"
                error={error["time"]}
                type="number"
                onChange={this.handleInput}
                inputProps={{ min: "15", max: "180" }}
                className={classes.textField}
                helperText="This is time end campaign (days). Range: 15 - 180 days (In testing, min: 1 minutes)"
                required
                InputLabelProps={{
                  shrink: true
                }}
              />
              <div>
                {process.env.REACT_APP_RECAPTCHA_ENABLE === "1" && (
                  <ReCAPTCHA
                    ref={el => {
                      this.recaptcha = el;
                    }}
                    sitekey={process.env.REACT_APP_RECAPTCHA_SITEKEY}
                    onChange={this.handleCaptchaResponseChange}
                  />
                )}
              </div>
              <div className={classes.centerButton}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  className={classes.button}
                  disabled={
                    Object.keys(error).length === 5
                      ? _.filter(error, o => {
                          return o === true;
                        }).length !== 0
                      : true || _.isEmpty(error)
                  }
                  onClick={e => this.handleSubmitForm(e)}
                >
                  <Send fontSize={"small"} /> &nbsp;Create campaign
                </Button>
              </div>
            </form>
          </CardContent>
          {/*
          <Card.Body>
            <Form>

              <Button
                variant="success"
                onClick={this.handleClick}
                disabled={
                  !(this.state.isValidName &&
                    this.state.isValidDesc &&
                    this.state.isValidShortDesc &&
                    this.state.isValidThumbnail &&
                    this.state.isValidGoal &&
                    this.state.isValidTime &&
                    (this.state.recaptchaRespone !== '' || process.env.REACT_APP_RECAPTCHA_ENABLE === '0') &&
                    !this.state.isProcessing)}>
                <FontAwesomeIcon icon="plus-circle" /> CREATE
         </Button>
            </Form>
          </Card.Body> */}
        </Card>
      </Fragment>
    );
  }
}

export default withStyles(useStyles)(FormCreate);
