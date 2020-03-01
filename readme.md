# CloudFlare Workers Deploy

## Installation

`npm install https://github.com/TomasHubelbauer/cf-workers-deploy`

## Usage

```javascript
const deploy = require('cf-worker-deploy');

// Create secrets.json and worker.js - see the Running section of this readme
await deploy();
```

## Running

Create `secrets.json` and `worker.js` first:

`secrets.json`:
```json
// See the code comments in `index.js` for guidance on how to obtain these values
{
  "accountId": "…",
  "workerName": "…",
  "accessToken": "…-ATOK…",
  "sessionCookie": "…" // Without the `vses2=` prefix
}
```

`worker.js`:
```javascript
// Your worker code, e.g.:
addEventListener('fetch', event => event.respondWith(handleRequest(event.request)));

async function handleRequest(request) {
  return new Response('hello world', { status: 200 });
}
```

`node .`

## Testing

See *Running*.

## Changelog

### `1.0.0` 2020-03-01

The initial release with support for deploying a worker with no bindings based
on `secrets.json` with manually obtained values.

## To-Do

### Add support for namespace bindings to enable preserving KV bindings
