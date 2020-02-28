import getRealIp from './getRealIp'
import getLang from './getLang'
import { Context } from 'koa'

const nodeParams = (ctx: Context, prefix = 'VP') => ({
  token: ctx.cookies.get(`${prefix}Token`),
  lang: getLang(ctx, prefix),
  ip: getRealIp(ctx),
  headerOthers: {
    'User-Agent': ctx.request.header['user-agent'] || '',
    'X-Request-Id': ctx.request.header['X-Request-Id'] || '',
    'X-Remote-Addr': ctx.request.header['X-Remote-Addr'] || '',
    'X-User-Info-UA': ctx.request.header['X-User-Info-UA'] || '',
    'X-Forwarded-For': ctx.request.header['X-Forwarded-For'] || '',
    'X-Transaction-Id': ctx.request.header['X-Transaction-Id'] || '',
  }
})
export default nodeParams
