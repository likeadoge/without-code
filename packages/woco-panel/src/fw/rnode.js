import { Reactive, ReactMap, emit } from './reactive.js'

export class VNode {
    #node = null
    constructor(node) {
        this.#node = node
    }
    setNode(node) { this.#node = node }
    getNode() { return this.#node }
    destory() {
        if (this.#node.parentNode) {
            this.#node.parentNode.removeChild(this.#node)
        }
    }
}

export class RTextNode extends VNode {

    #text = null

    constructor({ text = '' }) {
        super(document.createTextNode(''))
        this.#text = text instanceof Reactive ? text : new Reactive(text)
        this.#text.attach(this)
        this.#updateText()
    }

    #updateText() {
        this.getNode().data = this.#text.getVal()
    }

    destory() {
        this.#text.detach(this)
        super.destory()
    }

    [emit]() {
        this.#updateText()
    }
}

export class RElementNode extends VNode {

    #tag = ""

    #style = new ReactMap()
    #styleCache = new Map()
    #event = new ReactMap()
    #eventCache = new Map()
    #attr = new ReactMap()
    #attrCache = new Map()
    #children = []
    #childrenCache = []


    constructor({
        tag = "div",
        style = new ReactMap(),
        event = new ReactMap(),
        attr = new ReactMap(),
        children = []
    }) {

        super(document.createElement(tag))

        this.#tag = tag
        this.#style = style
        this.#event = event
        this.#attr = attr
        this.#children = children

        this.#style.attach(this)
        this.#event.attach(this)
        this.#attr.attach(this)
        this.#children.attach(this)

        this.#updateAttr()
        this.#updateEvent()
        this.#updateStyle()
        this.#updateChildren()
    }

    [emit](r) {
        switch (r) {
            case this.#attr:
                return this.#updateAttr()
            case this.#event:
                return this.#updateEvent()
            case this.#style:
                return this.#updateStyle()
            case this.#children:
                return this.#updateChildren()
            default:
                throw new Error('RElementNode: update Error!')
        }
    }

    #updateEvent() {
        Array.from(this.#eventCache.entries()).forEach(([type, listener]) => {
            this.getNode().removeEventListener(type, listener)
        })

        this.#eventCache.clear()

        Array.from(this.#event.getVal().entries()).forEach(([type, listener]) => {
            this.getNode().addEventListener(type, listener)
            this.#eventCache.set(type, listener)
        })
    }

    #updateStyle() {

        Array.from(this.#styleCache.entries()).forEach((property, value) => {
            this.getNode().style[property] = ''
        })

        this.#styleCache.clear()

        Array.from(this.#style.getVal().entries()).forEach(([property, value]) => {
            this.getNode().style[property] = value
            this.#styleCache.set(property, value)
        })
    }

    #updateAttr() {
        Array.from(this.#styleCache.entries()).forEach((type, _) => {
            this.getNode().removeAttribute(type)
        })

        this.#attrCache.clear()

        Array.from(this.#attr.getVal().entries()).forEach((name, value) => {
            this.getNode().setAttribute(name, value)
            this.#attrCache.set(name, value)
        })
    }

    #updateChildren() {
        this.#childrenCache.forEach(node => {
            this.getNode().removeChild(node)
        })

        this.#childrenCache.length = 0

        this.#children.getList().forEach(v => {
            this.getNode().appendChild(v.getNode())
            this.#childrenCache.push(v.getNode())
        })
    }
}

export class RNodeList extends Reactive {

    constructor() {
        super([])
    }

    setList(list) {
        list.forEach(v => {
            if (!v instanceof VNode) {
                throw new Error("RNodeList: input shoud be Vnode List")
            }
        })
        super.setVal(list)
    }

    getList() {
        return super.getVal()
    }

}

export class RNodeGroup extends RNodeList {
    #group = []
    #deps = []
    constructor(group) {
        super()
        this.#group = group
        this.#deps = group.filter(v => v instanceof RNodeList)
        this.#deps.forEach(v => { v.attach(this) })
        this.#update()
    }

    destory() {
        this.#deps.forEach(v => {
            v.detach(this)
        })
    }

    #update() {
        super.setList(
            this.#group.flatMap(
                v => v instanceof RNodeList
                    ? v.getList()
                    : [v]
            )
        )
    }

    [emit]() {
        this.#update()
    }
}

export class RNodeCase extends RNodeList {
    #val = false
    #list = null

    constructor(val, rNodeList) {
        super()
        this.#list = rNodeList
        this.#val = val instanceof Reactive ? val : new Reactive(val)
        this.#val.attach(this)
        this.#update()
    }

    #update() {
        const val = this.#val.getVal()
        if (val)
            super.setList(this.#list.getList())
        else
            super.setList([])
    }

    destory() {
        this.#val.detach(this)
    }

    [emit]() {
        this.#update()

    }
}

export class RNodeLoop extends RNodeList {
    #vals = null
    #createNodeList = () => { }
    #createKey = () => { }
    #cache = new Map()

    constructor(
        vals,
        createNodeList,
        createKey = () => Math.random(),
    ) {
        super()
        this.#vals = vals instanceof Reactive ? vals : new Reactive(vals)
        this.#createKey = createKey
        this.#createNodeList = createNodeList

        this.#vals.attach(this)
        this.#update()
    }


    #update() {
        const vals = Array.from(this.#vals.getVal())
        const newCache = new Map()

        Array.from(this.#cache.values()).forEach(v => v.detach(this))

        super.setList(vals.flatMap((val, index) => {
            const key = this.#createKey(val, index)
            const rNodeList = this.#cache.has(key)
                ? this.#cache.get(key)
                : this.#createNodeList(val, index)

            rNodeList.attach(this)
            newCache.set(key, rNodeList)
            return rNodeList.getList()
        }))

        this.#cache = newCache
    }

    destory() {
        this.#vals.detach(this)
        Array.from(this.#cache.values()).forEach(v => v.detach(this))
    }

    [emit]() { this.#update() }
}
