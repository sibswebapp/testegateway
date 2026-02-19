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
                paymentMethods= credential_config_variable.paymentMethods;
                gatewayVersion= credential_config_variable.gatewayVersion;

            }else{
                token = credential_default_variable.bearerToken;
                clientId = credential_default_variable.clientId;
                terminalId = credential_default_variable.terminalId;
                entity = credential_default_variable.entity;
                isDummyCustomer = credential_default_variable.isDummyCustomer;
                ServerToServer = credential_default_variable.ServerToServer;
                paymentMethods= credential_default_variable.paymentMethods;
                gatewayVersion= credential_default_variable.gatewayVersion;

            }

            encodedPaymentMethods = encodeURIComponent(paymentMethods);

            const paymentId = getQueryParam("id");
            const token_payment = token;
            const clientId_payment = clientId;

            const transactionID = getQueryParam("id");
            const referenceDiv = document.getElementById("service-reference");
            const debugHeaders = document.getElementById("debug-headers");
            const debugBody = document.getElementById("debug-body");

            if (!transactionID) {
                referenceDiv.innerHTML = '<div class="alert alert-danger">ID da transação não encontrado.</div>';
                debugHeaders.textContent = "";
                debugBody.textContent = "";
                return;
            }

            // Fazer o GET status para saber os campos e o estado do pagamento
            version = gatewayVersion === "1" ? "v1" : "v2";
            const apiUrl = `https://spg.qly.site1.sibs.pt/api/${version}/payments/${paymentId}/status`;

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

                // Extrai e mostra headers no debug
                let headerObj = {};
                for (let pair of response.headers.entries()) {
                    headerObj[pair[0]] = pair[1];
                }
                debugHeaders.textContent = JSON.stringify(headerObj, null, 2);

                if (!response.ok) {
                    throw new Error(`Erro na requisição: ${response.status}`);
                }

                const data = await response.json();

                // Mostra corpo no debug
                debugBody.textContent = JSON.stringify(data, null, 2);

                const statusCfg = {
                    "Success":  { label: "Sucesso",   icon: "fa-circle-check", color: "#10b981", bg: "#ecfdf5" },
                    "Pending":  { label: "Pendente",  icon: "fa-clock",        color: "#f59e0b", bg: "#fffbeb" },
                    "Declined": { label: "Falhou",    icon: "fa-circle-xmark", color: "#ef4444", bg: "#fef2f2" },
                    "CANC":     { label: "Cancelado", icon: "fa-ban",          color: "#6b7280", bg: "#f9fafb" }
                };

                const current = (data.paymentStatus === "Pending" && data.paymentReference.status === "CANC") 
                    ? statusCfg["CANC"] 
                    : (statusCfg[data.paymentStatus] || { label: data.paymentStatus, icon: "fa-question", color: "#374151", bg: "#f3f4f6" });

                referenceDiv.innerHTML = `
                    <div class="card border-0 shadow-lg mx-auto mt-4" style="max-width: 750px; border-radius: 1.25rem; overflow: hidden;">
                        
                        <div class="row g-0">
                            <div class="col-md-3 d-flex flex-column align-items-center justify-content-center p-4" style="background-color: ${current.bg}; border-right: 2px dashed #e5e7eb;">
                                <div class="mb-2" style="color: ${current.color}; font-size: 3rem;">
                                    <i class="fa-solid ${current.icon}"></i>
                                </div>
                                <h6 class="fw-bold mb-0 text-center" style="color: ${current.color}; letter-spacing: 1px; text-transform: uppercase;">
                                    ${current.label}
                                </h6>
                            </div>

                            <div class="col-md-9">
                                <div class="card-body p-4 bg-white">
                                    <div class="row mb-4">
                                        <div class="col-6 text-start">
                                            <p class="text-muted small fw-bold mb-1">ENTIDADE</p>
                                            <span class="h4 fw-bold text-dark">${data.paymentReference.paymentEntity}</span>
                                        </div>
                                        <div class="col-6 text-end">
                                            <p class="text-muted small fw-bold mb-1">MONTANTE</p>
                                            <span class="h4 fw-bold text-primary">${data.amount.value} €</span>
                                        </div>
                                    </div>

                                    <div class="p-4 mb-3 rounded-3 text-center" style="background: #f8fafc; border: 1px solid #f1f5f9; position: relative;">
                                        <p class="text-muted small fw-bold mb-2">REFERÊNCIA BANCÁRIA</p>
                                        <span class="display-6 fw-bold font-monospace" style="letter-spacing: 8px; color: #1e293b;">
                                            ${data.paymentReference.reference.replace(/(.{3})/g, '$1 ')}
                                        </span>
                                    </div>

                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="text-muted small">
                                            <i class="fa-regular fa-calendar-check me-1"></i> 
                                            Limite de pagamento: <strong>${new Date(data.paymentReference.expireDate).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit', year:'numeric'})}</strong>
                                        </span>
                                        
                                        <div class="d-flex gap-2">
                                            ${data.paymentStatus === "Success" ? `
                                                <button type="button" id="refund-btn" class="btn btn-warning btn-sm fw-bold px-3 rounded-pill">
                                                    <i class="fa-solid fa-arrow-rotate-left me-1"></i> Reembolsar
                                                </button>
                                            ` : ""}
                                            
                                            ${data.paymentStatus === "Pending" ? `
                                                <button type="button" id="cancel-ref-btn" class="btn btn-danger btn-sm fw-bold px-3 rounded-pill">
                                                    <i class="fa-solid fa-xmark me-1"></i> Cancelar Referência Bancária
                                                </button>
                                            ` : ""}
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Adicionar event listener para o botão de reembolso
                if (data.paymentStatus === "Success") {
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
                }

                // Adicionar event listener para o botão de cancelar referência
                if (data.paymentStatus === "Pending") {
                document.getElementById("cancel-ref-btn").addEventListener("click", function() {
                    // Guardar a referência a cancelar
                    let cancels = JSON.parse(localStorage.getItem("cancels")) || [];
                    cancels.push({
                    paymentId: paymentId,
                    amount: data.amount.value,
                    redirect: 1
                    });
                    localStorage.setItem("cancels", JSON.stringify(cancels));
                    window.location.href = "Cancellation_gateway/Cancellation_gateway.html"; 
                });
                }

            } catch (error) {
                console.error("Erro ao gerar referência de pagamento:", error);
                referenceDiv.innerHTML = '<div class="alert alert-danger">Erro ao gerar referência de pagamento.</div>';
                debugHeaders.textContent = "";
                debugBody.textContent = "";
            }
        });