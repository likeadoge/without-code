import path from 'path'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import { terser } from "rollup-plugin-terser";



class Config {

    #target = '' // 需要打包的包名
    #formats = ['cjs'] // 'cjs' 'esm' 'iifs' 'umd' 等
    #env = 'production' // 'develop' 'production'
    #sourcemap = false //


    constructor(target) {
        this.#target = target
    }

    format(...args) {
        this.#formats = args
        return this
    }

    env(env = 'production') {
        this.#env = env
        return this
    }

    sourcemap(bool) {
        this.#sourcemap = bool
    }

    createRollupConfig() {
        const pkgDir = path.resolve('./packages/', this.#target)
        console.log(path.resolve(pkgDir, '/src/index.js'))
        return {
            input: path.resolve(pkgDir, './src/index.js'),
            output: this.#formats.map(format => ({
                file: path.resolve(pkgDir, `./dist/index.${format}.js`),
                format: format,
                name: this.#target,
            })),
            plugins: [
                resolve({ preferBuiltins: true, browser: true }),
                commonjs(),
                json({ compact: true }),
                terser()
            ]
        }
    }
}


const pkg = ['woco-vite-plugin']

export default pkg.map(target => new Config(target).createRollupConfig())
