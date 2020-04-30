import * as constants from './constants'


export function generateCookie(dict) {
    var date = new Date();

    date.setTime(+ date + constants.cookieTTL);
    let cookie = '';
    Object.entries(dict).forEach(entry => { cookie = cookie.concat(entry[0], '=', entry[1], ',')})
    return cookie.slice(0, -1) + "; expires=" + date.toGMTString() + "; path=/";
}

export function newUserCookie() {
    return require('crypto').randomBytes(8).toString('hex');
}

export function getCookies(request) {
    let cookieJar = {}
    const cookieString = request.headers.get('cookie')
    if (cookieString) {
        cookieString.split(';').forEach(c => {
            c.split(',').forEach(cookie => {
                if (cookie) {
                    cookieJar[cookie.split('=')[0].trim()] = cookie.split('=')[1]
                }
            })
        })
    }
    return cookieJar
}
