const fs = require('fs-extra');
const fetch = require('node-fetch');

void async function () {
  const { accountId, workerName, namespaceId, inheritFrom, xAtok, cookie } = require('./secrets');
  const worker = await fs.readFile('worker.js', { encoding: 'ascii' });

  const data = {
    body_part: 'script',
    bindings: [
      { name: 'KV', type: 'kv_namespace', namespaceId },
    ],
    inherit_from: inheritFrom
  };

  const boundary = '---------------------------283571332918390';
  const body = [
    boundary,
    'Content-Disposition: form-data; name="metadata"; filename="blob"',
    'Content-Type: application/json',
    '',
    JSON.stringify(data),
    '--' + boundary,
    'Content-Disposition: form-data; name="script"; filename="blob"',
    'Content-Type: application/javascript',
    '',
    worker,
    '',
    boundary + '--',
    ''
  ].join('\r\n');

  const response = await fetch(`https://dash.cloudflare.com/api/v4/accounts/${accountId}/workers/scripts/${workerName}/preview`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
      Accept: '*/*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      Cookie: cookie,
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
      'X-ATOK': xAtok
    },
    referrer: 'https://dash.cloudflare.com/',
    body,
    method: 'PUT',
  });

  console.log(await response.text());
}()
