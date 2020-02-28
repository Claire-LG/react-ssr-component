interface Options {
  routePath: string
  fetch: any
}

const setFooterData = ({ routePath, fetch }: Options) => {
  const footerData: any = {
    zh_CN: [],
    en_US: [],
  }

  process.env.enableFootData = 'true'

  const fetchFootData = (lang: string) => {
    fetch({
      url: `${routePath}/api/common/nav/bottom`,
      ip: '',
      token: '',
      lang
    }).then((res: any) => {
      if (res.success !== false) {
        footerData[lang] = res.data
      }
      process.env.footerData = JSON.stringify(footerData)
    })
  }

  const footerMain = () => {
    fetchFootData('zh_CN')
    fetchFootData('en_US')
  }
  const getFooterData = () => {
    footerMain()
    setInterval(footerMain, 60 * 60 * 1000)
  }
  getFooterData()
}

export default setFooterData
