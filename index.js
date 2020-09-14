const vm = require('./svm')
const fs = require('fs')
let address = 'LV4bojRfHZvokXGBR5iJrjSufbuSA39APK'

async function readContract() {
    let result = await vm.read(address)
    console.log('READING CONTRACT')
    console.log(result)
    runContract()
}

async function runContract() {
    console.log('RUNNING CONTRACT')
    let result = await vm.run(address, 'helloworld', 'turinglabs')
    console.log(result)
}

readContract()