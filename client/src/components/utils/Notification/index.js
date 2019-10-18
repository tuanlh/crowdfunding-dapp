import Swal from 'sweetalert2/dist/sweetalert2.js'
import _ from 'lodash'
import 'sweetalert2/src/sweetalert2.scss'

function showNoti(data) {
  if(_.get(data, 'type') === 'error') {
    return (
      Swal.fire({
        type: 'error',
        title: 'Oops...',
        text: `Something went wrong! ${_.get(data, 'message' , '' )}`,
        footer: _.get(data, 'details', '')
      })
    )
  }
  return (
    Swal.fire({
      type: 'success',
      title: "Success ",
      footer: _.get(data, 'details', '')
    })
  )
}

export default showNoti
