import getLang from './getLang'
import { Context } from 'koa'
interface Object {
  [key: string]: any
}

const initialLocales: Object = {
  'en_US': {
    '验证码不正确': 'Verification code is wrong',
    '验证码已过期': 'Verification code has expired',
    '验证码服务出错，请联系客服': 'Verification code error, please contact the customer service',
    '抱歉，网络不佳，请稍后再试': 'A connection error has occurred. Please try again later.',
    '预测': 'Prediction',
    '预测-VPGAME电竞服务平台': 'Prediction-【VPGAME】World’s No.1 eSports service platform',
    'DOTA2资讯,DOTA2新闻,DOTA2视频,电竞新闻,电竞资讯,DOTA2赛事,DOTA2比赛,DOTA2赛程,VPGAME,VPGAME电竞平台,DOTA2赛事平台,VP电竞,DOTA2饰品,CSGO饰品,CSGO皮肤,DOTA2饰品交易,CSGO饰品交易,CDEC战队,CDEC大师赛,DOTA2比赛平台,DOTA2赛事中心,CSGO比赛,CSGO赛事,饰品交易': 'VPGAME DOTA2,Tournament, League, Item Market',
    'VPGAME（www.vpgame.com）业务涵盖了DOTA2、守望先锋、英雄联盟、CSGO等多款电竞游戏，并融合了DOTA2饰品交易、CSGO饰品交易，饰品竞猜，电竞赛事，电竞资讯等多项功能，是一个多元化的电竞服务平台。': `[VPGAME] World's No.1 eSports service platform DOTA2 | CSGO`
  },
  'ru_RU': {
    '验证码不正确': 'Verification code is wrong',
    '验证码已过期': 'Verification code has expired',
    '验证码服务出错，请联系客服': 'Verification code error, please contact the customer service',
    '抱歉，网络不佳，请稍后再试': 'A connection error has occurred. Please try again later.',
    '预测': 'Prediction',
    '预测-VPGAME电竞服务平台': '【VPGAME】Обмен и продажа предметов Dota 2, обмен и продажа предметов CSGO-Киберспортивная платформа VPGAME',
    'DOTA2资讯,DOTA2新闻,DOTA2视频,电竞新闻,电竞资讯,DOTA2赛事,DOTA2比赛,DOTA2赛程,VPGAME,VPGAME电竞平台,DOTA2赛事平台,VP电竞,DOTA2饰品,CSGO饰品,CSGO皮肤,DOTA2饰品交易,CSGO饰品交易,CDEC战队,CDEC大师赛,DOTA2比赛平台,DOTA2赛事中心,CSGO比赛,CSGO赛事,饰品交易': 'Расписание Dota 2, результаты Dota 2, команды Dota 2, игроки Dota 2, матчи Dota 2',
    'VPGAME（www.vpgame.com）业务涵盖了DOTA2、守望先锋、英雄联盟、CSGO等多款电竞游戏，并融合了DOTA2饰品交易、CSGO饰品交易，饰品竞猜，电竞赛事，电竞资讯等多项功能，是一个多元化的电竞服务平台。': `Киберспортивная платформа VPGAME`
  }
}

type LocalFace = {
  [key: string]: {
    [key: string]: string
  }
}

const getText = (text: string, ctx: Context, prefix = 'VP', locales?: any) => {
  const finallyLocales: LocalFace = {
    'en_US': {
      ...initialLocales['en_US'],
      ...((typeof locales !== 'undefined' && locales.en_US && locales.en_US.constructor === Object) ? locales.en_US : {})
    },
    'ru_RU': {
      ...initialLocales['ru_RU'],
      ...((typeof locales !== 'undefined' && locales.ru_RU && locales.ru_RU.constructor === Object) ? locales.ru_RU : {})
    }
  }

  const lang = getLang(ctx, prefix)

  if (lang === 'zh_CN') {
    return text
  }

  if (finallyLocales[lang] && typeof finallyLocales[lang][text] === 'string' && finallyLocales[lang][text].replace(/\s/g,'') !== '') {
    return finallyLocales[lang][text]
  }

  return ''
}

export default getText
