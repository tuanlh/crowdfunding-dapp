import IdentityUser from './components/IdentityUser'
import { connect } from "react-redux";

const mapStateToProps = state => {
  return {
    users: state.users
  };
};

export default connect(mapStateToProps)(IdentityUser);
