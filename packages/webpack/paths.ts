const { resolve } = require('path')

const resolveApp = (relativePath: string) => resolve(process.cwd(), relativePath)

const IS_CLIENT_HOT = process.env.CLIENT_HOT === 'true'

const VIEW_DIR = resolveApp('build/static')

const BUILD_DIR = process.env.NODE_ENV !== 'production'
  ? resolveApp('build/static')
  : resolveApp(`build/static/${process.env.npm_package_version}`)

const fileName = IS_CLIENT_HOT ? 'index.html' : 'client.art'

/** paths */
export = {
  /** webpack 输出目录 */
  appBuild: BUILD_DIR,
  /** html 模板目录 */
  appHtml: resolveApp('src/view/index.html'),
  /** 模板输出目录 */
  viewHtml: VIEW_DIR,
  /** 模板路径 */
  viewHtmlFile: `${VIEW_DIR}/${fileName}`,
  /** favicon路径 */
  appFavicon: resolveApp('src/client/images/favicon.ico'),
  /** webpack 入口文件 */
  appIndexJs: resolveApp('src/client/index.js'),
  /** node_modules路径 */
  appNodeModules: resolveApp('node_modules'),
  /** env配置文件目录 */
  envPath: resolveApp('env')
}
