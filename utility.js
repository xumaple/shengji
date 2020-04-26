
/**
 * Filter rest api call to specific urls
 * @param {Event} event
 * @param {String} api
 * @param {Function} func
 */
export async function FilterEvent(event, api, func) {
    if (api !== null) {
        const url = new URL(event.request.url);
        console.log(url.pathname, api);
        if (url.pathname !== api) { return; }
    }
    console.log('success')
    event.respondWith(func(event.request));
}

export function generateCookie(dict) {
    var date = new Date();

    date.setTime(+ date + cookieTTL);
    cookie = ''
    dict.forEach((key, value) => { cookie = cookie.concat(key, '=', value, '; ')})
    return cookie + "expires=" + date.toGMTString() + "; path=/";
}

export function newUserCookie() {
    return require('crypto').randomBytes(8).toString('hex');
}

export function getCookies(request) {
    let cookieJar = {}
    const cookieString = request.headers.get('Cookie')
    if (cookieString) {
        let cookies = cookieString.split(';')
        cookies.forEach(cookie => {
            cookieJar[cookie.split('=')[0].trim()] = cookie.split('=')[1]
        })
    }
    return cookieJar
}

export const cookieTTL = 5 * 60 * 1000; // 5 minutes
export const heartbeatLength = 1000 // 1 second
export const consideredDead = 5 // Number of heartbeats missed
export const kvTTL = {expirationTtl: 86400} // 1 day