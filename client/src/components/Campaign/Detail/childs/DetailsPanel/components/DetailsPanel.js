import React, { Component, Fragment } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  TextField,
  Typography
} from "@material-ui/core/";
import _ from "lodash";
import { blue, cyan, red } from "@material-ui/core/colors";
import { withStyles } from "@material-ui/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRetweet } from "@fortawesome/free-solid-svg-icons";
import TimeFormatter from "../../../../../utils/TimeFormatter";

const mode = ["Flexible", "Fixed", "Timing Flexible", "Timing Fixed"];
const customStyle = theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: "100%",
    listStyleType: "circle"
  },
  btnFund: {
    color: blue[500],
    margin: theme.spacing(1)
  },
  btnVoted: {
    color: cyan[500],
    margin: theme.spacing(1)
  },
  warning: {
    color: red[300]
  },
  titleText: {
    fontSize: "16px",
    whiteSpace: "nowrap",
    width: "300px",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  subText: {
    marginLeft: "20px"
  }
});

class DetailsPanel extends Component {
  render() {
    const { classes, detailsCampaign, tokenBacked, handleVoted, handleChangeVoted, numberStageToVoted } = this.props;
    return (
      <Fragment>
        <Card>
          <CardHeader
            avatar={<FontAwesomeIcon icon={faRetweet} />}
            title={"Project's Disbursement"}
            classes={{
              title: classes.titleText
            }}
          />
          <CardContent>
            <ul>
              <li>
                <Typography
                  variant="caption"
                  color="initial"
                  component="p"
                  className={classes.textField}
                >
                  Mode : {mode[detailsCampaign.mode]}
                </Typography>
              </li>
              <li>
                <Typography
                  variant="caption"
                  color="initial"
                  component="p"
                  className={classes.textField}
                >
                  Number stage : {detailsCampaign.numStage}
                </Typography>
              </li>
              {detailsCampaign.numStage > 1 && (
                <li>
                  <Typography
                    variant="caption"
                    color="initial"
                    component="p"
                    className={classes.textField}
                  >
                    Amount of each stage is :
                    {_.map(detailsCampaign.amountArr, (node, index) => {
                      return (
                        <Fragment key={index}>
                          <br />
                          <span className={classes.subText}>
                            Period {index} need to : {node} eth
                          </span>
                        </Fragment>
                      );
                    })}
                  </Typography>
                </li>
              )}
              {(detailsCampaign.mode === 2 || detailsCampaign.mode === 3) && (
                <li>
                  <Typography
                    variant="caption"
                    color="initial"
                    component="p"
                    className={classes.textField}
                  >
                    Time for each stage is :
                    {_.map(detailsCampaign.timeArr, (node, index) => {
                      return (
                        <Fragment key={index}>
                          <br />
                          <span className={classes.subText}>
                            Time to disburse {index} is : {TimeFormatter({ time: node * 1000 })} seconds
                          </span>
                        </Fragment>
                      );
                    })}
                  </Typography>
                </li>
              )}
              {
                detailsCampaign.agreedArr.length > 1 && <li>
                  <Typography
                    variant="caption"
                    color="initial"
                    component="p"
                    className={classes.textField}
                  >
                    Voted agree for each stage is :
                  {_.map(detailsCampaign.agreedArr, (node, index) => {
                      return (
                        <Fragment key={index}>
                          <br />
                          <span className={classes.subText}>
                            Stage {index} is : {node} vote
                        </span>
                        </Fragment>
                      );
                    })}
                  </Typography>
                </li>
              }
            </ul>
            {
              tokenBacked > 0 &&
              <Fragment>
                <div>
                  <TextField
                    type="number"
                    placeholder="Input stage to voted disbursement"
                    ref="amount"
                    inputProps={{ min: 0, max: detailsCampaign.numStage }}
                    onChange={handleChangeVoted}
                    className={classes.textField}
                    value={numberStageToVoted}
                  />
                  <div>
                    <Button onClick={handleVoted} className={classes.btnVoted} variant="outlined">
                      Voted
                    </Button>
                  </div>
                </div>
              </Fragment>
            }
          </CardContent>
        </Card>
      </Fragment>
    );
  }
}

export default withStyles(customStyle)(DetailsPanel);
