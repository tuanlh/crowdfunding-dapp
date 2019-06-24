const host = 'http://' + 'localhost'
const port = 3001

const url = host + ":" + port

export function callAPIPost(_extendPath, params){
  return fetch(url + _extendPath, {
    method: 'POST',
    mode: 'cors', // no-cors, cors, *same-origin
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params
  }).then(res => res.json())
}
