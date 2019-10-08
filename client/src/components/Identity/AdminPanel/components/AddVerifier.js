import React, { Component, Fragment } from 'react';
import { Card } from '@material-ui/core/';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
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
        dataVerifier : {
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
    if(_.isEmpty(dataVerifier.address) || _.isEmpty(dataVerifier.publicKey))
      return
    handleAddVerifier(dataVerifier)
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
        <Card style={{ display: 'flex' }}>
          <TextField
            label='Address'
            id='address'
            value={dataVerifier.address}
            onChange={this.handleAddAddress}
            className='form-control'
            margin='normal'
          />
          <TextField
            label='Public Key'
            id='publicKey'
            value={dataVerifier.publicKey}
            className='form-control'
            margin='normal'
          />
          <div style={{ display: 'flex', marginTop: '32px' }}>
            <input
              id='image-file'
              type='file'
              onChange={this.handleFileUpload}
            />
          </div>
          <Button
            variant='outlined'
            color='primary'
            size='medium'
            onClick={this.handleAddVerifier}
          >
            Add
          </Button>
        </Card>
      </Fragment >
    );
  }
}
