import Explore from './components/Explore'
import { connect } from 'react-redux'

const mapStateToProps = (state) => {
  return ({
    users: state.users
  })
}

export default connect(mapStateToProps)(Explore)
