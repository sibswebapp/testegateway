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
    
      encodedPaymentMethods = encodeURIComponent(paymentMethods);

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
          document.getElementById("payment-status").innerHTML = `<div class="alert alert-success d-flex flex-column align-items-center text-center" role="alert">
                            <svg class="bi mb-2" width="50" height="50" role="img" aria-label="Success:">
                                <use href="#check-circle-fill"/>
                            </svg>
                            <div>
                                <strong>Status do pagamento:</strong> ${data.paymentStatus}
                            </div>
                        </div>`;
        } else {
          document.getElementById("payment-status").innerHTML = `<div class="alert alert-danger d-flex flex-column align-items-center text-center" role="alert">
                            <svg class="bi mb-2" width="50" height="50" role="img" aria-label="Erro:">
                                <use href="#exclamation-triangle-fill"/>
                            </svg>
                            <div>
                                <strong>Status do pagamento:</strong> ${data.paymentStatus}
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