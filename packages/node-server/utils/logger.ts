import log4js from 'log4js'

interface logOptions {
  logPath: string
  isDev: boolean
}

const Logger = ({ logPath, isDev }: logOptions) => {
  const logConfig = {
    appenders: {
      app: {
        type: 'dateFile',
        filename: logPath,
        pattern: '.yyyy-MM-dd-hh'
      }
    },
    categories: {
      default: {
        appenders: ['app'],
        level: 'info'
      }
    },
    pm2: true,
    pm2InstanceVar: 'INSTANCE_ID'
  }

  if (isDev) {
    return console
  }

  log4js.configure(logConfig)

  return log4js.getLogger()
}

export default Logger
