import { Context } from 'koa'

interface Options {
  allowHeaders?: Array<string>
  https?: boolean
}

const headers = [
  'Content-Type',
  'Access-Control-Allow-Headers',
  'Authorization',
  'X-Requested-With',
  'Accept-ApiKey',
  'Accept-ApiSign',
  'Accept-ApiTime'
]

const cors = ({ allowHeaders = ['Vp-Token', 'Vp-Signature'], https = false }: Options = {}) => async (ctx: Context, next: Function) => {
  const ALLOW_HEADER = headers.concat(allowHeaders).toString()

  ctx.set('Access-Control-Max-Age', '31536000')
  ctx.set('Access-Control-Allow-Origin', ctx.headers.origin || '')
  ctx.set('Access-Control-Allow-Headers', ALLOW_HEADER)
  ctx.set('Access-Control-Allow-Credentials', 'true')
  ctx.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,HEAD,OPTIONS')
  if (https) {
    ctx.set('Strict-Transport-Security', 'max-age=10886400; includeSubDomains; preload;')
  }

  await next()
}

export default cors
