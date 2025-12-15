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



///////////////

//webhooks


// PopUP de sucesso chamada
    const successModal = document.getElementById("successModal"),
          overlay = successModal.querySelector(".overlay"),
          closeBtn = successModal.querySelector(".close-btn");

    function showSuccessModal() {
      successModal.classList.add("active");
    }

    overlay.addEventListener("click", () => successModal.classList.remove("active"));
    closeBtn.addEventListener("click", () => successModal.classList.remove("active"));


    // PopUP de erro chamada
    const errorModal = document.getElementById("errorModal"),
          errorOverlay = errorModal.querySelector(".overlay"),
          errorCloseBtn = errorModal.querySelector(".close-btn");

    function showErrorModal(message) {
      errorMessage.textContent = message;
      errorModal.classList.add("active");
    }

    errorOverlay.addEventListener("click", () => errorModal.classList.remove("active"));
    errorCloseBtn.addEventListener("click", () => errorModal.classList.remove("active"));


    //para ver se o endpoint do webhook esta correto
    async function testEndpoint() {
    
      let Endpoint_URL = document.getElementById("EndpointWebhook_input").value.trim();
      const x_initialization_vector = document.getElementById("Vector").value.trim();
      const x_authentication_tag = document.getElementById("Authentication_Tag").value.trim();
      const Body_endpoint = document.getElementById("Body_endpoint").value.trim();

      const endpoint_obrigatorio = "https://cors-anywhere.herokuapp.com/"

      Endpoint_URL_Completo = endpoint_obrigatorio + Endpoint_URL;

      const resultContainer = document.getElementById("endpointResult"); 

      resultContainer.innerHTML = "";

      if (!Endpoint_URL && !x_initialization_vector && !x_authentication_tag && !Body_endpoint) {
        showErrorModal("Preencha todos os campos obrigatórios.");
        return;
      }

      if (!Endpoint_URL) {
        showErrorModal("Preenchimento obrigatório do campo Endpoint");
        return;
      }

      if (!x_initialization_vector) {
        showErrorModal("Preenchimento obrigatório do campo Initialization Vector");
        return;
      }

      if (!x_authentication_tag) {
        showErrorModal("Preenchimento obrigatório do campo Authentication Tag");
        return;
      }

      if (!Body_endpoint) {
        showErrorModal("Preenchimento obrigatório do campo Body webhook");
        return;
      }

      try {
          const response = await fetch(Endpoint_URL_Completo, {
              method: "POST",
              headers: {
                  "Content-Type": "text/plain",
                  "X-AUTHENTICATION-TAG": x_authentication_tag,
                  "X-INITIALIZATION-VECTOR": x_initialization_vector
              },
              body: Body_endpoint
          });

          if (!response.ok) {
              const errorText = await response.text();
              resultContainer.innerHTML = `
                  <div class="alert alert-danger mt-3" role="alert">
                      <br>
                      <strong>Erro na chamada API:</strong><br>${errorText}
                  </div>
              `;
              showErrorModal("Erro na chamada API");
              return;
          }

          const resultText = await response.text();
          resultContainer.innerHTML = `
              <div class="alert alert-success mt-3" role="alert">
                  <br>
                  <strong>Resposta do endpoint:</strong><br>${resultText}
              </div>
          `;
          showSuccessModal("Desencriptação do webhook feita com sucesso");

      } catch (err) {
          console.error(err);
          resultContainer.innerHTML = `
              <div class="alert alert-danger mt-3" role="alert">
                  <strong>Erro ao chamar o endpoint:</strong><br>${err.message}
              </div>
          `;
          showErrorModal("Erro ao chamar o endpoint");
      }
    }


    //Para ver se ele faz a desencriptação como deve ser
    async function sodiumDecrypt() {

  const resultContainerDecrypt = document.getElementById("endpointResultDecrypt");
  resultContainerDecrypt.innerHTML = "";

  function base64ToBytes(base64) {
    try {
      return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    } catch (e) {
      throw new Error("Valor inválido: não é Base64 válido → " + base64);
    }
  }

  const webhookSecret = document.getElementById("webhookSecret").value.trim();
  const iv_from_http_header = document.getElementById("webhookIvB64").value.trim();
  const http_body = document.getElementById("webhookBody").value.trim();
  const auth_tag_from_http_header = document.getElementById("webhookAuthTagB64").value.trim();

  // Verificação correta — deve ser OR, não AND
  if (!webhookSecret || !iv_from_http_header || !http_body || !auth_tag_from_http_header) {
    showErrorModal("Preencha todos os campos obrigatórios.");
    return;
  }

  let key, iv, ciphertext, authTag;

  try {
    key = base64ToBytes(webhookSecret);
    iv = base64ToBytes(iv_from_http_header);
    ciphertext = base64ToBytes(http_body);
    authTag = base64ToBytes(auth_tag_from_http_header);
  } catch (e) {
    showErrorModal("Erro: " + e.message);
    return;
  }

  // Verificação de tamanhos recomendados pelo AES-GCM + SIBS
  if (key.length !== 32) {
    showErrorModal(`Webhook Secret inválido: AES-256 exige 32 bytes. Recebido: ${key.length}`);
    return;
  }

  if (iv.length !== 12) {
    showErrorModal(`IV inválido: AES-GCM exige 12 bytes. Recebido: ${iv.length}`);
    return;
  }

  if (authTag.length !== 16) {
    showErrorModal(`AuthTag inválido: AES-GCM exige 16 bytes. Recebido: ${authTag.length}`);
    return;
  }

  if (ciphertext.length === 0) {
    showErrorModal("O HTTP Body está vazio ou não é Base64 do ciphertext.");
    return;
  }

  // Juntar ciphertext + tag
  const combined = new Uint8Array(ciphertext.length + authTag.length);
  combined.set(ciphertext);
  combined.set(authTag, ciphertext.length);

  try {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      combined
    );

    const resultText = new TextDecoder().decode(decrypted);

    resultContainerDecrypt.innerHTML = `
      <div class="alert alert-success mt-3" role="alert">
        <strong>Resposta da desencriptação do Webhook:</strong><br>
        <pre>${resultText}</pre>
      </div>
    `;

    showSuccessModal("Desencriptação concluída com sucesso!");

  } catch (err) {

    let msg = err.message || "Erro desconhecido";

    if (msg.includes("OperationError")) {
      msg = `
        Falha na desencriptação AES-GCM (OperationError).  
        Isto significa que **pelo menos um dos seguintes valores está INCORRETO**:
        - webhookSecret (chave)
        - IV
        - ciphertext (http_body)
        - AuthTag
        Confirmar que todos estão em Base64 bruto e não foram alterados.
      `;
    }

    resultContainerDecrypt.innerHTML = `
      <div class="alert alert-danger mt-3" role="alert">
        <strong>Erro ao desencriptar o webhook:</strong><br>
        ${msg}<br>
        <pre>${JSON.stringify(err, Object.getOwnPropertyNames(err), 2)}</pre>
      </div>
    `;

    showErrorModal("Erro ao desencriptar o webhook.");
  }
}


    //https://cors-anywhere.herokuapp.com/




    