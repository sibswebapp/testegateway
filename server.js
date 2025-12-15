const express = require('express');
const path = require('path');

const app = express();
app.set('trust proxy', true);

const webappDir = path.join(__dirname, 'src', 'main', 'webapp');

// --------------------------------------------------
// BASIC AUTH
// --------------------------------------------------
const USER = "admin";
const PASS = "1234";

function basicAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) {
    res.setHeader('WWW-Authenticate', 'Basic realm="SecureArea"');
    return res.status(401).send("Authentication required.");
  }

  const base64 = auth.split(" ")[1];
  const [user, pass] = Buffer.from(base64, "base64")
    .toString()
    .split(":");

  if (user === USER && pass === PASS) return next();

  res.setHeader('WWW-Authenticate', 'Basic realm="SecureArea"');
  return res.status(401).send("Invalid credentials.");
}

// --------------------------------------------------
// MIDDLEWARES
// --------------------------------------------------
app.use(express.json());

// --------------------------------------------------
// ROTAS
// --------------------------------------------------

// Página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(webappDir, 'gateway', 'gateway.html'));
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// --------------------------------------------------
// PROXY SIBS – VALIDADOR CLIENTID
// --------------------------------------------------
app.post('/api/validar-clientid', basicAuth, async (req, res) => {
  try {
    const { nome, clientId, token, terminalID } = req.body;

    if (!nome || !clientId || !token || !terminalID) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios em falta"
      });
    }

    const payload = {
      merchant: {
        terminalId: Number(terminalID),
        channel: "web",
        merchantTransactionId: `Order ID: ${nome}`
      },
      transaction: {
        transactionTimestamp: new Date().toISOString(),
        description: "Validação ClientID",
        moto: false,
        paymentType: "PURS",
        amount: {
          value: 1,
          currency: "EUR"
        },
        paymentMethod: []
      }
    };

    const sibsResponse = await fetch(
      "https://api.sibspayments.com/api/v2/payments",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-IBM-Client-Id": clientId
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await sibsResponse.json();

    res.status(sibsResponse.status).json(data);

  } catch (err) {
    console.error("Erro proxy SIBS:", err);
    res.status(500).json({
      error: "Erro ao comunicar com a SIBS",
      details: err.message
    });
  }
});

// --------------------------------------------------
// SERVIR CONTEÚDO ESTÁTICO
// --------------------------------------------------

// Protege páginas do Validador
app.use(
  '/validador',
  basicAuth,
  express.static(path.join(webappDir, 'validador'))
);

// Protege páginas do Onboarding
app.use(
  '/Onboarding',
  basicAuth,
  express.static(path.join(webappDir, 'Onboarding_menu'))
);

// Resto da webapp (sem proteção)
app.use(express.static(webappDir));

// --------------------------------------------------
// START SERVER
// --------------------------------------------------
const PORT = process.env.PORT || 8002;
const HOST = process.env.HOST || '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(`testesgateway listening on http://${HOST}:${PORT}`);
  console.log(`Serving webapp from ${webappDir}`);
});
