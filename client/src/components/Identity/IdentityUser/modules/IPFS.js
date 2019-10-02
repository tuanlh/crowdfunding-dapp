import axios from 'axios'

const headers = {
  'Content-Type': 'multipart/form-data',
}

export const callIPFS = (encryptFile) => {
  let formData = new FormData()
  formData.append('file', encryptFile)
  return axios.post('https://ipfs.infura.io:5001/api/v0/add?pin=false', formData, {
    headers: headers
  })
}