import React, { Component, Fragment } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  withStyles,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core/';
import _ from 'lodash'
import { AccountCircle } from '@material-ui/icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faTag, faAddressCard } from '@fortawesome/free-solid-svg-icons'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
const useStyles = theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(3),
    width: '100%'
  }
});
const fields = [
  {label: 'Token', key: 'token', icon: faCoins},
  {label: 'Price', key: 'price', icon: faTag},
  {label: 'Your balance', key: 'eth', icon: faEthereum},
  {label: 'Your address', key: 'account', icon: faAddressCard, secondary: true}
]
class AccountInfo extends Component {
  renderData = () => {
    const { data } = this.props
    let result = _.map(fields, node => {
      return (
        <Fragment key={node.key}>
          <ListItem>
            <ListItemIcon>
              <FontAwesomeIcon icon={node.icon} />
            </ListItemIcon>
            <ListItemText
              primary={node.label}
              secondary={node.secondary ? data[node.key] : ''}
            />
            {
              !node.secondary && <span>{data[node.key]}</span>
            }
          </ListItem>
        </Fragment>
      )
    })
    return result
  }
  render() {
    const { classes } = this.props
    return (
      <Fragment>
        <Card>
          <CardHeader
            avatar={<AccountCircle />}
            title='Your account'
            classes={{
              title: classes.titleText,
            }}
            style={{
              paddingBottom: '0px'
            }}
          />
          <CardContent style={{
            paddingTop: "3px"
          }}>
            <List dense={false}>
              {
                this.renderData()
              }
            </List>
          </CardContent>
        </Card>
      </Fragment>
    )
  }
}
export default withStyles(useStyles)(AccountInfo);

