#  @vp/ssr

[![@vp/ssr](https://img.shields.io/badge/@vp/ssr-v0.2.0-blue.svg)](https://git.vpgame.cn/fed/vp-ssr)
[![node](https://img.shields.io/badge/node->%3D%208.9.3-green.svg)](https://badge.fury.io/js/node)
[![react](https://img.shields.io/badge/react->%3D%2016.8.6-orange.svg)](https://reactjs.org)
[![babel](https://img.shields.io/badge/babel-v7.0.0-yellow.svg)](https://babeljs.io/)

## 安装
    npm i @vp/ssr --registry=http://npm.vpgame.cn

### 1.目录介绍
    packages（组件源码） 
    lib (组件编译之后代码)

### 2.开发编译
    实时编译 npm run watch
    npm link
    项目中npm link @vp/ssr

### 3.发布组件
    npm version patch
    npm run build
    npm publish

### 4.组件规范
    
  目前的规范如下

  - packages 目录下index.ts 暴露组件
    - 每个组件对应一个文件夹原则上文件夹名字小写
    - 每个组件内部有一个index.ts 暴露组件以及引入对应的样式文件 

### 5.使用

corsMiddleware   

```javascript
import { corsMiddleware } from '@vp/ssr'
app.use(corsMiddleware({}))
```

apiMiddleware
```javascript
import { apiMiddleware } from '@vp/ssr'
app.use(apiMiddleware({
  prefix,
  fetch,
  serviceList,
  routePath
}))
```

serviceList
```javascript
const serviceList = [{
  key: 'yii',
  url: process.env.YII_URL
}, {
  key: 'api',
  url: process.env.SERVICE_URL,
}]
```

renderMiddleware
```javascript
import { renderMiddleware } from '@vp/ssr'
app.use(renderMiddleware(renderConfig))
```

renderConfig
```javascript
import App from '../../client/container/App'
import getStore from '../../client/redux/store'
import { setLanguage } from '../../client/action/language'
import { fetchUserInfo } from '../../client/container/App/action'
import { fetchNavInfo } from '../../client/container/App/navAction'
import { fetchNotice } from '../../client/container/App/noticeAction'
import routes, { ACTIVE_PATH } from '../../controllers'
import locales from '../locales'

const config = {
  App,
  getStore,
  setLanguage,
  routes,
  fetchList: [{
    action: fetchUserInfo,
    params: {
      activePath: ACTIVE_PATH
    }
  }, {
    action: fetchNavInfo,
  }, {
    action: fetchNotice,
  }],
  locales,
  beforeLoad: (ctx, route) => {
    console.log('beforeLoad')
  },
  beforeRender: (ctx, route) => {
    console.log('beforeRender')
  }
}

export default config
```

Logger
```javascript
import { Logger } from '@vp/ssr'
global.logger = Logger({
  logPath: process.env.LOG_PATH,
  isDev: __DEV__
})
```

setSeo
```javascript
import { setSeo } from '@vp/ssr'
setSeo({
  fetch,
  routePath: INDEX_PATH,
})
```

fetch
```javascript
import { fetch as utilFetch } from 'vp-utils'
import { isClient } from './util'
import serviceList from '../server/config/serviceList'
import versions from '../server/config/versions'

const fetch = params => utilFetch({
  serviceList,
  versions,
  indexPath: process.env.ROUTE_PATH,
  type: isClient ? 'client' : 'server',
  logger: global.logger,
  serverHost: process.env.SERVER_API_HOST,
  serverPort: process.env.SERVER_API_PORT,
  isDev: __DEV__
})(params)

export default fetch
```

server.js
```js
const { webpackDevServer } = require('@vp/ssr')
const webpackConfig = require('./webpack.config')

webpackDevServer(webpackConfig)
```

paths.js
```js
const { paths } = require('@vp/ssr')

module.exports = paths
```

isomorphic-config.js
```js
const { webpackIsomorphicConfig } = require('@vp/ssr')

module.exports = webpackIsomorphicConfig
```

webpack.config.js
PC项目可直接使用 webpack config,可以添加自定义配置
```js
const { webpackConfig } = require('@vp/ssr')

module.exports = webpackConfig
```

项目根目录创建customConfig.js可进行webpack部分内容进行配置

```js
module.exports = {

  /** less options */
  lessDefaultOptions: {

    modifyVars: {
      hd: '3px',
      'brand-primary': '#3C3C3C',
    }

  },

  /** 开启 BundleAnalyzerPlugin 开关 默认关闭 */
  enableDll: false,

  /**  HtmlWebpackPlugin 配置 */
  HtmlWebpackConfig: {},

  /**  sass-resources-loader 配置 */
  sassResourcesLoaderOptions: {}

}
```

DonePlugin (webpack构建完成执行文件操作插件 原createVersion已内置 production生成version.txt)
默认webpack已添加该插件
  
  > 构建完成需要对文件进行操作可使用此插件

```js
  const { DonePlugin } = require('@vp/ssr')

  //构建完成对文件进行操作
  new DonePlugin({
    fileHandler: [{
      /** 文件路劲 */
      filePath: string
      /**
       * 处理文件
       * @param content string 文件文本内容
       * @return string 返回修改后的文件内容
       */
      handler: (content: string) => string
    }]
  })
```

#### 注意

  - autoprefixer 以及 postcss-pxtorem 已从webpack配置去除 如需配置postcss-loader 如需使用如下: 

    > 项目根目录创建postcss.config.js
    ```js
    module.exports = {
      plugins: {
        'autoprefixer': {},
        'postcss-pxtorem': {
          rootValue: 124.2,
          propWhiteList: []
        }
      }
    }
    ```


