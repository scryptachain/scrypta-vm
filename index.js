const vm = require('./svm')
const fs = require('fs')

// THiS PART SHOULD BE INCLUDED IN @scrypta/core

let code = fs.readFileSync('./ida_modules/helloworld.js')
async function runModule() {
    let result = await vm.run(code, 'helloworld', "turinglabs")
    console.log(result)
}

runModule()