html = `<!DOCTYPE html>
<html lang="en">
    <head>
        <title>daniel</title>
    </head>
    <body>
        <div id="display">Wait for someone else to click!</div>
        <script>
            async function checkButton() {
                console.log('hello');
                const display = await fetch('/api/v1/').then(response => {console.log(response); return response.json()});
                console.log('display', display);
                if (display.display === '1') {
                    console.log('calling again');
                }
                else if (display.display === '2') {
                    let d = document.querySelector("#display");
                    d.innerHTML = 'I clicked it!';
                }
                else {
                    let d = document.querySelector("#display");
                    d.innerHTML = '<form><button type="submit" formmethod="post"> Click me! </button></form>';
                }
                setTimeout(checkButton, 1000);
            }

            checkButton()
        </script>
    </body>
</html>`

var key = 'clicker_user'

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
    console.log(request.url)
    if (request.url.includes('/api/v1/')) {
        const display = await displayButton(request);
        return new Response(JSON.stringify({display}), { headers: { 'content-type': 'application/json'}})
    } 
    if (request.method === 'GET') {
        return get(request);
    }
    return post(request);
}

async function displayButton(request) {
    const current = await CLICKER.get(key);
    const prev = await CLICKER.get('prev');
    const cookie = getCookie(request, 'user');
    console.log(current, prev, cookie);
    if (prev === cookie) { return '2'; }
    if (current === null || current === 'null') {
        console.log('its nulll');
        CLICKER.put(key, cookie);
        return '0';
    }
    return current === cookie ? '0' : '1';
}

async function post(request) {
    console.log('post')
    await CLICKER.put(key, null)
    await CLICKER.put('prev', getCookie(request, 'user'));
    return new Response(html, {
        headers: { 'content-type': 'text/html' },
    })
}

function get(request) {
    console.log('get')
    if (getCookie(request, 'user')) {
        return new Response(html, {
            headers: { 'content-type': 'text/html' },
        })
    }

    return new Response(html, {
        headers: { 'content-type': 'text/html', 'Set-Cookie': generateCookie(1) },
    })
}

function generateCookie(numHours) {
    var date = new Date();

    // Get unix milliseconds at current time plus number of days
    date.setTime(+ date + (numHours * 20 * 1000)); //24 * 60 * 60 * 1000

    return 'user=' + require('crypto').randomBytes(8).toString('hex') + "; expires=" + date.toGMTString() + "; path=/";
}

function getCookie(request, name) {
    let result = null
    let cookieString = request.headers.get('Cookie')
    if (cookieString) {
        let cookies = cookieString.split(';')
        cookies.forEach(cookie => {
            let cookieName = cookie.split('=')[0].trim()
            if (cookieName === name) {
                let cookieVal = cookie.split('=')[1]
                result = cookieVal
            }
        })
    }
    return result
}