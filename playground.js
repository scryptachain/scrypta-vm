const vm = require('./src/svm')
const fs = require('fs')

async function readContract() {
    let result = await vm.read('LV4bojRfHZvokXGBR5iJrjSufbuSA39APK', false)
    console.log('READING STORED CONTRACT')
    console.log(result)
}

async function runContract() {
    console.log('RUNNING CONTRACT')
    let request = {
        "message": "227b5c2266756e6374696f6e5c223a5c2268656c6c6f776f726c645c222c5c22706172616d735c223a5c22747572696e676c6162735c227d22",
        "hash": "d98ffa9551a7a8c393020edac2868968fd9d50a74f7124ec638cdabf2ae42ea2",
        "signature": "41565e3294a988fe8d867ab109946d20a7c29549fa6c412cf486e65ac4438d9e55813ea4d9c9f96cede495e6a8cb4e38762d8c6cbca8deb3820abe9a015fc537",
        "pubkey": "03b2131eef9abc87f7f1fd29b3a27c4fb9add53884ece96a4ad7696f86f5e2a168",
        "address": "LaoH8mrMgKoE7Egte8WuhMPpBeBJJHnT7M"
    }
    let result = await vm.run('./test_contracts/helloworld.ssc', request, true)
    console.log(result)
}
readContract()
runContract()