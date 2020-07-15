const fs = require('fs')
const path = require('path')
const markdown = require('../lib/markdown')
const promisify = require('util').promisify

const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)
const rimraf = promisify(require('rimraf'))

const build = async (args) => {
    return pipe(
        {
            ...args,
            ...require('../../articles.config')
        },
        cleanUp,
        allArticlePaths,
        mapToRawData,
        outputArticles,
        outputRaws
    )
}

const pipe = async(options, ...functions) => {
    let value = null
    for (f of functions) {
        value = await f(value, options)
    }
    return value
}

const cleanUp = async(_, { dist }) => {
    await rimraf('dist')
}

const allArticlePaths = async (_, { src, logVerbose }) => {
    const dirents = await readdir(src, { withFileTypes: true })
    const articles = []
    for (const dirent of dirents) {
        logVerbose(`checking ${dirent.name}`)
        if (!dirent.isDirectory()) {
            logVerbose(`${dirent.name} is not directory`)
            continue
        }
        dirs = (await readdir(path.resolve(src, dirent.name), { withFileTypes: true})).map(({ name }) => path.resolve(src, dirent.name, name))
        articles.push(
            ...dirs
        )
        logVerbose(`${dirs.length} articles in ${dirent.name}`)
        dirs.forEach(dir => logVerbose(`- ${dir}`))
    }
    return articles
}

const mapToRawData = async (paths, { logVerbose }) => {
    const articles = []
    for (const articlePath of paths) {
        const md = (await readFile(path.resolve(articlePath, 'article.md'))).toString()
        const json = require(path.resolve(articlePath, 'article.json'))
        articles.push({
            slug: path.basename(articlePath),
            metadata: {
                ...json,
                title: md.substring(2, md.indexOf('\n'))
            },
            body: md
        })
    }
    logVerbose(JSON.stringify(articles, null, 2))
    // TODO
    return articles.sort((left, right) => -1)
}

const outputArticles = async (articles, { dist, endpoint, dirNames }) => {
    const dir = path.resolve(dist, dirNames.metadata)
    await mkdir(dir, { recursive: true })
    for (const article of articles) {
        await writeFile(path.resolve(dir, `${article.slug}.json`), JSON.stringify({
            slug: article.slug,
            ...article.metadata,
            raw: `${endpoint}/${dirNames.raw}/${article.slug}.html`
        }))
    }
    return articles
}

const outputRaws = async (articles, { dist, endpoint, dirNames }) => {
    const dir = path.resolve(dist, dirNames.raw)
    await mkdir(dir, { recursive: true })
    for (const article of articles) {
        await writeFile(path.resolve(dir, `${article.slug}.json`), JSON.stringify({
            html: markdown(article.body)
        }))
    }
    return articles
}


module.exports = build
