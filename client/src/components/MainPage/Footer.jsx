import React, {Component} from 'react'
import { Row, Col } from 'react-bootstrap';

class Footer extends Component {
  
  render() {
    
    return (
      <Row className="pt-1">
        <Col>
        <div className="bg-dark text-center text-white p-2 mb-2">
          Blockchain-based Crowdfunding Platform
        </div>
        </Col>
      </Row>
    );
  }
}

export default Footer;