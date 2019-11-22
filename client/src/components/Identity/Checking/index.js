// checking new identity
import CheckingIdentity from './components/CheckingIdentity'
import { connect } from "react-redux";

const mapStateToProps = state => {
  return {
    users: state.users
  };
};

export default connect(mapStateToProps)(CheckingIdentity);
