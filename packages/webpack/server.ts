const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const exec = require('child_process').exec

const HOST = process.env.WEBPACK_SERVER_HOST

export = (config: any) => {
  const PORT = process.env.WEBPACK_SERVER_PORT
  config.output.filename = 'js/bundle.js'
  config.output.publicPath = '/'
  config.entry.app.unshift('webpack/hot/only-dev-server')
  config.entry.app.unshift(
    `webpack-dev-server/client?http://${HOST}:${PORT}`,
    'webpack/hot/dev-server'
  )
  config.entry.app.unshift('core-js')

  config.plugins.push(new webpack.HotModuleReplacementPlugin())

  const compiler = webpack(config)
  const server = new WebpackDevServer(compiler, {
    hot: true,
    stats: {
      colors: true
    },
    host: '0.0.0.0',
    quiet: true,
    port: PORT,
    headers: { 'Access-Control-Allow-Origin': '*' },
    historyApiFallback: true,
    disableHostCheck: true
  })

  server.listen(PORT, '0.0.0.0', (err: any) => {
    if (err) {
      console.log(err)
      return
    }
    console.log(`Listening at http://${HOST}:${PORT}`)
    exec(`open http://${HOST}:${PORT}`, (error: any) => {
      if (error) {
        exec(`start http://${HOST}:${PORT}`)
      }
    })
  })
}
