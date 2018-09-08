const ipfsAPI = require('ipfs-api');
const Koa = require('koa');

const ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'});

const app = new Koa();

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
});

app.use(async ctx => {
  const { id } = await ipfs.id();
  console.log(id);

  ctx.body = `Connected to IPFS node ${id}`;
});


app.listen(3000);
