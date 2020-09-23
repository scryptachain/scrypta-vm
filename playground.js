const vm = require('./src/svm')
const fs = require('fs')
const ScryptaCore = require('@scrypta/core')
let scrypta = new ScryptaCore
scrypta.staticnodes = true

async function readContract() {
    let result = await vm.read('LV4bojRfHZvokXGBR5iJrjSufbuSA39APK', true)
    console.log('READING STORED CONTRACT')
    console.log(result)
}

async function runContract() {
    console.log('RUNNING CONTRACT')
    let id = await scrypta.createAddress('123456', false)
    let request = await scrypta.createContractRequest(id.walletstore, '123456', {contract: 'Le9G4AYSGbGqonH7QEjFHDeVAMSPxK9KWt', function: 'index', params: {type: true}})
    let result = await scrypta.sendContractRequest(request, 'https://idanodejs01.scryptachain.org')
    console.log(result)
}
runContract()