import React, { Component, Fragment } from 'react';
import { Card } from '@material-ui/core/';
import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import _ from 'lodash'
import { withStyles } from "@material-ui/styles";

const customStyle = theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(3),
    width: '100%'
  },
})
class AddVerifier extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataVerifier: {
        address: '',
        publicKey: ''
      },
    }
  }
  handleFileUpload = e => {
    let files = e.target.files[0];
    let reader = new FileReader();
    reader.onload = e => {
      this.setState(prevState => ({
        dataVerifier: {
          ...prevState.dataVerifier,
          publicKey: e.target.result
        }
      }))
    };
    reader.readAsText(files);
  };

  handleAddVerifier = () => {
    const { dataVerifier } = this.state
    const { handleAddVerifier } = this.props
    if (_.isEmpty(dataVerifier.address) || _.isEmpty(dataVerifier.publicKey))
      return
    handleAddVerifier(dataVerifier)
  }

  handlePublicKey = (e) => {
    let value = e.target.value
    this.setState(prevState => ({
      dataVerifier: {
        ...prevState.dataVerifier,
        publicKey: value
      }
    }))
  }

  handleAddAddress = (e) => {
    let value = e.target.value
    this.setState(prevState => ({
      dataVerifier: {
        ...prevState.dataVerifier,
        address: value
      }
    }))
  }

  render() {
    const { classes } = this.props
    const { dataVerifier } = this.state
    return (
      <Fragment>
        <Card className='card-box-title'>
          {/* <Chip variant="outlined" size="small" icon={<AddIcon />} label='Add Verifier'/> */}
          <div style={{ display: 'flex' }}>
            <TextField
              label='Address'
              id='address'
              value={dataVerifier.address}
              onChange={this.handleAddAddress}
              className={classes.textField}
              margin='normal'
              InputLabelProps={{
                shrink: true
              }}
            />
            <TextField
              label='Public Key'
              id='publicKey'
              value={dataVerifier.publicKey}
              onChange={this.handlePublicKey}
              className={classes.textField}
              margin='normal'
              InputLabelProps={{
                shrink: true
              }}
            />
            <div style={{ display: 'flex', marginTop: '32px' }} className='text-field-box'>
              <input
                id='image-file'
                type='file'
                onChange={this.handleFileUpload}
              />
            </div>
            {/* <Button
            variant='outlined'
            color='primary'
            size='medium'
            onClick={this.handleAddVerifier}
          >
            Add
          </Button> */}
            <div className='text-field-box'>
              <Fab color="primary" aria-label="add" onClick={this.handleAddVerifier} size='small' style={{ marginTop: '5px' }}>
                <AddIcon />
              </Fab>
            </div>
          </div>
        </Card>
      </Fragment >
    );
  }
}

export default withStyles(customStyle)(AddVerifier)
