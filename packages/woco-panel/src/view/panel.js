import { Computed, Effect, Reactive, ReactMap } from './reactive.js'
import { RElementNode, RNodeGroup, RNodeLoop, RTextNode } from './rnode.js'

export const panel = () => {
    const panel = new RElementNode({
        tag: 'div',
        style: new ReactMap()
            .set('display', 'grid')
            .set("gridArea", 'grid')
            .set('gridTemplateColumns ', new Computed([Cell.col], v => `repeat(${v},auto)`))
            .set('gridTemplateRows ', new Computed([Cell.row], v => `repeat(${v}, auto)`))
            .set('height', '100%')//new Computed([Cell.row], v => `${v * 48 - 8}px`))
            .set('gridColumnGap', '8px')
            .set('gridRowGap', '8px'),
    })
}