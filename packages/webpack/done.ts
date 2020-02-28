const fs = require('fs')
const { join } = require('path')

interface FileHandlerFace {
  /** 文件路径 */
  filePath: string
  /**
   * 处理文件
   * @param content string 文件文本内容
   * @memberof FileHandlerFace
   * @return string 返回修改后的文件内容
   */
  handler: (content: string) => string
}


interface ConstructorProps {
  /** 服务端模板地址 */
  viewHtmlFile: string
  /** 服务端模板替换 head body */
  viewHtmlFileContent: Partial<{
    /** head标签结尾插入 */
    head: string
    /** body 标签结尾插入 */
    body: string
  }>
  /** isomorphic 配置修改 */
  assetsFile: string
  /** 自定义文件处理 */
  fileHandler: FileHandlerFace[]
}
/**
 * webpack 打包完成文件处理插件
 * @class DonePlugin
 */
export = class DonePlugin {
  viewHtmlFile: string
  assetsFile: string
  viewHtmlFileContent: Partial<{
    head: string
    body: string
  }>
  fileHandler: FileHandlerFace[]

  /**
   *Creates an instance of DonePlugin.
   * @param {Partial<ConstructorProps>} [props={}]
   * @memberof DonePlugin
   */
  constructor(props: Partial<ConstructorProps> = {}) {
    this.viewHtmlFile = props.viewHtmlFile || ''
    this.viewHtmlFileContent = props.viewHtmlFileContent || {}
    this.assetsFile = props.assetsFile || ''
    this.fileHandler = props.fileHandler || []
  }


  updateTemplate() {
    try {
      const html = fs.readFileSync(this.viewHtmlFile, 'utf-8')
      const placeholder = this.viewHtmlFileContent
      const newHtml = html.replace('</head>', `${placeholder.head || ''}</head>`).replace('</body>', `${placeholder.body || ''}</body>`)
      fs.writeFileSync(this.viewHtmlFile, newHtml, {
        encoding: 'utf-8'
      })
    } catch (error) {
      throw error
    }
  }

  updateAssets() {
    try {
      const assets = fs.readFileSync(this.assetsFile, 'utf-8')
      const newAssets = assets.replace(/\.\/src\//gi, './build/')
      fs.writeFileSync(this.assetsFile, newAssets, {
        encoding: 'utf-8'
      })
    } catch (error) {
      throw error
    }
  }

  /* eslint-disable class-methods-use-this */
  /* eslint-disable no-unused-vars */
  fileHandlerFn({ filePath = '', handler = (_content: string) => '' } = {}) {
    try {
      const assets = fs.readFileSync(filePath, 'utf-8')
      const newAssets = handler(assets)
      if (typeof newAssets !== 'string') {
        return
      }
      fs.writeFileSync(filePath, newAssets, {
        encoding: 'utf-8'
      })
    } catch (error) {
      throw error
    }
  }

  /* eslint-disable no-useless-escape */
  createVersion(stats: any) {
    try {
      const text = `name: ${process.env.npm_package_name}
version: ${process.env.npm_package_version}
commitHash: ${stats.compilation.fullHash}`
      fs.writeFileSync(join(stats.compilation.outputOptions.path.replace(new RegExp(`${process.env.npm_package_version}(\/)?$`, 'gi'), ''), 'version.txt'), text, {
        encoding: 'utf-8'
      })
    } catch (error) {
      throw error
    }
  }

  onCompilationDone(stats: any) {
    if (this.viewHtmlFile) {
      this.updateTemplate()
    }
    if (this.assetsFile) {
      this.updateAssets()
    }
    if (this.fileHandler.constructor === Array && this.fileHandler.length > 0) {
      this.fileHandler.forEach(item => {
        if (item.filePath) {
          this.fileHandlerFn(item)
        }
      })
    }
    if (process.env.NODE_ENV === 'production') {
      this.createVersion(stats)
    }
  }

  apply(compiler: any) {
    if (compiler.hooks && compiler.hooks.watchRun && compiler.hooks.done) {
      compiler.hooks.done.tap('DonePlugin', this.onCompilationDone.bind(this))
    } else {
      compiler.plugin('done', this.onCompilationDone.bind(this))
    }
  }
}
