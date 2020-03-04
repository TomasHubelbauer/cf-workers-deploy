const secrets = require('./secrets.json');
const deploy = require('.');
const fetch = require('node-fetch');

void async function () {
  // https://dash.cloudflare.com/${accountId}
  const accountId = secrets.accountId;
  if (!accountId) {
    throw new Error('Account ID must be supplied in the accountId key of secrets.json.');
  }

  const workerName = secrets.workerName;
  if (!workerName) {
    throw new Error('Worker name must be supplied in the workerName key of secrets.json.');
  }

  // https://dash.cloudflare.com/${accountId}/profile/api-tokens
  const apiToken = secrets.apiToken;
  if (!apiToken) {
    throw new Error('API token must be supplied in the apiToken key of secrets.json.');
  }

  const binding = secrets.bindings[0];
  if (!binding) {
    throw new Error('Binding must be supplied in the bindings key of secrets.json.');
  }

  // https://${workerName}.${userName}.workers.dev
  const userName = secrets.userName;
  if (!userName) {
    throw new Error('User name must be supplied in the userName key of secrets.json.');
  }

  const nonce = Math.random();

  const script = `
addEventListener('fetch', event => event.respondWith(handleRequest(event.request)));

async function handleRequest(request) {
  await ${binding.name}.put('nonce', ${nonce});
  const nonce = await ${binding.name}.get('nonce');
  return new Response('hello world ' + nonce, { status: 200 });
}
`;

  await deploy(accountId, workerName, apiToken, script, ...secrets.bindings);

  const attempts = 10;
  console.log('Nonce', nonce);
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const response = await fetch(`https://${workerName}.${userName}.workers.dev`);
    const text = await response.text();
    if (text !== `hello world ${nonce}`) {
      console.log('Attempt', attempt, 'mismatch:', text);
      if (attempt === 10) {
        throw new Error(`The worker did not have the expected response. Expected 'hello world ${nonce}'. Got '${text}'.`);
      }
    }
    else {
      console.log('Attempt', attempt, 'success');
      break;
    }

    // Wait for a bit to give the worker a chance to finish deployment and try again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}()
