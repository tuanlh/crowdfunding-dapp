import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles({
  root: {
    backgroundImage: props => {
      return props.backgrimage
    },
    borderRadius: 3,
    border: 0,
    color: 'white',
    height: 48,
    padding: '0 30px',
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  },
  label: {
    textTransform: 'capitalize',
  },
});

function CustomButton(props) {
  const { ...other } = props;
  const classes = useStyles(props);
  return <Button className={classes.root} {...other} />;
}

CustomButton.defaultProps = {
  backgrimage: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%);'
}

CustomButton.propTypes = {
  backgrimage: PropTypes.string
}

export default CustomButton
