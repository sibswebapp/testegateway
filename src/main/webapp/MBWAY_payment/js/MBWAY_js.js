 function getURLParameter(name) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    }


  document.addEventListener("DOMContentLoaded", async function () {

    // variavies globais
    const timerElement = document.getElementById("timer");
    const messageElement = document.getElementById("message");
    const buttonElement = document.getElementById("btnComParametros_button");
    const statusList = document.getElementById("statusList");
    const debugHeadersElement = document.getElementById("debugHeaders");
    const debugBodyElement = document.getElementById("debugBody");

    const totalTime = 240;
    const delayAfterExpiration = 60 * 1000;
    let timerInterval;

    const urlParams = new URLSearchParams(window.location.search);
    const currentTransactionID = urlParams.get("id");

    const useDefault = JSON.parse(localStorage.getItem("default"));
    const credential_default_variable = JSON.parse(localStorage.getItem('credential_default'))
    const credential_config_variable = JSON.parse(localStorage.getItem('credential_config'))

    let token
    let clientId
    let terminalId
    let entity
    let isDummyCustomer
    let ServerToServer
    let paymentMethods
    let encodedPaymentMethods
    
    if(useDefault == "0"){
      token = credential_config_variable.bearerToken;
      clientId = credential_config_variable.clientId;
      terminalId = credential_config_variable.terminalId;
      entity = credential_config_variable.entity;
      isDummyCustomer = credential_config_variable.isDummyCustomer;
      ServerToServer = credential_config_variable.ServerToServer;
      paymentMethods= credential_config_variable.paymentMethods;

    }else{

      token = credential_default_variable.bearerToken;
      clientId = credential_default_variable.clientId;
      terminalId = credential_default_variable.terminalId;
      entity = credential_default_variable.entity;
      isDummyCustomer = credential_default_variable.isDummyCustomer;
      ServerToServer = credential_default_variable.ServerToServer;
      paymentMethods= credential_default_variable.paymentMethods;
    }
  
    encodedPaymentMethods = encodeURIComponent(paymentMethods);


    const toggleButton = document.getElementById("toggleDebugView");
    let originalDebugHTML = ""; // Guarda o conteúdo atual antes de trocar

    // Só mostra o botão se for ServerToServer = 1
    if (toggleButton) {
      if (ServerToServer !== "1") {
        toggleButton.style.display = "none";
      } else {
        toggleButton.style.display = "inline-block";
      }

      toggleButton.addEventListener("click", function () {
      const debugContent = document.getElementById("debugContent");

        // Alterna estado
        showingResponse = !showingResponse;

        if (showingResponse) {

          originalDebugHTML = debugContent.innerHTML;

          debugContent.innerHTML = `
            <h6 class="fw-bold">Status Code da Resposta:</h6>
            <div class="bg-light rounded p-2 mb-3">
              <pre class="m-0">${lastResponseStatus ?? "Sem status disponível"}</pre>
            </div>

            <h6 class="fw-bold">Corpo da Resposta:</h6>
            <div class="bg-light rounded p-2" style="max-height: 300px; overflow: auto;">
              <pre id="debugResponseBody" class="m-0" style="white-space: pre; overflow-x: auto;">${JSON.stringify(lastResponseBody, null, 2)}</pre>
            </div>
          `;

          toggleButton.textContent = "Requisição";
        } else {
          // Restaurar conteúdo original
          debugContent.innerHTML = originalDebugHTML;
          toggleButton.textContent = "Resposta";
        }
      });
    }

    //função que serve para indexar os headers e o body para a parte do debug
    function updateDebug(headers, body) {
        debugHeadersElement.textContent = JSON.stringify(headers, null, 2);
        debugBodyElement.textContent = JSON.stringify(body, null, 2);
    }

    function showMessage(text, type) {
      messageElement.textContent = text;
      messageElement.classList.remove("d-none", "alert-danger", "alert-success", "alert-warning");
      messageElement.classList.add("alert-" + type);
      buttonElement.classList.remove("d-none");
    }

    //Função que irá fazer o getstatus da transação MB WAY e ver em qual estado esta o pagamento para colocar a mensagem certa na tela do utilizador
    async function checkRemotePaymentStatus() {

      let token_payment
      let clientId_payment
      let gatewayVersion

      if(useDefault == "0"){
        token_payment = credential_config_variable.bearerToken;
        clientId_payment = credential_config_variable.clientId;
        gatewayVersion = credential_config_variable.gatewayVersion;
      }else{
        token_payment = credential_default_variable.bearerToken;
        clientId_payment = credential_default_variable.clientId;
        gatewayVersion = credential_default_variable.gatewayVersion;
      }

      const version = gatewayVersion === "1" ? "v1" : "v2";
      const apiUrl = `https://spg.qly.site1.sibs.pt/api/${version}/payments/${currentTransactionID}/status`;

      const headers = {
        Authorization: `Bearer ${token_payment}`,
        "X-IBM-Client-Id": clientId_payment,
        "Content-Type": "application/json",
        "Accept": "application/json"
      };

      try {
        const response = await fetch(apiUrl, { method: "GET", headers });
        if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);

        let responseHeadersObj = {};
        response.headers.forEach((value, key) => {
          responseHeadersObj[key] = value;
        });

        const data = await response.json();
        updateDebug(responseHeadersObj, data);

        if(data.transactionStatusCode == "000") data.transactionStatusCode = "200"
        updateResponseDebug(data.transactionStatusCode, data);

        
        if (data.paymentStatus === "Declined" && data.transactionStatusCode == "E0506") {
          const timerParagraph = document.querySelector('p');
          if (timerParagraph) timerParagraph.style.display = "none";
          messageElement.textContent = 'O número colocado não está registado no MB WAY.';
          messageElement.classList.remove("d-none");
          messageElement.classList.add("alert", "alert-danger");
          buttonElement.classList.add("d-none");
          return { success: false, status: data.paymentStatus };
        }

        if (data.paymentStatus === "Success") {
          document.getElementById("timer").parentElement.style.display = "none";
          messageElement.classList.add("d-none");
          statusList.innerHTML = `
          <div class="alert alert-success" role="alert">
            <strong>Estado do Pagamento:</strong> Sucesso
          </div>`;
          
          statusList.innerHTML = `
            <div class="alert alert-success" role="alert">
              <strong>Estado do Pagamento:</strong> Sucesso
            </div>
            <!-- Botão de Reembolso -->
            <div class="text-center mt-3">
              <button type="button" id="refund-btn" class="btn btn-warning">
                Reembolso da Compra
              </button>
            </div>
          `;

          document.getElementById("refund-btn").addEventListener("click", function() {
            let refunds = JSON.parse(localStorage.getItem("refunds")) || [];

            refunds.push({
              paymentId: currentTransactionID,
              amount: data.amount.value,
              redirect: 1
            });

            localStorage.setItem("refunds", JSON.stringify(refunds));
            window.location.href = "Refund_gateway/Refund_gateway.html";
          });

          return { success: true, status: data.paymentStatus };

        }

        
        if (data.paymentStatus === "Declined") {
          document.getElementById("timer").parentElement.style.display = "none";
          messageElement.classList.add("d-none");
          statusList.innerHTML = `
          <div class="alert alert-danger" role="alert">
            <strong>Estado do Pagamento:</strong> Recusado
          </div>`;
          return { success: false, status: data.paymentStatus };

        }

        
        if (data.paymentStatus === "Declined" && data.transactionStatusCode == "E0500") {
          document.getElementById("timer").parentElement.style.display = "none";
          messageElement.classList.add("d-none");
          statusList.innerHTML = `
          <div class="alert alert-danger" role="alert">
            <strong>Estado do Pagamento:</strong> Recusado (Cliente não efetou o pagamento na APP)
          </div>`;
          return { success: false, status: data.paymentStatus };
        }

        return { success: false, status: data.paymentStatus };
      } catch (error) {
        console.error("Erro ao buscar status remoto:", error);
        return true;
      }
    }

    //Função que irá fazer novamente o get status por uma segunda vez apos os 4 minutos expirar
    async function checkFinalPaymentStatus() {
      try {

        let token_payment
        let clientId_payment
        let gatewayVersion

        if(useDefault == "0"){
          token_payment = credential_config_variable.bearerToken;
          clientId_payment = credential_config_variable.clientId;
          gatewayVersion = credential_config_variable.gatewayVersion;

        }else{
          token_payment = credential_default_variable.bearerToken;
          clientId_payment = credential_default_variable.clientId;
          gatewayVersion = credential_default_variable.gatewayVersion;

        }

        const version = gatewayVersion === "1" ? "v1" : "v2";
        const apiUrl = `https://spg.qly.site1.sibs.pt/api/${version}/payments/${currentTransactionID}/status`;

        const headers = {
          Authorization: `Bearer ${token_payment}`,
          "X-IBM-Client-Id": clientId_payment,
          "Content-Type": "application/json",
          "Accept": "application/json"
        };

        const response = await fetch(apiUrl, { method: "GET", headers });

        let responseHeadersObj = {};
        response.headers.forEach((value, key) => {
          responseHeadersObj[key] = value;
        });

        const data = await response.json();

        updateDebug(responseHeadersObj, data);
        
        if(data.transactionStatusCode == "000") data.transactionStatusCode = "200"
        updateResponseDebug(data.transactionStatusCode, data);

        messageElement.classList.add("d-none");

        let statusHTML = '';
        if (data.paymentStatus === 'Pending') {
          statusHTML = `<li class="list-group-item text-warning"><strong>Estado do Pagamento:</strong> Pendente</li>`;
        } else if (data.paymentStatus === 'Declined') {
          statusHTML = `<li class="list-group-item text-danger"><strong>Estado do Pagamento:</strong> Recusado</li>`;
        } else if (data.paymentStatus === 'Success') {
          statusHTML = `<li class="list-group-item text-success"><strong>Estado do Pagamento:</strong> Sucesso</li>`;
        } else {
          statusHTML = `<li class="list-group-item"><strong>Estado do Pagamento:</strong> ${data.paymentStatus}</li>`;
        }

        statusList.innerHTML = statusHTML;

      } catch (e) {
        console.error("Erro ao consultar status após o timeout:", e);
      }
    }

    async function checkImmediateStatus() {
      try {
        const res = await fetch("/status-pagamento");
        const data = await res.json();

        updateDebug({}, data);

        if (data.status === "concluido") {
          clearInterval(timerInterval);
          showMessage("Pagamento efetuado com sucesso!", "success");
          timerElement.textContent = "Pagamento concluído!";
          localStorage.removeItem("startTime");
          localStorage.removeItem("timerExpired");
        }
      } catch (e) {
        console.error("Erro ao verificar status inicial:", e);
      }
    }

    // É o que vai fazer o update ao timer quando tiver a zero e determinar o fluxo do MB WAY
    async function updateTimer(canStartTimer) {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const timeLeft = totalTime - elapsed;
      const dataSafe = typeof data !== 'undefined' ? data : {};

      if (timeLeft <= 0 ) {
        timerElement.textContent = "0:00";
        clearInterval(timerInterval);
        const canStartTimer = await checkRemotePaymentStatus();
        if(canStartTimer.status == 'Pending'){
          showMessage("O pagamento no MB WAY expirou.", "warning");
          localStorage.setItem("timerExpired", "true");
          setTimeout(checkFinalPaymentStatus, delayAfterExpiration);
        }
        
      } else {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      }
    }

    // --- FLUXO PRINCIPAL ---
    const storedTransactionID = localStorage.getItem("transactionID");
    if (!storedTransactionID || storedTransactionID !== currentTransactionID) {
      localStorage.setItem("transactionID", currentTransactionID);
      localStorage.setItem("startTime", Date.now());
      localStorage.removeItem("timerExpired");
    }

    let startTime = parseInt(localStorage.getItem("startTime"), 10);
    if (isNaN(startTime)) {
      startTime = Date.now();
      localStorage.setItem("startTime", startTime);
    }

    const isExpired = localStorage.getItem("timerExpired") === "true";
    const canStartTimer = await checkRemotePaymentStatus();
    const dataSafe = typeof data !== 'undefined' ? data : {};

    if (!canStartTimer) return;

    if (isExpired) {
      timerElement.textContent = "0:00";
      if(canStartTimer.status == 'Pending'){
        showMessage("O pagamento no MB WAY expirou.", "warning");
        setTimeout(checkFinalPaymentStatus, delayAfterExpiration);
      }
    } else {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      if (elapsed >= totalTime) {
        timerElement.textContent = "0:00";
        if(canStartTimer.status == 'Pending'){
          showMessage("O pagamento no MB WAY expirou.", "warning");
          localStorage.setItem("timerExpired", "true");
          setTimeout(checkFinalPaymentStatus, delayAfterExpiration);
        }
      } else {
        timerInterval = setInterval(updateTimer, 1000);
        updateTimer(canStartTimer);
        checkImmediateStatus();
      }
    }
  });

  // Armazena temporariamente os dados da última requisição e resposta
let lastRequestHeaders = {};
let lastRequestBody = {};
let lastResponseStatus = null;
let lastResponseBody = {};

// Flag para saber o modo atual
let showingResponse = false;

// Função original que atualiza debug da requisição
function updateDebug(headers, body) {
  lastRequestHeaders = headers;
  lastRequestBody = body;
  if (!showingResponse) {
    renderRequestDebug();
  }
}

// Nova função para renderizar a secção de requisição
function renderRequestDebug() {
  const debugContent = document.getElementById("debugContent");
  debugContent.innerHTML = `
    <h6 class="fw-bold"><i class="fa fa-bug me-2"></i>Headers da Requisição:</h6>
    <div class="bg-light rounded p-2 mb-3" style="max-height: 200px; overflow: auto;">
      <pre id="debugHeaders" class="m-0" style="white-space: pre; overflow-x: auto;">${JSON.stringify(lastRequestHeaders, null, 2)}</pre>
    </div>

    <h6 class="fw-bold">Corpo da Requisição:</h6>
    <div class="bg-light rounded p-2" style="max-height: 300px; overflow: auto;">
      <pre id="debugBody" class="m-0" style="white-space: pre; overflow-x: auto;">${JSON.stringify(lastRequestBody, null, 2)}</pre>
    </div>
  `;
}

// Nova função para renderizar a secção de resposta
function renderResponseDebug() {
  const debugContent = document.getElementById("debugContent");
  debugContent.innerHTML = `
    <h6 class="fw-bold">Status Code da Resposta:</h6>
    <div class="bg-light rounded p-2 mb-3">
      <pre class="m-0">${lastResponseStatus ?? "Sem status disponível"}</pre>
    </div>

    <h6 class="fw-bold">Corpo da Resposta:</h5>
    <div class="bg-light rounded p-2" style="max-height: 300px; overflow: auto;">
      <pre id="debugResponseBody" class="m-0" style="white-space: pre; overflow-x: auto;">${JSON.stringify(lastResponseBody, null, 2)}</pre>
    </div>
  `;
}

// Função auxiliar para guardar dados da resposta
function updateResponseDebug(statusCode, body) {
  lastResponseStatus = statusCode;
  lastResponseBody = body;
  if (showingResponse) {
    renderResponseDebug();
  }
}


const lastEvent = localStorage.getItem("spgLastEvent");
const lastData = JSON.parse(localStorage.getItem("spgLastData") || "{}");

console.log("Último evento SPG:", lastEvent, lastData);

if (lastEvent === "onPaymentSuccess") {
  document.getElementById("status").innerText = "✅ Pagamento confirmado!";
}
