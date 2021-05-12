module.exports = function woco(option = {}) {
    const {virtualFileId} = option
    console.log(option)
    return {
        name: 'my-plugin', // 必须的，将会显示在 warning 和 error 中
        async resolveId(id) {
            if (id.indexOf('?woco') >= 0) {
                return id
            }
        },
        async load(id) {
            if (id.indexOf('?woco')>= 0) {
                return `export const msg = "from virtual file"`
            }
        }
    }
}
