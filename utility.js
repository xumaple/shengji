
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

