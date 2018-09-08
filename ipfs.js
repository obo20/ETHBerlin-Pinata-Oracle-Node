const ipfsAPI = require('ipfs-api');

const ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'});

module.exports = ipfs;

module.exports.getConfig = async function getConfig(hash) {
  const file = await ipfs.files.get(hash);
  if (file.length === 0) {
    throw new Error('Config not Found', hash);
  }
  return JSON.parse(file[0].content.toString('utf8'));
}
