import React, { Component, Fragment } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  withStyles,
  List,
  TextField
} from "@material-ui/core/";
import _ from "lodash";
import clsx from "clsx";
import { ShoppingCart } from "@material-ui/icons";
const useStyles = theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(3),
    width: "100%"
  }
});
class AccountAction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amountToken: '',
      amountEth: 0,
      price: props.data.price
    };
  }

  handleChange = e => {
    if (e.target.value !== "") {
      const amountToken = parseInt(e.target.value);
      if (isNaN(amountToken)) {
        e.target.value = "";
        this.setState({ amountToken: 0, amountEth: 0 });
        return;
      }
      const amountEth = amountToken * this.props.data.price;
      this.setState({
        amountEth: +amountEth,
        amountToken: +amountToken
      });
    } else {
      this.setState({ amountToken: '', amountEth: 0 });
    }
  };

  render() {
    const { classes, data } = this.props;
    const { amountToken, amountEth, price } = this.state;
    return (
      <Fragment>
        <Card>
          <CardHeader
            avatar={<ShoppingCart />}
            title="Deposit/Withdraw"
            classes={{
              title: classes.titleText
            }}
            style={{
              paddingBottom: "0px"
            }}
          />
          <CardContent>
            <TextField
              label="Token"
              id="token"
              placeholder="Enter goal of campaign"
              type="number"
              value={amountToken}
              onChange={this.handleChange}
              margin="normal"
              className={classes.textField}
              helperText={clsx(
                amountToken !== '' && `${amountToken} Tokens = ${amountEth} Eth`,
                amountToken === '' && `0 Tokens = ${amountEth} Eth`
              )}
              required
              InputLabelProps={{
                shrink: true
              }}
            />
          </CardContent>
        </Card>
      </Fragment>
    );
  }
}
export default withStyles(useStyles)(AccountAction);

// const renderAccountAction = <Card bg>
//       <Card.Header>
//         <b><FontAwesomeIcon icon="cart-plus" /> Deposit/Withdraw</b>
//       </Card.Header>
//       <Card.Body className="p-1 m-1">
//         {this.state.loading === false ? (<div>
//           <InputGroup>
//             <Form.Control
//               type="number"
//               placeholder="Number of tokens"
//               ref='inputToken'
//               onChange={this.handleChange} />
//             <InputGroup.Append>
//               <InputGroup.Text>{this.state.amountEth + " ETH"}</InputGroup.Text>
//               <Button variant="primary" onClick={this.handleDeposit}>Deposit</Button>
//               <Button variant="secondary" onClick={this.handleWithdraw}>Withdraw</Button>
//             </InputGroup.Append>
//           </InputGroup>
//           <Row className="pt-3">
//             <Col sm={3}>
//               Or send ETH to:
//             </Col>
//             <Col sm={5}>
//               <Form.Control readOnly type="text" defaultValue={this.state.contract.address} />
//             </Col>
//             <Col sm={4}>
//               <QRCode value={this.state.contract.address} />
//             </Col>
//           </Row>
//         </div>
//         ) : (
//             <Alert variant="warning"><FontAwesomeIcon icon="spinner" pulse /> Loading...</Alert>
//           )}
//       </Card.Body>
//     </Card>;
