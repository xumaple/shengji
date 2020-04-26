import * as utility from '../utility'

/**
 * Called when user presses "Ready" button
 * @param {Request} request
 *   Returns empty body when successful
 */
export async function handleReady(request) {
    console.log('ready')
    return handleReadyButtonHelper(request, 1)
}

/**
 * Called when user presses "Not Ready" button
 * @param {Request} request
 *   Returns empty body when successful
 */
export async function handleNotReady(request) {
    console.log('not ready')
    return handleReadyButtonHelper(request, 0)
}

async function handleReadyButtonHelper(request, newVal) {
    const cookies = utility.getCookies(request)
    const position = await GAME.get(cookies.user.concat('-position'))
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
export async function handleHeartbeat(request) {
    console.log('heartbeat')
    const cookies = utility.getCookies(request)
    // request.headers.forEach((k, v) => {console.log(k, v)})
    // console.log(request.headers.keys())
    for (const k of request.headers.keys()) {
        console.log(k);
    }
    console.log(request.headers.get('cookie'))
    console.log(cookies["game"])
    let getKey = (pos, command) => { return cookies.game.concat('-', pos, '-', command) }
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
            heartbeats.filter(beat => now - beat > utility.heartbeatLength * utility.consideredDead))
    }
    return new Response(
        JSON.stringify({go, players, ready: promises.myPosition === 'true'}), 
        { headers: { 'content-type': 'application/json'}});
}

var _joined_success = 1;
var _joined_failure = -1;

export async function join(request, cookies) { // TODO remove cookies
    let user = cookies.user;
    GAME.put(user, user); // TODO change to username
    var joined = 0;
    try_join(user, cookies.game)
    while (joined === 0);
    return joined === _joined_success;
}

async function try_join(user, game) {
    console.log('try_join')
    let key = game.concat('-users');
    console.log('greetings')
    let num_users = GAME.get(key);
    if (num_users === null) {
        num_users = 0
    }
    console.log('hello')
    if (num_users >= 3) {
        joined = _joined_failure;
    }
    GAME.put(key, num_users + 1);
    try_join_helper(user, game, num_users, 0);
}

async function try_join_helper(user, game, position, count) {
    console.log('try_join_helper')
    const key = game.concat('-', position, '-user');
    if (count >= 1) {
        GAME.put(user + '-position', position);
        GAME.put(game + '-' + position + '-user', user);
        GAME.put(game + '-' + position + '-ready', false); //is this correct?
        joined = _joined_success;
        return;
    }
    if (count == 0) {
        await GAME.put(key, user);
    }
    if (user === await GAME.get(key)) {
        setTimeout(try_join_helper(user, game, position, count + 1), 0);
        return;
    }
    try_join(user, game);
}
