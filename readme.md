# CloudFlare Workers Deploy

## Installation

`npm install https://github.com/TomasHubelbauer/cf-workers-deploy`

## Usage

Create `secrets.json` and `worker.js` first:

`secrets.json`:
```json
{
  "accountId": "…",
  "workerName": "…",
  "accessToken": "…-ATOK…",
  "sessionCookie": "…",
  "namespaceId": "…",
  "bindingName": "…"
}
```

- `accountId` is the account ID displayed in your CloudFlare dashboard UI and URL
- `workerName` is the name of you worker - `https://${workerName}.${userName}.workers.dev`
- `accessToken` is the `X-ATOK` request header value found using the dev tools
- `sessionCookie` is the `vses2` cookie value found using the dev tools
- `namespaceId` is the KV namespace ID found in your KV tab in the CF dashboard
  (optional if you're not binding a KV to your worker)
- `bindingName` is the name of the variable binding your worker will see fo the KV
  (mandatory if the namespace ID is provided)

`worker.js`:
```javascript
// Your worker code, e.g.:
addEventListener('fetch', event => event.respondWith(handleRequest(event.request)));

async function handleRequest(request) {
  return new Response('hello world', { status: 200 });
}
```

With these prerequisites met, use as follows:

```javascript
const deploy = require('cf-worker-deploy');

// Deploys the contents of `worker.js` according to the keys of `secrets.json`
await deploy();
```

## Testing

**This will replace your existing worker at the configured secrets!**

You must also add a new secret key value pair: `userName` which is used as a
subdomain to construct the worker URL for the test:

`https://${workerName}.${userName}.workers.dev`

`npm test`

## Changelog

### `3.0.0` 2020-03-01

Dropped support for passing in the secrets using command line arguments and
exported the method correctly.

Added a destructive (!) test for verifying the deployment works.

### `2.0.0` 2020-03-01

Added support for the `namespaceId` and `bindingName` secrets which enable using
KV with the worker.

Fixed a bug where the session cookie was read from the access token command line
argument instead of its own.

### `1.0.0` 2020-03-01

The initial release with support for deploying a worker with no bindings based
on `secrets.json` with manually obtained values.

## To-Do
