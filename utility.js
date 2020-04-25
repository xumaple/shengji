
/**
 * Filter rest api call to specific urls
 * @param {Event} event
 * @param {String} api
 * @param {Function} func
 */
export async function FilterEvent(event, api, func) {
    const url = event.request.url;
    if (api !== null && url !== api) { return; }
    console.log(func);
    event.respondWith(func(event.request));
}

