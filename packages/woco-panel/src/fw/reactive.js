export const emit = Symbol()

export class Reactive {
    #val = undefined
    #watchers = []

    constructor(val = undefined) {
        this.#val = val
    }

    getVal() {
        return this.#val
    }

    setVal(newVal) {
        this.#val = newVal
        this.#watchers.forEach(v => v[emit](this))
    }

    updateVal(fn) {
        const newVal = fn(this.#val)
        this.setVal(newVal)
    }

    attach(watcher) {
        this.#watchers = this.#watchers.filter(v => v != watcher).concat([watcher])
    }

    detach(watcher) {
        this.#watchers = this.#watchers.filter(v => v != watcher)
    }
}

export class Effect {
    #fn = () => { }
    constructor(fn) { this.#fn = fn }
    [emit]() {
        this.#fn()
    }
}

export class Computed extends Reactive {

    #inputs = []
    #getter = (...args) => args
    #setter = null
    #deps = []

    constructor(
        inputs,
        getter = (...args) => args,
        setter = null
    ) {
        super()

        this.#inputs = inputs
        this.#getter = getter
        this.#setter = setter

        this.#deps = inputs.filter(v => v instanceof Reactive)
        // 在依赖数据上添加监听
        this.#deps.forEach(v => v.attach(this))
        // 更新当前数据
        this.#update()
    }

    // 当前数据更新方法
    #update() {
        super.setVal(
            this.#getter(
                ...this.#inputs.map(
                    v => v instanceof Reactive
                        ? v.getVal()
                        : v
                )
            )
        )
    }

    setVal(newVal) {
        // 如果不存在 setter ，报错
        if (!this.#setter) throw new Error(`Computed: setter is not exist!`)
        // 存在 setter 则调用 setter
        this.#setter(newVal)
    }

    // 监听数据更新则调用 #update，更新当前数据 
    [emit]() {
        this.#update()
    }

    // Computed 特有的注销方法
    destory() {
        this.#deps.forEach(v => v.detach(this))
    }
}

export class ReactMap extends Reactive {

    #map = new Map()

    #deps = new Map()

    constructor() {
        super(new Map())
    }

    set(key, value) {

        if (this.#map.has(key)) this.delete(key)

        this.#map.set(key, value)

        if (value instanceof Reactive) {
            value.attach(this)
            this.#deps.set(value, (this.#deps.get(value) || []).concat([key]))
        }

        super.updateVal(map => {
            map.set(key, value instanceof Reactive ? value.getVal() : value)
            return map
        })

        // 返回当前实例，以实现链式调用
        return this
    }

    get(key) {
        return this.#map.get(key)
    }

    delete(key) {
        if (!this.#map.has(key)) return

        const r = this.#map.get(key)

        if (r instanceof Reactive) {
            const keys = this.#deps.get(r).getVal().filter(v => v !== key)

            if (keys.length > 0) {
                this.#deps.set(r, keys)
            } else {
                this.#deps.delete(r)
                r.detach(this)
            }
        }

        this.#map.delete(r)

        super.updateVal(map => {
            map.delete(key)
            return map
        })

    }

    [emit](r) {
        const keys = this.#deps.get(r) || []
        const newVal = r.getVal()
        super.updateVal(map => {
            keys.forEach(key => { map.set(key, newVal) })
            return map
        })

    }
}
