import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import "../assets/Loading2.scss";

const useStyles = makeStyles(theme => ({
  progress: {
    margin: theme.spacing(2)
  }
}));

export default function Loading(props) {
  const classes = useStyles();
  return (
    <div className="__loading">
      <div className="sweet-loading">
        <CircularProgress className={classes.progress} />
        <br />
        {props.text || 'Please waiting....'}
      </div>
    </div>
  );
}
