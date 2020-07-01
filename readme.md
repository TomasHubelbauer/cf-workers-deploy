# CloudFlare Workers Deploy

## Installation

`npm install TomasHubelbauer/cf-workers-deploy`

## Usage

```javascript
const deploy = require('cf-worker-deploy');
await deploy(accountId, workerName, apiToken, script, ...bindings);
```

For argument values, see the Testing section below.

## Testing

**This will replace your existing worker at the configured secrets!**

`secrets.json`:
```json
{
  "accountId": "…",
  "workerName": "…",
  "apiToken": "…",
  "bindings": [
    {
      "name": "…",
      "namespaceId": "…"
    }
  ],
  "userName": "…"
}
```

- `accountId` is the account ID from https://dash.cloudflare.com/${accountId}/workers/overview
- `workerName` is the name of you worker in `https://${workerName}.${userName}.workers.dev`
- `apiToken` is the API token from https://dash.cloudflare.com/${accountId}/profile/api-tokens
- `bindings` is an array of associated worker resources (zero or more):
  - `name` is the name of the variable binding in the worker script source code
  - `namespaceId` is the namespace ID from https://dash.cloudflare.com/${accountId}/workers/kv/namespaces
- `userName` is used as a subdomain in `https://${workerName}.${userName}.workers.dev`

`npm test`

## Changelog

### `5.0.0` 2020-03-04

Rewritten to use the CloudFlare API:

https://developers.cloudflare.com/workers/tooling/api/scripts

### `4.0.0` 2020-03-01

Accept all the secrets and the script using function arguments instead of doing
file I/O in the method. This gives greated flexibility to the callers.

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
