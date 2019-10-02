import PropTypes from 'prop-types';
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
// export default class Alert extends Component {
//   constructor(props) {
//     super(props)
//     toast.configure()
//     console.log('----')
//   }
  
//   render() {
//     const { data } = this.props
//     return (
//       toast.error(data.content, {
//         position: data.position,
//         autoClose: 3000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: false,
//         draggable: true
//         })
//     );
//   }
// }
toast.configure()

export default function Alert ({ data, type = 'error' }) {
  return (
    toast[type](data.content, {
    position: data.position,
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true
    })
  )
}

Alert.propTypes = {
  data: PropTypes.shape({
    content: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success' , 'error', 'warning', 'info'])
  })
};
