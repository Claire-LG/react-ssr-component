import os from 'os'

interface SystemMonitor {
  timer: any
  timerActive: boolean
  loadAvg: any
  cpuLength: number
  platform: string
}

class SystemMonitor {
  constructor() {
    this.timer = 0
    this.timerActive = false
    this.loadAvg = null
    this.cpuLength = os.cpus().length
    this.platform = os.platform()
  }

  startTimer = () => {
    // 30秒获取一次系统负载信息
    this.timer = setInterval(() => {
      if (this.timerActive) {
        this.loadAvg = os.loadavg()
      } else {
        clearInterval(this.timer)
        this.timer = 0
      }
      this.timerActive = false
    }, 30 * 1000)
    this.loadAvg = os.loadavg()
  }

  getLoad = () => {
    this.timerActive = true
    if (!this.timer) {
      this.startTimer()
    }
    return this.loadAvg
  }

  isOverload = (baseLine = 0.85) => {
    const loadAvg = this.getLoad()
    baseLine >= 1 ? 0.9 : baseLine
    if (this.platform.includes('win')) {
      return false
    }
    if (loadAvg[0] && loadAvg[0] > baseLine * this.cpuLength) {
      return true
    }
    return false
  }
}

const systemMonitor = new SystemMonitor()

export default systemMonitor
