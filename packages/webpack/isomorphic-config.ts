const WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin')

const IS_CLIENT_HOT = process.env.CLIENT_HOT === 'true'
/**  isomorphic config */
export = {
  // debug: process.env.NODE_ENV !== 'production',
  webpack_assets_file_path: IS_CLIENT_HOT
    ? 'assets-cache/webpack-assets-client.json'
    : 'assets-cache/webpack-assets.json',
  webpack_stats_file_path: IS_CLIENT_HOT
    ? 'assets-cache/webpack-stats-client.json'
    : 'assets-cache/webpack-stats.json',
  assets: {
    images: {
      extensions: ['jpeg', 'jpg', 'png', 'gif'],
      parser: WebpackIsomorphicToolsPlugin.url_loader_parser
    },
    fonts: {
      extensions: ['woff', 'woff2', 'ttf', 'eot'],
      parser: WebpackIsomorphicToolsPlugin.url_loader_parser
    },
    svg: {
      extension: 'svg',
      parser: WebpackIsomorphicToolsPlugin.url_loader_parser
    },
    css: {
      extensions: ['css'],
      parser: WebpackIsomorphicToolsPlugin.style_loader_path_extractor
    },
    less: {
      extensions: ['less'],
      parser: WebpackIsomorphicToolsPlugin.style_loader_path_extractor
    }
  }
}
