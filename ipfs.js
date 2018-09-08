const ipfsAPI = require('ipfs-api');

const ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'});

module.exports = ipfs;
