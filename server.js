const express = require('express');
const path = require('path');

const app = express();
app.set('trust proxy', true);

// Serve static files from /src/main/webapp
const staticDir = path.join(__dirname, 'src', 'main', 'webapp');
app.use(express.static(staticDir, { extensions: ['html'] }));

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Port and host config
const PORT = process.env.PORT || 8002;
const HOST = process.env.HOST || '127.0.0.1';

// Start server
app.listen(PORT, HOST, () => {
  console.log(
    'testesgateway listening on http://' + HOST + ':' + PORT + ' serving ' + staticDir
  );
});


