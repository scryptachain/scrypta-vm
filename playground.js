const vm = require('./src/svm')
const fs = require('fs')
const ScryptaCore = require('@scrypta/core')
let scrypta = new ScryptaCore
scrypta.staticnodes = true

async function readContract() {
    let result = await vm.read('LcD7AGaY74xvVxDg3NkKjfP6QpG8Pmxpnu', false, '1.0.3')
    console.log('READING STORED CONTRACT')
    console.log(result)
}

async function runContract() {
    console.log('RUNNING CONTRACT')
    let id = await scrypta.createAddress('123456', false)
    scrypta.staticnodes = true
    scrypta.debug = true
    let request = await scrypta.createContractRequest(id.walletstore, '123456', {contract: 'Le9G4AYSGbGqonH7QEjFHDeVAMSPxK9KWt', function: 'eachBlock', params: {
        "hash": "356798d53057132482e65bc057a967500750ed609db57dbb3f4b5bb1377af89e",
        "confirmations": 1281,
        "size": 766,
        "height": 913478,
        "version": 3,
        "merkleroot": "6911b299006c64b7098ddd58a937226e17afb1eb0d642984d15b9bda87ff1027",
        "time": 1600859069,
        "nonce": 0,
        "bits": "1b0214f5",
        "difficulty": 31479.01053233,
        "chainwork": "000000000000000000000000000000000000000000000005553400865aa3ad24",
        "previousblockhash": "10298a57d5507f7c904c8eb31add433b8bf99594a0cb597c063d27aceaf76527",
        "nextblockhash": "80dd0d67df4378bad8257459bcd6e3d88f41649c70fa58dc7931d932924447ab",
        "totvin": 1971.04261833,
        "totvout": 1979.14107383,
        "fees": 0.0009999999999763531,
        "analysis": {
            "f553743b6e09e83986ac52362cf7b97f211db52400b3ea0d2c127e5c4cb73c4e": {
                "vin": 0,
                "vout": 0,
                "balances": {},
                "movements": {
                    "from": [],
                    "to": []
                }
            },
            "dc1c6ba43b493a22fe57b8b9b86377a2689f50b67980229142de07bbc9a730ae": {
                "vin": 5.103,
                "vout": 13.2024555,
                "balances": {
                    "LaQaiSa99dVWfGhvj9SfJnJeC49EfY1tDA": {
                        "value": 2.9964554999999997,
                        "type": "STAKE",
                        "vin": 5.103,
                        "vout": 8.0994555
                    },
                    "LaR95NP9EokPpYYQ8pCBX6FRxyK2KHGzSm": {
                        "value": 5.103,
                        "type": "REWARD",
                        "vin": 0,
                        "vout": 5.103
                    }
                },
                "movements": {
                    "from": [
                        "LaQaiSa99dVWfGhvj9SfJnJeC49EfY1tDA"
                    ],
                    "to": [
                        "LaQaiSa99dVWfGhvj9SfJnJeC49EfY1tDA",
                        "LaR95NP9EokPpYYQ8pCBX6FRxyK2KHGzSm"
                    ]
                }
            },
            "1089c9c2a9e4b0751243565b90e57e729d43789a60f31147ae1abc486d66c386": {
                "vin": 1965.93961833,
                "vout": 1965.93861833,
                "balances": {
                    "LchzGX6vqmanceCzNUMTk5cmnt1p6knGgT": {
                        "value": -0.0009999999999763531,
                        "type": "TX",
                        "vin": 1965.93961833,
                        "vout": 1965.93861833
                    }
                },
                "movements": {
                    "from": [
                        "LchzGX6vqmanceCzNUMTk5cmnt1p6knGgT"
                    ],
                    "to": [
                        "LchzGX6vqmanceCzNUMTk5cmnt1p6knGgT"
                    ]
                }
            }
        },
        "inputs": [
            {
                "txid": "5bd320448907fe98ef5e3dd8873b51af5a66305b7797a5d10ae122c6c1a1c1d8",
                "vout": 2
            },
            {
                "txid": "f7efb073ccbfed221d1ea53cdb1de20199a79fff2d992ede7cc0528614df599c",
                "vout": 0
            }
        ],
        "outputs": [
            {
                "txid": "dc1c6ba43b493a22fe57b8b9b86377a2689f50b67980229142de07bbc9a730ae",
                "vout": 1,
                "address": "LaQaiSa99dVWfGhvj9SfJnJeC49EfY1tDA",
                "scriptPubKey": "2102cb016f56d97d0e6219b67814ae2b7dcb82cb07b0f83ac536b5b9b2d3009150f2ac",
                "amount": 8.0994555
            },
            {
                "txid": "dc1c6ba43b493a22fe57b8b9b86377a2689f50b67980229142de07bbc9a730ae",
                "vout": 2,
                "address": "LaR95NP9EokPpYYQ8pCBX6FRxyK2KHGzSm",
                "scriptPubKey": "76a914a6a77d15835e46aac8e3cfbf2c442c6765f8ec4a88ac",
                "amount": 5.103
            },
            {
                "txid": "1089c9c2a9e4b0751243565b90e57e729d43789a60f31147ae1abc486d66c386",
                "vout": 0,
                "address": "LchzGX6vqmanceCzNUMTk5cmnt1p6knGgT",
                "scriptPubKey": "76a914bfc7758d357ea4f2f253ac8167450e9da6dd71a788ac",
                "amount": 1965.93861833
            }
        ],
        "planum": [],
        "raw_written": {
            "LchzGX6vqmanceCzNUMTk5cmnt1p6knGgT": [
                "1089c9c2a9e4b0751243565b90e57e729d43789a60f31147ae1abc486d66c386|?||?||?|*!*61b099e5.88bb.4d8c.85c2.06a8d20fbf68!*!!*!!*!rsspin://*=>https://medium.com/feed/@scryptachain*!*"
            ]
        },
        "data_written": {
            "LchzGX6vqmanceCzNUMTk5cmnt1p6knGgT": [
                {
                    "address": "LchzGX6vqmanceCzNUMTk5cmnt1p6knGgT",
                    "uuid": "61b099e5.88bb.4d8c.85c2.06a8d20fbf68",
                    "collection": "",
                    "refID": "",
                    "protocol": "rsspin://",
                    "data": "https://medium.com/feed/@scryptachain",
                    "block": 913478,
                    "blockhash": "356798d53057132482e65bc057a967500750ed609db57dbb3f4b5bb1377af89e",
                    "time": 1600859069,
                    "txid": "1089c9c2a9e4b0751243565b90e57e729d43789a60f31147ae1abc486d66c386"
                }
            ]
        },
        "data_received": {},
        "generated": 8.0994555
    }})
    let result = await scrypta.sendContractRequest(request, 'http://localhost:3001')
    console.log(result)
}
// readContract()
runContract()