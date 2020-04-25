import * as utility from '../../utility'

var game_id = 100000;

html = `<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Shengji</title>
    </head>
    <body>
        <div id="player-left"></div>
        <div id="player-opposite"></div>
        <div id="player-right"></div>
        <script>
            async function checkPlayers() {
                var ready = false;
                const json = await fetch('/api/heartbeat').then(response => {console.log(response); return response.json()});
                if (json.go) {
                    return;                                                     //TODO
                }
                document.querySelector("player-left").innerHTML = json.players[0];
                document.querySelector("player-opposite").innerHTML = json.players[1];
                document.querySelector("player-right").innerHTML = json.players[2];
                if (json.ready) {
                    if (!ready) {
                        ready = true;
                        var old_button = document.getElementById('notready');
                        if (old_button) {
                            document.body.removeChild(old_button);
                        }
                    }
                    var ready_button = document.createElement("div");
                    ready_button.id = 'ready';
                    ready_button.innerHTML = '<form><button type="submit" formmethod="post"> Not Ready </button></form>';
                    document.body.appendChild(ready_button);
                } else {
                    if (ready) {
                        ready = false;
                        var old_button = document.getElementById('ready');
                        if (old_button) {
                            document.body.removeChild(old_button);
                        }
                    }
                    var ready_button = document.createElement("div");
                    ready_button.id = 'notready';
                    ready_button.innerHTML = '<form><button type="submit" formmethod="post"> Ready! </button></form>'
                    document.body.appendChild(ready_button);
                }
                setTimeout(checkPlayers, utility.heartbeatLength);
            }

            checkPlayers()

        </script>
    </body>
</html>`

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    console.log(request.url)
    if (request.method === 'GET') {
        return get(request);
    }
    return post(request);
}

function get(request) {
    console.log('get')
    if (utility.getCookie(request)) {
        return new Response(html, {
            headers: { 'content-type': 'text/html' },
        })
    }
    var cookie = utility.generateCookie(game_id);
    GAME.put(cookie, cookie);
    GAME.put(cookie + '-position', position);
    GAME.put(game_id + '-' + position + '-user', cookie);
    GAME.put(game_id + '-' + position + '-ready', false); //is this correct?
    return new Response(html, {
        headers: { 'content-type': 'text/html', 'Set-Cookie': cookie },
    })
}

async function post(request) {
    console.log('post')
    const cookie = utility.getCookie(request);
    const position = await GAME.get(cookie + '-position');
    const ready = await GAME.get(game_id + '-' + position + '-ready');
    if (ready) {
        await fetch('/api/notready');
    } else {
        await fetch('/api/ready');
    }
    //await GAME.put(game_id + '-' + position + '-ready', !ready);
    return new Response(html, {
        headers: { 'content-type': 'text/html' },
    })
}