import axios from 'axios'
const headers = {
  'Content-Type': 'multipart/form-data',
}
// const urlIPFS = 'http://akiz.ga:5001/api/v0'
const URL_IPFS = 'http://' + process.env.REACT_APP_IP_SERVER
const PORT_ADD = 443 // 443
const PORT_GET = 143 // 80

const URL_ADD = URL_IPFS + ':' + PORT_ADD + '/api/v0/add?stream-channels=true'
const URL_GET = URL_IPFS + ':' + PORT_GET + '/ipfs/'

export const callPostIPFS = (encryptFile) => {
  let formData = new FormData()
  formData.append('file', JSON.stringify(encryptFile))
  console.log(encryptFile, formData)
  return axios.post(URL_ADD, formData, {
    headers: headers
  })
}

export const callGetIPFS = (path) => {
  return axios.get(URL_GET + path)
}
