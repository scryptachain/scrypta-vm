/**
 * NAME: HELLOWORLD
 * DESCRIPTION: SIMPLE HELLO WORLD MODULE
 * AUTHOR: TURINGLABS
 * VERSION: 1.0.1
 * IMMUTABLE: false
 */


async function constructor() {
    
}

function helloworld(who) {
    return new Promise(async response => {
        if (who !== undefined && who.length > 0) {
            response('Hello ' + who + '!')
        } else {
            response('Hello who?')
        }
    })
}