module.exports = function woco(option = {}) {
    const {virtualFileId} = option
    console.log(option)
    return {
        name: 'my-plugin', // 必须的，将会显示在 warning 和 error 中
        resolveId(id) {
            if (id === virtualFileId) {
                return virtualFileId
            }
        },
        load(id) {
            if (id === virtualFileId) {
                return `export const msg = "from virtual file"`
            }
        }
    }
}
