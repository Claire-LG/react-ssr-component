import svgCaptcha, { createMathExpr, create } from 'vp-svg-captcha'

interface Options {
  width?: number
  height?: number
  fontSize?: number
  size?: number
  noise?: number
}

const generateCaptcha = ({ width = 90, height = 30, fontSize = 45, size = 6, noise = 3 }: Options, text: string = '') => {
  const opts = { width, height, fontSize, size, noise }
  if (!text) {
    return Math.random() >= 0.5 ? createMathExpr(opts) as any : create(opts) as any
  }
  return svgCaptcha(text, opts) as any
}

export default generateCaptcha
