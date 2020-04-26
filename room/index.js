import * as utility from '../utility'
import { FilterEvent } from '../utility'
import { join, handleReady, handleNotReady, handleHeartbeat } from './api.js'

var game_id = 'da71e1ee';

let html = `<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Shengji</title>
    </head>
    <body>
        <script>
            async function cleanTemplate() {
                document.body.innerHTML = \`
                    <div id="player-left"></div>
                    <div id="player-opposite"></div>
                    <div id="player-right"></div>
                    <div id="center">
                        <div id="center-left"></div>
                        <div id="center-opposite"></div>
                        <div id="center-right"></div>
                        <div id="center-me"></div>
                    </div>
                    <div id="player-me"><form id='readybutton'></form></div>
                \`
            }

            var ready = false;
            async function checkPlayers() {
                const json = await fetch('/api/heartbeat/', {credentials: 'same-origin'}).then(response => {console.log(response); return response.json()});
                if (json.go) {
                    setTimeout(runGame, 0);
                    return;
                }
                document.querySelector("player-left").innerHTML = json.players[0];
                document.querySelector("player-opposite").innerHTML = json.players[1];
                document.querySelector("player-right").innerHTML = json.players[2];
                if (json.ready !== ready) {
                    ready = json.ready
                    let button = document.getElementById('readybutton')
                    if (ready) {
                        button.innerHTML = '<button onclick=() => {fetch("/api/notready/", {credentials: "same-origin"})}>Cancel</button>'
                    }
                    else {
                        button.innerHTML = '<button onclick=() => {fetch("/api/ready/", {credentials: "same-origin"})}>Ready</button>'
                    }
                }

                setTimeout(checkPlayers, $(utility.heartbeatLength));
            }

            async function runGame() {
                cleanTemplate()
                document.getElementById('center-me').innerHTML = 'Running game...'
            }

            cleanTemplate()
            checkPlayers()

        </script>
    </body>
</html>`

addEventListener('fetch', event => {
    FilterEvent(event, '/', handleRequest)
    FilterEvent(event, '/api/ready/', handleReady); 
    FilterEvent(event, '/api/notready/', handleNotReady); 
    FilterEvent(event, '/api/heartbeat/', handleHeartbeat); 
})

async function handleRequest(request) {
    const prevCookie = utility.getCookies(request)
    // TODO cookie should actually already be given to this function. No need to set cookie here in the future. 
    let user_cookie = utility.newUserCookie();
    let cookies = {'user': user_cookie, 'game': game_id};
    await join(request, cookies);
    console.log("*********", utility.generateCookie(cookies))
    if (prevCookie && prevCookie.user) {
        return new Response(html, {
            headers: { 'content-type': 'text/html' },
        })
    }
    return new Response(html, {
        headers: { 'content-type': 'text/html', 'Set-Cookie': utility.generateCookie(cookies) },
    })
}
