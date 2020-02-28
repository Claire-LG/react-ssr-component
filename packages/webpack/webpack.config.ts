const webpack = require('webpack')
const path = require('path')
const LoadablePlugin = require('@loadable/webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const DonePlugin = require('./done')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin')
const Dotenv = require('dotenv')
const DotenvWebpack = require('dotenv-webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const CssWebpWebpackPlugin = require('@vp/css-webp-plugin/webpack')

const paths = require('./paths')
const isomorphicConfig = require('./isomorphic-config')

const NODE_ENV = process.env.NODE_ENV || 'development'
const IS_CLIENT_HOT = process.env.CLIENT_HOT === 'true' // 是否纯前端渲染
const IS_LOCAL_DEV = process.env.__IS_LOCAL_DEV__ === 'true' // 是否本地开发模式

const webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(
  isomorphicConfig
).development()

const ExtractLESS = new MiniCssExtractPlugin({
  filename: IS_CLIENT_HOT ? 'css/[name].css' : 'css/[name].[hash].css',
  chunkFilename: IS_CLIENT_HOT ? 'css/style.[name].css' : 'css/[name].[hash].css',
})

Dotenv.config({
  path: `${paths.envPath}/common.env`
})

Dotenv.config({
  path: `${paths.envPath}/${NODE_ENV}.env`
})

const commonDot = new DotenvWebpack({
  path: `${paths.envPath}/common.env`,
  systemvars: true
})

const nodeEnvDot = new DotenvWebpack({
  path: `${paths.envPath}/${NODE_ENV}.env`,
  systemvars: true
})

let WpConfig: any = {
  /** less options */
  lessDefaultOptions: {},
  /** 开启 BundleAnalyzerPlugin */
  enableDll: false,
  /**  HtmlWebpackPlugin 配置 */
  HtmlWebpackConfig: {},
  /**  sass-resources-loader 配置 */
  sassResourcesLoaderOptions: {},
  /** base 64 limit设置*/
  base64Limit: 5000
}

try {
  let wpConfig = require(`${path.join(process.cwd(), 'customConfig.js')}`)
  WpConfig = {
    ...WpConfig,
    ...wpConfig
  }
} catch (error) {
  throw error
}

const sassResourcesLoader: any[] = []

if (WpConfig.sassResourcesLoaderOptions && WpConfig.sassResourcesLoaderOptions.resources && WpConfig.sassResourcesLoaderOptions.resources.length > 0) {
  sassResourcesLoader.push({
    loader: 'sass-resources-loader',
    options: WpConfig.sassResourcesLoaderOptions
  })
}


const webpackConfig: any = {
  mode: IS_CLIENT_HOT ? 'development' : 'production',
  optimization: {},
  context: path.resolve(process.cwd()),

  entry: {
    app: [paths.appIndexJs]
  },

  output: {
    path: paths.appBuild,
    filename: 'js/[name].[chunkhash:8].js',
    publicPath: NODE_ENV !== 'production' ? process.env.CLIENT_PUB : `${process.env.CLIENT_PUB}${process.env.npm_package_version}/`,
    chunkFilename: 'js/[name].[chunkhash:8].js',
    sourceMapFilename: IS_LOCAL_DEV ? '[file].map' : 'vp_source_map/[file].map'
    // 线上调试某个js文件的代码 //# sourceMappingURL=/vp_source_map/js/xxxx.js.map
  },

  performance: {
    maxAssetSize: 1024 * 100
  },

  devtool: IS_LOCAL_DEV ? 'cheap-module-eval-source-map' : 'hidden-source-map',

  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        exclude: paths.appNodeModules,
        use: 'babel-loader'
      },
      {
        test: webpackIsomorphicToolsPlugin.regularExpression('css'),
        use: [
          IS_LOCAL_DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: webpackIsomorphicToolsPlugin.regularExpression('less'),
        use: [
          IS_LOCAL_DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'less-loader',
            options: WpConfig.lessDefaultOptions,
          },
          ...sassResourcesLoader
        ]
      },
      {
        test: webpackIsomorphicToolsPlugin.regularExpression('images'),
        loader: `url-loader?limit=${WpConfig.base64Limit}&name=images/[name].[hash:8].[ext]`
      }
    ],
    exprContextRegExp: /$^/,
    exprContextCritical: false
  },

  resolve: {
    extensions: ['.js', '.jsx', 'ts', 'tsx', '.json', '.less', '.css'],
    alias: {
      '~': path.resolve('src/'),
      '@': path.resolve('src/client/'),
    }
  },

  plugins: [
    IS_LOCAL_DEV
      ? new webpack.NamedModulesPlugin()
      : new webpack.HashedModuleIdsPlugin(),

    new ProgressBarPlugin(),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': IS_LOCAL_DEV ? JSON.stringify('development') : JSON.stringify('production'),
      __DEV__: IS_LOCAL_DEV,
      __IS_CLIENT__: true
    }),

    ExtractLESS,

    new HtmlWebpackPlugin({
      template: paths.appHtml,
      favicon: paths.appFavicon,
      title: process.env.STATIC_TITLE || 'VPGAME',
      filename: paths.viewHtmlFile,
      isHOT: IS_CLIENT_HOT ? 'true' : 'false',
      iconFontLink: process.env.ICON_FONT_LINK,
      GrowingIO_Id: process.env.GROWINGIO_ID,
      chunks: IS_CLIENT_HOT ? '' : [],
      minify: {
        removeComments: IS_LOCAL_DEV,
        collapseWhitespace: IS_LOCAL_DEV
      },
      ...WpConfig.HtmlWebpackConfig
    }),

    webpackIsomorphicToolsPlugin,

    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ru|zh-cn|en/),

    commonDot,

    nodeEnvDot,

  ]
}

if (WpConfig.enableDll) {
  webpackConfig.plugins.push(
    new BundleAnalyzerPlugin()
  )
}

if (!IS_CLIENT_HOT) {
  webpackConfig.entry.app.unshift('core-js')
  webpackConfig.entry.vendor = [
    'react',
    'react-dom',
    'redux',
    'react-redux',
    'redux-thunk',
    'react-router-dom',
  ]

  webpackConfig.optimization.minimizer = [
    new TerserPlugin({
      terserOptions: {
        parse: {
          ecma: 8
        },
        compress: {
          ecma: 5,
          warnings: false,
          comparisons: false,
          inline: 2
        },
        mangle: {
          safari10: true
        },
        output: {
          ecma: 5,
          comments: false,
          ascii_only: true
        }
      },
      // 多核处理能力，为true时值为 os.cpus().length - 1
      parallel: true,
      // 关键行，开启缓存
      cache: true,
      sourceMap: true
    })
  ]

  webpackConfig.optimization.runtimeChunk = {
    name: 'runtime'
  }

  webpackConfig.optimization.splitChunks = {
    minChunks: 3,
    cacheGroups: {
      vendor: {
        chunks: 'initial',
        name: 'vendor',
        test: 'vendor',
        enforce: true
      },
      styles: {
        name: 'styles',
        test: /\.css$/,
        chunks: 'all',
        enforce: true
      }
    }
  }

  webpackConfig.plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),

    new LoadablePlugin({
      writeToDisk: {
        filename: path.resolve(process.cwd(), 'assets-cache')
      }
    }),

    new DonePlugin({
      viewHtmlFile: paths.viewHtmlFile,
      viewHtmlFileContent: {
        head: '{{@styleTags || ""}}',
        body: '{{@scriptTags || ""}}'
      },
      assetsFile: process.env.DEV_SERVER === 'true' ? '' : isomorphicConfig.webpack_assets_file_path
    }),

    new CssWebpWebpackPlugin({
      template: paths.viewHtmlFile, // template路径
      webpfix: 'x-oss-process=image/format,webp', //阿里OSS webp格式
      postfix: '_webp' // template文件后缀
    })
  )
}


export = webpackConfig

