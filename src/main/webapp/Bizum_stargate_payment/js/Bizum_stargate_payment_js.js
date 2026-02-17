document.addEventListener("DOMContentLoaded", async function () {

      function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
      }

      // variavies globais
      const useDefault_stargate = JSON.parse(localStorage.getItem("default_stargate"));
      const credential_default_stargate_variable = JSON.parse(localStorage.getItem('credential_default_stargate'))
      const credential_config_stargate_variable = JSON.parse(localStorage.getItem('credential_config_stargate'))

      let token
      let clientId
      let terminalId
      let paymentMethods
      let encodedPaymentMethods
  
            
      if(useDefault_stargate == "0"){
        token = credential_config_stargate_variable.bearerToken;
        clientId = credential_config_stargate_variable.clientId;
        terminalId = credential_config_stargate_variable.terminalId;
        paymentMethods = credential_config_stargate_variable.paymentMethods;
      }else{
        token = credential_default_stargate_variable.bearerToken;
        clientId = credential_default_stargate_variable.clientId;
        terminalId = credential_default_stargate_variable.terminalId;
        paymentMethods = credential_default_stargate_variable.paymentMethods;
      }

      let baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, ''); 

      window.addEventListener("popstate", function () {
        baseUrl = "Stargate.html";
      });

      const paymentId = getQueryParam("id");

      if (!paymentId) {
        document.getElementById("payment-status").innerHTML =
          '<div class="alert alert-danger">ID do pagamento não encontrado.</div>';
        return;
      }

      const apiUrl = `https://stargate.qly.site2.sibs.pt/api/v1/payments/${paymentId}/status`;
      
      let token_payment
      let clientId_payment

      if(useDefault_stargate == "0"){
        token_payment = credential_config_stargate_variable.bearerToken;
        clientId_payment = credential_config_stargate_variable.clientId;

      }else{
        token_payment = credential_default_stargate_variable.bearerToken;
        clientId_payment = credential_default_stargate_variable.clientId;
      }

      
      const headers = {
        Authorization: `Bearer ${token_payment}`,
        "X-IBM-Client-Id": clientId_payment,
        "Content-Type": "application/json",
        Accept: "application/json",
      };


      try {
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: headers,
        });

        // Mostrar os headers da resposta no debug
        let headersObj = {};
        response.headers.forEach((value, key) => {
          headersObj[key] = value;
        });
        document.getElementById("debug-headers").textContent = JSON.stringify(headersObj, null, 2);

        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status}`);
        }

        const data = await response.json();

        // Mostrar o corpo da resposta no debug
        document.getElementById("debug-body").textContent = JSON.stringify(data, null, 2);

        if (data.paymentStatus === "Success") {
          document.getElementById("payment-status").innerHTML = `
              <div class="card border-0 shadow-lg mx-auto mt-3" style="max-width: 750px; border-radius: 20px; overflow: hidden;">
                  <div class="row g-0">
                      <div class="col-md-4 d-flex align-items-center justify-content-center p-5" style="background: #ecfdf5;">
                          <div class="text-center">
                              <div class="mb-3" style="color: #10b981; font-size: 4rem;">
                                  <i class="fa-solid fa-circle-check"></i>
                              </div>
                              <span class="badge rounded-pill px-3 py-2" style="background: rgba(16, 185, 129, 0.2); color: #065f46; font-size: 0.75rem; letter-spacing: 1px;">SISTEMA OK</span>
                          </div>
                      </div>
                      <div class="col-md-8 p-5">
                          <h3 class="fw-bold text-dark mb-2">Pagamento Confirmado</h3>
                          <p class="text-muted mb-4">A sua transação foi concluída com sucesso.</p>
                          
                          <div class="p-3 bg-light rounded-3 mb-4">
                              <div class="d-flex justify-content-between align-items-center mb-1">
                                  <span class="text-muted small fw-bold">ID DA TRANSAÇÃO</span>
                              </div>
                              <span class="font-monospace fw-bold text-dark" style="word-break: break-all; font-size: 0.9rem;">${paymentId}</span>
                          </div>
                      </div>
                  </div>
              </div>
          `;

      } else {
          document.getElementById("payment-status").innerHTML = `
              <div class="card border-0 shadow-lg mx-auto mt-3" style="max-width: 750px; border-radius: 20px; overflow: hidden;">
                  <div class="row g-0">
                      <div class="col-md-4 d-flex align-items-center justify-content-center p-5" style="background: #fef2f2;">
                          <div class="text-center">
                              <div class="mb-3" style="color: #ef4444; font-size: 4rem;">
                                  <i class="fa-solid fa-circle-exclamation"></i>
                              </div>
                              <span class="badge rounded-pill px-3 py-2" style="background: rgba(239, 68, 68, 0.2); color: #991b1b; font-size: 0.75rem; letter-spacing: 1px;">ERRO</span>
                          </div>
                      </div>
                      <div class="col-md-8 p-5">
                          <h3 class="fw-bold text-dark mb-2">Falha no Pagamento</h3>
                          <p class="text-muted mb-4">Infelizmente, não foi possível realizar esta operação.</p>
                          
                          <div class="alert alert-danger border-0 p-3 mb-4" style="background: #fff1f2; border-left: 4px solid #ef4444 !important; border-radius: 8px;">
                              <p class="small fw-bold mb-1" style="color: #991b1b;">MOTIVO DA RECUSA:</p>
                              <span class="small" style="color: #b91c1c;">${data.transactionStatusDescription || "Erro de comunicação com o gateway."}</span>
                          </div>

                      </div>
                  </div>
              </div>
          `;
      }
      } catch (error) {
        console.error("Erro ao buscar status do pagamento:", error);
        document.getElementById("payment-status").innerHTML =
          '<div class="alert alert-danger">Erro ao buscar status do pagamento.</div>';

        // No erro também limpar ou informar o debug
        document.getElementById("debug-headers").textContent = "";
        document.getElementById("debug-body").textContent = error.message;
      }
    });