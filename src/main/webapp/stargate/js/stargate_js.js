//credenciais default
    const credential_default_stargate = {
      terminalId: "301",
      clientId: "a1f729f7-ee7c-46b3-b30a-9b20d7fff09a",
      bearerToken: "02090d1ccf9a8e42a5b859c5b84dc4c5a8.eyJlIjoiMjA2NzY3MzI2NDY1MSIsInJvbGVzIjoiTUFOQUdFUiIsInRva2VuQXBwRGF0YSI6IntcIm1jXCI6XCIxODFcIixcInRjXCI6XCIzMDFcIn0iLCJpIjoiMTc1MjE0MDQ2NDY1MSIsImlzIjoiaHR0cHM6Ly9xbHkuc2l0ZTEuc3NvLnN5cy5zaWJzLnB0L2F1dGgvcmVhbG1zL1FMWS5TQk8tSU5ULlBPUlQxIiwidHlwIjoiQmVhcmVyIiwiaWQiOiJyaFNOVVl4RFNIMjE2NDU1NmU5NDYxNGU0YWEzOGU4NDYzMTBhMzRlMjUifQ==.f486111bd4c61bb025c46fb6478233f23a18edfebd42e66712d6b3547ed452d8217d85d2fc6f0682f2b572fb787e082e9f3609b3343c27f851659b5f71bacf30",
      AllMethodsPay: "0",
      Country: "Poland"
    };

    const credential_default_stargate_SPAIN = {
      terminalId: "345",
      clientId:"46840c19-5ac0-40e4-8c88-b05ca0ad7efe",
      bearerToken: "02090d1ccf9a8e42a5b859c5b84dc4c5a8.eyJlIjoiMjA3MDcwNDExMzgwNyIsInJvbGVzIjoiTUFOQUdFUiIsInRva2VuQXBwRGF0YSI6IntcIm1jXCI6XCIyMjFcIixcInRjXCI6XCIzNDVcIn0iLCJpIjoiMTc1NTE3MTMxMzgwNyIsImlzIjoiaHR0cHM6Ly9xbHkuc2l0ZTEuc3NvLnN5cy5zaWJzLnB0L2F1dGgvcmVhbG1zL1FMWS5TQk8tSU5ULlBPUlQxIiwidHlwIjoiQmVhcmVyIiwiaWQiOiJUdTRuZ1VodzExNWQ2MTQ2Yjk1MDIzNDA5YzkyODY2ODBhMjBhYjRhMjYifQ==.d4f8d7309bc4a158128ddb3e0b6072a47dfedb342c4c587c0f85829eb76dca21299327fa8d9ec9fa71391cd935ff7859dde9f68036dd1f4696c1b867baaddde3",
      AllMethodsPay: "0",
      Country: "EUR"
    };

    localStorage.setItem('credential_default_stargate_SPAIN', JSON.stringify(credential_default_stargate_SPAIN));
    localStorage.setItem('credential_default_stargate', JSON.stringify(credential_default_stargate));


    //Buscar localStorage arrays
    const credential_default_stargate_variable = JSON.parse(localStorage.getItem('credential_default_stargate'))
    const credential_config_stargate_variable = JSON.parse(localStorage.getItem('credential_config_stargate'))
    const credential_default_stargate_SPAIN_variable = JSON.parse(localStorage.getItem('credential_default_stargate_SPAIN'))
    const default_stargate_Configs = JSON.parse(localStorage.getItem('default_stargate'))

    //Se ele clicar voltar para tras isto da reset a tudo
    window.addEventListener('pageshow', function(event) {
      if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
        const dynamicForm = document.getElementById("dynamicForm");
        if (dynamicForm) dynamicForm.remove();
          const forms = document.querySelectorAll("form");
          forms.forEach(form => form.reset());
          window.location.reload();
        }
    });

    //Função para mascarar string
    function maskValue(value) {
      if (!value) return "";
      return value.substring(0, 4) + "****";
    }


    document.addEventListener("DOMContentLoaded", function () {
      const urlParams = new URLSearchParams(window.location.search);
    });

    function getURLParameter(name) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    }

    document.addEventListener("DOMContentLoaded", () => {

      if (!localStorage.getItem('default_stargate')) {
        localStorage.setItem('default_stargate', '1');
      }

      if(default_stargate_Configs == "0"){
        AllMethodsPay = credential_config_stargate_variable.AllMethodsPay
      }else{
        AllMethodsPay = credential_default_stargate.AllMethodsPay
      }

      if (AllMethodsPay == "1") {
        document.getElementById("payment-method_Div").style.display = "none";
      } else {
        document.getElementById("payment-method_Div").style.display = "block";
      }

      const paymentForm = document.getElementById("payment-form");
      const debugContainer = document.getElementById("debug-container");

      if (paymentForm) {
        paymentForm.style.height = "";
      }

      const checkAndApplyHeight = () => {
        if (
          debugContainer &&
          debugContainer.offsetHeight > 0 &&
          window.getComputedStyle(debugContainer).display !== "none"
        ) {
          paymentForm.style.height = "771px";
          observer.disconnect();
        }
      };

      const observer = new MutationObserver(checkAndApplyHeight);

      if (debugContainer) {
        observer.observe(debugContainer, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      }

      checkAndApplyHeight();
    });

    function updatePaymentMethods() {
      const selectedCountry = document.querySelector('input[name="country"]:checked')?.value;
      const select = document.getElementById("payment-method");
      select.innerHTML = "";

      const methodMap = {
        Spain: [{ label: "Bizum", value: "BIZM" }],
        Poland: [{ label: "BLIK", value: "BLIK" }]
      };

      const methods = methodMap[selectedCountry] || [];

      methods.forEach(({ label, value }) => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = label;
        select.appendChild(opt);
      });
      
    }

    updatePaymentMethods();

    function updatePaymentMethods() {
      const selectedCountry = document.querySelector('input[name="country"]:checked')?.value;
      const select = document.getElementById("payment-method");
      select.innerHTML = "";

      const methodMap = {
        Spain: [{ label: "Bizum", value: "BIZM" }, {label: "Cartão", value: "CARD"}],
        Poland: [{ label: "BLIK", value: "BLIK" }, {label: "Cartão", value: "CARD"}]
      };

      const methods = methodMap[selectedCountry] || [];

      methods.forEach(({ label, value }) => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = label;
        select.appendChild(opt);
      });

    }

    //Gerar o form depois do checkout
    function generatePaymentForm(transactionID, formContext, token, clientId, terminalId, currency_country, paymentMethodArray, data) {
      const formContainer = document.getElementById("payment-form");
      formContainer.innerHTML = "";
      
      let redirectUrl = "";

      let baseUrl = window.location.origin + '/';

      
      if (paymentMethodArray.length === 0) {
        redirectUrl = `${baseUrl}card_stargate_payment/card_stargate_return.html`;
      }

      if (paymentMethodArray.length === 1 && paymentMethodArray[0] === "CARD") {
        redirectUrl = `${baseUrl}card_stargate_payment/card_stargate_return.html`;
      }

      if (paymentMethodArray.length === 1 && paymentMethodArray[0] === "BLIK") {
        redirectUrl = `${baseUrl}BLIK_stargate_payment/BLIK_stargate_return.html`;
      }

      if (paymentMethodArray.length === 1 && paymentMethodArray[0] === "BIZM") {
        redirectUrl = `${baseUrl}Bizum_stargate_payment/Bizum_stargate_return.html`;
      }


      const amount = parseFloat(document.getElementById("amount").value);

      const form = document.createElement("form");
      form.className = "paymentSPG";
      form.setAttribute("spg-context", formContext);
      form.setAttribute("spg-config", JSON.stringify({
        paymentMethodList: [],
        amount: { value: amount, currency: currency_country },
        language: "pt",
        redirectUrl: redirectUrl
      }));

      formContainer.appendChild(form);

      const script = document.createElement("script");
      script.src = `https://stargate.qly.site2.sibs.pt/assets/js/widget.js?id=${transactionID}`;
      document.body.appendChild(script);

      const debugBody = {
        merchant: {
          terminalId: terminalId,
          channel: "web",
          merchantTransactionId: "OrderID"
        },
        transaction: {
          transactionTimestamp: new Date().toISOString(),
          description: "Transaction short description",
          moto: false,
          paymentType: "PURS",
          amount: {
            value: amount,
            currency: currency_country
          },
          paymentMethod: paymentMethodArray
        }
      };

      //para o corpo do debug (debug - body do checkout)
      const debugHeaders = {
        "Authorization": `Bearer ${maskValue(token)}`,
        "X-IBM-Client-Id": maskValue(clientId),
        "Content-Type": "application/json",
        "Accept": "application/json"
      };

       // --- Debug Container ---
      const debugContainer = document.createElement("div");
      debugContainer.className = "card mt-4";

      // Cabeçalho com título e botão
      const debugHeader = document.createElement("div");
      debugHeader.className = "card-header text-white fw-bold d-flex justify-content-between align-items-center";
      debugHeader.style.backgroundColor = "rgb(255, 152, 0)";
      debugHeader.style.color = "rgb(242, 242, 242)";
      const debugTitle = document.createElement("span");
      debugTitle.innerHTML = '<i class="fa fa-bug me-2"></i>Debug do Request API';

      const responseButton = document.createElement("button");
      responseButton.className = "btn btn-light btn-sm fw-bold";
      responseButton.textContent = "Ver API reply";

      debugHeader.appendChild(debugTitle);
      debugHeader.appendChild(responseButton);
      debugContainer.appendChild(debugHeader);

      // Corpo inicial do debug (requisição)
      const debugContent = document.createElement("div");
      debugContent.className = "card-body";

      // Elementos do debug original
      const headersTitle = document.createElement("h6");
      headersTitle.className = "fw-bold";
      headersTitle.textContent = "Request Headers:";

      const headersPre = document.createElement("pre");
      headersPre.className = "bg-light p-3 rounded";
      headersPre.style.maxHeight = "150px";
      headersPre.style.overflowY = "auto";
      headersPre.style.fontSize = "0.8rem";
      headersPre.textContent = JSON.stringify(debugHeaders, null, 2);

      const bodyTitle = document.createElement("h6");
      bodyTitle.className = "fw-bold mt-3";
      bodyTitle.textContent = "Request Body:";

      const bodyPre = document.createElement("pre");
      bodyPre.className = "bg-light p-3 rounded";
      bodyPre.style.maxHeight = "300px";
      bodyPre.style.overflowY = "auto";
      bodyPre.style.fontSize = "0.8rem";
      bodyPre.textContent = JSON.stringify(debugBody, null, 2);

      // Montar conteúdo original
      debugContent.appendChild(headersTitle);
      debugContent.appendChild(headersPre);
      debugContent.appendChild(bodyTitle);
      debugContent.appendChild(bodyPre);
      debugContainer.appendChild(debugContent);
      formContainer.appendChild(debugContainer);

      // --- Alternar entre Request e Response ---
      let showingResponse = false;

      responseButton.onclick = () => {
        if (!showingResponse) {
          // Mostrar a resposta recebida (vinda como parâmetro 'data')
          debugContent.innerHTML = `
            <h6 class="fw-bold">Status Code Response:</h6>
            <pre class="bg-light p-3 rounded">${data?.status || "200"}</pre>

            <h6 class="fw-bold mt-3">Request Body:</h6>
            <pre class="bg-light p-3 rounded" style="max-height:400px;overflow-y:auto;font-size:0.8rem;">
              ${JSON.stringify(data, null, 2)}
            </pre>
          `;

          responseButton.textContent = "Ver API request";
          debugTitle.innerHTML = '<i class="fa fa-bug me-2"></i>Response API';
          showingResponse = true;
        } else {

          // Voltar à visualização original
          debugContent.innerHTML = "";
          debugContent.appendChild(headersTitle);
          debugContent.appendChild(headersPre);
          debugContent.appendChild(bodyTitle);
          debugContent.appendChild(bodyPre);

          responseButton.textContent = "Ver API reply";
          debugTitle.innerHTML = '<i class="fa fa-bug me-2"></i>Debug do Request API';
          showingResponse = false;
        }
      };

    }


    //Fazer o checkout para depois gerar o form
    async function makePayment() {

      const apiUrl = "https://stargate.qly.site2.sibs.pt/api/v1/payments";

      const selectedMethod = document.getElementById("payment-method").value;
      const selectedCountry = document.querySelector('input[name="country"]:checked')?.value;

      let defaultToken = "";
      let defaultClientId = "";
      let defaultTerminalId = "";
      let currency_country = "";

      let token;
      let clientId;
      let terminalId;
      

      if(selectedCountry == "Poland"){
        defaultToken = credential_default_stargate_variable.bearerToken
        defaultTerminalId =  credential_default_stargate_variable.terminalId;
        defaultClientId = credential_default_stargate_variable.clientId
        currency_country = "PLN";

      } else {
        defaultToken = credential_default_stargate_SPAIN_variable.bearerToken;
        defaultTerminalId = credential_default_stargate_SPAIN_variable.terminalId;
        defaultClientId = credential_default_stargate_SPAIN_variable.clientId
        currency_country = "EUR";
      }
        
      
      if (default_stargate_Configs == "0" && credential_config_stargate_variable?.useDefaultConfig == "true") {
        token = defaultToken;
        clientId = defaultClientId;
        terminalId = parseInt(defaultTerminalId);
      } else {
        token = credential_config_stargate_variable?.bearerToken || defaultToken;
        clientId = credential_config_stargate_variable?.clientId || defaultClientId;
        terminalId = parseInt(credential_config_stargate_variable?.terminalId || defaultTerminalId);
      }

      const amountValue = parseFloat(document.getElementById("amount").value);

      //caso o AllMethodsPay tiver a 1 então o array do payment Method fica vazio
      const paymentMethodArray = (AllMethodsPay == "1") ? [] : [selectedMethod];

      if (!selectedMethod  && AllMethodsPay != "1") {
        showErrorModal("Selecione um método de pagamento.");
        return;
      }
      
      const requestData = {
        merchant: {
          terminalId: terminalId,
          channel: "web",
          merchantTransactionId: "OrderID"
        },
        transaction: {
          transactionTimestamp: new Date().toISOString(),
          description: "Transaction short description",
          moto: false,
          paymentType: "PURS",
          amount: {
            value: amountValue,
            currency: currency_country
          },
          paymentMethod:paymentMethodArray
        }
      };

      let response;

      try {
        response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "X-IBM-Client-Id": clientId,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(requestData)
        });

        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status}`);
        }

        const data = await response.json();
        if (data.transactionID && data.formContext) {
          generatePaymentForm(data.transactionID, data.formContext, token, clientId, terminalId, currency_country, paymentMethodArray, data);
        } else {
          throw new Error("Resposta da API incompleta.");
        }
      } catch (error) {
        console.error("Erro ao processar pagamento:", error);
        showErrorModal("Erro ao processar pagamento. Verifique o console para mais detalhes.");

        if (response) {

              const debugHeaders = {
              "Authorization": `Bearer ${maskValue(token)}`,
              "X-IBM-Client-Id": maskValue(clientId),
              "Content-Type": "application/json",
              "Accept": "application/json"
            };


            const debugBody = {
              merchant: {
                terminalId: terminalId,
                channel: "web",
                merchantTransactionId: "OrderID"
              },
              transaction: {
                transactionTimestamp: new Date().toISOString(),
                description: "Transaction short description",
                moto: false,
                paymentType: "PURS",
                amount: {
                  value: amount,
                  currency: "EUR"
                },
                paymentMethod: paymentMethodArray
              }
            };


          try {
            const responseBody = await response.json().catch(() => null);
            createDebugContainer(debugHeaders, debugBody, {
              status: response.status,
              body: responseBody
            });
          } catch {
            createDebugContainer(debugHeaders, debugBody, {
              status: "Erro ao ler resposta"
            });
          }
        } else {
          createDebugContainer(debugHeaders, debugBody, {
            status: "Sem resposta do servidor"
          });
        }
      }

    }


    //Caso der erro, irá fazer mesmo assimm o modo debug da resposta
    function createDebugContainer(debugHeaders, debugBody, responseData) {
      const formContainer = document.getElementById("payment-form");
      formContainer.innerHTML = "";

      const debugContainer = document.createElement("div");
      debugContainer.className = "card mt-4";

      // Cabeçalho
      const debugHeader = document.createElement("div");
      debugHeader.className = "card-header bg-danger text-white fw-bold d-flex justify-content-between align-items-center";

      const debugTitle = document.createElement("span");
      debugTitle.innerHTML = '<i class="fa fa-bug me-2"></i>Debug do Request API - Erro';

      const responseButton = document.createElement("button");
      responseButton.className = "btn btn-light btn-sm fw-bold";
      responseButton.textContent = "Ver API reply";

      debugHeader.appendChild(debugTitle);
      debugHeader.appendChild(responseButton);
      debugContainer.appendChild(debugHeader);

      // Corpo (request)
      const debugContent = document.createElement("div");
      debugContent.className = "card-body";

      const headersTitle = document.createElement("h6");
      headersTitle.className = "fw-bold";
      headersTitle.textContent = "Request Headers:";

      const headersPre = document.createElement("pre");
      headersPre.className = "bg-light p-3 rounded";
      headersPre.style.maxHeight = "150px";
      headersPre.style.overflowY = "auto";
      headersPre.style.fontSize = "0.8rem";
      headersPre.textContent = JSON.stringify(debugHeaders, null, 2);

      const bodyTitle = document.createElement("h6");
      bodyTitle.className = "fw-bold mt-3";
      bodyTitle.textContent = "Request Body:";

      const bodyPre = document.createElement("pre");
      bodyPre.className = "bg-light p-3 rounded";
      bodyPre.style.maxHeight = "300px";
      bodyPre.style.overflowY = "auto";
      bodyPre.style.fontSize = "0.8rem";
      bodyPre.textContent = JSON.stringify(debugBody, null, 2);

      debugContent.appendChild(headersTitle);
      debugContent.appendChild(headersPre);
      debugContent.appendChild(bodyTitle);
      debugContent.appendChild(bodyPre);
      debugContainer.appendChild(debugContent);
      formContainer.appendChild(debugContainer);

      // Alternar request / response
      let showingResponse = false;

      responseButton.onclick = () => {
        if (!showingResponse) {
          debugContent.innerHTML = `
            <h6 class="fw-bold">Status Code Response:</h6>
            <pre class="bg-light p-3 rounded">${responseData?.status || "200"}</pre>

            <h6 class="fw-bold mt-3">Response Body:</h6>
            <pre class="bg-light p-3 rounded" style="max-height:400px;overflow-y:auto;font-size:0.8rem;">
    ${JSON.stringify(responseData, null, 2)}
            </pre>
          `;
          responseButton.textContent = "Ver API request";
          debugTitle.innerHTML = '<i class="fa fa-bug me-2"></i>Response API - Erro';
          showingResponse = true;
        } else {
          debugContent.innerHTML = "";
          debugContent.appendChild(headersTitle);
          debugContent.appendChild(headersPre);
          debugContent.appendChild(bodyTitle);
          debugContent.appendChild(bodyPre);
          responseButton.textContent = "Ver API reply";
          debugTitle.innerHTML = '<i class="fa fa-bug me-2"></i>Debug do Request API - Erro';
          showingResponse = false;
        }
      };
    }


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