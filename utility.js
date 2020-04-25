
/**
 * Filter rest api call to specific urls
 * @param {Event} event
 * @param {String} api
 * @param {Function} func
 */
export async function FilterEvent(event, api, func) {
    if (api !== null) {
        const url = event.request.url;
        const urlapi = url.substr(url.indexOf('workers.dev') + 11);
        console.log(urlapi);
        if (urlapi !== api) { return; }
    }
    event.respondWith(func(event.request));
}

export function getCookies(request) {
    let cookieJar = {}
    const cookieString = request.headers.get('Cookie')
    if (cookieString) {
        let cookies = cookieString.split(';')
        cookies.forEach(cookie => {
            result[cookie.split('=')[0].trim()] = cookie.split('=')[1]
        })
    }
    return cookieJar
}

export const cookieTTL = 5 * 60 * 1000; // 5 minutes
export const heartbeatLength = 1000 // 1 second