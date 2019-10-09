import React, { Component, Fragment } from 'react';
import { Card, CardContent } from '@material-ui/core/';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import _ from 'lodash'
export default class AddVerifier extends Component {
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
    const { dataVerifier } = this.state
    return (
      <Fragment>
        <Card className='card-box-title'>
          <Chip variant="outlined" size="small" icon={<AddIcon />} label='Add Verifier'/>
          <div style={{ display: 'flex' }}>
            <TextField
              label='Address'
              id='address'
              value={dataVerifier.address}
              onChange={this.handleAddAddress}
              className='form-control text-field-box'
              margin='normal'
            />
            <TextField
              label='Public Key'
              id='publicKey'
              value={dataVerifier.publicKey}
              onChange={this.handlePublicKey}
              className='form-control text-field-box'
              margin='normal'
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
