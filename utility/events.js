
var API_HANDLES;
var SERVER;

export function SET_VARS(api, server) {
    API_HANDLES = api;
    SERVER = server;
}

/**
 * Filter rest api call to specific urls
 * @param {Event} event
 * @param {String} api
 * @param {Function} func
 * @ret {bool} true if api is correct
 */
export async function FilterEvent(event, api, func) {
    if (api !== null) {
        const url = new URL(event.request.url);
        if (url.pathname !== api) { return false; }
    }
    console.log('api', api)
    event.respondWith(func(event.request));
    return true;
}

export async function CallEvents(event, stopOnFirst=true) {
    if (API_HANDLES === undefined) {
        console.log('Could not find defined API_HANDLES');
        return;
    }
    for (const apiObj of API_HANDLES) {
        if (FilterEvent(event, apiObj.api, apiObj.handle) === true && stopOnFirst) {
            return;
        }
    }
}

export async function CallFetch(func, postRequest=null, asJson=false) {
    console.log('calling fetch', postRequest, asJson)
    if (API_HANDLES === undefined || SERVER === undefined) {
        console.log('Could not find defined API_HANDLES or SERVER');
        return;
    }
    for (const apiObj of API_HANDLES) {
        if (apiObj.handle === func) {
            console.log('found func')
            let promise = postRequest === null ? await fetch(SERVER + apiObj.api)
            .then(response => { console.log('response received from', apiObj.api, ': ', response); return response; })
            .catch(error => {
                console.log(error);
                return error;
            }) : await fetch(SERVER + apiObj.api, {
                headers: { 'Content-Type': 'application/json' }, 
                method: 'POST', 
                body: JSON.stringify(postRequest)
            })
            .then(response => { console.log('response received from', apiObj.api, ': ', response); return response; })
            .catch(error => {
                console.log(error);
                return error;
            });
            console.log('response is', promise.text());
            if (asJson !== true) return promise;
            return promise.then(response => response.json()).catch(error => {
                console.log(error);
                return error;
            });
        }
    }
}