const express = require('express');
const path = require('path');

const app = express();
app.set('trust proxy', true);

const webappDir = path.join(__dirname, 'src', 'main', 'webapp');

// Serve toda a pasta webapp
app.use(express.static(webappDir));

// Redireciona a raiz "/" para o gateway.html
app.get('/', (req, res) => {
  res.sendFile(path.join(webappDir, 'gateway', 'gateway.html'));
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Use a porta do Azure App Service
const PORT = process.env.PORT || 8002;

// Não defina HOST fixo, apenas use undefined para aceitar conexões externas
app.listen(PORT, () => {
  console.log(`testesgateway listening on port ${PORT} serving ${webappDir}`);
});
