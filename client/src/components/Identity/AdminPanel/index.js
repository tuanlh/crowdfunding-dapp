import AdminPanel from './components/AdminPanel'
import { connect } from "react-redux";

const mapStateToProps = state => {
  return {
    users: state.users
  };
};

export default connect(mapStateToProps)(AdminPanel);
