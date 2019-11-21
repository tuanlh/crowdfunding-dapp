import Detail from './components/Detail'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

const mapStateToProps = (state) => {
  return ({
    users: state.users
  })
}

export default connect(mapStateToProps)(withRouter(Detail))
