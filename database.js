const fs = require('fs');

const path = './db.json';

const database = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf8')) : {
  contracts: [],
};

function writeDB() {
  fs.writeFileSync(path, JSON.stringify(database));
}

module.exports.getContracts = function getContracts() {
  return database.contracts;
};

module.exports.addContract = function addContract(address) {
  const contract = {
    address,
    configHash: null,
    hashes: [],
  };
  database.contracts.push(contract);
  writeDB();
};

function getContract(address) {
  for (let i = 0; i < database.contracts.length; i++) {
    if (database.contracts[i].address === address) {
      return database.contracts[i];
    }
  }
  return null;
}
module.exports.getContract = getContract;

module.exports.hasContract = function hasContract(address) {
  return !!getContract(address);
};

module.exports.setConfigHash = function setConfigHash(address, configHash) {
  const contract = getContract(address);
  contract.configHash = configHash;
  writeDB();
}

module.exports.addHash = function addHash(address, hash) {
  const contract = getContract(address);
  contract.hashes.push(hash);
  writeDB();
}

