import Contribute from './components/Contribute'
import { connect } from 'react-redux'

const mapStateToProps = (state) => {
  return ({
    users: state.users
  })
}

export default connect(mapStateToProps)(Contribute)
