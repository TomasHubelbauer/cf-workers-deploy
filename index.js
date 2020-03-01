const crypto = require('crypto');
const fetch = require('node-fetch');

module.exports = async function (accountId, workerName, accessToken, sessionCookie, script, namespaceId, bindingName) {
  if (!accountId) {
    throw new Error('Account ID must be supplied.');
  }

  if (!workerName) {
    throw new Error('Worker name must be supplied.');
  }

  if (!accessToken) {
    throw new Error('Access token must be supplied.');
  }

  if (!sessionCookie) {
    throw new Error('Session cookie must be supplied.');
  }

  if (!script) {
    throw new Error('Script must be supplied.');
  }

  if (namespaceId && !bindingName) {
    throw new Error('The binding name must be provided since the namespace ID is provided.');
  }

  const metadata = {
    body_part: 'script',
    bindings: namespaceId ? [{ name: bindingName, type: 'kv_namespace', namespace_id: namespaceId }] : [],
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
}
