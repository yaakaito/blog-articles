#!/usr/bin/env node

const { program } = require('commander')
const chalk = require('chalk')

const main = async() => {

    program.option('--verbose', 'verbose logs', false)
    program.parse(process.argv)

    const log = console.log
    const logVerbose = (msg) => program.verbose ? log(`${chalk.green('Verbose')}\t${msg}`) : undefined
    const logError = (msg) => log(`${chalk.white.bgRedBright.bold('Error')}\t${msg}`)

    try {
        const action = program.args[0]
        await require(`./actions/${action}`)({
            args: [...program.args.slice(1)],
            logError,
            logVerbose
        })
    }
    catch(e) {
        logError(e.message)
    }
}

if (require.main === module) {
    main()
}
