const express = require('express');
const path = require('path');

const app = express();
app.set('trust proxy', true);

const webappDir = path.join(__dirname, 'src', 'main', 'webapp');

// --- Basic Auth ---
const USER = "admin";
const PASS = "1234";

function basicAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) {
    res.setHeader('WWW-Authenticate', 'Basic realm="SecureArea"');
    return res.status(401).send("Authentication required.");
  }
  const base64 = auth.split(" ")[1];
  const [user, pass] = Buffer.from(base64, "base64").toString().split(":");
  if (user === USER && pass === PASS) return next();
  res.setHeader('WWW-Authenticate', 'Basic realm="SecureArea"');
  return res.status(401).send("Invalid credentials.");
}

// Abrir automaticamente o gateway.html
app.get('/', (req, res) => {
  res.sendFile(path.join(webappDir, 'gateway', 'gateway.html'));
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// --- Protege todas as paginas do Onboarding ---
app.use('/validador', basicAuth, express.static(path.join(webappDir, 'validador')));
app.use('/Onboarding', basicAuth, express.static(path.join(webappDir, 'Onboarding_menu')));


// Servir restante webapp (outras pastas) sem proteção
app.use(express.static(webappDir));

const PORT = process.env.PORT || 8002;
const HOST = process.env.HOST || '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log('testesgateway listening on http://' + HOST + ':' + PORT + ' serving ' + webappDir);
});
