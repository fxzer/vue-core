import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { createRequire } from 'node:module'
import process from 'node:process'
import esbuild from 'esbuild'

const args = process.argv.slice(2)

const __dirname = resolve(fileURLToPath(import.meta.url), '..')
const require = createRequire(import.meta.url)

const target = args[0] || 'reactivity'

const format = args[2] || 'iife'

// 入口文件
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`)
// 包信息
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`))

// 打包
esbuild.context({
  entryPoints: [entry],
  outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`),
  bundle: true, // reactivity --> shared 会整合到一起
  format,
  globalName: pkg.buildOptions?.name,
  sourcemap: true,
  platform: 'browser', // 打包后给浏览器用的
}).then((ctx) => {
  return ctx.watch() // 监听文件变化持续打包
}).catch(() => {
  console.error(`Build ${target} failed`)
})
