import * as utility from '../utility/cookies'
import * as constants from '../utility/constants'
import { CallFetch } from '../utility/events'

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
    GAME.put(cookies.game.concat('-', position, '-ready'), newVal, constants.kvTTL)
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
    console.log(request.headers.get('cookie'))
    console.log(cookies["game"])
    let getKey = (pos, command) => { return cookies.game.concat('-', pos, '-', command) }
    [GAME.get(cookies.game.concat)]
    let promises = []
    for (let i = 0; i < 4; ++i) { promises.push(GAME.get(getKey(i, 'user'))) }
    for (let i = 0; i < 4; ++i) { promises.push(GAME.get(getKey(i, 'ready'))) }
    const values = await Promise.all(promises);
    const myPosition = values.indexOf(cookies.user);
    if (myPosition === -1) {
        // TODO
    }
    const now = Date.now()
    GAME.put(getKey(myPosition, 'heart'), now, constants.KvTTL)
    let players = promises.slice(myPosition + 1, 4)
    if (myPosition !== 3) {
        players.push(...promises.slice(myPosition))
    }
    let go = (promises[4] === '1' && promises[5] === '1' && promises[6] === '1' && promises[7] === '1')
    console.log('go', go)
    if (go) {
        // Grab heartbeats to heck that nobody disconnected
        heartPromises = []
        for (let i = 0; i < 4; ++i) { 
            if (i !== myPosition) heartPromises.push(GAME.get(getKey(i, 'heart')))
            else heartPromises.push(null)
        }
        go = await Promise.all(heartPromises).then(heartbeats => 
            heartbeats.filter(beat => now - beat > constants.heartbeatLength * constants.consideredDead))
    }
    console.log(JSON.stringify({go, players, ready: promises.myPosition === 'true'}))
    return new Response(
        JSON.stringify({go, players, ready: promises.myPosition === 'true'}), 
        { headers: { 'content-type': 'application/json;charset=UTF-8'}});
}

var _joined_success = 1;
var _joined_failure = -1;

export async function join(request) { // TODO remove cookies
    // return new Response('hello daniel', { headers: { 'content-type': 'text/plain' } });
    console.log('entering join')
    let cookies = utility.getCookies(request)
    let user = cookies.user;
    GAME.put(user, user, constants.kvTTL); // TODO change to username
    // return new Response(JSON.stringify({'frank': 'frank'}), { headers: { 'content-type': 'application/json'}})
    return CallFetch(tryJoin);
    // await fetch(new Request('http://room.shengji.workers.dev/api/join/')).then(response => response.json()).then(data => {console.log(data)}).catch(error=>{console.log(error)});//, {credentials: 'same-origin'})
    // console.log('hello');
    // // while (joined === 0);
    // // return joined === _joined_success;
    // console.log(JSON.stringify({joined: joined === _joined_success}));
    // return new Response(
    //     JSON.stringify({joined: joined === _joined_success}), 
    //     { headers: { 'content-type': 'application/json'}});
}

export async function tryJoin(request) {
    console.log('entering tryJoin')
    let cookies = utility.getCookies(request)
    let game = cookies.game;
    let key = game.concat('-users');
    console.log('greetings')
    let num_users = parseInt(await GAME.get(key));
    if (isNaN(num_users) === true) {
        num_users = 0
    }
    console.log('hello', num_users, isNaN(num_users))
    if (num_users >= 3) {
        return new Response(JSON.stringify({joined: _joined_failure}), {
            headers: { 'content-type': 'text/json' },
        })
    }
    GAME.put(key, num_users + 1, constants.kvTTL);
    return CallFetch(tryJoinHelper, {position: num_users, count: 0});
}

export async function tryJoinHelper(request) {
    try {
        console.log('entering tryJoinHelper');
        const j = request.body.json();
        const position = j.position;
        const count = j.count;
        const key = game.concat('-', position, '-user');
        if (count >= 1) {
            GAME.put(user + '-position', position, constants.kvTTL);
            GAME.put(game + '-' + position + '-user', user, constants.kvTTL);
            GAME.put(game + '-' + position + '-ready', false, constants.kvTTL); //is this correct?
            return new Response(JSON.stringify({joined: _joined_success}), {
                headers: { 'content-type': 'application/json' },
            })
        }
        if (count == 0) {
            await Game.put(key, user, constants.kvTTL);
        }
        if (user === await GAME.get(key)) {
            return CallFetch(tryJoinHelper, {position, count: count + 1});
        }
        return CallFetch(tryJoin);
    } catch(error) {
        console.log(error, request);
        return new Response(JSON.stringify({error: error.toString(), request: request.body.text()}), {
            headers: { 'content-type': 'text/json' },
        })
    }
}

// export async function tryJoinHelper(user, game, position, count) {
//     console.log('entering tryJoinHelper')
//     const key = game.concat('-', position, '-user');
//     if (count >= 1) {
//         GAME.put(user + '-position', position, constants.kvTTL);
//         GAME.put(game + '-' + position + '-user', user, constants.kvTTL);
//         GAME.put(game + '-' + position + '-ready', false, constants.kvTTL); //is this correct?
//         joined = _joined_success;
//         return;
//     }
//     if (count == 0) {
//         await GAME.put(key, user, constants.kvTTL);
//     }
//     if (user === await GAME.get(key)) {
//         setTimeout(tryJoinHelper(user, game, position, count + 1), 10);
//         return;
//     }
//     tryJoin(user, game);
// }
