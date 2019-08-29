import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import _ from 'lodash'
class PreviewImage extends Component {
  render() {
    const { isOpen, imageArray, handleModal } = this.props
    return (
      <Modal isOpen={isOpen} toggle={handleModal} size={'lg'} >
          <ModalHeader toggle={handleModal}>Preview Image</ModalHeader>
          <ModalBody style={{ textAlign: 'center' }}>
            {
              _.isEmpty(imageArray) && <div>Nothing to preview</div>
            }
            {
              imageArray.map((imageURI, index) =>
                (
                  <img
                    className="photo-uploaded" 
                    src={imageURI} key={index}
                    alt=""
                    style={{
                      width: '90%',
                      height: '75%'
                    }}
                  />
                )
              )
            }
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleModal}>Okay</Button>{' '}
          </ModalFooter>
        </Modal>
    );
  }
}

export default PreviewImage;