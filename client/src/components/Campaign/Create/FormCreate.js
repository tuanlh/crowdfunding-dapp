import React, { Component } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import _ from 'lodash';
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  withStyles,
  Button
} from '@material-ui/core/';
import validate from 'url-validator';
import { Send } from '@material-ui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import DetailsDescription from './DetailsDescription';
import './FormCreate.scss'
const useStyles = theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(3),
    width: '100%'
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: '18px'
  },
  centerButton: {
    textAlign: 'center',
    marginTop: theme.spacing(3)
  }
});
const INPUT_FIELD = 6
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
        desc: value
      },
      error: {
        ...prevState.error,
        desc: inputIsError
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
      case 'name':
        if (value.length >= 30 && value.length <= 300) inputIsError = false;
        break;
      case 'goal':
        value = parseInt(value);
        if (value >= 1000 && value <= 1000000000) inputIsError = false;
        break;
      case 'short_desc':
        if (value.length >= 100 && value.length <= 300) inputIsError = false;
        break;
      case 'thumbnail':
        const url = validate(value);
        if (url === value) inputIsError = false;
        break;
      case 'time':
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

  handleSubmitForm = (e) => {
    e.preventDefault()
    const { sendDataToParents } = this.props
    const { data, recaptchaRespone } = this.state
    sendDataToParents({
      ...data,
      recaptchaRespone
    })
    this.setState({
      recaptchaRespone: null,
    })
    process.env.REACT_APP_RECAPTCHA_ENABLE === '1' && this.recaptcha.reset()
  };

  checkValidated = () => {
    const { error, recaptchaRespone } = this.state;
    if (process.env.REACT_APP_RECAPTCHA_ENABLE === '1' && _.isNil(recaptchaRespone)) {
      return true
    }
    if (_.isEmpty(error) || Object.keys(error).length !== INPUT_FIELD) {
      return true;
    }
    return _.filter(error, o => {
      return o === true;
    }).length !== 0
  };

  render() {
    const { error } = this.state;
    const { classes } = this.props;
    return (
      <div className='form-create'>
        <Card>
          <CardHeader
            avatar={<FontAwesomeIcon icon={faEdit} />}
            title='Create campaign'
            classes={{
              title: classes.titleText
            }}
          />
          <CardContent>
            <form autoComplete='off' onSubmit={this.handleSubmitForm}>
              <TextField
                label='Name'
                id='name'
                placeholder='Enter name of campaign'
                margin='normal'
                type='text'
                onChange={this.handleInput}
                error={error['name']}
                className={classes.textField}
                helperText='Min: 30, Max: 300 characters'
                required
                InputLabelProps={{
                  shrink: true
                }}
              />
              <TextField
                label='Short desciption'
                id='short_desc'
                placeholder='Enter short description'
                margin='normal'
                error={error['short_desc']}
                className={classes.textField}
                onChange={this.handleInput}
                inputProps={{ min: '100', max: '300' }}
                helperText='Min: 100, Max: 300 characters. Short description as slogan of campaign, it will be display on homepage.'
                required
                InputLabelProps={{
                  shrink: true
                }}
              />
              <div className={classes.textField} style={{ width: '100%' }}>
                <DetailsDescription
                  sendToParents={this.dataDetailsDecription}
                  id='desc'
                  error={error['desc']}
                />
              </div>
              <TextField
                label='Image thumbnail url'
                id='thumbnail'
                placeholder='Enter url of thumbnail image'
                margin='normal'
                error={error['thumbnail']}
                type='url'
                onChange={this.handleInput}
                className={classes.textField}
                helperText='Thumbnail image is best with size 286x180'
                required
                InputLabelProps={{
                  shrink: true
                }}
              />
              <TextField
                label='Goal'
                id='goal'
                placeholder='Enter goal of campaign'
                type='number'
                error={error['goal']}
                inputProps={{ min: '100000', max: '1000000000' }}
                onChange={this.handleInput}
                margin='normal'
                className={classes.textField}
                helperText='Goal range: 1000-1.000.000.000 (Testing: min 1000 tokens)'
                required
                InputLabelProps={{
                  shrink: true
                }}
              />
              <TextField
                label='Deadline'
                id='time'
                placeholder='Enter number of days'
                margin='normal'
                error={error['time']}
                type='number'
                onChange={this.handleInput}
                inputProps={{ min: '15', max: '180' }}
                className={classes.textField}
                helperText='This is time end campaign (days). Range: 15 - 180 days (In testing, min: 1 minutes)'
                required
                InputLabelProps={{
                  shrink: true
                }}
              />
              <div className={classes.textField}>
                {process.env.REACT_APP_RECAPTCHA_ENABLE === '1' && (
                  <ReCAPTCHA
                    ref={el => {
                      this.recaptcha = el;
                    }}
                    size={'normal'}
                    sitekey={process.env.REACT_APP_RECAPTCHA_SITEKEY}
                    onChange={this.handleCaptchaResponseChange}
                  />
                )}
              </div>
              <div className={classes.centerButton}>
                <Button
                  variant='contained'
                  color='primary'
                  type='submit'
                  className={classes.button}
                  disabled={this.checkValidated()}
                  onClick={e => this.handleSubmitForm(e)}
                >
                  <Send fontSize={'small'} /> &nbsp;Create campaign
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default withStyles(useStyles)(FormCreate);
