const vm = require('./svm')
const fs = require('fs')
let code = fs.readFileSync('./modules/helloworld.js')

async function runModule() {
    let result = await vm.run(code, 'helloworld', "turinglabs")
    console.log(result)
}

runModule()