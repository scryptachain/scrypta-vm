const vm = require('./src/svm')
const fs = require('fs')
const ScryptaCore = require('@scrypta/core')
let scrypta = new ScryptaCore
scrypta.staticnodes = true
const log = require('log-to-file');

const express = require('express')
const app = express()
var cors = require('cors')
const port = 4498
var bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', async (req, res) => {
    res.send({ message: 'Playground working', status: 'OK' })
})

app.post('/read', async (req, res) => {
    let result = await readContract(req.body)
    res.send(result)
})

app.post('/run', async (req, res) => {
    let result = await runContract(req.body)
    res.send(result)
})

app.listen(port, () => console.log(`Scrypta playground listening on port ${port}!`))

function readContract(request) {
    return new Promise(async response => {
        let result = await vm.read(request.address, true, request.version)
        response(result)
    })
}

async function runContract(request) {
    log('RUNNING CONTRACT')
    log(JSON.stringify(request))
    return new Promise(async response => {
        if (request.address !== undefined && request.request !== undefined) {
            scrypta.staticnodes = true
            scrypta.debug = true
            let result = await vm.run(request.address, request.request, true, 'latest')
            log(result)
            response(result.toString())
        }else{
            log(response)
            response('INVALID REQUEST')
        }
    })
}