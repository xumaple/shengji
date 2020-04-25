import { FilterEvent } from '../../utility'
import * as utility from '../../utility'

addEventListener('fetch', event => { 
    FilterEvent(event, '/api/ready', handleReady); 
    FilterEvent(event, '/api/notready', handleNotReady); 
    FilterEvent(event, '/api/heartbeat', handleHeartbeat); 
})

/**
 * Called when user presses "Ready" button
 * @param {Request} request
 *   Returns empty body when successful
 */
async function handleReady(request) {
    return handleReadyButtonHelper(request, 1)
}

/**
 * Called when user presses "Not Ready" button
 * @param {Request} request
 *   Returns empty body when successful
 */
async function handleNotReady(request) {
    return handleReadyButtonHelper(request, 0)
}

function handleReadyButtonHelper(request, newVal) {
    const cookies = getCookies(request)
    const position = await GAME.get(cookies.user + '-position')
    GAME.put(cookies.game.concat('-', position, '-ready'), newVal, utility.kvTTL)
    return new Response(
        JSON.stringify({}), 
        { headers: { 'content-type': 'application/json'}});
}

/**
 * Called to maintain connection with user
 * @param {Request} request
 *   Returns { 
 *     go: true/false
 *       True means game can begin
 *       False means still waiting on all players
 *     players: []
 *       List is size 3, indicating players left, opposite and right
 *       Each element will be player ID, or null if player has not joined
 *     ready: true/false
 *   }
 */
async function handleHeartbeat(request) {
    const cookies = getCookies(request)
    getKey = (pos, command) => cookies.game.concat('-', pos, '-', command)
    [GAME.get(cookies.game.concat)]
    promises = []
    for (i = 0; i < 4; ++i) { promises.push(GAME.get(getKey(i, 'user'))) }
    for (i = 0; i < 4; ++i) { promises.push(GAME.get(getKey(i, 'ready'))) }
    const values = await Promise.all(promises);
    const myPosition = values.indexOf(cookies.user);
    const now = Date.now()
    GAME.put(getKey(myPosition, 'heart'), now, utility.KvTTL)
    players = promises.slice(myPosition + 1, 4)
    if (myPosition !== 3) {
        players.push(...promises.slice(myPosition))
    }
    go = (promises[4] === '1' && promises[5] === '1' && promises[6] === '1' && promises[7] === '1')
    if (go) {
        // Grab heartbeats to heck that nobody disconnected
        heartPromises = []
        for (i = 0; i < 4; ++i) { 
            if (i !== myPosition) heartPromises.push(GAME.get(getKey(i, 'heart')))
            else heartPromises.push(null)
        }
        go = await Promise.all(heartPromises).then(heartbeats => 
            heartbeats.filter(beat => now - beat > utility.heartbeatLength * consideredDead))
    }
    return new Response(
        JSON.stringify({go, players, ready: promises.myPosition === 'true'}), 
        { headers: { 'content-type': 'application/json'}});
}