
const IPFS = require('ipfs-http-client')
const ipfs = IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

export default ipfs;