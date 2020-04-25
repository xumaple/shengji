import { FilterEvent } from '../../utility'

addEventListener('fetch', event => { FilterEvent(event, null, handleRequest); })
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  return new Response('Hello worker!', {
    headers: { 'content-type': 'text/plain' },
  })
}