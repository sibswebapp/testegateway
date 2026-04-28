    //credenciais default
    const credential_default = {
      terminalId: "96167",
      entity: "53882",
      clientId: "dd4348ea-e240-4356-bf06-6a4f294c1077",
      bearerToken: "0276b80f950fb446c6addaccd121abfbbb.eyJlIjoiMjA5MjY0NTgyMjIwMCIsInJvbGVzIjoiU1BHX01BTkFHRVIiLCJ0b2tlbkFwcERhdGEiOiJ7XCJtY1wiOlwiNTA2OTMxXCIsXCJ0Y1wiOlwiOTYxNjdcIn0iLCJpIjoiMTc3NzAyNjYyMjIwMCIsImlzIjoiaHR0cHM6Ly9xbHkuc2l0ZTEuc3NvLnN5cy5zaWJzLnB0L2F1dGgvcmVhbG1zL1FMWS5NRVJDSC5QT1JUMSIsInR5cCI6IkJlYXJlciIsImlkIjoiRGEwR1puNE04UTAwYmI0MjkyMjUzNzQ1NDM4OTkwMTY4ZjZjOTQwOWUxIn0=.9305920d1f909efaf8ae55f006c249368810c0b52da90826a520b8f0ebeba24f2c3ac903516b56621a5c17cf0a72b962f8f3a72700520ac774b132795268a313",
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
      VersionMITS: "0",
      typeOfPayment: "1",
      VersionpagamentosAutorizados: "0",
      pagamentosAutorizados: "0"
    };

    localStorage.setItem('credential_default', JSON.stringify(credential_default));
    let PA_trigger = 1;

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
        typeOfPayment = credential_config_variable.typeOfPayment
        LayoutVersion = credential_config_variable.LayoutVersion
        pagamentosAutorizados = credential_config_variable.pagamentosAutorizados

      }else{
        paymentMethodsParam = credential_default_variable.paymentMethods
        AllMethodsPay = credential_default_variable.AllMethodsPay
        gatewayVersion = credential_default_variable.gatewayVersion
        typeOfPayment = credential_default_variable.typeOfPayment
        LayoutVersion = credential_default_variable.LayoutVersion
        pagamentosAutorizados = credential_default_variable.pagamentosAutorizados

      }

      if (AllMethodsPay == "1") {
        document.getElementById("payment-method_Div").style.display = "none";
      } else {
        document.getElementById("payment-method_Div").style.display = "block";
      }

      // isto apenas vai ser usado quando os pagamentos autorizados tiver desenvolvidos paymentMethodsParam = JSON.parse(paymentMethodsParam);
      if (paymentMethodsParam) {
        if (typeof paymentMethodsParam === "string") {
          try {
            paymentMethodsParam = JSON.parse(paymentMethodsParam);
          } catch {
            paymentMethodsParam = paymentMethodsParam.split(",");
          }
        }
      }

      if (pagamentosAutorizados == 1) {
          if (!paymentMethodsParam.includes("4")) {
              paymentMethodsParam.push("4");
          }
      }

      const select = document.getElementById("payment-method");
      select.innerHTML = "";

      const methodMap = {
          "1": { label: "MB WAY", value: "MBWAY" },
          "2": { label: "Multibanco", value: "REFERENCE" },
          "3": { label: "Cartão", value: "CARD" }
      };

      if (pagamentosAutorizados == 1) {
        methodMap["4"] = { label: "Criação Mandato", value: "PA" };
      }

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

      if (PA_trigger) return; 
      let phoneNumberPA = document.getElementById("phoneNumberPA").value;
      PA_trigger = 1;

      const paymentform = document.getElementById('payment-form');
      if (paymentform) {
          paymentform.classList.remove('d-none');  
          paymentform.style.display = 'block';  
      }

      let token;
      let clientId;
      let terminalId;
      let entity;
      let referenceExpiry;
      let referenceExpiryUnit;
      let gatewayVersion;
      let typeOfPayment;
      let LayoutVersion;
      let apiUrl;
      let MITs;
      let pagamentosAutorizados;
      let VersionpagamentosAutorizados;


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
        typeOfPayment = credential_config_variable.typeOfPayment;
        LayoutVersion = credential_config_variable.LayoutVersion;
        MITs = credential_config_variable.MITs;
        pagamentosAutorizados = credential_config_variable.pagamentosAutorizados;
        VersionpagamentosAutorizados = credential_config_variable.VersionpagamentosAutorizados;

      }else{
        referenceExpiry = credential_default_variable.referenceExpiry;
        referenceExpiryUnit = credential_default_variable.referenceExpiryUnit;
        gatewayVersion = credential_default_variable.gatewayVersion;
        typeOfPayment = credential_default_variable.typeOfPayment;
        LayoutVersion = credential_default_variable.LayoutVersion
        MITs = credential_default_variable.MITs;
        pagamentosAutorizados = credential_default_variable.pagamentosAutorizados;
        VersionpagamentosAutorizados = credential_default_variable.VersionpagamentosAutorizados;

      }

      const amountValue = parseFloat(document.getElementById("amount").value);
      const selectedMethod = document.getElementById("payment-method").value;

      const placeholder = document.getElementById('loader-placeholder');
      if (placeholder) {
          placeholder.style.display = 'none';
      }

      const formContainer = document.getElementById('payment-form');
      if (formContainer) {
          formContainer.classList.remove('d-none');
      }

      //caso o AllMethodsPay tiver a 1 então o array do payment Method fica vazio
      const paymentMethodArray = (AllMethodsPay == "1") ? [] : [selectedMethod];

      const version = gatewayVersion === "1" ? "v1" : "v2";
      const versionTypePayment = typeOfPayment === "1" ? "PURS" : "AUTH";

      if(selectedMethod != "PA"){
        apiUrl = `https://spg.qly.site1.sibs.pt/api/${version}/payments`;
      }else{
        apiUrl = `https://api.qly.sibspayments.com/sibs/spg/v2/mbway-mandates/creation`;
      }


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
      let requestData


      if (selectedMethod == "PA") {

        if (VersionpagamentosAutorizados === "1") {
            VersionpagamentosAutorizados = "ONECLICK";
        } else if (VersionpagamentosAutorizados === "2") {
            VersionpagamentosAutorizados = "SUBSCRIPTION";
        }

        let rawNumber = document.getElementById("phoneNumberPA").value;
        let phoneNumberPA = `351#${rawNumber}`;

        requestData = {
          merchant:{
            terminalId: terminalId,
            channel: "web",
            merchantTransactionId: "mandatosExemplo",
            transactionDescription: "mandatosExemplo"
          },
          mandate: {
            mandateType: VersionpagamentosAutorizados,
            aliasMBWAY: phoneNumberPA,
            customerName: "OnboardingTestes"
          }
        }
      }
      else if (selectedMethod == "REFERENCE") {
        requestData = {
          merchant: {
            terminalId: terminalId,
            channel: "web",
            merchantTransactionId: "OrderID"
          },
          transaction: {
            transactionTimestamp: new Date().toISOString(),
            description: "Transaction short description",
            moto: false,
            paymentType: versionTypePayment,
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

      }else{

        requestData = {
          merchant: {
            terminalId: terminalId,
            channel: "web",
            merchantTransactionId: "OrderID"
          },
          transaction: {
            transactionTimestamp: new Date().toISOString(),
            description: "Transaction short description",
            moto: false,
            paymentType: versionTypePayment,
            amount: {
              value: amountValue,
              currency: "EUR"
            },
            paymentMethod: paymentMethodArray
          }
        };

      }

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
              street1: document.getElementById("billingStreet1").value,
              street2: document.getElementById("billingStreet2").value,
              city: document.getElementById("billingCity").value,
              postcode: document.getElementById("billingPostcode").value,
              country: document.getElementById("billingCountry").value
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
                paymentType: versionTypePayment,
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
                    street1: document.getElementById("billingStreet1").value,
                    street2: document.getElementById("billingStreet2").value,
                    city: document.getElementById("billingCity").value,
                    postcode: document.getElementById("billingPostcode").value,
                    country: document.getElementById("billingCountry").value
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
      const typeOfPayment = credential_config_variable?.typeOfPayment ?? credential_default_variable?.typeOfPayment;

      const isProd = window.location.hostname === 'sibsdigitalcommerce.com'; 

      let baseUrl = isProd 
      ? window.location.origin + '/SimuladorSIBS/' 
      : window.location.origin + '/';


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

        if(LayoutVersion == "1") LayoutVersion = "spg_form_tabs"
        if(LayoutVersion == "2") LayoutVersion = "spg_form"

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


        formContainer.appendChild(form);

        const script = document.createElement("script");
        script.src = `https://spg.qly.site1.sibs.pt/assets/js/widget.js?id=${transactionID}`;
        document.body.appendChild(script);
        

      } else {

        const wrapper = document.createElement("div");
        wrapper.className = "d-flex flex-column align-items-center justify-content-center p-4 border rounded bg-light";
        wrapper.id = "divserverToserver";

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

            const isProd = window.location.hostname === 'sibsdigitalcommerce.com'; 

            let baseUrl_MBWAY = isProd 
            ? window.location.origin + '/SimuladorSIBS/' 
            : window.location.origin + '/';
            
            const redirectWithPhone = `${baseUrl_MBWAY}MBWAY_payment/MBWAY_return.html?id=${transactionID}`;

            window.location.href = redirectWithPhone;
          };

        wrapper.appendChild(phoneGroup);
        wrapper.appendChild(payButton);

        }
        else if (paymentMethodArray.length === 1 && paymentMethodArray[0] === "REFERENCE") {
            const referenceText = document.createElement("p");
            referenceText.className = "fw-semibold text-center mb-3";
            referenceText.id = "divserverToserver";
            referenceText.textContent = "Clique no botão abaixo para gerar uma referência de pagamento:";

            const referenceButton = document.createElement("button");
            referenceButton.className = "btn btn-primary";
            referenceButton.textContent = "Gerar Referência de Pagamento";

            const isProd = window.location.hostname === 'sibsdigitalcommerce.com'; 

            let baseUrl = isProd 
            ? window.location.origin + '/SimuladorSIBS/' 
            : window.location.origin + '/';

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

      verificarMensagemMBWAY(paymentMethodArray);

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
      const versionTypePayment = typeOfPayment === "1" ? "PURS" : "AUTH";

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
          paymentType: versionTypePayment,
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
              street1: document.getElementById("billingStreet1").value,
              street2: document.getElementById("billingStreet2").value,
              city: document.getElementById("billingCity").value,
              postcode: document.getElementById("billingPostcode").value,
              country: document.getElementById("billingCountry").value
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

      renderApiInspector(debugHeaders, debugBody, data);
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

    const currentDefault = localStorage.getItem('default');

    const terminalToggle = document.getElementById('defaultToggle');
    if (terminalToggle) {
      terminalToggle.checked = currentDefault === '1';
    }


    function verificarMensagemMBWAY(paymentMethodArray) {
        const mensagem = document.getElementById('MBWAY_mensagem');
        
        if (paymentMethodArray && paymentMethodArray[0] === "MBWAY") {
            mensagem.style.display = 'block'; // Mostra
        } else {
            mensagem.style.display = 'none';  // Esconde
        }
    }

// Exemplo de uso dentro do teu código existente:
// verificarMensagemMBWAY(paymentMethodArray);

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
  
  function toggleMandateUI() {

    const method = document.getElementById("payment-method").value;
    const btnDiv = document.getElementById("div_botaoPagamento");
    const mandateDiv = document.getElementById("mandate-container");
    const serverDiv = document.getElementById("divserverToserver");
    const placeholder = document.getElementById('loader-placeholder');
    const paymentform = document.getElementById('payment-form');

    if(method === "PA"){

      btnDiv.classList.add("d-none");

      mandateDiv.classList.remove("d-none");
      mandateDiv.style.display = "block";   // 👈 garante que aparece

      if(serverDiv){
        serverDiv.classList.add("d-none");
      }

      if (placeholder) {
          placeholder.style.display = 'none';
      }

      if (paymentform) {
          paymentform.style.display = 'none';
      }
      
      PA_trigger = 1

    } else {

      btnDiv.classList.remove("d-none");

      mandateDiv.classList.add("d-none");
      mandateDiv.style.display = "none";

      if(serverDiv){
        serverDiv.classList.remove("d-none");
      }

      if(paymentform){
        paymentform.classList.remove("d-none");
      }

      PA_trigger = 0
    }

  }

  function RoutoTomakePayment() {
    PA_trigger = 0
    makePayment();
  }

  