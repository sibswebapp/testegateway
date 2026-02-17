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

      const isProd = window.location.hostname === 'sibsdigitalcommerce.com'; 

      let baseUrl = isProd 
      ? window.location.origin + '/SimuladorSIBS/' 
      : window.location.origin + '/';

      
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

      const placeholder = document.getElementById('loader-placeholder');
      if (placeholder) {
          placeholder.style.display = 'none'; 
      }

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

      renderApiInspector(debugHeaders, debugBody, data);
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


   function renderApiInspector(headers, body, responseData) {
        const formContainer = document.getElementById("payment-form");
        
        // Criar o elemento do Inspetor se não existir
        let inspectorDiv = document.getElementById("sibs-inspector-root");
        if (!inspectorDiv) {
            inspectorDiv = document.createElement("div");
            inspectorDiv.id = "sibs-inspector-root";
            formContainer.appendChild(inspectorDiv);
        }

        const reqHeadersStr = JSON.stringify(headers, null, 2);
        const reqBodyStr = JSON.stringify(body, null, 2);
        const resStr = JSON.stringify(responseData, null, 2);

        inspectorDiv.innerHTML = `
            <div class="debug-container my-5">
                <div class="debug-card shadow-lg">
                    <div class="debug-header">
                        <div class="terminal-dots">
                            <div class="dot-red"></div>
                            <div class="dot-yellow"></div>
                            <div class="dot-green"></div>
                        </div>
                        <div class="debug-title">
                           <i class="fa-solid fa-bug me-2"></i> Debug SIBS API Inspector
                        </div>
                        <div class="status_badge_debug text_info_debug" id="insp-badge">Request Mode</div>
                    </div>

                    <div class="debug-section p-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="text-muted small fw-bold">DEBUG CONSOLE</span>
                            <button class="btn btn-sm btn-outline-primary" id="insp-toggle">
                                <i class="fa-solid fa-arrows-rotate me-1"></i> Ver API Reply
                            </button>
                        </div>

                        <div id="insp-content">
                            <div class="mb-4">
                                <div class="section-label"> <i class="fa-solid fa-list-check"></i> HEADER</div>
                                <div class="code-window position-relative">
                                    <pre id="pre-h" class="bg-dark p-3 rounded" style="max-height:150px; overflow-y:auto; font-size:0.8rem; color:white">${reqHeadersStr}</pre>
                                </div>
                            </div>
                            <div>
                                <div class="section-label">PAYLOAD</div>
                                <div class="code-window position-relative">
                                    <pre id="pre-b" class="bg-dark text_info_debug p-3 rounded" style="max-height:350px; overflow-y:auto; font-size:0.8rem;">${reqBodyStr}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Lógica de Toggle
        let isResponseView = false;
        const btn = document.getElementById("insp-toggle");
        const badge = document.getElementById("insp-badge");
        const preH = document.getElementById("pre-h");
        const preB = document.getElementById("pre-b");

        btn.onclick = () => {
            isResponseView = !isResponseView;
            if (isResponseView) {
                preH.textContent = `Status: ${responseData?.status || "200 OK"}`;
                preH.className = "bg-dark p-3 text_info_debug rounded";
                preB.textContent = resStr;
                preB.className = "bg-dark p-3 text_info_debug rounded";
                badge.textContent = "JSON Response";
                badge.className = "status_badge_debug text_info_debug";
                btn.innerHTML = '<i class="fa-solid fa-arrows-rotate me-1"></i> Ver API Request';
            } else {
                preH.textContent = reqHeadersStr;
                preH.className = "bg-dark text_info_debug p-3 rounded";
                preB.textContent = reqBodyStr;
                preB.className = "bg-dark text_info_debug p-3 rounded";
                badge.textContent = "Request Mode";
                badge.className = "status_badge_debug text_info_debug";
                btn.innerHTML = '<i class="fa-solid fa-arrows-rotate me-1"></i> Ver API Reply';
            }
        };
    }

    function createDebugContainer(debugHeaders, debugBody, responseData) {

      const placeholder = document.getElementById('loader-placeholder');
      if (placeholder) {
          placeholder.style.display = 'none'; 
      }
      
      const formContainer = document.getElementById("payment-form");
      formContainer.innerHTML = ""; 

      // Preparação dos dados da Resposta
      const resStr = JSON.stringify(responseData, null, 2);
      const status = responseData?.status || "Error";

      formContainer.innerHTML = `
          <div class="debug-container my-5">
              <div class="debug-card-error shadow-lg">
                  <div class="debug-header" style="background-color: #a11b0adb;"> 
                      <div class="terminal-dots">
                          <div class="dot-red"></div>
                          <div class="dot-yellow"></div>
                          <div class="dot-green"></div>
                      </div>
                       <div class="debug-title" style="color:white">
                           <i class="fa-solid fa-bug me-2" style="color:white"></i> SIBS API - RESPONSE ERROR
                        </div>
                      <div class="status_badge_debug_error">JSON Response</div>
                  </div>

                  <div class="debug-section p-4">
                      <div id="error-content-area">
                          <div class="mb-4">
                              <div class="section-label_error">RESPONSE STATUS</div>
                              <div class="code-window">
                                  <pre class="text_info_debug p-3" style="font-size:0.9rem; background: transparent; margin:0;">Status: ${status}</pre>
                              </div>
                          </div>

                          <div>
                              <div class="section-label_error">RESPONSE BODY</div>
                              <div class="code-window">
                                  <pre class="text_info_debug p-3" style="max-height:450px; overflow-y:auto; font-size:0.85rem; background: transparent; margin:0;">${resStr}</pre>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      `;
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