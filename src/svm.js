const { NodeVM } = require('vm2')
const compressor = require('lzutf8')
const fs = require('fs')
const ScryptaCore = require('@scrypta/core')
const v001 = require('../compiler/0.0.1')
var MongoClient = require('mongodb').MongoClient
const crypto = require('crypto')
var CoinKey = require('coinkey')

if (global['db_url'] === undefined) {
    global['db_url'] = 'mongodb://localhost:27017'
}
if (global['db_options'] === undefined) {
    global['db_options'] = { useNewUrlParser: true, useUnifiedTopology: true }
}
if (global['db_name'] === undefined) {
    global['db_name'] = 'idanodejs'
}

function prepare(toCompile, request = '', local = false, address) {
    return new Promise(async response => {
        try {
            let compiled = await v001.compiler(toCompile.toString().trim(), request, local)

            const dbMock = {
                read(query, limit) {
                    return new Promise(response => {
                        if (local === true) {
                            MongoClient.connect(global['db_url'], global['db_options'], async function (err, client) {
                                var db = client.db(global['db_name'])
                                if (err) {
                                    client.close()
                                    response(err)
                                } else {
                                    try {
                                        let result = []
                                        if (limit !== undefined) {
                                            result = await db.collection(address).find(query).limit(limit).toArray()
                                        } else {
                                            result = await db.collection(address).find(query).toArray()
                                        }
                                        let array = []
                                        for (let k in result) {
                                            delete result[k]._id
                                            let state = result[k]
                                            array.push(state)
                                        }
                                        if (array.length === 1) {
                                            array = array[0]
                                        }
                                        client.close()
                                        response(array)
                                    } catch (e) {
                                        response(false)
                                    }
                                }
                            })
                        } else {
                            response(false)
                        }
                    })
                },
                insert(object) {
                    if (local === true) {
                        return new Promise(response => {
                            MongoClient.connect(global['db_url'], global['db_options'], async function (err, client) {
                                var db = client.db(global['db_name'])
                                if (err) {
                                    client.close()
                                    response(err)
                                } else {
                                    try {
                                        let result = await db.collection(address).insertOne(object);
                                        client.close()
                                        response(result)
                                    } catch (e) {
                                        client.close()
                                        response(false)
                                    }
                                }
                            })
                        })
                    } else {
                        response(false)
                    }
                },
                update(query, object) {
                    if (local === true) {
                        return new Promise(response => {
                            MongoClient.connect(global['db_url'], global['db_options'], async function (err, client) {
                                var db = client.db(global['db_name'])
                                if (err) {
                                    client.close()
                                    response(err)
                                } else {
                                    try {
                                        let result = await db.collection(address).updateOne(query, object)
                                        client.close()
                                        response(result)
                                    } catch (e) {
                                        response(false)
                                    }
                                }
                            })
                        })
                    }
                },
                delete(query) {
                    if (local === true) {
                        return new Promise(response => {
                            MongoClient.connect(global['db_url'], global['db_options'], async function (err, client) {
                                var db = client.db(global['db_name'])
                                if (err) {
                                    client.close()
                                    response(err)
                                } else {
                                    try {
                                        let result = await db.collection(address).deleteOne(query)
                                        client.close()
                                        response(result)
                                    } catch (e) {
                                        response(false)
                                    }
                                }
                            })
                        })
                    }
                }
            }
            
            if (compiled !== false) {
                if (local === true && address.indexOf('/') !== -1) {
                    const hash = crypto.createHash('sha256').update(address).digest('hex')
                    var temp = new CoinKey(Buffer.from(hash, 'hex'), {
                        private: 0xae,
                        public: 0x30,
                        scripthash: 0x0d
                    })
                    address = temp.publicAddress
                }
                let vm = new NodeVM({
                    console: 'inherit',
                    require: {
                        external: {
                            modules: ['@scrypta/core', 'axios']
                        },
                        mock: {
                            db: dbMock
                        }
                    }
                })
                let contract = vm.run(compiled.code, 'svm.js')
                response(contract)
            } else {
                response(false)
            }
        } catch (e) {
            console.log(e)
            response(false)
        }
    })
}

function returnLocalContract(address) {
    return new Promise(async response => {
        MongoClient.connect(global['db_url'], global['db_options'], async function (err, client) {
            var db = client.db(global['db_name'])
            if (err) {
                client.close()
                response(err)
            } else {
                try {
                    let result = await db.collection('written').find({ address: address, protocol: 'ida://' }).toArray()
                    let array = []
                    for (let k in result) {
                        delete result[k]._id
                        let state = result[k]
                        array.push(state)
                    }
                    if (array.length === 1) {
                        array = array[0]
                    }
                    client.close()
                    response({data: array})
                } catch (e) {
                    response(false)
                }
            }
        })
    })
}

function read(address, local = false) {
    return new Promise(async response => {
        try {
            let scrypta = new ScryptaCore
            scrypta.staticnodes = true
            if (local) {
                scrypta.mainnetIdaNodes = ['http://localhost:3001']
            }
            if (address.indexOf('/') === -1) {
                let contractBlockchain
                if (local) {
                    contractBlockchain = await returnLocalContract(address)
                } else {
                    contractBlockchain = await scrypta.post('/read', { address: address, protocol: 'ida://' })
                }
                let genesisindex = contractBlockchain.data.length - 1
                let genesis = JSON.parse(contractBlockchain.data[genesisindex].data.message)
                let versionindex
                if (genesis.immutable === undefined || genesis.immutable === false) {
                    versionindex = 0
                } else {
                    versionindex = genesisindex
                }
                if (contractBlockchain.data[versionindex] !== undefined) {
                    let data = contractBlockchain.data[versionindex].data
                    let verify = await scrypta.verifyMessage(data.pubkey, data.signature, data.message)
                    let contract = JSON.parse(data.message)
                    if (verify !== false) {
                        let toCompile = compressor.decompress(contract.code, { inputEncoding: 'Base64' })
                        let compiled = await v001.compiler(toCompile.toString().trim(), '', local)
                        if (compiled !== false) {
                            contract.functions = compiled.functions
                            contract.code = compiled.code
                            response(contract)
                        } else {
                            response(false)
                        }
                    } else {
                        response(false)
                    }
                } else {
                    response(false)
                }
            } else {
                let toCompile = fs.readFileSync(address)
                let compiled = await v001.compiler(toCompile.toString(), '', local)
                if (compiled !== false) {
                    let contract = {}
                    contract.functions = compiled.functions
                    contract.code = compiled.code
                    response(contract)
                } else {
                    response(false)
                }
            }
        } catch (e) {
            response(e)
        }
    })
}

function run(address, request, local = false) {
    return new Promise(async response => {
        try {
            let scrypta = new ScryptaCore
            scrypta.staticnodes = true
            if (local) {
                scrypta.mainnetIdaNodes = ['http://localhost:3001']
            }
            let validateRequest = await (scrypta.verifyMessage(request.pubkey, request.signature, request.message))
            if (validateRequest !== false) {
                try {
                    request.message = JSON.parse(JSON.parse(Buffer.from(request.message, 'hex').toString('utf8')))
                } catch (e) {
                    request.message = JSON.parse(Buffer.from(request.message, 'hex').toString('utf8'))
                }
                if (request.message.function !== undefined && request.message.params !== undefined) {
                    if (address.indexOf('/') === -1) {
                        let contractBlockchain
                        if (local) {
                            contractBlockchain = await returnLocalContract(address)
                        } else {
                            contractBlockchain = await scrypta.post('/read', { address: address, protocol: 'ida://' })
                        }
                        let genesisindex = contractBlockchain.data.length - 1
                        let genesis = JSON.parse(contractBlockchain.data[genesisindex].data.message)
                        let versionindex
                        if (genesis.immutable === undefined || genesis.immutable === false) {
                            versionindex = 0
                        } else {
                            versionindex = genesisindex
                        }
                        if (contractBlockchain.data[versionindex] !== undefined) {
                            let data = contractBlockchain.data[versionindex].data
                            let verify = await scrypta.verifyMessage(data.pubkey, data.signature, data.message)
                            let contract = JSON.parse(data.message)
                            if (verify !== false) {
                                let toCompile = compressor.decompress(contract.code, { inputEncoding: 'Base64' })
                                let code = await prepare(toCompile, request, local, address)
                                if (code !== false) {
                                    if (code[request.message.function] !== undefined) {
                                        let result = await code[request.message.function](request.message.params)
                                        response(result)
                                    } else {
                                        response(false)
                                    }
                                } else {
                                    response(false)
                                }
                            } else {
                                response(false)
                            }
                        } else {
                            response(false)
                        }
                    } else {
                        let toCompile = fs.readFileSync(address)
                        let code = await prepare(toCompile, request, local, address)
                        if (code !== false) {
                            if (code[request.message.function] !== undefined) {
                                let result = await code[request.message.function](request.message.params)
                                response(result)
                            } else {
                                response(false)
                            }
                        } else {
                            response(false)
                        }
                    }
                } else {
                    response(false)
                }
            } else {
                response(false)
            }
        } catch (e) {
            response(e)
        }
    })
}

exports.run = run
exports.read = read