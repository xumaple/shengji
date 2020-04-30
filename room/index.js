import { SET_VARS, CallEvents } from '../utility/events'
import { handleRequest } from './room.js'
import * as api from './api.js'


var SERVER = 'https://room.shengji.workers.dev';
var API_HANDLES = [
    {api: '/', handle: handleRequest}, 
    {api: '/api/ready/', handle: api.handleReady}, 
    {api: '/api/notready/', handle: api.handleNotReady}, 
    {api: '/api/heartbeat/', handle: api.handleHeartbeat}, 
    {api: '/api/hidden/join/', handle: api.join}, 
    {api: '/api/hidden/try/', handle: api.tryJoin}, 
    {api: '/api/hidden/tryhelp/', handle: api.tryJoinHelper}, 

];

SET_VARS(API_HANDLES, SERVER);



addEventListener('fetch', event => { console.log(event.request.url); CallEvents(event); })//event.respondWith(handleRequest(event.request)); })