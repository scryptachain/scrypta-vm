const { NodeVM } = require('vm2')
const compressor = require('lzutf8')
const ScryptaCore = require('@scrypta/core')

async function compiler(code, request = '') {
    return new Promise(response => {
        let compiled = `const ScryptaCore = require('@scrypta/core');let scrypta = new ScryptaCore;scrypta.staticnodes = true;scrypta.mainnetIdaNodes = ['http://localhost:3001'];scrypta.testnetIdaNodes = ['http://localhost:3001'];`
        if (request !== '') {
            compiled += 'const request = ' + JSON.stringify(request) + ';'
        }
        compiled += code
        let runnable = []
        let functions = code.match(/(?<=function )(.*?)(?=\s*\()/gi)
        if (functions.length > 1) {
            for (let k in functions) {
                let fn = functions[k]
                if (fn !== 'constructor') {
                    runnable.push(fn)
                    compiled += '\nmodule.exports.' + fn + ' = ' + fn
                }
            }
            compiled += '\nconstructor()'
            response({
                functions: runnable,
                code: compiled
            })
        } else {
            response(false)
        }
    })
}

function prepare(toCompile, request = '') {
    return new Promise(async response => {
        try {
            let compiled = await compiler(toCompile.toString().trim(), request)
            if (compiled !== false) {
                let vm = new NodeVM({
                    console: 'inherit',
                    sandbox: {},
                    require: {
                        external: true
                    }
                })
                let mod = vm.run(compiled.code, 'svm.js')
                response(mod)
            } else {
                response(false)
            }
        } catch (e) {
            console.log(e)
            response(false)
        }
    })
}

function read(address) {
    return new Promise(async response => {
        try {
            let scrypta = new ScryptaCore
            scrypta.staticnodes = true
            scrypta.mainnetIdaNodes = ['http://localhost:3001']
            let contractBlockchain = await scrypta.post('/read', { address: address, protocol: 'ida://' })
            let genesisindex = contractBlockchain.data.length - 1
            let genesis = JSON.parse(contractBlockchain.data[genesisindex].data.message)
            let versionindex
            if (genesis.immutable === undefined || genesis.immutable === false) {
                versionindex = 0
            } else {
                versionindex = genesisindex
            }
            if (contractBlockchain.data[versionindex] !== undefined) {
                let data = contractBlockchain.data[versionindex].data
                let verify = await scrypta.verifyMessage(data.pubkey, data.signature, data.message)
                let contract = JSON.parse(data.message)
                if (verify !== false) {
                    let toCompile = compressor.decompress(contract.code, { inputEncoding: 'Base64' })
                    let compiled = await compiler(toCompile.toString().trim())
                    if (compiled !== false) {
                        contract.functions = compiled.functions
                        contract.code = compiled.code
                        response(contract)
                    } else {
                        response(false)
                    }
                } else {
                    response(false)
                }
            } else {
                response(false)
            }
        } catch (e) {
            response(e)
        }
    })
}

function run(address, request) {
    return new Promise(async response => {
        try {
            let scrypta = new ScryptaCore
            scrypta.staticnodes = true
            scrypta.mainnetIdaNodes = ['http://localhost:3001']
            let validateRequest = await (scrypta.verifyMessage(request.pubkey, request.signature, request.message))
            if (validateRequest !== false) {
                request.message = JSON.parse(request.message)
                if (request.message.function !== undefined && request.message.params !== undefined) {
                    let contractBlockchain = await scrypta.post('/read', { address: address, protocol: 'ida://' })
                    let genesisindex = contractBlockchain.data.length - 1
                    let genesis = JSON.parse(contractBlockchain.data[genesisindex].data.message)
                    let versionindex
                    if (genesis.immutable === undefined || genesis.immutable === false) {
                        versionindex = 0
                    } else {
                        versionindex = genesisindex
                    }
                    if (contractBlockchain.data[versionindex] !== undefined) {
                        let data = contractBlockchain.data[versionindex].data
                        let verify = await scrypta.verifyMessage(data.pubkey, data.signature, data.message)
                        let contract = JSON.parse(data.message)
                        if (verify !== false) {
                            let toCompile = compressor.decompress(contract.code, { inputEncoding: 'Base64' })
                            let code = await prepare(toCompile, request)
                            if (code !== false) {
                                if (code[request.message.function] !== undefined) {
                                    let result = await code[request.message.function](request.message.params)
                                    response(result)
                                } else {
                                    response(false)
                                }
                            } else {
                                response(false)
                            }
                        } else {
                            response(false)
                        }
                    } else {
                        response(false)
                    }
                } else {
                    response(false)
                }
            } else {
                response(false)
            }
        } catch (e) {
            response(e)
        }
    })
}

exports.run = run
exports.read = read