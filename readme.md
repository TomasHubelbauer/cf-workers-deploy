# CloudFlare Workers Deploy

## Installation

`npm install https://github.com/TomasHubelbauer/cf-workers-deploy`

## Usage

Create `secrets.json` and `worker.js` first.
See the *Running* section below.

```javascript
const deploy = require('cf-worker-deploy');
await deploy();
```

## Running

Create `secrets.json` and `worker.js` first:

`secrets.json`:
```json
{
  "accountId": "…",
  "workerName": "…",
  "accessToken": "…-ATOK…",
  "sessionCookie": "…"
}
```

- `accountId` is the account ID displayed in your CloudFlare dashboard UI and URL
- `workerName` is the name of you worker - `https://${workerName}.${userName}.workers.dev`
- `accessToken` is the `X-ATOK` request header value found using the dev tools
- `sessionCookie` is the `vses2` cookie value found using the dev tools

`worker.js`:
```javascript
// Your worker code, e.g.:
addEventListener('fetch', event => event.respondWith(handleRequest(event.request)));

async function handleRequest(request) {
  return new Response('hello world', { status: 200 });
}
```

With these prerequisites met, run using `node .`.

## Testing

See *Running*.

## Changelog

### `1.0.0` 2020-03-01

The initial release with support for deploying a worker with no bindings based
on `secrets.json` with manually obtained values.

## To-Do

### Add support for namespace bindings to enable preserving KV bindings
