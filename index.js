const vm = require('./svm')
const fs = require('fs')
let contract = 'LV4bojRfHZvokXGBR5iJrjSufbuSA39APK'

async function readContract() {
    let result = await vm.read(contract)
    console.log('READING CONTRACT')
    console.log(result)
    runContract()
}

async function runContract() {
    console.log('RUNNING CONTRACT')
    let result = await vm.run(contract, 'helloworld', 'turinglabs')
    console.log(result)
}

readContract()