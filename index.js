const Koa = require('koa');
const router = require('./router');
require('./ethereum');

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

app.use(router.routes());
// makes sure a 405 Method Not Allowed is sent
app.use(router.allowedMethods());

app.listen(3000);
