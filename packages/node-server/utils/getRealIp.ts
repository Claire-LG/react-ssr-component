import { Context } from 'koa'

const getRealIp = (ctx: Context) => {
  const realIp = typeof ctx.header['x-real-ip'] != 'undefined' ? ctx.header['x-real-ip'] : ctx.ip
  const ip = typeof ctx.header['x-forwarded-for'] != 'undefined' && ctx.header['x-forwarded-for'].length > 0 ? ctx.header['x-forwarded-for'].split(',')[0].replace(' ', '') : realIp
  return ip
}

export default getRealIp
