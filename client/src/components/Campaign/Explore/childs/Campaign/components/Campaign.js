import React, { Component, Fragment } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Typography
} from "@material-ui/core/";
import { red, green } from "@material-ui/core/colors";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandsHelping } from "@fortawesome/free-solid-svg-icons";
import { Favorite, KeyboardArrowRight } from "@material-ui/icons/";
import { withStyles } from "@material-ui/styles";

import clsx from "clsx";
import _ from "lodash";

import TimeFormatter from "../../../../../utils/TimeFormatter";
import "../assets/Campaign.scss";

const customStyle = theme => ({
  titleText: {
    fontSize: "16px",
    whiteSpace: "nowrap",
    width: "300px",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  card: {
    maxWidth: 500,
    maxHeight: 500,
    minHeight: 500
  },
  media: {
    height: "180px"
    // paddingTop: "56.25%", // 16:9,
    // marginTop: "30"
    // width: '100%'
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: "rotate(180deg)"
  },
  details: {
    marginLeft: "auto"
  },
  content: {
    minHeight: "180px"
  }
});

class Campaign extends Component {

  handleDonate = () => {
    console.log("donate");
  };

  renderTitle = () => {
    const { data, campaigns } = this.props;
    let styleStatus = "";
    switch (_.toLower(campaigns.status)) {
      case "failed":
        styleStatus = red[500]
        break;
      default:
        styleStatus = green[300]
        break;
    }
    if(campaigns.finStatus === 2) {
      campaigns.status = 'Reject'
      styleStatus = red[500]
    }
    return (
      <span>
        <span style={{
          color: styleStatus
        }}>{campaigns.status}</span> -{" "}
        {data.short_description}
      </span>
    );
  };

  toTimestamp = strDate => {
    return Date.parse(strDate);
  };

  render() {
    const { classes, data, campaigns } = this.props;
    if (_.isEmpty(data) || _.isEmpty(campaigns)) return
    return (
      <Fragment>
        <Card className={clsx(classes.card, "campaign")}>
          <CardHeader
            avatar={<FontAwesomeIcon icon={faHandsHelping} />}
            title={this.renderTitle()}
            classes={{
              title: classes.titleText
            }}
          />
          <div style={{ textAlign: "center" }}>
            <img className={classes.media} src={data.thumbnail_url} alt='' />
          </div>
          <CardContent className={classes.content}>
            <p className={"short-description"}>{data.short_description}</p>
            <Typography variant="body2" color="textSecondary" component="p">
              Start: {TimeFormatter({ time: campaigns.start })}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              End: &nbsp;
              <span
              // style={{
              //   color:
              //     this.toTimestamp(new Date().toLocaleString()) >
              //     campaigns.end
              //       ? red[500]
              //       : green[300]
              // }}
              >
                {TimeFormatter({ time: campaigns.end })}
              </span>
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              By: {_.truncate(campaigns.owner, 45)}
            </Typography>
          </CardContent>
          <CardActions disableSpacing>
            <IconButton
              aria-label="donate"
              onClick={this.handleDonate}
              disabled={_.toLower(campaigns.status) === "failed"}
            >
              <Favorite />{" "}
              <Typography variant="body2" color="textSecondary" component="p">
                {campaigns.collected}/{campaigns.goal}
              </Typography>
            </IconButton>
            <Link to={`/campaign/${campaigns.id}`} className={classes.details}>
              <IconButton aria-label="details">
                <KeyboardArrowRight />
              </IconButton>
            </Link>
          </CardActions>
        </Card>
      </Fragment>
    );
  }
}

export default withStyles(customStyle)(Campaign);
