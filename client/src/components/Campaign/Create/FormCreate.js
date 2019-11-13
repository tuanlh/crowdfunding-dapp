import React, { Component, Fragment } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import _ from 'lodash';
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  withStyles,
  Button,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormControlLabel,
  Chip
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
  },
  formControl: {
    margin: theme.spacing(1),
    width: '100%',
    color: '#757575'
  },
  chipTags: {
    marginRight: theme.spacing(1),
  },
});
class FormCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recaptchaRespone: null,
      error: {},
      data: {
        amountStageArr: [],
        amountStage: '',
        timing: '',
        timingArr: [],
        mode: '0'
      },
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
        value = value * 60; // in test, convert second to minutes
        break;
      case 'numStage':
        value = _.toInteger(value)
        if (value >= 0) inputIsError = false;
        break;
      case 'amountStage':
      case 'mode':
        value = _.toInteger(value)
        inputIsError = false;
        break;
      case 'timing':
        value = _.toInteger(value)
        if (value >= 1) inputIsError = false;
        break
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
    if (data.mode === 0 || data.mode === 1) {
      data.timingArr = []
    } else {
      data.timingArr.unshift(0)
    }
    if (data.numStage === 1) {
      data.amountStageArr = []
    }
    delete data.amountStage
    delete data.timing
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
    // return true -> disabled button
    const { error, recaptchaRespone, data } = this.state;
    if (process.env.REACT_APP_RECAPTCHA_ENABLE === '1' && _.isNil(recaptchaRespone)) {
      return true
    }
    if (_.isEmpty(error)) {
      return true;
    }
    if (data.numStage > 1) {
      let sumAmountStage = data.amountStageArr.reduce((a, b) => +a + +b, 0)
      if (sumAmountStage !== _.get(data, 'goal', -1)) {
        return true
      }
      if (data.mode === 2 || data.mode === 3) {
        let lengthOfTiming = data.timingArr.length
        if (lengthOfTiming !== data.numStage - 1) {
          return true
        }
      }
    }
    return _.filter(error, o => {
      return o === true;
    }).length !== 0
  };

  handleCreateTags = (e, value, valueArr) => {
    if (e.key === 'Enter') {
      const { data } = this.state
      data[valueArr].push(data[value])
      this.setState(prevState => ({
        data: {
          ...prevState.data,
          [valueArr]: data[valueArr],
          [value]: ''
        }
      }));
    }
  }

  renderTags = (valueArr) => {
    const { data } = this.state;
    const { classes } = this.props
    let result = []
    if (data.numStage >= data[valueArr].length) {
      let sumAmount = data[valueArr].reduce((a, b) => +a + +b, 0)
      result = _.map(data[valueArr], (node, index) => {
        return (
          <Chip
            variant="outlined"
            color={sumAmount === _.get(data, 'goal', -1) ? 'primary' : 'secondary'}
            onDelete={() => this.handleDeleteTags(index, valueArr)}
            className={classes.chipTags}
            key={index}
            label={node}
          />
        )
      })
    }
    return result
  }
  renderTagsMode = (valueArr) => {
    const { data } = this.state;
    const { classes } = this.props
    let result = []
    result = _.map(data[valueArr], (node, index) => {
      return (
        <Chip
          variant="outlined"
          color={'primary'}
          onDelete={() => this.handleDeleteTags(index, valueArr)}
          className={classes.chipTags}
          key={index}
          label={node}
        />
      )
    })
    return result
  }
  handleDeleteTags = (index, valueArr) => {
    let { data } = this.state
    data[valueArr].splice(index, 1)
    this.setState({
      data
    })
  }

  render() {
    const { error, data } = this.state;
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
              {
                <div style={{ display: 'flex' }}>
                  <TextField
                    label='Numstage'
                    id='numStage'
                    placeholder='Enter number of stage'
                    margin='normal'
                    defaultValue={1}
                    type='number'
                    onChange={this.handleInput}
                    className={classes.textField}
                    helperText='This is number stage of project'
                    InputLabelProps={{
                      shrink: true
                    }}
                  />
                  {
                    (_.toInteger(data.numStage) >= 1 && data.numStage > data.amountStageArr.length) &&
                    <Fragment>
                      <TextField
                        label='Amount Stage'
                        id='amountStage'
                        placeholder='Enter number amount each of stage'
                        margin='normal'
                        type='number'
                        value={data.amountStage}
                        onChange={this.handleInput}
                        onKeyDown={e => this.handleCreateTags(e, 'amountStage', 'amountStageArr')}
                        className={classes.textField}
                        helperText='This is number stage of project'
                        InputLabelProps={{
                          shrink: true
                        }}
                      />
                    </Fragment>
                  }
                </div>
              }
              <div className={classes.textField}>
                {
                  this.renderTags('amountStageArr')
                }
              </div>
              {
                _.toInteger(data.numStage) >= 1 &&
                <div className={classes.textField} style={{ display: 'flex' }}>
                  <FormControl component="fieldset" className={classes.formControl}>
                    <FormLabel component="legend">Mode</FormLabel>
                    <RadioGroup aria-label="mode" value={data.mode} onChange={this.handleInput}>
                      <FormControlLabel value={0} control={<Radio id='mode' />} label="Flexible" />
                      <FormControlLabel value={1} control={<Radio id='mode' />} label="Fixed" />
                      <FormControlLabel value={2} control={<Radio id='mode' />} label="Timing Flexible" />
                      <FormControlLabel value={3} control={<Radio id='mode' />} label="Timing Fixed" />
                    </RadioGroup>
                  </FormControl>
                  {
                    ((data.mode === 2 || data.mode === 3) && (data.numStage > data.timingArr.length + 1)) &&
                    <Fragment>
                      <TextField
                        label='Timing'
                        id='timing'
                        placeholder='Enter time each of stage'
                        margin='normal'
                        type='number'
                        value={data.timing}
                        onChange={this.handleInput}
                        onKeyDown={e => this.handleCreateTags(e, 'timing', 'timingArr')}
                        className={classes.textField}
                        helperText='This is time stage of each period'
                        InputLabelProps={{
                          shrink: true
                        }}
                      />
                    </Fragment>
                  }
                </div>
              }
              <div className={classes.textField}>
                {
                  this.renderTagsMode('timingArr')
                }
              </div>
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
