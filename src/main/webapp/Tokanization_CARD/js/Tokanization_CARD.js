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

// variáveis globais
const useDefault = JSON.parse(localStorage.getItem("default"));
const credential_default_variable = JSON.parse(localStorage.getItem('credential_default'));
const credential_config_variable = JSON.parse(localStorage.getItem('credential_config'));

let token;
let clientId;
let terminalId;
let entity;
let isDummyCustomer;
let ServerToServer;
let paymentMethods;
let encodedPaymentMethods;
let gatewayVersion;

if (useDefault == "0") {
    token = credential_config_variable.bearerToken;
    clientId = credential_config_variable.clientId;
    terminalId = credential_config_variable.terminalId;
    entity = credential_config_variable.entity;
    isDummyCustomer = credential_config_variable.isDummyCustomer;
    ServerToServer = credential_config_variable.ServerToServer;
    paymentMethods = credential_config_variable.paymentMethods;
    gatewayVersion = credential_config_variable.gatewayVersion;
} else {
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

document.addEventListener("DOMContentLoaded", async function () {

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const paymentId = getQueryParam("id");
    
    const version = gatewayVersion === "1" ? "v1" : "v2";
    const apiUrl = `https://spg.qly.site1.sibs.pt/api/${version}/payments/${paymentId}/status`;

    const debugHeaders = document.getElementById("debug-headers");
    const debugBody = document.getElementById("debug-body");
    const debugSection = document.getElementById("container_debug");

    
    let token_payment;
    let clientId_payment;

    if (useDefault == "0") {
        token_payment = credential_config_variable.bearerToken;
        clientId_payment = credential_config_variable.clientId;
    } else {
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

        if (data.token?.value) {
            const transactionInput = document.getElementById("transactionID");
            if (transactionInput) {
                transactionInput.value = data.token.value;
            }
        }

        // Mostrar o corpo da resposta no debug
        document.getElementById("debug-body").textContent = JSON.stringify(data, null, 2);

        const formContainer = document.getElementById("form-container");

        if (data.paymentStatus === "Declined") {

            showErrorModal("❌ Erro técnico ao efetuar a Tokanização.");

            // Debug
            if (debugHeaders && debugBody && debugSection) {
                let headerObj = {};

                for (let pair of response.headers.entries()) {
                    headerObj[pair[0]] = pair[1];
                }

                debugHeaders.textContent = JSON.stringify(headerObj, null, 2);
                debugBody.textContent = JSON.stringify(data, null, 2);
                debugSection.classList.remove("d-none");
            }

            if (formContainer) formContainer.style.display = "none";
            
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
                                <p class="small fw-bold mb-2 text-uppercase" style="color: #991b1b; letter-spacing: 0.5px;">
                                    <i class="fa-solid fa-triangle-exclamation me-1"></i> Motivo da Recusa
                                </p>
                                <div class="small d-flex flex-column gap-1" style="color: #b91c1c;">
                                    <span><strong>Código: </strong>${data.transactionStatusCode || "N/D"}</span>
                                    <span><strong>Descrição:</strong> ${data.transactionStatusDescription || "Erro de comunicação com o gateway."}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } 
        // Cenário 2: Pagamento Pendente (Oculta o form, avisa o utilizador e faz refresh automático após 5 segundos)
        else if (data.paymentStatus === "Pending") {
            if (formContainer) formContainer.style.display = "none";

            document.getElementById("payment-status").innerHTML = `
                <div class="card border-0 shadow-lg mx-auto mt-3" style="max-width: 750px; border-radius: 20px; overflow: hidden;">
                    <div class="row g-0">
                        <div class="col-md-4 d-flex align-items-center justify-content-center p-5" style="background: #fffbeb;">
                            <div class="text-center">
                                <div class="mb-3" style="color: #f59e0b; font-size: 4rem;">
                                    <i class="fa-solid fa-clock"></i>
                                </div>
                                <span class="badge rounded-pill px-3 py-2" style="background: rgba(245, 158, 11, 0.2); color: #b45309; font-size: 0.75rem; letter-spacing: 1px;">PENDENTE</span>
                            </div>
                        </div>
                        <div class="col-md-8 p-5">
                            <h3 class="fw-bold text-dark mb-2">Pagamento Pendente</h3>
                            <p class="text-muted mb-4">A transação encontra-se a aguardar confirmação.</p>

                            <div class="alert alert-warning border-0 p-3 mb-4" style="background: #fffbeb; border-left: 4px solid #f59e0b !important; border-radius: 8px;">
                                <p class="small fw-bold mb-1" style="color: #b45309;">ESTADO:</p>
                                <span class="small" style="color: #92400e;">Por favor assim que efetuar a Autorização, refresh na página...</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

        }
        // Cenário 3: Pagamento Bem Sucedido (Success / Sucess) -> Mantém o formulário visível para a captura
        else if (data.paymentStatus === "Success" || data.paymentStatus === "Sucess") {
            if (formContainer) formContainer.style.display = "block";
            document.getElementById("payment-status").innerHTML = ""; 
        }
        else {
            if (formContainer) formContainer.style.display = "block";
            document.getElementById("payment-status").innerHTML = `
                <div class="alert alert-warning">Status do pagamento: ${data.paymentStatus}</div>
            `;
        }
        
    } catch (error) {
        console.error("Erro ao buscar status do pagamento:", error);
        document.getElementById("payment-status").innerHTML =
        '<div class="alert alert-danger">Erro ao buscar status do pagamento.</div>';

        document.getElementById("debug-headers").textContent = "";
        document.getElementById("debug-body").textContent = error.message;
    }

});

async function TokanizationCard() {

    const transactionInput = document.getElementById("transactionID");
    const amountInput = document.getElementById("AmountTokanization");

    const paymentId = transactionInput ? transactionInput.value.trim() : "";
    const AmountTokanization = amountInput ? amountInput.value.trim() : "";

    // Validações
    if (!paymentId) {
        showErrorModal("Por favor, indica qual o ID do Token.");
        return;
    }

    if (!AmountTokanization || isNaN(AmountTokanization) || Number(AmountTokanization) <= 0) {
        showErrorModal("Por favor, indica um valor válido para a Tokanização.");
        return;
    }

    const apiUrlCheckout = `https://spg.qly.site1.sibs.pt/api/v2/payments`;

    const headersCheckout = {
        Authorization: `Bearer ${token}`,
        "X-IBM-Client-Id": clientId,
        "Content-Type": "application/json",
        Accept: "application/json",
    };

    const bodyCheckout = {
        merchant: {
            terminalId: Number(terminalId),
            channel: "web",
            merchantTransactionId: "teste123"
        },
        transaction: {
            transactionTimestamp: new Date().toISOString(),
            description: "My transactions own description",
            moto: false,
            paymentType: "AUTH",
            paymentMethod: ["CARD"],
            amount: {
                value: Number(AmountTokanization),
                currency: "EUR"
            }
        },
        tokenisation: {
            paymentTokens: [
                {
                    tokenType: "Card",
                    value: paymentId
                }
            ]
        }
    };

    const debugHeaders = document.getElementById("debug-headers");
    const debugBody = document.getElementById("debug-body");
    const debugSection = document.getElementById("container_debug");

    try {

        const response = await fetch(apiUrlCheckout, {
            method: "POST",
            headers: headersCheckout,
            body: JSON.stringify(bodyCheckout)
        });

        const data = await response.json();

        // Debug
        if (debugHeaders && debugBody && debugSection) {
            let headerObj = {};

            for (let pair of response.headers.entries()) {
                headerObj[pair[0]] = pair[1];
            }

            debugHeaders.textContent = JSON.stringify(headerObj, null, 2);
            debugBody.textContent = JSON.stringify(data, null, 2);
            debugSection.classList.remove("d-none");
        }

        if (response.ok) {

            const transactionId = data.transactionID;
            const formContext = data.formContext;

            if (!transactionId || !formContext) {
                showErrorModal("Não foi possível obter o TransactionID ou o FormContext da resposta da API.");
                return;
            }

            // Determinar URL de retorno
            const isProd = window.location.hostname === 'sibsdigitalcommerce.com';

            let baseUrl = isProd
                ? window.location.origin + '/SimuladorSIBS/'
                : window.location.origin + '/';

            const redirectUrl = `${baseUrl}card_payment/card_return.html`;

            const script = document.createElement("script");
            script.src = `https://spg.qly.site1.sibs.pt/assets/js/widget.js?id=${encodeURIComponent(transactionId)}`;

            // Container
            const container = document.getElementById("sibsFormContainer");

            if (!container) {
                showErrorModal("Não foi possível encontrar o container do formulário SIBS.");
                return;
            }

            // Limpar formulário anterior
            container.innerHTML = "";

            // Adicionar script
            container.appendChild(script);

            // Criar formulário
            const form = document.createElement("form");
            form.className = "paymentSPG";
            form.setAttribute("spg-context", formContext);

            const formConfig = {
                paymentMethodList: [],
                amount: {
                    value: 0,
                    currency: "EUR"
                },
                language: "pt",
                redirectUrl: redirectUrl
            };

            form.setAttribute("spg-config", JSON.stringify(formConfig));

            const formstyle = {
                layout: "spg_form_tabs",
                theme: "default",
                color: {
                    primary: "",
                    border: "",
                    surface: "",
                    body: {
                        text: ""
                    }
                },
                font: ""
            };

            form.setAttribute("spg-style", JSON.stringify(formstyle));

            container.appendChild(form);

        } else {

            showErrorModal(`❌ Erro ao efetuar a Tokanização: ${data.transactionStatusDescription || response.status}`);

        }

    } catch (error) {

        if (debugSection && debugBody) {
            debugSection.classList.remove("d-none");
            debugBody.textContent = JSON.stringify({
                error: error.message
            }, null, 2);
        }

        showErrorModal("❌ Erro técnico ao efetuar a Tokanização.");
    }
}

