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
            <div class="alert alert-success d-flex flex-column align-items-center text-center" role="alert">
              <svg class="bi mb-2" width="50" height="50" role="img" aria-label="Success:">
                  <use href="#check-circle-fill"/>
              </svg>
              <div>
                  <strong>Status do pagamento:</strong> ${data.paymentStatus}
              </div>
              <div class="text-center mt-3">
                <button type="button" id="refund-btn" class="btn btn-warning">
                  Reembolso da Compra
                </button>
              </div>
            </div>
          `;

          // Adicionar event listener ao botão de reembolso
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
          document.getElementById("payment-status").innerHTML = `<div class="alert alert-danger d-flex flex-column align-items-center text-center" role="alert">
                            <svg class="bi mb-2" width="50" height="50" role="img" aria-label="Erro:">
                                <use href="#exclamation-triangle-fill"/>
                            </svg>
                            <div>
                                <strong>Status do pagamento:</strong> ${data.paymentStatus}
                            </div>
                            <div>
                                <strong>Descrição:</strong>${data.transactionStatusDescription}
                            </div>
                        </div>`;
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