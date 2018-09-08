const contract = require('truffle-contract');
const Web3 = require('web3');
const ipfs = require('./ipfs');
const db = require('./database');
const Web3Abi = require('web3-eth-abi');

const pinataBuild = require('../smart-contracts/build/contracts/PinataHub.json');
const Pinata = contract(pinataBuild);

const provider = new Web3.providers.WebsocketProvider('ws://localhost:8546');
Pinata.setProvider(provider);
const web3 = new Web3(provider);

const all = Promise.all.bind(Promise);

const MY_ADDRESS = '0x0000000000000000000000000000000000000000';

function getSignature(event) {
  return web3.utils.sha3(`${event.name}(${event.params.map(param => param.type).join(',')})`);
}
function getHashFromEvent(event, eventDef) {
  const log = Web3Abi.decodeLog(eventDef.params, event.data.replace('0x', ''), event.topics);

  for (var i = 0; i < eventDef.params.length; i++) {
    const definition = eventDef.params[i];
    if (definition.selected) {
      return log[definition.name];
    }
  }
  throw Error('Hash not found', log);
}

async function watchContract(address) {
  console.log('Starting watcher for contract', address);
  const contract = db.getContract(address);
  const config = await ipfs.getConfig(contract.configHash);

  console.log(config);

  config.events.forEach(eventDef => {
    const signature = getSignature(eventDef);
    console.log(signature);

    web3.eth.subscribe('logs', {
      address: address,
      topics: [signature],
    })
      .on('data', event => {
        const hash = getHashFromEvent(event, eventDef);
        console.log('adding hash', hash);
        db.addHash(address, hash);
        ipfs.pin.add(hash);
      });
  });
}

(async function() {
  const pinata = await Pinata.deployed();

  db.getContracts().forEach(({ address, configHash }) => {
    if (configHash) {
      watchContract(address);
    }
  });

  pinata.ContractAddedClient({
    filter: {
      _client: MY_ADDRESS,
    }
  })
    .on('data', async (data) => {
      console.log('New Contract', data);
      const { _contract, configHash } = data.returnValues;

      if (!db.hasContract(_contract)) {
        db.addContract(_contract);
      }
      db.setConfigHash(_contract, configHash);

      watchContract(_contract);
    });
})();
