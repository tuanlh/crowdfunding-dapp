import React from 'react';
import { Alert, Row, Col, Spinner } from 'react-bootstrap';

const Loading = (props) => {
    return <Row className="pt-1">
        <Col sm={12}>
            <Alert variant={props.variant} className="mb-0">
                <Spinner animation="border" variant="success" size="sm" /> {props.text}
                </Alert>
        </Col>
    </Row>;
}
Loading.defaultProps = {
    variant: 'success',
    text: 'Loading...'
};
export default Loading;
