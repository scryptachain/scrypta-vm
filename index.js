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
    let request = 
    {
        "message": "{\"function\":\"helloworld\",\"params\":\"turinglabs\"}",
        "hash": "9bb8d77dcc9be70228a219e9169b9fa086a935ba28eb04263f6a5aef15fccaae",
        "signature": "430d28ca0cd7c4e194b60c2983e262d0f19df690f7113d5bed712ad503b0eba276218aa3ef11f69aec19e2b6186bec9eb29d9bffd4459c2791b01a5a4d7ebe3d",
        "pubkey": "03b2131eef9abc87f7f1fd29b3a27c4fb9add53884ece96a4ad7696f86f5e2a168",
        "address": "LaoH8mrMgKoE7Egte8WuhMPpBeBJJHnT7M"
    }    
    let result = await vm.run(address, request)
    console.log(result)
}

readContract()