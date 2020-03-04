const crypto = require('crypto');
const fetch = require('node-fetch');

module.exports = async function (accountId, workerName, apiToken, script, ...bindings) {
  if (!accountId) {
    throw new Error('Account ID must be supplied.');
  }

  if (!workerName) {
    throw new Error('Worker name must be supplied.');
  }

  if (!apiToken) {
    throw new Error('API token must be supplied.');
  }

  if (!script) {
    throw new Error('Script must be supplied.');
  }

  const metadata = {
    body_part: 'script',
    bindings: bindings.map(binding => ({ name: binding.name, type: 'kv_namespace', namespace_id: binding.namespaceId })),
  };

  const boundary = crypto.randomBytes(20).toString('hex');
  const body = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="metadata"; filename="blob"',
    'Content-Type: application/json',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Disposition: form-data; name="script"; filename="blob"',
    'Content-Type: application/javascript',
    '',
    script,
    `--${boundary}--`,
    ''
  ].join('\r\n');

  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${workerName}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error('The API has responded with an error:\n' + JSON.stringify(data, null, 2));
  }
}
