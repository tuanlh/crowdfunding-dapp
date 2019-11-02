import React from "react";
import { matchPath, withRouter, Link as RouterLink } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Typography from "@material-ui/core/Typography";
import clsx from "clsx";
import _ from "lodash";
const useStyles = makeStyles(theme => ({
  root: {
    justifyContent: "center",
    flexWrap: "wrap",
    boxShadow: "0px 2px 5px -4px grey"
  },
  paper: {
    padding: theme.spacing(1, 3),
    borderRadius: 0
  },
  activeLink: {
    fontWeight: "700"
  },
  textBreadcrumb: {
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline"
    }
  }
}));

function getPaths(pathname) {
  let paths = ["/"];
  if (pathname === "/") return paths;

  pathname.split("/").reduce((prev, curr) => {
    let currPath = prev + "/" + curr;
    paths.push(currPath);
    return currPath;
  });
  return paths;
}

function findRouteName(url, routes = []) {
  const aroute = routes.find(route => {
    return (0, matchPath)(url, { path: route.path, exact: route.exact });
  });
  return aroute && aroute.name ? aroute.name : "";
}

const CustomSeparator = props => {
  const classes = useStyles();
  const { location, appRoutes } = props;
  const paths = getPaths(location.pathname);

  const items = paths.map((path, i) => {
    const routeName = findRouteName(path, appRoutes);
    if (_.isEmpty(routeName)) {
      return '';
    }
    if (i === paths.length - 1) {
      return (
        <Typography
          color="textPrimary"
          key={i}
          className={clsx(classes.activeLink, classes.textBreadcrumb)}
        >
          {routeName}
        </Typography>
      );
    }
    return (
      <RouterLink
        to={path}
        style={{ color: "inherit" }}
        key={i}
        className={clsx(classes.textBreadcrumb)}
      >
        {routeName}
      </RouterLink>
    );
  });

  return (
    <div className={classes.root}>
      <Paper elevation={0} className={classes.paper}>
        <Breadcrumbs aria-label="breadcrumb">{items}</Breadcrumbs>
      </Paper>
    </div>
  );
};

export default withRouter(CustomSeparator);
