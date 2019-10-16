import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import Campaigns from "../../contracts/Campaigns.json";
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';
import Container from '@material-ui/core/Container';

import axios from "axios";
//import getWeb3 from '../utils/getWeb3';
import { Keccak } from "sha3";
import Web3 from "web3";
import TimeFormatter from "../utils/TimeFormatter";
// import Loading from '../utils/Loading';
import Paginator from "../utils/Paginator";
import Loading from "../utils/Loading2/index.js";
const styles = theme => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
})
class Home extends Component {
  state = {
    numberOfCampaign: 0,
    campaigns: [],
    page: {
      limit: 4,
      firstIndex: 0,
      lastIndex: 0
    },
    data: [],
    //api_db_set: null,
    api_db: null,
    loaded: 0,
    isLoading: false,
    web3: null,
    account: null,
    contract: null
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      //const web3 = await getWeb3();
      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.REACT_APP_DEFAULT_NETWORK)
      );
      // Use web3 to get the user's accounts.
      //const accounts = await web3.eth.getAccounts();
      web3.eth.defaultAccount = process.env.REACT_APP_DEFAULT_ACCOUNT;
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Campaigns.networks[networkId];
      const instance = new web3.eth.Contract(
        Campaigns.abi,
        deployedNetwork && deployedNetwork.address
      );
      const api_db_default = "http://" + window.location.hostname + ":8080/";
      const api_db =
        !hasOwnProperty.call(process.env, "REACT_APP_STORE_CENTRALIZED_API") ||
        process.env.REACT_APP_STORE_CENTRALIZED_API === ""
          ? api_db_default
          : process.env.REACT_APP_STORE_CENTRALIZED_API;

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState(
        { web3, account: web3.eth.defaultAccount, api_db, contract: instance },
        this.loadContractInfo
      );
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  loadContractInfo = async () => {
    this.setState({ isLoading: true });
    const { account, contract } = this.state;
    const numberOfCampaign = parseInt(
      await contract.methods.length().call({ from: account })
    );
    if (numberOfCampaign > 0) {
      const emptyCampaign = [];
      this.setState({ campaigns: emptyCampaign }); //reset campaign
      for (let i = 0; i < numberOfCampaign; i++) {
        this.loadCampaign(i);
      }
      this.setState({ numberOfCampaign });
      //this.updatePagination();
    } else {
      this.setState({ isLoading: false });
    }
  };

  loadCampaign = async index => {
    const { account, contract, page } = this.state;
    const campaign = await contract.methods
      .getInfo(index)
      .call({ from: account });
    let {
      startDate,
      endDate,
      goal,
      collected,
      owner,
      finStatus,
      ref,
      hashIntegrity
    } = campaign;
    this.loadDataOfCampaign(index, ref, hashIntegrity);
    let { numberOfCampaign, campaigns, loaded } = this.state;
    finStatus = parseInt(finStatus);
    if (finStatus > 0) {
      collected = parseInt(collected);
      goal = parseInt(goal);
      startDate = parseInt(startDate) * 1000;
      endDate = parseInt(endDate) * 1000;
      const stt = this.getStatus(endDate, goal, collected);
      let statusChr = ["During", "Failed", "Succeed"][stt];
      const progress = this.getProgress(collected, goal);
      campaigns.push({
        id: index,
        start: startDate,
        end: endDate,
        goal: goal,
        collected: collected,
        owner: owner,
        status: statusChr,
        progress: progress
      });
      if (numberOfCampaign !== loaded) {
        this.setState({ campaigns });
      }
    }
    loaded++;
    this.setState({ loaded });
    if (numberOfCampaign === loaded) {
      campaigns.sort((prev, next) => next.start > prev.start);
      this.setState({ campaigns, isLoading: false });
    }
    if (loaded === page.limit || numberOfCampaign === loaded) {
      this.handlePaginator(1);
    }
  };

  loadDataOfCampaign = async (index, ref, hash_integrity) => {
    let { data, api_db } = this.state;
    if (!data.hasOwnProperty(index)) {
      axios.get(api_db + "campaign/" + ref).then(response => {
        if (response.status === 200) {
          if (
            hasOwnProperty.call(response.data, "name") &&
            hasOwnProperty.call(response.data, "description") &&
            hasOwnProperty.call(response.data, "short_description") &&
            hasOwnProperty.call(response.data, "thumbnail_url")
          ) {
            const d = response.data;
            const temp =
              d.name + d.short_description + d.description + d.thumbnail_url;
            const hashEngine = new Keccak(256);
            hashEngine.update(temp);
            const result_hash = hashEngine.digest("hex");
            //console.log(result_hash, hash_integrity);
            if (result_hash === hash_integrity) {
              data[index] = response.data;
              this.setState({ data });
            }
          }
        }
      });
    }
  };

  printData = (index, property) => {
    const { data } = this.state;
    if (data.hasOwnProperty(index)) {
      if (hasOwnProperty.call(data[index], property)) {
        return data[index][property];
      } else {
        if (property === "thumbnail_url") {
          return "/default-thumbnail.jpg";
        } else {
          return "[Field not found]";
        }
      }
    } else {
      return "Loading...";
    }
  };

  getStatus = (deadline, goal, collected) => {
    if (Date.now() < deadline) {
      return 0; //during
    } else {
      if (collected < goal) {
        return 1; //failed
      } else {
        return 2; //succeed
      }
    }
  };

  getProgress = (collected, goal) => {
    const percent = parseInt((collected * 100) / goal);
    let state = "info";
    if (percent >= 80) {
      state = "danger";
    } else if (percent >= 60) {
      state = "warning";
    } else if (percent >= 40) {
      state = "success";
    }
    return { percent, state };
  };

  listenEventToUpdate = async () => {
    const { contract } = this.state;
    contract.events.allEvents(
      {
        fromBlock: "latest"
      },
      (error, result) => {
        if (error === false && result !== null) {
          this.loadContractInfo(); // update front-end when new event emitted
        }
      }
    );
  };

  handlePaginator = current => {
    let { page } = this.state;
    page.lastIndex = current * page.limit;
    page.firstIndex = page.lastIndex - page.limit;
    this.setState({ page });
  };

  render() {
    const { classes } = this.props
    // const classes = withStyles(styles)
    if (!this.state.web3) {
      return <Loading />;
    }
    const { campaigns, page } = this.state;
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
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="textPrimary"
              gutterBottom
            >
              Crownfunding
            </Typography>
            <Typography
              variant="h5"
              align="center"
              color="textSecondary"
              paragraph
            >
              To live in this life, one needs a soul. For what, you know? <br />
            </Typography>
            {/* <Typography
              variant="h5"
              align="center"
              color="textSecondary"
              paragraph
            >
              You need fund?{" "}
            </Typography> */}
            <div className={classes.heroButtons}>
              <Grid container spacing={2} justify="center">
                <Grid item>
                  <Link to="/create" style={{ textDecoration: 'none' }}>
                    <Button variant="contained" color="primary">
                      Start campaign
                    </Button>
                  </Link>
                </Grid>
              </Grid>
            </div>
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
