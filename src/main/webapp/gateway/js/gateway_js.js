
    //credenciais default
    const credential_default = {
      terminalId: "96167",
      entity: "53882",
      clientId: "dd4348ea-e240-4356-bf06-6a4f294c1077",
      bearerToken: "0267adfae94c224be1b374be2ce7b298f0.eyJlIjoiMjA3MDcwMDU2ODEyNSIsInJvbGVzIjoiTUFOQUdFUiIsInRva2VuQXBwRGF0YSI6IntcIm1jXCI6XCI1MDY5MzFcIixcInRjXCI6XCI5NjE2N1wifSIsImkiOiIxNzU1MTY3NzY4MTI1IiwiaXMiOiJodHRwczovL3FseS5zaXRlMS5zc28uc3lzLnNpYnMucHQvYXV0aC9yZWFsbXMvREVWLlNCTy1JTlQuUE9SVDEiLCJ0eXAiOiJCZWFyZXIiLCJpZCI6ImhtVmRVQ1lhU1NmOGIzMWRmY2JlMWQ0MDFlODc5OTdhZGY0ZTE1ZmM1MSJ9.71920d8b517e515a61b32b813872e5b967a06471fa63428ff66d32f83f4ce25e32548a4a8e9cf6545e2f5c6e47979b408a4f3bb2367329d71fafdec4d49af223",
      paymentMethods: ["1", "2", "3"],
      isDummyCustomer: "1",
      ServerToServer: "0",
      useDefaultConfig: "1",
      AllMethodsPay: "0",
      referenceExpiry: "1",
      referenceExpiryUnit: "days",
      gatewayVersion: "2",
      LayoutVersion: "1",
      MITs: "0",
      VersionMITS: "0"
    };

    localStorage.setItem('credential_default', JSON.stringify(credential_default));

    //Buscar localStorage arrays
    const credential_default_variable = JSON.parse(localStorage.getItem('credential_default'))
    const credential_config_variable = JSON.parse(localStorage.getItem('credential_config'))
    const default_Configs = JSON.parse(localStorage.getItem('default'))

  
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


      if (!localStorage.getItem('default')) {
        localStorage.setItem('default', '1');
      }

      let paymentMethodsParam;

      if(default_Configs == "0"){
        paymentMethodsParam = credential_config_variable.paymentMethods
        AllMethodsPay = credential_config_variable.AllMethodsPay
        gatewayVersion = credential_config_variable.gatewayVersion
        LayoutVersion = credential_config_variable.LayoutVersion

      }else{
        paymentMethodsParam = credential_default_variable.paymentMethods
        AllMethodsPay = credential_default_variable.AllMethodsPay
        gatewayVersion = credential_default_variable.gatewayVersion
        LayoutVersion = credential_default_variable.LayoutVersion

      }

      if (AllMethodsPay == "1") {
        document.getElementById("payment-method_Div").style.display = "none";
      } else {
        document.getElementById("payment-method_Div").style.display = "block";
      }


      const select = document.getElementById("payment-method");
      select.innerHTML = "";

      const methodMap = {
          "1": { label: "MB WAY", value: "MBWAY" },
          "2": { label: "Multibanco", value: "REFERENCE" },
          "3": { label: "Cartão", value: "CARD" }
      };

      if (paymentMethodsParam) {

        //verificar se é string e converter
        if (typeof paymentMethodsParam === "string") {
          try {
            paymentMethodsParam = JSON.parse(paymentMethodsParam);
          } catch {
            paymentMethodsParam = paymentMethodsParam.split(",");
          }
        }

        paymentMethodsParam
        .filter(code => typeof code === "string")
        .forEach(code => {
          const trimmed = code.trim();
          if (methodMap[trimmed]) {
            const opt = document.createElement("option");
            opt.value = methodMap[trimmed].value;
            opt.textContent = methodMap[trimmed].label;
            select.appendChild(opt);
          }
        });
      }

      if (select.options.length === 0) {
        Object.values(methodMap).forEach(({ label, value }) => {
          const opt = document.createElement("option");
          opt.value = value;
          opt.textContent = label;
          select.appendChild(opt);
        });
      }
    });

    function getURLParameter(name) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    }

    //função que faz o costumer info personalizado aparecer
    function showDummyFieldsIfNeeded() {

      let isDummyCustomer;

      if(default_Configs == "0"){
        isDummyCustomer = credential_config_variable.isDummyCustomer
      }else{
        isDummyCustomer = credential_default_variable.isDummyCustomer
      }

      const selectedMethod = document.getElementById("payment-method").value;

      if (isDummyCustomer === "1" && selectedMethod == "CARD") {
        document.getElementById("dummyCustomerFields").style.display = "block";
      } else {
        document.getElementById("dummyCustomerFields").style.display = "none";
      }
    }

    window.addEventListener("DOMContentLoaded", showDummyFieldsIfNeeded);

    function validateDummyCustomerFields() {

      let isDummyCustomer;

      if(default_Configs == "0" ){
        isDummyCustomer = credential_config_variable.isDummyCustomer
      }else{
        isDummyCustomer = credential_default_variable.isDummyCustomer
      }

      if (isDummyCustomer !== "1") {
        return true;
      }

      const container = document.getElementById("dummyCustomerFields");
      if (!container) return true;

      const inputs = container.querySelectorAll("input, select");

      for (const input of inputs) {
        if (!input.value || input.value.trim() === "") {
          showErrorModal();
          input.focus();
          return false;
        }
      }

      return true;
    }

    //função que faz o pagamento (checkout)
    async function makePayment() {

      let token;
      let clientId;
      let terminalId;
      let entity;
      let referenceExpiry;
      let referenceExpiryUnit;
      let gatewayVersion;
      let LayoutVersion;
      let apiUrl;
      let MITs;

      if(default_Configs == "0" && credential_config_variable.useDefaultConfig == "true"){
        token = credential_default_variable.bearerToken;
        clientId = credential_default_variable.clientId;
        terminalId = parseInt(credential_default_variable.terminalId);
        entity = String(credential_default_variable.entity);
      }else{

        token = credential_config_variable?.bearerToken ?? credential_default_variable?.bearerToken;
        clientId = credential_config_variable?.clientId ?? credential_default_variable?.clientId;
        terminalId =  parseInt(credential_config_variable?.terminalId ?? credential_default_variable?.terminalId);
        entity =  String(credential_config_variable?.entity ?? credential_default_variable?.entity);
      }

      if(credential_config_variable?.useDefaultConfig == "true"){
        referenceExpiry = credential_config_variable.referenceExpiry;
        referenceExpiryUnit = credential_config_variable.referenceExpiryUnit;
        gatewayVersion = credential_config_variable.gatewayVersion;
        LayoutVersion = credential_config_variable.LayoutVersion;
        MITs = credential_config_variable.MITs;
      }else{
        referenceExpiry = credential_default_variable.referenceExpiry;
        referenceExpiryUnit = credential_default_variable.referenceExpiryUnit;
        gatewayVersion = credential_default_variable.gatewayVersion;
        LayoutVersion = credential_default_variable.LayoutVersion
        MITs = credential_default_variable.MITs;
      }

      const amountValue = parseFloat(document.getElementById("amount").value);
      const selectedMethod = document.getElementById("payment-method").value;


     //caso o AllMethodsPay tiver a 1 então o array do payment Method fica vazio
      const paymentMethodArray = (AllMethodsPay == "1") ? [] : [selectedMethod];

      const version = gatewayVersion === "1" ? "v1" : "v2";
      apiUrl = `https://spg.qly.site1.sibs.pt/api/${version}/payments`;


      if (!selectedMethod  && AllMethodsPay != "1") {
        showErrorModal();
        return;
      }

      if (!validateDummyCustomerFields()) {
        return;
      }

      const initialDatetime = new Date();
      const initialDatetimeStr = initialDatetime.toISOString();

      const finalDatetime = new Date(initialDatetime);

      // força número
      const expiryValue = parseInt(referenceExpiry, 10);
      const unit = String(referenceExpiryUnit || "").toLowerCase();

      if (!isNaN(expiryValue) && expiryValue > 0) {
        switch (unit) {
          case "hours":
            finalDatetime.setHours(initialDatetime.getHours() + expiryValue);
            break;

          case "days":
            finalDatetime.setDate(initialDatetime.getDate() + expiryValue);
            break;

          case "months":
            // usa setFullYear para evitar overflow e bug de string
            finalDatetime.setFullYear(
              initialDatetime.getFullYear(),
              initialDatetime.getMonth() + expiryValue,
              initialDatetime.getDate()
            );
            break;

          default:
            console.warn("Unidade de expiração desconhecida:", referenceExpiryUnit);
            break;
        }
      } else {
          finalDatetime.setFullYear(
          initialDatetime.getFullYear(),
          initialDatetime.getMonth() + 2,
          initialDatetime.getDate()
        );
      }

      const finalDatetimeStr = finalDatetime.toISOString();

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
            currency: "EUR"
          },
          paymentMethod: paymentMethodArray,
          paymentReference: {
            initialDatetime: initialDatetimeStr,
            finalDatetime: finalDatetimeStr,
            maxAmount: { value: amountValue, currency: "EUR" },
            minAmount: { value: amountValue, currency: "EUR" },
            entity: entity
          }
        }
      };

      let isDummyCustomer;

      if(default_Configs == "0"){
        isDummyCustomer = credential_config_variable.isDummyCustomer
      }else{
        isDummyCustomer = credential_default_variable.isDummyCustomer
      }

      if (isDummyCustomer === "1" && selectedMethod == "CARD") {
        requestData.customer = {
          customerInfo: {
            customerName: document.getElementById("customerName").value,
            customerEmail: document.getElementById("customerEmail").value,
            shippingAddress: {
              street1: document.getElementById("shippingStreet1").value,
              street2: document.getElementById("shippingStreet2").value,
              city: document.getElementById("shippingCity").value,
              postcode: document.getElementById("shippingPostcode").value,
              country: document.getElementById("shippingCountry").value
            },
            billingAddress: {
              street1: document.getElementById("billingStreet1").value,
              street2: document.getElementById("billingStreet2").value,
              city: document.getElementById("billingCity").value,
              postcode: document.getElementById("billingPostcode").value,
              country: document.getElementById("billingCountry").value
            }
          }
        };
      }

      if(MITs == "1" && selectedMethod == "CARD"){
        requestData.merchantInitiatedTransaction = {
          type: "PURS",
          amountQualifier: "ESTIMATED"
        }
      }

      let response;
      let data;

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

        data = await response.json();

        if (data.transactionID && data.formContext) {
          generatePaymentForm(
            data.transactionID,
            data.formContext,
            data.transactionSignature,
            data,
            paymentMethodArray
          );
        } else {
          throw new Error("Resposta da API incompleta.");
        }

      } catch (error) {
        console.error("Erro ao processar pagamento:", error);
        showErrorModal();


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

            if (selectedMethod === "REFERENCE") {
              debugBody.transaction.paymentReference = {
                initialDatetime: initialDatetime,
                finalDatetime: finalDatetime.toISOString(),
                maxAmount: { value: amount, currency: "EUR" },
                minAmount: { value: amount, currency: "EUR" },
                entity: entity
              };
            }
            
            if (isDummyCustomer === "1" && selectedMethod === "CARD") {
              debugBody.customer = {
                customerInfo: {
                  customerName: document.getElementById("customerName").value,
                  customerEmail: document.getElementById("customerEmail").value,
                  shippingAddress: {
                    street1: document.getElementById("shippingStreet1").value,
                    street2: document.getElementById("shippingStreet2").value,
                    city: document.getElementById("shippingCity").value,
                    postcode: document.getElementById("shippingPostcode").value,
                    country: document.getElementById("shippingCountry").value
                  },
                  billingAddress: {
                    street1: document.getElementById("billingStreet1").value,
                    street2: document.getElementById("billingStreet2").value,
                    city: document.getElementById("billingCity").value,
                    postcode: document.getElementById("billingPostcode").value,
                    country: document.getElementById("billingCountry").value
                  }
                }
              };
            }


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

    //função que gera o form (logo a seguir ao checkout)
    function generatePaymentForm(transactionID, formContext, transactionSignature, data, paymentMethodArray) {
      const formContainer = document.getElementById("payment-form");
      formContainer.innerHTML = "";

      let token_payment;
      let clientId_payment;
      let terminalId_payment;
      let entity_payment;
      let apiUrl;
      let version;

      if(default_Configs == "0" && credential_config_variable.useDefaultConfig == "true"){
        token_payment = credential_default_variable.bearerToken;
        clientId_payment = credential_default_variable.clientId;
        terminalId_payment = parseInt(credential_default_variable.terminalId);
        entity_payment = String(credential_default_variable.entity);

      }else{

        token_payment = credential_config_variable?.bearerToken ?? credential_default_variable?.bearerToken;
        clientId_payment = credential_config_variable?.clientId ?? credential_default_variable?.clientId;
        terminalId_payment = parseInt(credential_config_variable?.terminalId ?? credential_default_variable?.terminalId);
        entity_payment = String(credential_config_variable?.entity ?? credential_default_variable?.entity);
      }

      let LayoutVersion = credential_config_variable?.LayoutVersion ?? credential_default_variable?.LayoutVersion;

      const isDummyCustomer = credential_config_variable?.isDummyCustomer ?? credential_default_variable?.isDummyCustomer;
      const paymentMethods = credential_config_variable?.paymentMethods ?? credential_default_variable?.paymentMethods;
      const isServerToServer = credential_config_variable?.ServerToServer ?? credential_default_variable?.ServerToServer;
      const gatewayVersion = credential_config_variable?.gatewayVersion ?? credential_default_variable?.gatewayVersion;

      let baseUrl = window.location.origin + '/';

      let redirectUrl = `${baseUrl}reference_payment/REFERENCE_return.html`

      if (paymentMethodArray.length === 1 && paymentMethodArray[0] === "MBWAY") {
        redirectUrl = `${baseUrl}MBWAY_payment/MBWAY_return.html`
      }

      if (paymentMethodArray.length === 1 && paymentMethodArray[0] === "CARD") {
        redirectUrl = `${baseUrl}card_payment/card_return.html`
      }

      if (paymentMethodArray.length == 0) {
        redirectUrl = `${baseUrl}AllmethodsPayment/AllmethodsPayment.html`
      }


      const amount = parseFloat(document.getElementById("amount").value);

      if (isServerToServer == "0") {
        const form = document.createElement("form");
        form.className = "paymentSPG";

        form.setAttribute("spg-context", formContext);
        
        form.setAttribute("spg-config", JSON.stringify({
          paymentMethodList: [],
          amount: { value: amount, currency: "EUR" },
          language: "pt",
          redirectUrl: redirectUrl
        }));

        if(LayoutVersion != "1"){

          if(LayoutVersion == "2") LayoutVersion = "spg_form_tabs"
          if(LayoutVersion == "3") LayoutVersion = "spg_form"

          form.setAttribute("spg-style", JSON.stringify({
            layout: LayoutVersion,
            theme: "default",
            color: {
                  "primary": "",
                  "border": "",
                  "surface": "",
                  "body": {
                      "text": "",
                  }
            },
            font: ""
          }));
        }

        formContainer.appendChild(form);

        const script = document.createElement("script");
        script.src = `https://spg.qly.site1.sibs.pt/assets/js/widget.js?id=${transactionID}`;
        document.body.appendChild(script);


      } else {

        const wrapper = document.createElement("div");
        wrapper.className = "d-flex flex-column align-items-center justify-content-center p-4 border rounded bg-light";

        if (paymentMethodArray.length === 1 && paymentMethodArray[0] === "MBWAY") {
          const phoneGroup = document.createElement("div");
          phoneGroup.className = "mb-3 text-center";

          const phoneLabel = document.createElement("label");
          phoneLabel.setAttribute("for", "mbwayPhone");
          phoneLabel.className = "form-label fw-bold";
          phoneLabel.textContent = "Número de Telemóvel MBWAY:";

          const phoneInput = document.createElement("input");
          phoneInput.id = "mbwayPhone";
          phoneInput.type = "tel";
          phoneInput.className = "form-control text-center";
          phoneInput.placeholder = "Formato 351#915532562";
          phoneInput.style.maxWidth = "300px";

          phoneInput.addEventListener("input", function () {
            this.value = this.value.replace(/[^\d#]/g, "");
          });

          const messageDiv = document.createElement("div");
          messageDiv.id = "message";
          messageDiv.setAttribute("role", "alert");
          messageDiv.style.marginTop = "0.25rem";
          messageDiv.style.textAlign = "center";
          messageDiv.style.maxWidth = "300px";
          messageDiv.style.margin = "0.25rem auto 0";
          messageDiv.style.padding = "0.375rem 0.75rem";
          messageDiv.style.borderRadius = "0.25rem";

          phoneGroup.appendChild(phoneLabel);
          phoneGroup.appendChild(phoneInput);
          phoneGroup.appendChild(messageDiv);

          const payButton = document.createElement("button");
          payButton.className = "btn btn-success mt-2";
          payButton.textContent = "Pagar MBWAY";
          payButton.onclick = async () => {
            const mbwayPhone = document.getElementById("mbwayPhone").value.trim();
            const messageElement = document.getElementById("message");

            if (!mbwayPhone) {
              messageElement.textContent = "Por favor, preencha o campo de telefone MB WAY.";
              messageElement.classList.add("alert", "alert-danger");
              return;
            }

            messageElement.textContent = "Telefone OK!";
            messageElement.classList.remove("alert", "alert-danger");

            version = gatewayVersion === "1" ? "v1" : "v2";
            apiUrl = `https://spg.qly.site1.sibs.pt/api/${version}/payments/${transactionID}/mbway-id/purchase`;

            const headers = {
              Authorization: `Digest ${transactionSignature}`,
              "X-IBM-Client-Id": clientId_payment,
              "Content-Type": "application/json",
              "Accept": "application/json"
            };

            const body = {
              customerPhone: mbwayPhone
            };

            try {
              const response = await fetch(apiUrl, {
                method: "POST",
                headers,
                body: JSON.stringify(body)
              });

              if (!response.ok) {
                throw new Error(`Erro ao gerar referência ServerToServer: ${response.status}`);
              }

              const data = await response.json();

            } catch (error) {
              console.error("Erro ServerToServer:", error);
              if (messageElement) {
                messageElement.textContent = "Erro, número de telefone incorreto";
                messageElement.classList.add("alert", "alert-danger");
              }
              return;
            }

            let baseUrl_MBWAY =  window.location.origin + '/';
            const redirectWithPhone = `${baseUrl_MBWAY}MBWAY_payment/MBWAY_return.html?id=${transactionID}`;

            window.location.href = redirectWithPhone;
          };

        wrapper.appendChild(phoneGroup);
        wrapper.appendChild(payButton);

        }
        else if (paymentMethodArray.length === 1 && paymentMethodArray[0] === "REFERENCE") {
            const referenceText = document.createElement("p");
            referenceText.className = "fw-semibold text-center mb-3";
            referenceText.textContent = "Clique no botão abaixo para gerar uma referência de pagamento:";

            const referenceButton = document.createElement("button");
            referenceButton.className = "btn btn-primary";
            referenceButton.textContent = "Gerar Referência de Pagamento";
            let baseUrl = window.location.origin + '/';

            referenceButton.onclick = () => {

              referenceButton.onclick = () => {
              const redirect_reference_serverToserver = `${baseUrl}reference_payment/REFERENCE_return.html?id=${transactionID}`;

              const headers = {
                "Authorization": `Digest ${transactionSignature}`,
                "X-IBM-Client-Id": clientId_payment,
                "Content-Type": "application/json",
                "Accept": "application/json"
              };

              version = gatewayVersion === "1" ? "v1" : "v2";
              apiUrl = `https://spg.qly.site1.sibs.pt/api/${version}/payments/${transactionID}/service-reference/generate`;

              fetch(apiUrl, {
                method: 'POST',
                headers: headers
              })
              .then(response => {
                if (response.ok) {
                  window.location.href = redirect_reference_serverToserver;
                } else {
                  console.error('Erro ao gerar referência:', response.status);
                }
              })
              .catch(error => {
                console.error('Erro na requisição:', error);
              });
            };

          };

          wrapper.appendChild(referenceText);
          wrapper.appendChild(referenceButton);
        }

        formContainer.appendChild(wrapper);

      }

      let token;
      let clientId;
      let terminalId;
      let entity;

      if(default_Configs == "0" && credential_config_variable.useDefaultConfig == "true"){
        token = credential_default_variable.bearerToken;
        clientId = credential_default_variable.clientId;
        terminalId = parseInt(credential_default_variable.terminalId);
        entity = String(credential_default_variable.entity);

      }else{
        token = credential_config_variable?.bearerToken ?? credential_default_variable?.bearerToken;
        clientId = credential_config_variable?.clientId ?? credential_default_variable?.clientId;
        terminalId = parseInt(credential_config_variable?.terminalId ?? credential_default_variable?.terminalId);
        entity = String(credential_config_variable?.entity ?? credential_default_variable?.entity);
      }

      //para o corpo do debug (debug - body do checkout)
      const initialDatetime = new Date().toISOString();
      const finalDatetime = new Date();
      finalDatetime.setMonth(finalDatetime.getMonth() + 2);
      
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

      if (paymentMethodArray.length === 1 && paymentMethodArray[0] === "REFERENCE") {
        debugBody.transaction.paymentReference = {
          initialDatetime: initialDatetime,
          finalDatetime: finalDatetime.toISOString(),
          maxAmount: { value: amount, currency: "EUR" },
          minAmount: { value: amount, currency: "EUR" },
          entity: entity
        };
      }
      
      if (isDummyCustomer === "1" && paymentMethodArray.length === 1 && paymentMethodArray[0] === "CARD") {
        debugBody.customer = {
          customerInfo: {
            customerName: document.getElementById("customerName").value,
            customerEmail: document.getElementById("customerEmail").value,
            shippingAddress: {
              street1: document.getElementById("shippingStreet1").value,
              street2: document.getElementById("shippingStreet2").value,
              city: document.getElementById("shippingCity").value,
              postcode: document.getElementById("shippingPostcode").value,
              country: document.getElementById("shippingCountry").value
            },
            billingAddress: {
              street1: document.getElementById("billingStreet1").value,
              street2: document.getElementById("billingStreet2").value,
              city: document.getElementById("billingCity").value,
              postcode: document.getElementById("billingPostcode").value,
              country: document.getElementById("billingCountry").value
            }
          }
        };
      }


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
      debugHeader.className = "card-header bg-primary text-white fw-bold d-flex justify-content-between align-items-center";

      const debugTitle = document.createElement("span");
      debugTitle.innerHTML = '<i class="fa fa-bug me-2"></i>Debug da Requisição';

      const responseButton = document.createElement("button");
      responseButton.className = "btn btn-light btn-sm fw-bold";
      responseButton.textContent = "Resposta";

      debugHeader.appendChild(debugTitle);
      debugHeader.appendChild(responseButton);
      debugContainer.appendChild(debugHeader);

      // Corpo inicial do debug (requisição)
      const debugContent = document.createElement("div");
      debugContent.className = "card-body";

      // Elementos do debug original
      const headersTitle = document.createElement("h6");
      headersTitle.className = "fw-bold";
      headersTitle.textContent = "Headers da Requisição:";

      const headersPre = document.createElement("pre");
      headersPre.className = "bg-light p-3 rounded";
      headersPre.style.maxHeight = "150px";
      headersPre.style.overflowY = "auto";
      headersPre.style.fontSize = "0.8rem";
      headersPre.textContent = JSON.stringify(debugHeaders, null, 2);

      const bodyTitle = document.createElement("h6");
      bodyTitle.className = "fw-bold mt-3";
      bodyTitle.textContent = "Corpo da Requisição:";

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
            <h6 class="fw-bold">Status Code da Resposta:</h6>
            <pre class="bg-light p-3 rounded">${data?.status || "200"}</pre>

            <h6 class="fw-bold mt-3">Corpo da Resposta:</h6>
            <pre class="bg-light p-3 rounded" style="max-height:400px;overflow-y:auto;font-size:0.8rem;">
              ${JSON.stringify(data, null, 2)}
            </pre>
          `;

          responseButton.textContent = "Requisição";
          debugTitle.innerHTML = '<i class="fa fa-bug me-2 "></i>Resposta da API';
          showingResponse = true;
        } else {
        
          // Voltar à visualização original
          debugContent.innerHTML = "";
          debugContent.appendChild(headersTitle);
          debugContent.appendChild(headersPre);
          debugContent.appendChild(bodyTitle);
          debugContent.appendChild(bodyPre);

          responseButton.textContent = "Resposta";
          debugTitle.innerHTML = '<i class="fa fa-bug me-2"></i>Debug da Requisição';

          showingResponse = false;
        }
      };
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
      debugTitle.innerHTML = '<i class="fa fa-bug me-2"></i>Debug da Requisição - Erro';

      const responseButton = document.createElement("button");
      responseButton.className = "btn btn-light btn-sm fw-bold";
      responseButton.textContent = "Resposta";

      debugHeader.appendChild(debugTitle);
      debugHeader.appendChild(responseButton);
      debugContainer.appendChild(debugHeader);

      // Corpo (request)
      const debugContent = document.createElement("div");
      debugContent.className = "card-body";

      const headersTitle = document.createElement("h6");
      headersTitle.className = "fw-bold";
      headersTitle.textContent = "Headers da Requisição:";

      const headersPre = document.createElement("pre");
      headersPre.className = "bg-light p-3 rounded";
      headersPre.style.maxHeight = "150px";
      headersPre.style.overflowY = "auto";
      headersPre.style.fontSize = "0.8rem";
      headersPre.textContent = JSON.stringify(debugHeaders, null, 2);

      const bodyTitle = document.createElement("h6");
      bodyTitle.className = "fw-bold mt-3";
      bodyTitle.textContent = "Corpo da Requisição:";

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
            <h6 class="fw-bold">Status Code da Resposta:</h6>
            <pre class="bg-light p-3 rounded">${responseData?.status || "200"}</pre>

            <h6 class="fw-bold mt-3">Corpo da Resposta:</h6>
            <pre class="bg-light p-3 rounded" style="max-height:400px;overflow-y:auto;font-size:0.8rem;">
    ${JSON.stringify(responseData, null, 2)}
            </pre>
          `;
          responseButton.textContent = "Requisição";
          debugTitle.innerHTML = '<i class="fa fa-bug me-2 "></i>Resposta da API - Erro';
          showingResponse = true;
        } else {
          debugContent.innerHTML = "";
          debugContent.appendChild(headersTitle);
          debugContent.appendChild(headersPre);
          debugContent.appendChild(bodyTitle);
          debugContent.appendChild(bodyPre);
          responseButton.textContent = "Resposta";
          debugTitle.innerHTML = '<i class="fa fa-bug me-2 "></i>Debug da Requisição - Erro';
          showingResponse = false;
        }
      };
    }

    const currentDefault = localStorage.getItem('default');

    const terminalToggle = document.getElementById('defaultToggle');
    if (terminalToggle) {
      terminalToggle.checked = currentDefault === '1';
    }



  window.addEventListener("message", function (event) {
    try {
      // --- Validação de origem (ativa em produção) ---
      // if (!event.origin.includes("sibs.pt")) return;

      let msg = event.data;
      if (typeof msg === "string") {
        try {
          msg = JSON.parse(msg);
        } catch {
          console.warn("Mensagem recebida não é JSON:", msg);
          return;
        }
      }

      // --- Filtrar apenas mensagens do SPG ---
      if (msg.source === "spg-form") {
        console.log("📩 Evento recebido do SPG:", msg.type, msg.data);

        // --- Guardar no localStorage ---
        // Cria um histórico de eventos SPG
        let history = JSON.parse(localStorage.getItem("spgEvents") || "[]");

        // Guarda o novo evento com timestamp
        history.push({
          type: msg.type,
          data: msg.data,
          timestamp: new Date().toISOString()
        });

        // Atualiza o localStorage
        localStorage.setItem("spgEvents", JSON.stringify(history));

        // Opcional: guardar o estado mais recente separadamente
        localStorage.setItem("spgLastEvent", msg.type);
        localStorage.setItem("spgLastData", JSON.stringify(msg.data));

        // --- Lógica de reação ---
        if (msg.type === "onClickPay") {
          console.log("🟡 Clique no botão Pay:", msg.data);
        }

        if (msg.type === "onPaymentSuccess") {
          console.log("🟢 Pagamento bem-sucedido:", msg.data);
        }

        if (msg.type === "onPaymentError") {
          console.error("🔴 Erro no pagamento:", msg.data);
        }
      }

    } catch (err) {
      console.error("Erro ao processar mensagem SPG:", err);
    }
  }, false);
