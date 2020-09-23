const vm = require('./src/svm')
const fs = require('fs')
const ScryptaCore = require('@scrypta/core')
let scrypta = new ScryptaCore
scrypta.staticnodes = true

async function readContract() {
    let result = await vm.read('LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu', true)
    console.log('READING STORED CONTRACT')
    console.log(result)
}

async function runContract() {
    console.log('RUNNING CONTRACT')
    let id = await scrypta.createAddress('123456', false)
    scrypta.staticnodes = true
    scrypta.debug = true
    let request = await scrypta.createContractRequest(id.walletstore, '123456', {contract: 'LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu', function: 'search', params: {address: 'LchzGX6vqmanceCzNUMTk5cmnt1p6knGgT'}})
    let result = await scrypta.sendContractRequest(request, 'https://idanodejs01.scryptachain.org')
}
//readContract()
runContract()