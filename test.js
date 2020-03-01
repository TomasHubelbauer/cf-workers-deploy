const fs = require('fs-extra');
const deploy = require('.');
const fetch = require('node-fetch');
const secrets = require('./secrets.json');

void async function () {
  const nonce = Math.random();

  await fs.writeFile('worker.js', `
addEventListener('fetch', event => event.respondWith(handleRequest(event.request)));

async function handleRequest(request) {
  return new Response('hello world ${nonce}', { status: 200 });
}
`);

  await deploy();

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
