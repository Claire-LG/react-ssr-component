import Redis from 'ioredis'
import { randomBytes } from 'crypto'

interface RedisStore {
  success: boolean
  redis: any
}

class RedisStore {
  constructor(redisConfig: Object) {
    this.success = false
    try {
      this.redis = new Redis(redisConfig)
    } catch (e) {
      this.success = false
      logger.error('catch redis error', JSON.stringify(e))
    }
    this.redis.on('error', (e: any) => {
      this.success = false
      logger.error('redis error', JSON.stringify(e))
    })
    this.redis.on('connect', () => {
      this.success = true
      logger.info('redis connect success')
    })
  }

  getID = (length: number) => randomBytes(length).toString('hex')

  getStatus = () => this.success

  async get(sid: any) {
    const data = await this.redis.get(`SESSION:${sid}`)
    return JSON.parse(data)
  }

  async set(session: any, { sid = this.getID(24), maxAge = 600000 } = {}) {
    try {
      await this.redis.set(`SESSION:${sid}`, JSON.stringify(session), 'EX', maxAge / 1000)
    } catch (e) {
      logger.error('redis set error', JSON.stringify(e))
    }
    return sid
  }

  async destroy(sid: any) {
    await this.redis.del(`SESSION:${sid}`)
    return sid
  }
}

export default RedisStore
