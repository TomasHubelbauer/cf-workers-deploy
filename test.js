const secrets = require('./secrets.json');
const deploy = require('.');
const fetch = require('node-fetch');

void async function () {
  // Find in https://dash.cloudflare.com/ (on load appended to the URL)
  const accountId = secrets.accountId;
  if (!accountId) {
    throw new Error('Account ID must be supplied in the accountId key of secrets.json.');
  }

  const workerName = secrets.workerName;
  if (!workerName) {
    throw new Error('Worker name must be supplied in the workerName key of secrets.json.');
  }

  // Find in dashboard network requests' X-ATOK HTTP request headers in the dev tools
  const accessToken = secrets.accessToken;
  if (!accessToken) {
    throw new Error('Access token must be supplied in the accessToken key of secrets.json.');
  }

  // Go to https://dash.cloudflare.com/${accountId}/workers/edit/${workerName}
  // and find the `vses2` cookie value in the browser developer tools
  const sessionCookie = secrets.sessionCookie;
  if (!sessionCookie) {
    throw new Error('Session cookie must be supplied in the sessionCookie key of secrets.json.');
  }

  const namespaceId = secrets.namespaceId;
  const bindingName = secrets.bindingName;
  if (namespaceId && !bindingName) {
    throw new Error('The binding name must be provided since the namespace ID is provided.');
  }

  const nonce = Math.random();

  const script = `
addEventListener('fetch', event => event.respondWith(handleRequest(event.request)));

async function handleRequest(request) {
  return new Response('hello world ${nonce}', { status: 200 });
}
`;

  await deploy(accountId, workerName, accessToken, sessionCookie, script, namespaceId, bindingName);

  const attempts = 10;
  console.log('Nonce', nonce);
  for (let attempt = 1; attempt <= attempts; attempt++) {
    console.log('Attempt', attempt);
    const response = await fetch(`https://${secrets.workerName}.${secrets.userName}.workers.dev`);
    const text = await response.text();
    if (text !== `hello world ${nonce}`) {
      console.log('Mismatch:', text);
      if (attempt === 10) {
        throw new Error(`The worker did not have the expected response. Expected 'hello world ${nonce}'. Got '${text}'.`);
      }
    }
    else {
      console.log('Success');
      break;
    }

    // Wait for a bit to give the worker a chance to finish deployment and try again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}()
