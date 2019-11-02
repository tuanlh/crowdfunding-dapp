import React, { Component, Fragment } from "react";
import { Card, CardHeader, CardContent } from "@material-ui/core/";
import ReactMarkdown from "react-markdown";
import LinearProgress from "@material-ui/core/LinearProgress";
import TimeFormatter from "../../../../../utils/TimeFormatter";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAlignJustify, faAlignLeft } from "@fortawesome/free-solid-svg-icons";
import { withStyles } from "@material-ui/styles";

const customStyle = theme => ({
  root: {
    flexGrow: 1
  },
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
  },
  details: {
    marginLeft: "auto"
  },
  content: {
    minHeight: "180px"
  },
  icon: {
    fontSize: "1em"
  }
});

class CampaignInfo extends Component {
  printData = property => {
    const { extData } = this.props;
    if (hasOwnProperty.call(extData, property)) {
      return extData[property];
    } else {
      if (property === "thumbnail_url") {
        return "/default-thumbnail.jpg";
      } else {
        return "[Field not found]";
      }
    }
  };

  render() {
    const { classes, campaign } = this.props;
    return (
      <Fragment>
        <Card>
          <CardHeader
            avatar={<FontAwesomeIcon icon="parachute-box" />}
            title={this.printData("name")}
            classes={{
              title: classes.titleText
            }}
          />
          <div style={{ textAlign: "center" }}>
            <img
              className={classes.media}
              src={this.printData("thumbnail_url")}
              alt=""
            />
          </div>
          <CardContent className={classes.content}>
            <div>
              <p>
                <FontAwesomeIcon icon={faAlignLeft} />{" "}
                <b>Short Description: </b>
              </p>
              <span>
                <p>{this.printData("short_description")}</p>
              </span>
            </div>
            <div>
              <p>
                <FontAwesomeIcon icon={faAlignJustify} /> <b>Description: </b>
              </p>
              <span>
                <ReactMarkdown
                  source={this.printData("description")}
                  escapeHtml={true}
                />
              </span>
            </div>
            <div>
              <p>
                <b>
                  <FontAwesomeIcon icon="user-tie" /> Owner:
                </b>{" "}
                {campaign.owner}
              </p>
            </div>
            <div>
              <p>
                <b>
                  <FontAwesomeIcon icon="calendar-plus" /> Created:{" "}
                </b>
                <TimeFormatter time={campaign.startDate} />
              </p>
              <p>
                <b>
                  <FontAwesomeIcon icon="calendar-check" /> Deadline:{" "}
                </b>
                <TimeFormatter time={campaign.endDate} />
              </p>
              <p>
                <b>
                  <FontAwesomeIcon icon="signal" /> Progress:{" "}
                </b>
                {campaign.collected} / {campaign.goal} tokens 
                {campaign.finStatus !== 2 && ( " - " + this.props.campaignStatusChr[campaign.status] )}
              </p>
              <div className={classes.root}>
                <LinearProgress
                  variant="determinate"
                  value={campaign.progress.percent}
                />
                <br />
              </div>
            </div>
          </CardContent>
        </Card>
      </Fragment>
    );
  }
}

export default withStyles(customStyle)(CampaignInfo);
