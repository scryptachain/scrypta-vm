const vm = require('./svm')
const fs = require('fs')
const compressor = require('lzutf8')
const argv = require('minimist')(process.argv.slice(2))
const ScryptaCore = require('@scrypta/core')
var CoinKey = require('coinkey')
var crypto = require('crypto');

async function publishModule() {
    if (argv.m !== undefined && argv.i !== undefined) {
        let name
        let author
        let version
        let description
        let code = fs.readFileSync(argv.m)
        let manifest = code.toString().match(/\/\*(\*(?!\/)|[^*])*\*\//gi)
        manifest = manifest[0].replace('/**', '')
        manifest = manifest.replace('**/', '')
        manifest = manifest.replace(new RegExp('\n', 'g'), '')
        manifest = manifest.split('*')

        for (let k in manifest) {
            let definition = manifest[k].trim().split(':')
            if (definition[1] !== undefined) {
                if (definition[0] === 'NAME') {
                    name = definition[1].trim()
                }
                if (definition[0] === 'AUTHOR') {
                    author = definition[1].trim()
                }
                if (definition[0] === 'VERSION') {
                    version = definition[1].trim()
                }
                if (definition[0] === 'DESCRIPTION') {
                    description = definition[1].trim()
                }
                if (immutable[0] === 'IMMUTABLE') {
                    immutable = immutable[1].trim()
                }
            }
        }

        if (name !== undefined && author !== undefined && version !== undefined) {
            manifest = {
                v: 1,
                name: name,
                author: author,
                version: version,
                description: description,
                immutable: immutable,
                code: compressor.compress(code, { outputEncoding: 'Base64' })
            }
            let scrypta = new ScryptaCore
            let identity = argv.i
            let pubkey = await scrypta.getPublicKey(identity)
            let address = await scrypta.getAddressFromPubKey(pubkey)

            console.log('AUTHOR ADDRESS IS: ' + address)
            let balance = await scrypta.get('/balance/' + address)

            const hash = crypto.createHash('sha256').update(identity + ':' + manifest.name).digest('hex')
            let contract = new CoinKey(Buffer.from(hash, 'hex'), {
                private: 0xae,
                public: 0x30,
                scripthash: 0x0d
            })

            console.log('CONTRACT ADDRESS IS: ' + contract.publicAddress)
            manifest.address = contract.publicAddress
            let sid = await scrypta.buildWallet('TEMPORARY', contract.publicAddress, { prv: contract.privateWif, key: contract.publicKey.toString('hex') }, false)

            if (balance.balance > 0.011) {
                console.log('BALANCE IS: ' + balance.balance + ' LYRA')
                let genesis_check = await scrypta.post('/read', { address: manifest.address, refID: 'genesis', protocol: 'ida://' })
                if (genesis_check.data[0] !== undefined) {
                    let genesis = genesis_check.data[0].data
                    genesis.contract = JSON.parse(genesis.message)
                    if (genesis.contract.name === manifest.name && genesis.contract.address === manifest.address) {
                        console.log('GENESIS EXIST, CHECK IF EXIST VERSION.')
                        let version_check = await scrypta.post('/read', { address: manifest.address, refID: manifest.version, protocol: 'ida://' })
                        if (version_check.data[0] === undefined && genesis.contract.version !== manifest.version) {
                            console.log('PUBLISHING UPDATE')
                            if (genesis.contract.immutable === false) {
                                let signed = await scrypta.signMessage(identity, JSON.stringify(manifest))
                                let contractBalance = await scrypta.get('/balance/' + manifest.address)
                                let funded = false
                                if (contractBalance.balance < 0.002) {
                                    funded = await fundAddress(manifest.address)
                                } else {
                                    funded = true
                                }
                                if (funded !== false) {
                                    let update_written = await scrypta.write(sid, 'TEMPORARY', JSON.stringify(signed), '', manifest.version, 'ida://')
                                    if (update_written.uuid !== undefined && update_written.txs !== undefined && update_written.txs.length > 0) {
                                        console.log('UPDATE TRANSACTION WRITTEN CORRECTLY')
                                    } else {
                                        console.error('ERROR WHILE CREATING TRANSACTION')
                                    }
                                } else {
                                    console.log('ERROR WHILE FUNDING ADDRESS')
                                }
                            } else {
                                console.log('CAN\'T UPDATE IMMUTABLE CONTRACT!')
                            }
                        } else {
                            console.log('VERSION EXIST, PLEASE UPDATE CONTRACT FIRST')
                        }
                    } else {
                        console.log('GENESIS TRANSACTION DOESN\'T MATCH.')
                    }
                } else {
                    console.log('SIGNING GENESIS TRANSACTION.')
                    let signed = await scrypta.signMessage(identity, JSON.stringify(manifest))
                    let contractBalance = await scrypta.get('/balance/' + manifest.address)
                    let funded = false
                    if (contractBalance.balance < 0.01) {
                        funded = await fundAddress(manifest.address)
                    } else {
                        funded = true
                    }
                    if (funded !== false) {
                        let genesis_written = await scrypta.write(sid, 'TEMPORARY', JSON.stringify(signed), '', 'genesis', 'ida://')
                        if (genesis_written.uuid !== undefined && genesis_written.txs !== undefined && genesis_written.txs.length > 0) {
                            console.log('GENESIS TRANSACTION WRITTEN CORRECTLY')
                        } else {
                            console.error('ERROR WHILE CREATING TRANSACTION')
                        }
                    } else {
                        console.log('ERROR WHILE FUNDING ADDRESS')
                    }
                }
            } else {
                console.log('CONTRACT DOESN\'T HAVE REQUIRED BALANCE: ' + balance.balance)
            }
        } else {
            console.log('CAN\'T FIND MANIFEST')
        }
    } else {
        console.log('PLEASE PROVIDE CONTRACT PATH AND IDENTITY PRIVATE KEY')
    }
}

async function fundAddress(contractAddress) {
    return new Promise(async response => {
        let scrypta = new ScryptaCore
        scrypta.staticnodes = true
        let funded = false
        let success = false
        let retries = 0
        while (funded === false) {
            let identity = argv.i
            let pubkey = await scrypta.getPublicKey(identity)
            let address = await scrypta.getAddressFromPubKey(pubkey)
            let sid = await scrypta.buildWallet('TEMPORARY', address, { prv: identity, key: pubkey }, false)
            let sent = await scrypta.send(sid, 'TEMPORARY', contractAddress, 0.01)
            if (sent !== false && sent !== null && sent.length === 64) {
                funded = true
                success = true
            }
            retries++
            if (retries > 10) {
                funded = true
            }
        }
        if (funded === true && success === true) {
            setTimeout(function () {
                response(true)
            }, 1000)
        } else {
            response(false)
        }
    })
}

publishModule()