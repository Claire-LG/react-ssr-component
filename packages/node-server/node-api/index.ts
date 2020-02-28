import { Context } from 'koa'
import nodeParams from '../utils/nodeParams'
import generateCaptcha from '../utils/generateCaptcha'
import checkCaptcha from '../utils/checkCaptcha'

interface Option {
  router: any
  fetch: any
  redisStore: any
  prefix?: string
}

const nodeApi = ({ router, fetch, redisStore, prefix = 'VP' }: Option) => {
  const captchaRoutePath = process.env.CAPTCHA_ROUTE_PATH || process.env.ROUTE_PATH
  const routePath = process.env.ROUTE_PATH
  // 生成验证码
  router.get(`${captchaRoutePath}/captcha`, (ctx: any) => {
    const captcha = generateCaptcha({})
    ctx.session.captcha = captcha.text
    logger.info('session', ctx.session)
    ctx.body = {
      captcha: captcha.data
    }
  })

  //健康检查
  router.get('/health_check', (ctx: any) => {
    logger.info(`[HEALTH_CHECK]: ${new Date()} ${ctx.method} ${ctx.url}`)
    ctx.body = {
      message: 'success',
      code: 200
    }
  })

  // 校验验证码，测试时使用
  router.post(`${captchaRoutePath}/captcha/check`, async (ctx: Context) => {
    if (checkCaptcha(ctx, redisStore)) {
      logger.info('校验验证码正确')
      ctx.body = {
        code: 204,
        success: true
      }
    }
  })

  // 忘记密码发送验证码
  router.post(`${captchaRoutePath}/forget/sendcode`, async (ctx: Context) => {
    if (checkCaptcha(ctx, redisStore)) {
      const others = nodeParams(ctx, prefix)
      const result = await fetch({
        url: `${routePath}/api/sso/password/reset/code`,
        method: 'POST',
        data: ctx.request.body,
        params: 'as',
        ...others
      })

      logger.info('验证码正确，调用加入接口: forget/sendcode', result)
      ctx.body = result
    }
  })

  // 注册发送验证码
  router.post(`${captchaRoutePath}/signup/sendcode`, async (ctx: Context) => {
    if (checkCaptcha(ctx, redisStore)) {
      const others = nodeParams(ctx, prefix)
      const result = await fetch({
        url: `${routePath}/api/sso/signup/code`,
        method: 'POST',
        data: ctx.request.body,
        ...others
      })

      logger.info('验证码正确，调用加入接口: signup/sendcode', result)
      ctx.body = result
    }
  })
}

export default nodeApi
