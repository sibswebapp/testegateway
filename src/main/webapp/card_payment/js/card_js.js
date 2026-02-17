document.addEventListener("DOMContentLoaded", async function () {

      function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
      }

      // variavies globais
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
      let gatewayVersion

      if(useDefault == "0"){
        token = credential_config_variable.bearerToken;
        clientId = credential_config_variable.clientId;
        terminalId = credential_config_variable.terminalId;
        entity = credential_config_variable.entity;
        isDummyCustomer = credential_config_variable.isDummyCustomer;
        ServerToServer = credential_config_variable.ServerToServer;
        paymentMethods = credential_config_variable.paymentMethods;
        gatewayVersion = credential_config_variable.gatewayVersion;

      }else{
        token = credential_default_variable.bearerToken;
        clientId = credential_default_variable.clientId;
        terminalId = credential_default_variable.terminalId;
        entity = credential_default_variable.entity;
        isDummyCustomer = credential_default_variable.isDummyCustomer;
        ServerToServer = credential_default_variable.ServerToServer;
        paymentMethods = credential_default_variable.paymentMethods;
        gatewayVersion = credential_default_variable.gatewayVersion;

      }
    
      encodedPaymentMethods = encodeURIComponent(paymentMethods);
      const paymentId = getQueryParam("id");

      if (!paymentId) {
        document.getElementById("payment-status").innerHTML =
          '<div class="alert alert-danger">ID do pagamento não encontrado.</div>';
        return;
      }

      const version = gatewayVersion === "1" ? "v1" : "v2";
      const apiUrl = `https://spg.qly.site1.sibs.pt/api/${version}/payments/${paymentId}/status`;
      
      let token_payment
      let clientId_payment

      if(useDefault == "0"){
        token_payment = credential_config_variable.bearerToken;
        clientId_payment = credential_config_variable.clientId;

      }else{
        token_payment = credential_default_variable.bearerToken;
        clientId_payment = credential_default_variable.clientId;
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

                        <div class="d-grid">
                            <button type="button" id="refund-btn" class="btn btn-warning fw-bold py-3 rounded-pill shadow-sm">
                                <i class="fa-solid fa-arrow-rotate-left me-2"></i>Solicitar Reembolso da Compra
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById("refund-btn").addEventListener("click", function() {
            let refunds = JSON.parse(localStorage.getItem("refunds")) || [];
            refunds.push({
                paymentId: paymentId,
                amount: data.amount.value,
                redirect: 1
            });
            localStorage.setItem("refunds", JSON.stringify(refunds));
            window.location.href = "Refund_gateway/Refund_gateway.html";
        });

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