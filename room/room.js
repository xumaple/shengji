import * as utility from '../utility/cookies'
import { heartbeatLength } from '../utility/constants'
import { CallFetch } from '../utility/events'
import { join } from './api'

var game_id = 'da71e1ee';

let html = `<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Shengji</title>
    </head>
    <body>
        <div id="body">Loading...</div>
        <script>
            async function cleanTemplate() {
                document.querySelector("#body").innerHTML = \`
                    <div id="player-left">1</div>
                    <div id="player-opposite">2</div>
                    <div id="player-right">3</div>
                    <div id="center">
                        <div id="center-left">4</div>
                        <div id="center-opposite">5</div>
                        <div id="center-right">6</div>
                        <div id="center-me">7</div>
                    </div>
                    <div id="player-me"><form id='readybutton'></form></div>
                \`
            }

            var ready = false;
            async function checkPlayers() {
                console.log("Checking players")
                const json = await fetch('/api/heartbeat/', {credentials: 'same-origin'}).then(response => {console.log(response); return response.json()});
                if (json.go) {
                    setTimeout(runGame, 0);
                    return;
                }
                document.querySelector("#player-left").innerHTML = json.players[0];
                document.querySelector("#player-opposite").innerHTML = json.players[1];
                document.querySelector("#player-right").innerHTML = json.players[2];
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

                setTimeout(checkPlayers, ${heartbeatLength});
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

export async function handleRequest(request) {
    const prevCookie = utility.getCookies(request)
    // TODO cookie should actually already be given to this function. No need to set cookie here in the future. 
    let user_cookie = utility.newUserCookie();
    let cookies = {'user': user_cookie, 'game': game_id};
    // await join(request, cookies);
    let response = await CallFetch(join, null, true);
    console.log('back in main thread', response);
    if (prevCookie && prevCookie.user && prevCookie.game) {
        return new Response(html, {
            headers: { 'content-type': 'text/html' },
        })
    }
    console.log(utility.generateCookie(cookies))
    return new Response(html, {
        headers: { 'content-type': 'text/html', 'Set-Cookie': utility.generateCookie(cookies) },
    })
}
