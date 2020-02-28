import getText from './getText'
import { Context } from 'koa'

const checkCaptcha = (ctx: Context, redisStore: any) => {
  if (!redisStore.getStatus()) { // redis不正常
    logger.error('redis 异常,验证码服务出错')
    ctx.body = {
      code: 100,
      message: getText('验证码服务出错，请联系客服', ctx),
      success: false
    }
    return false
  }

  const captcha = ctx.session.captcha
  if (captcha && captcha.toLowerCase() === ctx.request.body.captcha.toLowerCase()) {
    ctx.session.captcha = null
    return true
  }
  if (captcha == null) {
    logger.info('验证码已过期:', 'session', ctx.session, 'captcha:', ctx.request.body.captcha)
    ctx.body = {
      code: 100,
      message: getText('验证码已过期', ctx),
      success: false
    }
    return false
  }

  logger.info('验证码错误', ctx.session, 'captcha:', ctx.request.body.captcha)
  ctx.body = {
    code: 100,
    message: getText('验证码不正确', ctx),
    success: false
  }
  return false
}

export default checkCaptcha
