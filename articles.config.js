const path = require('path')

module.exports = {
    src: path.resolve(__dirname, './articles'),
    dist: path.resolve(__dirname, './dist'),
    endpoint: 'http://localhost:9001',
    dirNames: {
        metadata: 'articles',
        raw: 'raw',
    }
}
