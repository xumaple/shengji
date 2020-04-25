import { FilterEvent } from '../../utility'

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
  return new Response(
    JSON.stringify({}), 
    { headers: { 'content-type': 'application/json'}});
}

/**
 * Called when user presses "Not Ready" button
 * @param {Request} request
 *   Returns empty body when successful
 */
async function handleNotReady(request) {
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
 *   }
 */
async function handleHeartbeat(request) {
  return new Response(
    JSON.stringify({}), 
    { headers: { 'content-type': 'application/json'}});
}