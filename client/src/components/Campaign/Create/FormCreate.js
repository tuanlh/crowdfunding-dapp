import React, { Component, Fragment } from 'react'
import { Card, Grid, CardContent, CardHeader, TextField, withStyles, Typography } from '@material-ui/core/';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import DetailsDescription from './DetailsDescription';
import { convertToRaw } from 'draft-js';
const useStyles = theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: '100%',
  },
  titleText: {
    fontWeight: "bold",
    fontSize: '18px'
  }
})
class FormCreate extends Component {
  dataDetailsDecription = e => {
    console.log(e)
  }
  render() {
    const { classes } = this.props
    return (
      <Fragment>
        <Card>
          <CardHeader
            avatar={
              <FontAwesomeIcon icon={faEdit} />
            }
            title='Create campaign'
            classes={{
              title: classes.titleText
            }}
          />
          <CardContent>
            <form autoComplete='off'>
              <TextField
                label="Name"
                placeholder='Enter name of campaign'
                margin="normal"
                className={classes.textField}
                helperText='Min: 30, Max: 300 characters'
              />
              <TextField
                label="Short desciption"
                placeholder='Enter short description'
                margin="normal"
                className={classes.textField}
                helperText='Min: 100, Max: 300 characters. Short description as slogan of campaign, it will be display on homepage.'
              />
              <div className={classes.textField} style={{ width: '100%' }}>
                <DetailsDescription
                  sendToParents={this.dataDetailsDecription}
                />
              </div>
              {/* <TextField
                label="Short desciption"
                placeholder='Enter short description'
                margin="normal"
                className={classes.textField}
                helperText='Min: 250, Max: 10000 characters. You can type as Markdown format.'
              /> */}
            </form>
          </CardContent>
          {/*
          <Card.Body>
            <Form>
              <Form.Group controlId="name">
                <Form.Label>{requiredChar} Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter name of campaign"
                  isInvalid={!this.state.isValidName && this.state.nameEnter}
                  isValid={this.state.isValidName && this.state.nameEnter}
                  onChange={this.handleInput} />
                <Form.Text className="text-muted">
                  Min: 30, Max: 300 characters
           </Form.Text>
              </Form.Group>
              <Form.Group controlId="short_desc">
                <Form.Label>{requiredChar} Short desciption</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter short description"
                  isInvalid={!this.state.isValidShortDesc && this.state.shortDescEnter}
                  isValid={this.state.isValidShortDesc && this.state.shortDescEnter}
                  onChange={this.handleInput} />
                <Form.Text className="text-muted">
                  Min: 100, Max: 300 characters. Short description as slogan of campaign, it will be display on homepage.
           </Form.Text>
              </Form.Group>
              <Form.Group controlId="desc">
                <Form.Label>{requiredChar} Desciption</Form.Label>
                <Form.Control
                  as="textarea"
                  rows="7"
                  isInvalid={!this.state.isValidDesc && this.state.descEnter}
                  isValid={this.state.isValidDesc && this.state.descEnter}
                  onChange={this.handleInput} />
                <Form.Text className="text-muted">
                  Min: 250, Max: 10000 characters. You can type as Markdown format.
           </Form.Text>
              </Form.Group>
              <Form.Group controlId="thumbnail">
                <Form.Label>{requiredChar} Image thumbnail url</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter url of thumbnail image"
                  isInvalid={!this.state.isValidThumbnail && this.state.thumbnailEnter}
                  isValid={this.state.isValidThumbnail && this.state.thumbnailEnter}
                  onChange={this.handleInput} />
                <Form.Text className="text-muted">
                  Thumbnail image is best with size 286x180
           </Form.Text>
              </Form.Group>
              <Form.Group controlId="goal">
                <Form.Label>{requiredChar} Goal</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter goal of campaign"
                  isInvalid={!this.state.isValidGoal && this.state.goalEnter}
                  isValid={this.state.isValidGoal && this.state.goalEnter}
                  onChange={this.handleInput} />
                <Form.Text className="text-muted">
                  Goal range: 100.000-1.000.000.000 (Testing: min 1000 tokens)
           </Form.Text>
              </Form.Group>
              <Form.Group controlId="time">
                <Form.Label>{requiredChar} Deadline</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter number of days"
                  isInvalid={!this.state.isValidTime && this.state.timeEnter}
                  isValid={this.state.isValidTime && this.state.timeEnter}
                  onChange={this.handleInput} />
                <Form.Text className="text-muted">
                  This is time end campaign (days). Range: 15 - 180 days (In testing, min: 1 minutes)
           </Form.Text>
              </Form.Group>
              <Form.Group>
                {process.env.REACT_APP_RECAPTCHA_ENABLE === '1' &&
                  <ReCAPTCHA
                    ref={(el) => { this.recaptcha = el; }}
                    sitekey={process.env.REACT_APP_RECAPTCHA_SITEKEY}
                    onChange={this.handleCaptchaResponseChange}
                  />
                }

              </Form.Group>
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
    )
  }
}

export default withStyles(useStyles)(FormCreate)
