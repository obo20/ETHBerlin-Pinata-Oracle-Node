const Router = require('koa-router');
const ipfs = require('./ipfs');
const db = require('./database');

const router = new Router();

router.get('/', async (ctx) => {
  const { id } = await ipfs.id();

  ctx.body = `Connected to IPFS node ${id}`;
});

router.get('/pin', async (ctx) => {
  const files = await ipfs.pin.ls();

  ctx.body = files;
});

router.post('/pin/:hash', async (ctx) => {
  const files = await ipfs.pin.add(ctx.params.hash);

  ctx.body = files;
});

router.delete('/pin/:hash', async (ctx) => {
  const files = await ipfs.pin.rm(ctx.params.hash);

  ctx.body = files;
});

router.get('/contract/:address', async (ctx) => {
  const contract = db.getContract(ctx.params.address);
  ctx.body = {
    contract,
    events: contract && contract.configHash ? await ipfs.getConfig(contract.configHash) : null,
  };
})

module.exports = router;
