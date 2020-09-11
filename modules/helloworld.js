/**
 * SCRYPTA IDANODE PLUGGABLE MODULES
 * VERSION: 1.0.0
 */

var time
async function constructor() {
    time = new Date()
}

function helloworld(who) {
    return new Promise(async response => {
        console.log('Module running at ' + time)
        
        if (who !== undefined && who.length > 0) {
            console.log('Hello ' + who + '!')
        } else {
            console.log('Hello who?')
        }

        response('Seems all ok.')
    })
}

module.exports.helloworld = helloworld