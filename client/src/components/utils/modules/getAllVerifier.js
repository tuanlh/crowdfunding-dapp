

import _ from 'lodash'
var contract = ''
var account = ''
const getAllVerifier = (contractUser, accountUser) => {
  contract = contractUser
  account = accountUser
  return new Promise(resolve => {
    contract.methods.getVerifierAddresses().call({
      from: account
    }).then(res => {
      // new Promise(resolve => {
      //   resolve()
      // })
      getPublicKey(res).then(data =>
        resolve(data)
      )
    })
  })
}
const getPublicKey = (data) => {
  return new Promise(resolve => {
    let p1 = _.map(data, node => {
      return getVerifier(node)
    })
    Promise.all(p1).then(res => {
      resolve(res)
    })
  })
  
}
const getVerifier = (node) => {
  return new Promise(resolve => {
    contract.methods.getVerifier(node).call({
      from: account
    }).then(res => {
      resolve({
        address: node,
        publicKey: res.pubKey,
        task: _.toInteger(res.task)
      })
    })
  })
}

export default getAllVerifier
