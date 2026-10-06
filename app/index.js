const express = require('express');
const client = require('prom-client');

const app = express();
client.collectDefaultMetrics();

const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequests.inc({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

app.get('/', (req, res) => res.json({ message: 'Hello from GitOps pipeline', version: 'v1' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// HPA test ke liye CPU load generate karta hai
app.get('/load', (req, res) => {
  const end = Date.now() + 200;
  while (Date.now() < end) { Math.sqrt(Math.random()); }
  res.send('load done');
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

module.exports = app;
