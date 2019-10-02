import React from 'react';
import { Spinner } from 'reactstrap';
import '../assets/Loading2.scss'


export default class Loading extends React.Component {
  render() {
    return (
      <div className='__loading'>
        <div className='sweet-loading'>
          <Spinner color="primary" />
        </div>
      </div>
    )
  }
}