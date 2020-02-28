import React from 'react'
import { ChunkExtractor } from '@loadable/server'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { matchRoutes } from 'react-router-config'
import { Provider } from 'react-redux'
import { resolve } from 'path'
const getRenderParams = require('@vp/css-webp-plugin/server').getRenderParams
import getText from '../utils/getText'
import getLang from '../utils/getLang'
import nodeParams from '../utils/nodeParams'
import systemMonitor from '../systemMonitor'
import Koa, { Context } from 'koa'

type ObjectParams = { [key: string]: any }
declare module 'koa' {
  interface Request extends Koa.BaseRequest {
    prometheus: ObjectParams
    extra: ObjectParams
  }
}

interface Option {
  App: any
  getStore: any
  setWebp: any
  setFooterData: any
  setLanguage: any
  /** 站点语言包数据 */
  siteLocales: ObjectParams
  routes: any
  locales: any
  fetchList: Array<any>
  isDev: boolean
  beforeLoad: (ctx: Context, route: any, store: any) => Promise<any>
  beforeRender: (ctx: Context, route: any, store: any, pageOptions: any) => Promise<any>
  prefix?: string
}

type DefaultSeoInfo = {
  [key in 'zh_CN' | 'en_US']: {
    title: string
    desc: string
    keywords: string
  }
}

const defaultSeoInfo: DefaultSeoInfo = {
  zh_CN: {
    title: 'VPGAME电竞服务平台',
    desc: 'VPGAME（www.vpgame.com）业务涵盖了DOTA2、守望先锋、英雄联盟、CSGO、刀塔自走棋、绝地求生等多款电竞游戏，并融合了DOTA2饰品交易、CSGO饰品交易，饰品竞猜，电竞赛事，电竞资讯等多项功能，是一个多元化的电竞服务平台。',
    keywords: 'VP,DOTA2赛事平台,VP电竞,DOTA2饰品,CSGO饰品,DOTA2饰品交易,CSGO饰品交易,CDEC战队,CDEC大师赛,DOTA2比赛,DOTA2比赛平台,dota,刀塔,VPGAME,VPGAME电竞平台'
  },
  en_US: {
    title: "【VPGAME】World's No.1 eSports service platform DOTA2 | CSGO",
    desc: 'VPGAME is a multi-purpose esports service platform that provides match making, Dota2 and CS:GO virtual items market, in-game interaction, esports news, which support various esports titles(Dota2, LOL, Overwatch, CS:GO)',
    keywords: 'VPGAME,DOTA2,CSGO,DOTA,DOTA2 Tournament,DOTA2 League,DOTA2 Item Game,DOTA2 accessories,DOTA2 Community,DOTA2 Item Market'
  }
}

const clearUrl = (url: any) => {
  if (!url) {
    return ''
  }
  return url.split('?')[0]
}

const loadBranchData = (store: any, branch: any, others: any, ctx: Context) => {
  const promises = branch.map(({ route, match }: any) => {
    if (route.loadData) {
      return route.loadData({
        dispatch: store.dispatch,
        others,
        params: match.params,
        cookies: ctx.cookies,
        query: ctx.request.query,
        ctx
      })
    }
    return Promise.resolve(null)
  })
  return Promise.all(promises)
}

const renderMiddleware = ({ setLanguage, setWebp, setFooterData, getStore, routes, locales = {}, fetchList, App, beforeLoad, beforeRender, prefix = 'VP', siteLocales = {} }: Option) => async (ctx: Context, next: Function) => {

  const branch: Array<any> = matchRoutes(routes, clearUrl(ctx.req.url))

  if (branch.length > 0 && ctx.method === 'GET') {
    const branchRoute = branch[0].route

    if (branchRoute.path.startsWith('/') || branchRoute.path === '*') {

      const store = getStore()
      const routerContext = {}
      const pageOptions: any = {}
      const entrypointChunk = 'app'
      const currChunks = [entrypointChunk]
      /** 设置语言 */
      const lang = getLang(ctx, prefix)
      const cookieOptions = {
        httpOnly: false,
        domain: process.env.COOKIE_DOMAIN,
        expires: new Date(2147483647000)
      }
      ctx.cookies.set(`${prefix}Lang`, lang, cookieOptions)
      const SiteLocales = (siteLocales && siteLocales[lang]) ? siteLocales[lang] : {}
      await store.dispatch(setLanguage(lang, SiteLocales))

      /** 页面加载前 */
      beforeLoad && await beforeLoad(ctx, branchRoute, store)

      /** 判断是否支持webp */
      let supportWebp = false
      const headerAccept = ctx.header['accept'] || ''
      if (headerAccept.includes('image/webp')) {
        supportWebp = true
        await store.dispatch(setWebp(true))
      }

      /** 设置seo */
      let seo: any = {}
      if (process.env.enableSeo === 'true') {
        try {
          const seoConfig: any = process.env.seoConfig
          seo = JSON.parse(seoConfig)
          seo = seo[lang === 'zh_CN' ? lang : 'en_US']
        } catch (error) {
          logger.error('seo错误')
        }
      }
      branch.forEach(({ route }) => {
        pageOptions.styles = []
        pageOptions.scripts = []
        const currentDefaultSeo = defaultSeoInfo[lang === 'zh_CN'? 'zh_CN' : 'en_US']
        pageOptions.title = getText(route.$title, ctx, prefix, locales) || seo.title || currentDefaultSeo.title
        pageOptions.keywords = getText(route.$keywords, ctx, prefix, locales) || seo.keywords || currentDefaultSeo.keywords
        pageOptions.description = getText(route.$description , ctx, prefix, locales) || seo.description || currentDefaultSeo.desc
        pageOptions.lang = lang
        if (route.$name && !currChunks.includes(route.$name)) {
          currChunks.push(route.$name)
        }
      })

      /** 设置footData */
      let footData: any = []

      if (process.env.enableFootData === 'true') {
        try {
          const footerData: any = process.env.footerData
          footData = JSON.parse(footerData)
          footData = footData[lang === 'zh_CN' ? lang : 'en_US']
        } catch (error) {
          logger.error('footData错误')
        }

        if (setFooterData) {
          store.dispatch(setFooterData(footData))
        }
      }

      const others: any = nodeParams(ctx, prefix)

      /** 请求公用接口 */
      const promiseList = fetchList.map(item => ({
        ...item,
        params: {
          ...item.params,
          ...others,
          ctx
        }
      }))

      await Promise.all(promiseList.map((item: any) => store.dispatch(item.action(item.params))))

      /** 请求页面接口 */
      await loadBranchData(store, branch, others, ctx)

      const statsFile = resolve(process.cwd(), 'assets-cache/loadable-stats.json')
      const extractor = new ChunkExtractor({ statsFile, entrypoints: currChunks }) as any
      currChunks.filter(chunk => chunk !== entrypointChunk).forEach(item => extractor.addChunk(item))

      const rootContent = (!systemMonitor.isOverload()) ? renderToString(
        <Provider store={store}>
          <StaticRouter location={ctx.req.url} context={routerContext}>
            <App />
          </StaticRouter>
        </Provider>
      ) : ''

      const storeState = store.getState()
      const scriptTags = extractor.getScriptTags()
      const styleTags = extractor.getStyleTags() // or  extractor.getStyleElements();

      /** prometheus监控 */
      ctx.request.prometheus = {
        uri: branch[0].route.path
      }

      /** node log */
      ctx.request.extra = {
        html: true,
        content: `页面请求: ${ctx.request.url}`
      }

      /** 页面渲染前 */
      beforeRender && await beforeRender(ctx, branchRoute, store, pageOptions)

      let pageParams = {
        template: 'client',
        scriptTags,
        styleTags
      }
      if (process.env.NODE_ENV === 'production' && supportWebp) {
        pageParams = getRenderParams( { template: 'client', scriptTags, styleTags }, supportWebp, '_webp')
      }
      /** 页面渲染 */
      await ctx.render(pageParams.template, {
        root: rootContent,
        store: storeState,
        scriptTags: pageParams.scriptTags,
        styleTags: pageParams.styleTags,
        ...pageOptions
      })
    } else {
      await next()
    }
  } else {
    await next()
  }
}

export default renderMiddleware
