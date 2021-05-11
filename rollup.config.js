class Pipe{
    
    #val = null

    constructor(val = null){
        this.#val = val
    }

    next(fn){
        const newVal = fn(this.#val)
        return new Pipe(this.#val)
    }
}


class Config{

    target =  '' // 需要打包的包名
    formats = ['ejs'] // 'cjs' 'esm' 'iifs' 'umd' 等
    env = 'production' // 'develop' 'production'
    sourcemap = false //
}




