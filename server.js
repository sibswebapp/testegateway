const express = require('express');
const path = require('path');
const fs = require('fs');

require('dotenv').config({
  path: path.join(__dirname, 'pass.env')
});

const USER = process.env.BASIC_AUTH_USER;
const PASS = process.env.BASIC_AUTH_PASS;
const PORT = process.env.PORT || 8002;
const HOST = process.env.HOST || '127.0.0.1';
const prefix = process.env.APP_PREFIX || '/SimuladorSIBS/';

if (!USER || !PASS) {
  throw new Error('BASIC_AUTH_USER ou BASIC_AUTH_PASS não estão definidos!');
}

const app = express();
app.set('trust proxy', true);
const webappDir = path.join(__dirname, 'src', 'main', 'webapp');

// Middleware para Basic Auth
function basicAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="SecureArea"');
    return res.status(401).send('Authentication required');
  }
  const base64 = auth.split(' ')[1];
  const [user, pass] = Buffer.from(base64, 'base64').toString().split(':');
  if (user === USER && pass === PASS) return next();
  
  res.setHeader('WWW-Authenticate', 'Basic realm="SecureArea"');
  return res.status(401).send('Invalid credentials');
}

app.use(express.json());

// --------------------------------------------------
// Chamadas API
// --------------------------------------------------

app.post(`${prefix}api/validar-clientid`, async (req, res) => {
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

// GET STATUS
app.get("/api/status", async (req, res) => {
  try {
    const { terminalId, clientId, transactionId, token } = req.query;

    if (!transactionId || !clientId || !token || !terminalId) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios em falta"
      });
    }

    const sibsResponse = await fetch(
      `https://spg.qly.site1.sibs.pt/api/v2/payments/${transactionId}/status`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-IBM-Client-Id": clientId,
          "Content-Type": "application/json"
        }
      }
    );

    // Tenta parsear JSON da SIBS
    const text = await sibsResponse.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // Se não for JSON, devolve texto
      return res.status(sibsResponse.status).json({
        error: "Resposta SIBS não é JSON",
        body: text
      });
    }

    res.status(sibsResponse.status).json(data);

  } catch (err) {
    console.error("Erro proxy SIBS:", err);
    res.status(500).json({
      error: "Erro ao comunicar com a SIBS",
      details: err.message
    });
  }
});



// Validar checkout em QLY
app.post('/api/validar-clientid_qly', async (req, res) => {
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
      "https://spg.qly.site1.sibs.pt/api/v2/payments",
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

//Fazer checkout com o body do validador
app.post('/api/validar-body_qly', async (req, res) => {
  try {
    const { body, clientId, token } = req.body;

    if (!body || !clientId || !token) {
      return res.status(400).json({ error: "Parâmetros obrigatórios em falta" });
    }

    body.merchant = body.merchant || {};
    body.merchant.terminalId = body.merchant.terminalId || 0;

    const sibsResponse = await fetch(
      "https://spg.qly.site1.sibs.pt/api/v2/payments",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-IBM-Client-Id": clientId
        },
        body: JSON.stringify(body)
      }
    );

    const responseBody = await sibsResponse.text(); // lê como texto primeiro
    let data;

    try {
      data = JSON.parse(responseBody); // tenta transformar em JSON
    } catch {
      data = { raw: responseBody }; // se não for JSON, retorna como raw
    }

    // Retorna exatamente o status que a SIBS enviou
    res.status(sibsResponse.status).json(data);

  } catch (err) {
    console.error("Erro proxy SIBS:", err);
    res.status(500).json({
      error: "Erro ao comunicar com a SIBS",
      details: err.message
    });
  }
});

//Refund
app.post('/api/Refund', async (req, res) => {
  try {
    const { montante, clientId, bearerToken, terminalId } = req.body;
    const { transactionId } = req.query;

    if (!montante || !clientId || !bearerToken || !terminalId || !transactionId) {
      return res.status(400).json({ error: "Parâmetros obrigatórios em falta" });
    }

    const payload = {
      merchant: {
        terminalId: Number(terminalId),
        channel: "web",
        merchantTransactionId: "Refund"
      },
      transaction: {
        transactionTimestamp: new Date().toISOString(),
        description: "Refund",
        amount: {
          value: Number(montante),
          currency: "EUR"
        }
      }
    };

    const sibsResponse = await fetch(
      `https://spg.qly.site1.sibs.pt/api/v2/payments/${transactionId}/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`,
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

//Cancel
app.post('/api/Cancel', async (req, res) => {
  try {
    const { montante, clientId, bearerToken, terminalId } = req.body;
    const { transactionId } = req.query;

    if (!montante || !clientId || !bearerToken || !terminalId || !transactionId) {
      return res.status(400).json({ error: "Parâmetros obrigatórios em falta" });
    }

    const payload = {
      merchant: {
        terminalId: Number(terminalId),
        channel: "web",
        merchantTransactionId: "Cancelamento"
      },
      transaction: {
        transactionTimestamp: new Date().toISOString(),
        description: "Cancelamento",
        amount: {
          value: Number(montante),
          currency: "EUR"
        }
      }
    };

    const sibsResponse = await fetch(
      `https://spg.qly.site1.sibs.pt/api/v2/payments/${transactionId}/cancellation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`,
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

//CIT
app.post('/api/cit', async (req, res) => {
  try {
    const { montante, clientId, terminalId, bearerToken } = req.body;
    const { CitType } = req.query;

    if (!montante || !clientId || !terminalId || !bearerToken || !CitType) {
      return res.status(400).json({ error: "Parâmetros obrigatórios em falta" });
    }

    let payload;

    if (CitType === "RCRR") {
      payload = {
        merchant: {
          terminalId: Number(terminalId),
          channel: "web",
          merchantTransactionId: `CIT-RCRR-${Date.now()}`
        },
        transaction: {
          transactionTimestamp: new Date().toISOString(),
          description: "CIT RCRR",
          moto: false,
          paymentType: "PURS",
          amount: {
            value: Number(montante),
            currency: "EUR"
          },
          paymentMethod: ["CARD"]
        },
        customer: {
          customerInfo: {
            customerName: "John Doe",
            customerEmail: "john.doe@xptomail.com",
            billingAddress: {
                street1: "First street",
                street2: "Menef Square",
                city: "Lisbon",
                postcode: "1700-123",
                country: "PT"
            }
          }
        },
        merchantInitiatedTransaction: {
          type: "RCRR",
          amountQualifier: "ESTIMATED"
        }
      };
    } else {
      payload = {
        merchant: {
          terminalId: Number(terminalId),
          channel: "web",
          merchantTransactionId: `CIT-UCOF-${Date.now()}`
        },
        transaction: {
          transactionTimestamp: new Date().toISOString(),
          description: "CIT UCOF",
          moto: false,
          paymentType: "AUTH",
          amount: {
            value: 0,
            currency: "EUR"
          },
          paymentMethod: ["CARD"]
        },
        customer: {
          customerInfo: {
            customerName: "John Doe",
            customerEmail: "john.doe@xptomail.com",
            billingAddress: {
                street1: "First street",
                street2: "Menef Square",
                city: "Lisbon",
                postcode: "1700-123",
                country: "PT"
            }
          }
        },
        merchantInitiatedTransaction: {
          type: "UCOF",
          amountQualifier: "ESTIMATED"
        }
      };
    }

    const sibsResponse = await fetch(
      "https://spg.qly.site1.sibs.pt/api/v2/payments",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`,
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

//MIT
app.post('/api/Mit', async (req, res) => {
  try {
    const { montante, clientId, terminalId, bearerToken } = req.body;
    const { mitType, MITTransactionId } = req.query;

    if (!montante || !clientId || !terminalId || !bearerToken || !mitType || !MITTransactionId) {
      return res.status(400).json({ error: "Parâmetros obrigatórios em falta" });
    }

    let payload;
    
    
    if (mitType === "RCRR") {

      payload = {
        merchant: {
          terminalId: Number(terminalId),
          channel: "web",
          merchantTransactionId: `MIT-RCRR-${Date.now()}`
        },
        transaction: {
          transactionTimestamp: new Date().toISOString(),
          description: "MIT RCRR",
          amount: {
            value: Number(montante),
            currency: "EUR"
          }
        },
        originalTransaction: {
          id: MITTransactionId,
          datetime: new Date().toISOString()
        }
      };

    } else {
      payload = {
        merchant: {
          terminalId: Number(terminalId),
          channel: "web",
          merchantTransactionId: `MIT-UCOF-${Date.now()}`
        },
        transaction: {
          transactionTimestamp: new Date().toISOString(),
          description: "MIT UCOF",
          amount: {
            value: Number(montante),
            currency: "EUR"
          }
        },
        originalTransaction: {
          id: MITTransactionId,
          datetime: new Date().toISOString()
        }
      };
    }

    const sibsResponse = await fetch(
      `https://spg.qly.site1.sibs.pt/api/v2/payments/${MITTransactionId}/mit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`,
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

//Capture
app.post('/api/capture', async (req, res) => {
  try {
    const { montante, clientId, terminalId, bearerToken } = req.body;
    const { captureTransactionId } = req.query;

    if (!montante || !clientId || !terminalId || !bearerToken || !captureTransactionId) {
      return res.status(400).json({ error: "Parâmetros obrigatórios em falta" });
    }

    let payload;
    
    payload = {
      merchant: {
        terminalId: Number(terminalId),
        channel: "web",
        merchantTransactionId: `Captura MIT- ${captureTransactionId}`
      },
      transaction: {
        transactionTimestamp: new Date().toISOString(),
        description: `Captura MIT- ${captureTransactionId}`,
        amount: {
          value: Number(montante),
          currency: "EUR"
        }
      }
    };

    
    const sibsResponse = await fetch(
      `https://spg.qly.site1.sibs.pt/api/v2/payments/${captureTransactionId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`,
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

// Listar Mandatos
app.post("/api/ListarMandato", async (req, res) => {
  try {
    const { clientId, bearerToken } = req.query;

    if (!clientId || !bearerToken) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios em falta"
      });
    }

    const sibsResponse = await fetch(
      "https://api.qly.sibspayments.com/sibs/spg/v2/mbway-mandates/list",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${bearerToken}`,
          "X-IBM-Client-Id": clientId,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({})
      }
    );

    const text = await sibsResponse.text();

    // proteção contra HTML
    if (!text.trim().startsWith("{")) {
      return res.status(sibsResponse.status).json({
        error: "SIBS devolveu HTML em vez de JSON",
        status: sibsResponse.status,
        body: text
      });
    }

    const data = JSON.parse(text);
    res.status(sibsResponse.status).json(data);

  } catch (err) {
    console.error("Erro proxy SIBS:", err);
    res.status(500).json({
      error: "Erro ao comunicar com a SIBS",
      details: err.message
    });
  }
});


//Cancelar Mandato
app.post('/api/CancelarMandato', async (req, res) => {
  try {
    const { terminalId, CancelMandatoMerchantID } = req.body;
    const { CancelMandatoTransactionId, bearerToken, clientId, CancelMandatoPhone } = req.query;

    if (!clientId || !terminalId || !bearerToken || !CancelMandatoTransactionId || !CancelMandatoMerchantID || !CancelMandatoPhone) {
      return res.status(400).json({ error: "Parâmetros obrigatórios em falta" });
    }

    let payload;
    
    payload = {
      merchant: {
        terminalId: Number(terminalId),
        channel: "web",
        merchantTransactionId: `${CancelMandatoMerchantID}`
      }
    };

    const sibsResponse = await fetch(
      `https://api.qly.sibspayments.com/sibs/spg/v2/mbway-mandates/${CancelMandatoTransactionId}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`,
          "X-IBM-Client-Id": clientId,
          "Mbway-ID": CancelMandatoPhone
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

//Detalhe Mandato
app.post('/api/DetalheMandato', async (req, res) => {
  try {

    const { DetalheMandatoTransactionId, bearerToken, clientId, DetalheMandatoPhone } = req.query;

    if (!DetalheMandatoTransactionId || !bearerToken || !clientId || !DetalheMandatoPhone) {
      return res.status(400).json({ error: "Parâmetros obrigatórios em falta" });
    }

    const sibsResponse = await fetch(
      `https://api.qly.sibspayments.com/sibs/spg/v2/mbway-mandates/${DetalheMandatoTransactionId}/inquiry-detail`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`,
          "X-IBM-Client-Id": clientId,
          "Mbway-ID": DetalheMandatoPhone
        },
        body: JSON.stringify({})
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

//Criar Mandato
app.post('/api/CriarMandato', async (req, res) => {

  try {
    const { terminalId, CriarMandatoCustomerName, CriarMandatoPhone, CriarMandatoMerchantID } = req.body;
    const { bearerToken, clientId } = req.query;

    if (!terminalId || !CriarMandatoCustomerName || !CriarMandatoPhone || !CriarMandatoMerchantID || !bearerToken || !clientId) {
      return res.status(400).json({ error: "Parâmetros obrigatórios em falta" });
    }

    let payload;

    payload = {
      merchant: {
        terminalId: Number(terminalId),
        channel: "web",
        merchantTransactionId: `${CriarMandatoMerchantID}`,
        transactionDescription: `Mandatos -> ${CriarMandatoMerchantID}`
      },
      mandate: {
        mandateType : "ONECLICK",
        aliasMBWAY : CriarMandatoPhone,
        customerName : CriarMandatoCustomerName
      }
    };

    const sibsResponse = await fetch(
      `https://api.qly.sibspayments.com/sibs/spg/v2/mbway-mandates/creation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`,
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

//Refund Mandato
app.post('/api/RefundMandato', async (req, res) => {
  try {
    const { montante, clientId, bearerToken, terminalId } = req.body;
    const { transactionId } = req.query;

    if (!montante || !clientId || !bearerToken || !terminalId || !transactionId) {
      return res.status(400).json({ error: "Parâmetros obrigatórios em falta" });
    }

    const payload = {
      merchant: {
        terminalId: Number(terminalId),
        channel: "web",
        merchantTransactionId: "Refund PA"
      },
      transaction: {
        transactionTimestamp: new Date().toISOString(),
        description: "Refund PA",
        amount: {
          value: Number(montante),
          currency: "EUR"
        }
      }
    };

    const sibsResponse = await fetch(
      `https://spg.qly.site1.sibs.pt/api/v2/payments/${transactionId}/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`,
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


//Checkout Mandato
app.post('/api/CheckoutMandato', async (req, res) => {
  try {
    const { terminalId , montante , checkoutMandateId, checkoutMerchantID, checkoutCustomerName } = req.body;
    const { clientId, bearerToken } = req.query;

    if (!terminalId || !montante || !checkoutMandateId || !checkoutMerchantID || !checkoutCustomerName || !clientId || !bearerToken) {
      return res.status(400).json({ error: "Parâmetros obrigatórios em falta" });
    }

    const payload = {
      merchant: {
        terminalId: Number(terminalId),
        channel: "web",
        merchantTransactionId: checkoutMerchantID
      },
      customer: {
        customerInfo: {
            customerName: checkoutCustomerName
        }
      },
      transaction: {
        transactionTimestamp: new Date().toISOString(),
        description: "CHECKOUT MANDATO",
        moto: false,
        paymentType: "PURS",
        amount: {
          value: Number(montante),
          currency: "EUR"
        },
        paymentMethod: [
            "MANDATE",
            "MBWAY"
        ]
      },
      mandate: {
        mandateId: checkoutMandateId
      }
    };

    const sibsResponse = await fetch(
      `https://api.qly.sibspayments.com/sibs/spg/v2/payments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`,
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

//Compra Mandato
app.post('/api/CompraMandato', async (req, res) => {
  try {
    const { bearerToken, mandateTransactionSignature } = req.query;
    const { clientId, transactionID } = req.body;

    if (!clientId || !bearerToken || !transactionID) {
      return res.status(400).json({ error: "Parâmetros obrigatórios em falta" });
    }

    const payload = {
      mandate: {
        mandateCreation: false,
        useMBWAYMandate: true
        }
    };

    const sibsResponse = await fetch(
      `https://api.qly.sibspayments.com/sibs/spg/v2/payments/${transactionID}/mbway-id/purchase`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Digest ${mandateTransactionSignature}`,
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

// 1. ROTAS PROTEGIDAS (Acesso restrito)
const protectedRoutes = [
  '/validador_API',
  '/validador',
  '/Onboarding_menu',
  '/webhooks',
  '/validador_form',
  '/validador_multifuncoes'
];

protectedRoutes.forEach(route => {
  // O path.join aqui deve apontar para a pasta real no disco
  const folderName = route.replace('/', '');
  app.use(route, basicAuth, express.static(path.join(webappDir, folderName)));
});

// 2. ROTAS PÚBLICAS (Sem Auth)
const publicRoutes = [
  '/public',
  '/AllmethodsPayment',
  '/Bizum_stargate_payment',
  '/BLIK_stargate_payment',
  '/Cancellation_gateway',
  '/card_payment',
  '/card_stargate_payment',
  '/config_gateway',
  '/config_stargate',
  '/footer',
  '/gateway',
  '/gateway_menu',
  '/MBWAY_payment',
  '/navbar',
  '/Onboarding',
  '/popups',
  '/reference_payment',
  '/Refund_gateway',
  '/stargate'
];

publicRoutes.forEach(route => {
  const folderName = route.replace('/', '');
  app.use(route, express.static(path.join(webappDir, folderName)));
});

// 3. PÁGINA INICIAL
app.get('/', (req, res) => {
  const indexPath = path.join(webappDir, 'gateway_menu', 'gateway_menu.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Página inicial não encontrada! Verifique o caminho: ' + indexPath);
  }
});

// 4. FALLBACK (Arquivos na raiz de webapp)
app.use(express.static(webappDir));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
  console.log(`Webapp root: ${webappDir}`);
});