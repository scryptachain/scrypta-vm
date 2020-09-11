const vm = require('./svm')
const fs = require('fs')
let code = fs.readFileSync('./ida_modules/helloworld.js')

async function runModule() {
    let result = await vm.run(code, 'helloworld', "turinglabs")
    console.log(result)
}

runModule()