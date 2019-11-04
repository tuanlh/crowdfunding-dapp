import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";
function showActionNoti(props) {
  return Swal.fire({
    text: "You have to register identity before create campaign",
    type: "warning",
    confirmButtonColor: "#3085d6",
    confirmButtonText: "Okay, Let's go!!"
  }).then(result => {
    return new Promise(res => res(result));
  });
}

export default showActionNoti;
