import React, { Component, Fragment } from 'react'
import { withStyles, withTheme } from "@material-ui/core/styles";
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import MobileStepper from '@material-ui/core/MobileStepper';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: '0 20%'
  },
});

class StepperExplore extends Component {
  render() {
    const { handleNext, handleBack, activeStep, classes, theme, data } = this.props
    return (
      <Fragment>
        <MobileStepper
          variant="dots"
          steps={data.length}
          position="static"
          activeStep={activeStep}
          className={classes.root}
          nextButton={
            <Button size="small" onClick={handleNext} disabled={activeStep === data.length}>
              Next
          {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </Button>
          }
          backButton={
            <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
              {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
              Back
        </Button>
          }
        />
      </Fragment>
    )
  }
}

export default withStyles(styles)(withTheme(StepperExplore))
