import React from 'react';
import { css } from '@emotion/core';
// First way to import
import { FadeLoader } from 'react-spinners';
// Another way to import. This is recommended to reduce bundle size
// import FadeLoader from 'react-spinners/ClipLoader';
import '../assets/Loading2.scss'
// Can be a string as well. Need to ensure each key-value pair ends with ;
const override = css`
  margin: 0 auto;
  top: 50%;
`;

export default class Loading extends React.Component {
  render() {
    return (
      <div className='__loading'>
        <div className='sweet-loading'>
          <FadeLoader
            css={override}
            sizeUnit={"px"}
            size={150}
            color={'#123abc'}
            loading={this.props.isLoading}
          />
        </div>
      </div>
    )
  }
}