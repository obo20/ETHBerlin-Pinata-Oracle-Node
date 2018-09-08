const contract = require('truffle-contract');
const Web3 = require('web3');
const ipfs = require('./ipfs');

const customerBuild = require('../testcontract/build/contracts/Customer.json');
const pinataBuild = require('../testcontract/build/contracts/Pinata.json');

const Pinata = contract(pinataBuild);
const Customer = contract(customerBuild);

const provider = new Web3.providers.WebsocketProvider('ws://localhost:8546');
Pinata.setProvider(provider);
Customer.setProvider(provider);
const web3 = new Web3(provider);

const all = Promise.all.bind(Promise);

(async function() {
  const pinata = await Pinata.deployed();

  const customerAddresses = await pinata.getCustomers('0x0000000000000000000000000000000000000000');

  const customers = await all(customerAddresses.map(address => Customer.at(address)));

  await all(customers.map(async (customer) => {
    console.log('Setting up customer', customer.address);
    const numHashes = await customer.getNumHashes();
    for (let i = 0; i < numHashes; i++) {
      const hash = web3.utils.toUtf8(await customer.getHash(i));
      console.log('adding hash', hash);
      ipfs.pin.add(hash);
    }
  }));
})();
