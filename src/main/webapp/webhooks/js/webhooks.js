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
        return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      }

      const webhookSecret = document.getElementById("webhookSecret").value.trim();
      const iv_from_http_header = document.getElementById("webhookIvB64").value.trim();
      const http_body = document.getElementById("webhookBody").value.trim();
      const auth_tag_from_http_header = document.getElementById("webhookAuthTagB64").value.trim();

      if (!webhookSecret && !iv_from_http_header && !http_body && !auth_tag_from_http_header) {
          showErrorModal("Preencha todos os campos obrigatórios.");
          return;
      }

      if (!webhookSecret) {
          showErrorModal("Preenchimento obrigatório do campo Webhook Secret");
          return;
      }

      if (!iv_from_http_header) {
          showErrorModal("Preenchimento obrigatório do campo IvB64");
          return;
      }
      
      if (!http_body) {
          showErrorModal("Preenchimento obrigatório do campo HTTP Body");
          return;
      }

      if (!auth_tag_from_http_header) {
          showErrorModal("Preenchimento obrigatório do campo AuthTag 64");
          return;
      }

      const key = base64ToBytes(webhookSecret);
      const iv = base64ToBytes(iv_from_http_header);
      const ciphertext = base64ToBytes(http_body);
      const authTag = base64ToBytes(auth_tag_from_http_header);

      const combined = new Uint8Array(ciphertext.length + authTag.length);
      combined.set(ciphertext);
      combined.set(authTag, ciphertext.length);

      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );

      try {
        const decrypted = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: iv },
          cryptoKey,
          combined
        );

        let decoder = new TextDecoder();

        decoder.decode(decrypted);
        const resultText = decoder.decode(decrypted);

        resultContainerDecrypt.innerHTML = `
              <div class="alert alert-success mt-3" role="alert">
                <br>
                <strong>Resposta da desencriptação do Webhook:</strong><br>${resultText}
              </div>
          `;

        showSuccessModal("Desencriptação do webhook feita com sucesso");

      } catch (err) {
        console.error("Erro completo:", err);

        resultContainerDecrypt.innerHTML = `
          <div class="alert alert-danger mt-3" role="alert">
            <strong>Erro ao desencriptar o webhook:</strong><br>
            ${err.message || "Erro desconhecido"}<br><br>
            <pre>${JSON.stringify(err, Object.getOwnPropertyNames(err), 2)}</pre>
          </div>
        `;

        showErrorModal("Erro ao desencriptar o webhook");
      }
    }


    //https://cors-anywhere.herokuapp.com/
