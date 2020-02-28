import { Context } from 'koa'

const getBrowserLang = (ctx: Context) => {
  const acceptLang = ctx.header['accept-language']
  let lang = 'en_US'
  if (acceptLang && acceptLang.startsWith('zh')) {
    lang = 'zh_CN'
  }
  return lang
}

const getLang = (ctx: Context, prefix = 'VP') => {
  const langs = ['zh_CN', 'en_US', 'ru_RU']
  const lang = ctx.query.lang || ctx.cookies.get(`${prefix}Lang`) || getBrowserLang(ctx)

  if (langs.includes(lang)) {
    return lang
  }
  return 'zh_CN'
}

export default getLang
