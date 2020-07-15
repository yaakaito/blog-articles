const marked = require('marked')

module.exports = (markdown) => {
    return marked(markdown)
}
