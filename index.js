const vm = require('./svm')
const fs = require('fs')

let contract = 'LV4bojRfHZvokXGBR5iJrjSufbuSA39APK'
async function runContract() {
    let result = await vm.run(contract, 'helloworld', 'turinglabs')
    console.log(result)
}

runContract()