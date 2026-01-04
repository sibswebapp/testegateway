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

               referenceDiv.innerHTML = `
                <div class="card shadow-sm p-3 mt-3 bg-light">
                        <ul class="list-group list-group-flush text-start text-center">
                            <li class="list-group-item"><strong>Entidade:</strong> ${data.paymentReference.paymentEntity}</li>
                            <li class="list-group-item"><strong>Referência:</strong> ${data.paymentReference.reference}</li>
                            <li class="list-group-item"><strong>Montante:</strong> ${data.amount.value} €</li>
                            <li class="list-group-item"><strong>Data de Validade:</strong> ${new Date(data.paymentReference.expireDate).toLocaleDateString()}</li>
                            ${(() => {
                                if (data.paymentStatus === "Pending") {
                                    return `<li class="list-group-item text-warning"><strong>Estado do Pagamento:</strong> Pendente</li>`;
                                } else if (data.paymentReference.status == "CANC") {
                                    return `<li class="list-group-item text-danger"><strong>Estado do Pagamento:</strong> Cancelado</li>`;
                                } else if (data.paymentStatus === "Declined") {
                                    return `<li class="list-group-item text-danger"><strong>Estado do Pagamento:</strong> Sem sucesso</li>`;
                                } else if (data.paymentStatus === "Success") {
                                    return `<li class="list-group-item text-success"><strong>Estado do Pagamento:</strong> Sucesso</li>`;
                                } else {
                                    return `<li class="list-group-item"><strong>Estado do Pagamento:</strong> ${data.paymentStatus}</li>`;
                                }
                            })()}
                        </ul>

                        <!-- Botões dinâmicos -->
                        <div class="text-center mt-3">
                            ${data.paymentStatus === "Success" ? `
                            <button type="button" id="refund-btn" class="btn btn-warning">Reembolso da Compra</button>
                            ` : ""}
                            ${data.paymentStatus === "Pending" ? `
                            <button type="button" id="cancel-ref-btn" class="btn btn-danger">Cancelar Referência</button>
                            ` : ""}
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