import Detail from './components/Detail'
import { connect } from 'react-redux'

const mapStateToProps = (state) => {
  return ({
    users: state.users
  })
}

export default connect(mapStateToProps)(Detail)
