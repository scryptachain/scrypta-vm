const { NodeVM } = require('vm2')

async function compiler(code){
    return new Promise(response => {
        let compiled = `
            const ScryptaCore = require('@scrypta/core');
            let scrypta = new ScryptaCore;
            scrypta.staticnodes = true;
            scrypta.mainnetIdaNodes = ['http://localhost:3001']
            scrypta.testnetIdaNodes = ['http://localhost:3001']
        `
        compiled += code
        compiled += '\nconstructor()'
        response(compiled)
    })
}

function prepare(toCompile){
    return new Promise(async response => {
        try{
            let compiled = await compiler(toCompile.toString().trim())
            if(compiled.indexOf('while') === -1){
                let vm = new NodeVM({
                    console: 'inherit',
                    sandbox: {},
                    require: {
                        external: true
                    }
                })
                let mod = vm.run(compiled, 'svm.js')
                response(mod)
            }else{
                response(false)
            }
        }catch(e){
            console.log(e)
            response(false)
        }
    })
}

function run(toCompile, functionToCall, paramsToPass){
    return new Promise(async response => {
        try{
            let code = await prepare(toCompile)
            if(code !== false){
                let result = await code[functionToCall](paramsToPass)
                response(result)
            }else{
                response(false)
            }
        }catch(e){
            response(e)
        }
    })
}

exports.run = run