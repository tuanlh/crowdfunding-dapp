import Swal from 'sweetalert2/dist/sweetalert2.js'
import _ from 'lodash'
import 'sweetalert2/src/sweetalert2.scss'

function showNoti(data) {
  console.log(data.type === 'error')
  if(data.type === 'error') {
    return (
      Swal.fire({
        type: 'error',
        title: 'Oops...',
        text: `Something went wrong! ${_.get(data, 'message' , '' )}`,
        footer: data.details
      })
    )
  }
  return (
    Swal.fire({
      type: 'success',
      title: "Success ",
      footer: data.details
    })
  )
}

export default showNoti
