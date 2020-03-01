const secrets = require('./secrets');
const crypto = require('crypto');
const fs = require('fs-extra');
const fetch = require('node-fetch');

void async function () {
  // Find in https://dash.cloudflare.com/ (on load appended to the URL)
  const accountId = secrets.accountId || process.argv[2];
  if (!accountId) {
    throw new Error('Account ID must be supplied in the accountId key of secrets.json or in the 1st command line argument.');
  }

  const workerName = secrets.workerName || process.argv[3];
  if (!workerName) {
    throw new Error('Worker name must be supplied in the workerName key of secrets.json or in the 2nd command line argument.');
  }

  // Find in dashboard network requests' X-ATOK HTTP request headers in the dev tools
  const accessToken = secrets.accessToken || process.argv[4];
  if (!accessToken) {
    throw new Error('Access token must be supplied in the accessToken key of secrets.json or in the 3rd command line argument.');
  }

  // Go to https://dash.cloudflare.com/${accountId}/workers/edit/${workerName}
  // and find the `vses2` cookie value in the browser developer tools
  const sessionCookie = secrets.sessionCookie || process.argv[4];
  if (!sessionCookie) {
    throw new Error('Session cookie must be supplied in the sessionCookie key of secrets.json or in the 4th command line argument.');
  }

  if (!await fs.pathExists('worker.js')) {
    throw new Error('worker.js must exist');
  }

  const script = await fs.readFile('worker.js', { encoding: 'utf8' });

  const metadata = {
    body_part: 'script',
    bindings: [],
  };

  const boundary = crypto.randomBytes(20).toString('hex');
  const body = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="metadata"; filename="blob"',
    'Content-Type: application/json',
    '',
    //'',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Disposition: form-data; name="script"; filename="blob"',
    'Content-Type: application/javascript',
    '',
    //'',
    script,
    `--${boundary}--`,
    ''
  ].join('\r\n');

  const response = await fetch(`https://dash.cloudflare.com/api/v4/accounts/${accountId}/workers/scripts/${workerName}`, {
    method: 'PUT',
    headers: {
      'X-ATOK': accessToken,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Cookie: `vses2=${sessionCookie}`
    },
    body,
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error('The API has responded with an error:\n' + JSON.stringify(data, null, 2));
  }
}()
