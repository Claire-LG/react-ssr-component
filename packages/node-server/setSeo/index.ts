interface Options {
  routePath: string
  fetch: any
}

const setSeo = ({ routePath, fetch }: Options) => {
  const seoConfig: any = {
    zh_CN: {
      title: '',
      keywords: '',
      description: '',
    },
    en_US: {
      title: '',
      keywords: '',
      description: '',
    },
  }

  process.env.enableSeo = 'true'

  const fetchSeo = (lang: string) => {
    fetch({
      url: `${routePath}/api/news/seo_info?language=${lang.toLocaleLowerCase()}`,
      lang
    }).then((res: any) => {
      if (res.success !== false) {
        seoConfig[lang].title = res.data.title
        seoConfig[lang].keywords = res.data.keywords
        seoConfig[lang].description = res.data.description
      }
      process.env.seoConfig = JSON.stringify(seoConfig)
    })
  }

  const seoMain = () => {
    fetchSeo('zh_CN')
    fetchSeo('en_US')
  }
  const seoInfo = () => {
    seoMain()
    setInterval(seoMain, 60 * 60 * 1000)
  }

  seoInfo()
}

export default setSeo
