const express = require('express');
const path = require('path');

const app = express();
app.set('trust proxy', true);

const webappDir = path.join(__dirname, 'src', 'main', 'webapp');

// Serve TODA a pasta webapp (todas as pastas, todos os JS)
app.use(express.static(webappDir));

// Abrir automaticamente o gateway.html
app.get('/', (req, res) => {
  res.sendFile(path.join(webappDir, 'gateway', 'gateway.html'));
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 8002;
const HOST = process.env.HOST || '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(
    'testesgateway listening on http://' + HOST + ':' + PORT + ' serving ' + webappDir
  );
});
