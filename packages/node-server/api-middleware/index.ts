import { Context } from 'koa'
import nodeParams from '../utils/nodeParams'
import getText from '../utils/getText'

interface options {
  fetch: any
  serviceList: Array<any>
  routePath: string
  prefix?: string
  beforeReturn?: (ctx: Context, result: any) => void
}

const apiMiddleware = ({ fetch, serviceList, routePath, prefix = 'VP', beforeReturn }: options) => async (ctx: Context, next: Function) => {
  logger.info('API_MIDDLEWARE', 'method', ctx.req.method, 'url:', ctx.req.url)
  if (ctx.request.method === 'OPTIONS') {
    ctx.status = 204
  }

  const apiType = serviceList.reduce((result: any, curValue: any) => (
    result + (ctx.req.url || '').startsWith(`${routePath}/${curValue.key}`) ? 1 : 0
  ), 0)

  if (apiType === 0) {
    await next()
  } else {
    const deviceId = ctx.method === 'POST' ? ctx.request.body.deviceId : ctx.query.deviceId
    // 如果没有Device-Id，则保存Device-Id
    if (!ctx.cookies.get('Device-Id')) {
      ctx.cookies.set('Device-Id', deviceId, {
        httpOnly: true,
        domain: process.env.COOKIE_DOMAIN
      })
    }

    const apiStart = new Date().getTime()
    const others = nodeParams(ctx, prefix)
    const options = {
      url: ctx.req.url,
      method: ctx.method,
      data: ctx.request.body,
      deviceId: ctx.cookies.get('Device-Id') || deviceId,
      ...others
    }

    let result

    try {
      result = await fetch(options)

      const apiEnd = new Date().getTime()
      if (apiEnd - apiStart >= 2000) {
        // 接口返回慢
        logger.warn('API_MIDDLEWARE, API Request Time > 2s', apiEnd - apiStart, ctx.req.url)
      }
      if (ctx.req.url && (ctx.req.url.includes('signin') || ctx.req.url.includes('/api/sso/signup/confirm') || ctx.req.url.includes('/api/sso/social/login')) && !result.code) {
        let Token = ""
        if (result.token) {
          Token = result.token
        } else if (result.data && result.data.token && result.data.token.token) {
          Token = result.data.token.token
        }
        if (Token) {
          logger.info('set cookie token', ctx.req.url)
          const cookieOption: any = {
            httpOnly: true,
            domain: process.env.COOKIE_DOMAIN,
            maxAge: ctx.request.body.remember ? 3600 * 1000 * 24 * 7 : null
          }
          ctx.cookies.set(`${prefix}Token`, `Bearer+${Token}`, cookieOption)
        }
      }
      if (beforeReturn) {
        beforeReturn(ctx, result)
      }

      ctx.body = result
    } catch (e) {
      logger.warn('API_MIDDLEWARE, api error:', ctx.req.url, JSON.stringify(e))
      ctx.status = 500
      result = {
        code: 500,
        message: getText('网络连接失败，稍后重试', ctx),
        success: false
      }
      ctx.body = result
    }
  }
}

export default apiMiddleware
