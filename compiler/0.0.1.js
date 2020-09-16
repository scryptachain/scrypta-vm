/* Compiler v0.0.1 */

async function compiler(code, request = '', local = false) {
    return new Promise(response => {
        let compiled = `const ScryptaCore = require('@scrypta/core'); const db = require('db'); const axios = require('axios');`
        compiled += `const scrypta = new ScryptaCore; scrypta.staticnodes = true;`
        if (local === true) {
            compiled += `scrypta.mainnetIdaNodes = ['http://localhost:3001']; scrypta.testnetIdaNodes = ['http://localhost:3001'];`
        }
        if (request !== '') {
            compiled += 'const request = ' + JSON.stringify(request) + ';'
        }

        let functions = code.match(/(?<=function )(.*?)(?=\s*\()/gi)
        compiled += code
        let runnable = []
        if (functions.length > 1) {
            for (let k in functions) {
                let fn = functions[k]
                if (fn !== 'constructor') {
                    let sp = fn.split(':')
                    if (sp[1] !== undefined) {
                        if(sp[0].trim() === 'public'){
                            runnable.push(sp[1].trim())
                            compiled += '\nmodule.exports.' + sp[1].trim() + ' = ' + sp[1].trim() + ';'
                        }
                        compiled = compiled.replace(fn, sp[1].trim())
                    } else {
                        runnable.push(fn)
                        compiled += '\nmodule.exports.' + fn + ' = ' + fn + ';'
                    }
                }
            }

            compiled += '\nconstructor();'

            response({
                functions: runnable,
                code: compiled
            })
        } else {
            response(false)
        }
    })
}

exports.compiler = compiler