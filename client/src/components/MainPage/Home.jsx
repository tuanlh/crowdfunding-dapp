import React, { Component, Fragment } from "react";
import { withStyles } from "@material-ui/styles";
import Container from "@material-ui/core/Container";
import { MainHome } from "./ChildsHome/";

const styles = theme => ({
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  },
});
class Home extends Component {
  render() {
    const { classes } = this.props;
    // const renderCampaigns = campaigns
    //   .slice(page.firstIndex, page.lastIndex)
    //   .map((camp, i) => (
    //     <Col className="pt-1" sm={12} md={6} lg={3} xl={3} key={i}>
    //       <Card style={{ height: "100%" }}>
    //         {/* <Card.Img variant="top" src={this.printData(camp.id, 'thumbnail_url')}/> */}
    //         <Link to={`/campaign/${camp.id}`}>
    //           <Image
    //             src={this.printData(camp.id, "thumbnail_url")}
    //             fluid
    //             style={{ height: "200px", width: "100%" }}
    //           />
    //         </Link>
    //         <Card.Body className="p-1">
    //           <Card.Title>
    //             <Link
    //               style={{ color: "black", fontWeight: "bold" }}
    //               to={`/campaign/${camp.id}`}
    //             >
    //               {" "}
    //               {this.printData(camp.id, "name")}
    //             </Link>
    //           </Card.Title>
    //           <Card.Text>
    //             <small>{this.printData(camp.id, "short_description")}</small>
    //           </Card.Text>
    //           <Card.Subtitle className="mb-2 text-muted">
    //             <small>By {camp.owner}</small>
    //           </Card.Subtitle>
    //           <Card.Text className="mb-2">
    //             Collected {camp.collected} of {camp.goal} tokens ({camp.status})
    //           </Card.Text>
    //           {camp.progress.percent > 0 && (
    //             <ProgressBar
    //               now={camp.progress.percent}
    //               label={`${camp.progress.percent}%`}
    //               variant={camp.progress.state}
    //             />
    //           )}
    //         </Card.Body>
    //         <Card.Footer>
    //           <small className="text-muted">
    //             End at <TimeFormatter time={camp.end} />
    //           </small>
    //         </Card.Footer>
    //       </Card>
    //     </Col>
    //   ));

    return (
      <Fragment>
        <div className={classes.heroContent}>
          <Container maxWidth="sm">
            <MainHome />
          </Container>
        </div>
        {/* <Row className="pt-1">
          <Col>
            <Alert variant="info" className="mb-0">
              You need fund?{" "}
              <Link to="/create">
                <Button variant="success">
                  <FontAwesomeIcon icon="plus-circle" /> Start campaign
                </Button>
              </Link>
            </Alert>
          </Col>
        </Row>
        {this.state.isLoading && <Loading text="Loading campaigns" />}
        <Row className="pt-1">
          <Col>
            <Card>
              <Card.Header>
                <b>
                  <FontAwesomeIcon icon="chart-line" /> Campaign List
                </b>
              </Card.Header>
              <Card.Body className="p-1">
                {this.state.isLoading === false &&
                  this.state.numberOfCampaign === 0 && (
                    <Alert variant="secondary" className="m-1">
                      Empty list
                    </Alert>
                  )}
                <Row>{renderCampaigns}</Row>
              </Card.Body>
              {this.state.numberOfCampaign >= this.state.page.limit && (
                <Card.Footer className="p-1 pt-3">
                  <Paginator
                    numberOfItem={this.state.numberOfCampaign}
                    limit={this.state.page.limit}
                    callback={this.handlePaginator}
                    className="m-0"
                  />
                </Card.Footer>
              )}
            </Card>
          </Col>
        </Row> */}
      </Fragment>
    );
  }
}

export default withStyles(styles)(Home);
