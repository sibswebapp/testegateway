window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  const modalDetalhes = document.getElementById('modalDetalhesMandatos');

  modalDetalhes.addEventListener('hidden.bs.modal', function () {

    //Limpar os Inputs
    document.getElementById('DetalheMandatoTransactionId').value = '';
    document.getElementById('DetalheMandatoPhone').value = '351#';

    //Resetar o conteúdo da listagem para o estado inicial (mensagem de vazio)
    const listaResultados = document.getElementById('listaMandatosResultados');
          listaResultados.innerHTML = `
          <div class="p-5 text-center text-muted bg-light bg-opacity-50">
            <i class="fa-solid fa-inbox d-block mb-2 fs-3 opacity-25"></i>
            <span class="small">Introduza os dados e clique em pesquisar</span>
          </div>
          `;
  });


  const modalCancelar = document.getElementById('modalCancelarMandatos');

  modalCancelar.addEventListener('hidden.bs.modal', function () {
    document.getElementById('CancelarMandatoTransactionId').value = '';
    document.getElementById('CancelarMandatoPhone').value = '351#';

    const feedbackArea = document.getElementById('feedbackCancelarMandato');
      if (feedbackArea) {
        feedbackArea.innerHTML = '';
      }
  });

  modalCancelar.addEventListener('shown.bs.modal', function () {
    document.getElementById('CancelarMandatoTransactionId').focus();
  });


  const modalLista = document.getElementById('modalMandatosAtivos');

  modalLista.addEventListener('hidden.bs.modal', function () {
    const listaResultados = document.getElementById('listaTodosMandatosResultados');

    if (listaResultados) {
      listaResultados.innerHTML = `
        <div class="p-5 text-center text-muted bg-light bg-opacity-50">
          <i class="fa-solid fa-clipboard-list d-block mb-2 fs-3 opacity-25"></i>
          <span class="small fw-medium">Nenhum mandato carregado na vista atual</span>
        </div>
      `;
    }

  });

});

const credential_default = JSON.parse(localStorage.getItem('credential_default')) || {};
const credential_config = JSON.parse(localStorage.getItem('credential_config')) || {};
const default_Configs = localStorage.getItem('default'); // Normalmente é string "0" ou "1"~

// PopUP de sucesso chamada
const successModal = document.getElementById("successModal"),
overlay = successModal.querySelector(".overlay"),
closeBtn = successModal.querySelector(".close-btn");

function showSuccessModal(message) {
  sucessMessage.textContent = message;
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


//Listar Mandato
async function ListarMandato() {
    let clientId, bearerToken;
    const container = document.getElementById("listaTodosMandatosResultados");

    // 1. Setup de Credenciais (Reutilizando a tua lógica)
    const finalData = (default_Configs === "0" && credential_config.useDefaultConfig === "true") 
        ? { clientId: credential_default.clientId, token: credential_default.bearerToken }
        : { clientId: credential_config.clientId, token: credential_config.bearerToken };

    clientId = finalData.clientId;
    bearerToken = finalData.token;

    // 2. Feedback de Loading
    container.innerHTML = `
        <div class="p-5 text-center text-success">
            <div class="spinner-border spinner-border-sm me-2 text-success" role="status"></div>
            <span class="small fw-bold">A comunicar com o servidor SIBS...</span>
        </div>`;

    const prefix = window.location.hostname === '127.0.0.1' ? '' : '/SimuladorSIBS';

    try {
        const params = new URLSearchParams({ bearerToken, clientId });
        const response = await fetch(`${prefix}/api/ListarMandato?${params.toString()}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();

        // 3. Verificação de dados (Adaptar conforme a estrutura real do teu JSON)
        // Supondo que a SIBS retorna uma lista em data.mandates
        const mandatos = data.mandates || []; 

        if (mandatos.length === 0) {
            container.innerHTML = `
                <div class="p-5 text-center text-muted bg-light bg-opacity-50">
                    <i class="fa-solid fa-folder-open d-block mb-2 fs-3 opacity-25"></i>
                    <span class="small fw-medium">Não foram encontrados mandatos ativos.</span>
                </div>`;
            return;
        }

        // 4. Construção da Tabela Global com mais espaço e data formatada
        let htmlTable = `
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0" style="font-size: 0.9rem; min-width: 900px;">
                    <thead class="bg-light sticky-top" style="z-index: 1;">
                        <tr style="border-bottom: 2px solid #edf2f7;">
                            <th class="border-0 px-4 py-4 text-muted small fw-bold text-uppercase">Mandato ID</th>
                            <th class="border-0 px-3 py-4 text-muted small fw-bold text-uppercase">Transaction ID</th>
                            <th class="border-0 px-3 py-4 text-muted small fw-bold text-uppercase">Nome Cliente</th>
                            <th class="border-0 px-3 py-4 text-muted small fw-bold text-uppercase">Telefone</th>
                            <th class="border-0 px-3 py-4 text-muted small fw-bold text-uppercase">Estado</th>
                            <th class="border-0 py-4 text-end px-4 text-muted small fw-bold text-uppercase">Data Expiração</th>
                        </tr>
                    </thead>
                    <tbody class="border-top-0">`;

        mandatos.forEach(m => {
            // Lógica para cor do badge
            const status = m.mandateStatus || '---';
            let statusClass = "bg-secondary text-secondary";
            
            if (status === "ACTV" || status === "Success" || status === "Active") {
                statusClass = "bg-success text-success";
            } else if (status === "PEND" || status === "Pending") {
                statusClass = "bg-warning text-warning";
            }

            // Formatação da Data: Retira apenas a parte YYYY-MM-DD
            const dataFull = m.mandateExpirationDate || '';
            const dataFormatada = dataFull.length > 10 ? dataFull.substring(0, 10) : (dataFull || '---');

            htmlTable += `
                <tr style="transition: background 0.2s;">
                    <td class="px-4 py-4 fw-bold text-primary">
                        ${m.mandateId || '---'}
                    </td>
                    <td class="px-3 py-4 text-muted" style="font-size: 0.85rem;">
                        ${m.transactionId || '---'}
                    </td>
                    <td class="px-3 py-4 fw-semibold text-dark">
                        ${m.customerName || '---'}
                    </td>
                    <td class="px-3 py-4 text-muted">
                        ${m.aliasMBWAY || '---'}
                    </td>
                    <td class="px-3 py-4">
                        <span class="badge rounded-pill px-3 py-2 bg-opacity-10 ${statusClass}" style="font-size: 0.75rem; letter-spacing: 0.3px;">
                            ${status}
                        </span>
                    </td>
                    <td class="text-end px-4 py-4 text-muted fw-medium">
                        ${dataFormatada}
                    </td>
                </tr>`;
        });

        htmlTable += `</tbody></table></div>`;

        container.innerHTML = htmlTable;

    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <div class="p-4 text-center text-danger">
                <i class="fa-solid fa-triangle-exclamation fs-3 d-block mb-2"></i>
                <span class="small fw-bold">Erro ao listar mandatos</span>
            </div>`;
    }
}


// Cancelar Mandato
async function CancelarMandato() {
    // 1. Obter valores dos inputs
    const transactionIdValue = document.getElementById("CancelarMandatoTransactionId")?.value?.trim();
    const phoneValue = document.getElementById("CancelarMandatoPhone")?.value?.trim();
    const feedbackArea = document.getElementById("feedbackCancelarMandato");

    // 2. Configurações de Credenciais
    const config = (default_Configs === "0" && credential_config.useDefaultConfig === "true")
        ? credential_default
        : credential_config;

    const { clientId, bearerToken, terminalId } = config;
    const CancelMandatoMerchantID = "123"; // Valor fixo conforme o teu server espera

    // 3. Validação inicial
    if (!transactionIdValue || !phoneValue) {
        showErrorModal("Por favor, preencha todos os campos para cancelar.");
        return;
    }

    // 4. Feedback de carregamento
    feedbackArea.innerHTML = `
        <div class="d-flex align-items-center justify-content-center p-3 text-muted">
            <div class="spinner-border spinner-border-sm me-2" role="status"></div>
            <span class="small fw-bold">A comunicar revogação...</span>
        </div>`;

    const prefix = window.location.hostname === '127.0.0.1' ? '' : '/SimuladorSIBS';

    try {
        // AJUSTE CRÍTICO: Os nomes das chaves aqui têm de ser IGUAIS ao que o teu server faz destructuring no req.query
        const params = new URLSearchParams({
            CancelMandatoTransactionId: transactionIdValue,
            bearerToken: bearerToken,
            clientId: clientId,
            CancelMandatoPhone: decodeURIComponent(phoneValue)
        });

        const response = await fetch(`${prefix}/api/CancelarMandato?${params.toString()}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // AJUSTE CRÍTICO: O body tem de ter estes nomes exatos para o req.body do server
            body: JSON.stringify({
                terminalId: terminalId,
                CancelMandatoMerchantID: CancelMandatoMerchantID
            })
        });

        const data = await response.json();
        const statusMsg = data?.returnStatus?.statusMsg;

        // 5. Apresentação do resultado (Sucesso/Erro)
        if (statusMsg === "Success") {
            feedbackArea.innerHTML = `
                <div class="p-4 border-0 shadow-sm d-flex align-items-center" style="background: #f0fdf4; border-radius: 20px;">
                    <div class="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 45px; height: 45px; flex-shrink: 0;">
                        <i class="fa-solid fa-check fs-5"></i>
                    </div>
                    <div>
                        <h6 class="fw-bold text-success mb-1">Mandato Cancelado!</h6>
                        <p class="small text-success mb-0 opacity-75">A autorização foi revogada com sucesso.</p>
                    </div>
                </div>`;
        } else {
            feedbackArea.innerHTML = `
                <div class="p-4 border-0 shadow-sm d-flex align-items-center" style="background: #fef2f2; border-radius: 20px;">
                    <div class="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 45px; height: 45px; flex-shrink: 0;">
                        <i class="fa-solid fa-xmark fs-5"></i>
                    </div>
                    <div>
                        <h6 class="fw-bold text-danger mb-1">Falha no Cancelamento</h6>
                        <p class="small text-danger mb-0 opacity-75">${data?.returnStatus?.errorDescription || "Verifique os dados e tente novamente."}</p>
                    </div>
                </div>`;
        }

    } catch (err) {
        console.error("Erro na requisição:", err);
        feedbackArea.innerHTML = `<div class="alert alert-danger rounded-4 small">Erro de ligação ao servidor.</div>`;
    }
}


//Detalhe Mandato
async function DetalheMandato() {
  let clientId, bearerToken, terminalId;
  const listaContainer = document.getElementById("listaMandatosResultados");

  // Configuração de Credenciais (Mantido da tua lógica original)
  const finalData = (default_Configs === "0" && credential_config.useDefaultConfig === "true") 
    ? { clientId: credential_default.clientId, token: credential_default.bearerToken }
    : { clientId: credential_config.clientId, token: credential_config.bearerToken };

  clientId = finalData.clientId;
  bearerToken = finalData.token;

  const transactionId = document.getElementById("DetalheMandatoTransactionId")?.value?.trim();
  const phone = document.getElementById("DetalheMandatoPhone")?.value?.trim();

  // Validações
  if (!transactionId || !phone) {
    showErrorModal("Por favor, preencha o TransactionID e o Telefone.");
    return;
  }

  // 1. Iniciar estado de carregamento na listagem
  listaContainer.innerHTML = `
    <div class="p-5 text-center text-primary">
        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
        <span class="small fw-bold">A consultar SIBS...</span>
    </div>`;

  const prefix = window.location.hostname === '127.0.0.1' ? '' : '/SimuladorSIBS';

  try {
    const params = new URLSearchParams({ DetalheMandatoTransactionId: transactionId, bearerToken, clientId, DetalheMandatoPhone: phone });
    const response = await fetch(`${prefix}/api/DetalheMandato?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();

    // Atualizar elementos de debug (se ainda existirem na página)
    if(document.getElementById("bodyCompletoDetalheMandato")) {
        document.getElementById("bodyCompletoDetalheMandato").innerText = JSON.stringify(data, null, 2);
    }

    const statusMsg = data?.returnStatus?.statusMsg || "Error";
    const amount = data?.mandate?.amountAvailable?.value || "0.00";
    const currency = data?.mandate?.amountAvailable?.currency || "EUR";

    // 2. Construir a Tabela de Resultados
    let statusClass = statusMsg === "Success" ? "bg-success text-success" : "bg-danger text-danger";
    
    listaContainer.innerHTML = `
      <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" style="font-size: 0.85rem;">
              <thead class="bg-light">
                  <tr>
                      <th class="border-0 px-4 py-3 text-muted small">DETALHES</th>
                      <th class="border-0 py-3 text-muted small">ESTADO</th>
                      <th class="border-0 py-3 text-end px-4 text-muted small">DISPONÍVEL</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td class="px-4 py-3">
                          <div class="fw-bold text-dark">#${transactionId}</div>
                          <div class="text-muted small">${phone}</div>
                      </td>
                      <td>
                          <span class="badge rounded-pill px-3 py-2 bg-opacity-10 ${statusClass}">
                              ${statusMsg.toUpperCase()}
                          </span>
                      </td>
                      <td class="text-end px-4 fw-bold text-dark">
                          ${parseFloat(amount).toFixed(2)} ${currency}
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>`;

  } catch (err) {
    console.error(err);
    listaContainer.innerHTML = `
      <div class="p-4 text-center text-danger">
          <i class="bi bi-exclamation-triangle fs-3 d-block mb-2"></i>
          <span class="small fw-bold">Erro ao comunicar com o servidor</span>
      </div>`;
  }
}


//Criar Mandato
async function CriarMandato() {

  const CriarMandatoCustomerName = document.getElementById("CriarMandatoCustomerName")?.value?.trim();
  const CriarMandatoPhone = document.getElementById("CriarMandatoPhone")?.value?.trim();

  let clientId;
  let bearerToken;
  let terminalId;
  let typeofPA;

  if (default_Configs === "0" && credential_config.useDefaultConfig === "true") {
    finalData = {
      clientId: credential_default.clientId,
      token: credential_default.bearerToken,
      terminalId: credential_default.terminalId,
    };
  } else {
    finalData = {
      clientId: credential_config.clientId,
      token: credential_config.bearerToken,
      terminalId: credential_config.terminalId,
    };
  }

  clientId = finalData.clientId;
  bearerToken = finalData.token;
  terminalId = finalData.terminalId;
  typeofPA = credential_config.VersionpagamentosAutorizados;

  if(typeofPA === "1"){
    typeofPA = "ONECLICK";
  }else{
    typeofPA = "SUBSCRIPTION";
  }

  if (!CriarMandatoPhone) {
    showErrorModal("O campo 'Telefone' tem que estar preenchido");
    return;
  }

  if (!CriarMandatoCustomerName) {
    showErrorModal("O campo 'Titular da conta' tem que estar preenchido");
    return;
  }

  document.getElementById("CriarMandatoPagamento").innerText = "...";
  document.getElementById("statusCodeCriarMandato").innerText = "CODE: -";
  document.getElementById("bodyCompletoCriarMandato").innerText = "{}";

  const prefix = window.location.hostname === '127.0.0.1' ? '' : '/SimuladorSIBS';

  try {
    const params = new URLSearchParams({bearerToken, clientId, typeofPA});
    const response = await fetch(`${prefix}/api/CriarMandato_cli?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terminalId, CriarMandatoCustomerName, CriarMandatoPhone })
    });

    const data = await response.json();
    document.getElementById("bodyCompletoCriarMandato").innerText = JSON.stringify(data, null, 2);
    document.getElementById("statusCodeCriarMandato").innerText = `CODE: ${data.returnStatus.statusCode}`;

    const status = data?.returnStatus.statusMsg || "-";
    document.getElementById("CriarMandatoPagamento").innerText = status;

    if (status === "Success") {
      document.getElementById("CriarMandatoPagamento").className = "h4 fw-bold text-success mt-1";
      showSuccessModal("Mandato criado com sucesso");

      setTimeout(() => {
          goToStep(2);
      }, 800);

    } else {
      document.getElementById("CriarMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
    }


    const MandateId = document.getElementById("checkoutMandateMandateId");
    if (MandateId && data?.mandate.mandateId) {
      MandateId.value = data.mandate.mandateId;
    }

    const checkoutMandatoCustomerName = document.getElementById("checkoutMandatoCustomerName");
    if (checkoutMandatoCustomerName && CriarMandatoCustomerName) {
      checkoutMandatoCustomerName.value = CriarMandatoCustomerName;
    }

  } catch (err) {
    console.error(err);
    document.getElementById("CriarMandatoPagamento").innerText = "ERRO";
    document.getElementById("CriarMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
  }
}


//Checkout e compra do Mandato
async function CobrancaMandato() {

  let clientId;
  let bearerToken;
  let terminalId;

  if (default_Configs === "0" && credential_config.useDefaultConfig === "true") {
    finalData = {
      clientId: credential_default.clientId,
      token: credential_default.bearerToken,
      terminalId: credential_default.terminalId,
    };
  } else {
    finalData = {
      clientId: credential_config.clientId,
      token: credential_config.bearerToken,
      terminalId: credential_config.terminalId,
    };
  }

  clientId = finalData.clientId;
  bearerToken = finalData.token;
  terminalId = finalData.terminalId;

  const montante = document.getElementById("checkoutMandatoAmount")?.value?.trim();
  const checkoutMandateId = document.getElementById("checkoutMandateMandateId")?.value?.trim();
  const checkoutCustomerName = document.getElementById("checkoutMandatoCustomerName")?.value?.trim();
  const checkoutMerchantID = "123"


  if (!checkoutMandateId) {
    showErrorModal("O campo 'Mandate ID' tem que estar preenchido");
    return;
  }

  if (!checkoutCustomerName) {
    showErrorModal("O campo 'Titular da conta' tem que estar preenchido");
    return;
  }

  if (!montante) {
    showErrorModal("O campo 'Montante' tem que estar preenchido");
    return;
  }

  document.getElementById("CheckoutMandatoPagamento").innerText = "...";
  document.getElementById("statusCodeCheckoutMandato").innerText = "CODE: -";
  document.getElementById("bodyCompletoCheckoutMandato").innerText = "{}";

  const prefix = window.location.hostname === '127.0.0.1' ? '' : '/SimuladorSIBS';


  try {

    const params = new URLSearchParams({
      clientId, bearerToken
    });


    const response = await fetch(`${prefix}/api/CheckoutMandato?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terminalId , montante , checkoutMandateId, checkoutMerchantID, checkoutCustomerName  })
    });

    const data = await response.json();

    // ===================== LOCALSTORAGE =====================
    localStorage.removeItem("CheckoutMandatoConfigurado");

    const CheckoutMandatoArray = [
      {
        checkoutmandateId: data?.transactionID,
        MandateTransactionSignature: data?.transactionSignature
      }
    ];

    localStorage.setItem("CheckoutMandatoConfigurado", JSON.stringify(CheckoutMandatoArray));

    const raw = localStorage.getItem("CheckoutMandatoConfigurado");
    const arrayMandato = raw ? JSON.parse(raw) : [];
    const mandateTransactionSignature = Array.isArray(arrayMandato) ? arrayMandato?.[0]?.MandateTransactionSignature || "" : "";

    try {

        const params = new URLSearchParams({
          bearerToken, mandateTransactionSignature
        });

        const transactionID = arrayMandato?.[0]?.checkoutmandateId || "";

        const response = await fetch(`${prefix}/api/CompraMandato?${params.toString()}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId,
            transactionID
          })
        });

        const data = await response.json();

        document.getElementById("bodyCompletoCheckoutMandato").innerText = JSON.stringify(data, null, 2);
        document.getElementById("statusCodeCheckoutMandato").innerText = `CODE: ${data.returnStatus.statusCode}`;

        const status = data?.returnStatus?.statusMsg || "-";
        document.getElementById("CheckoutMandatoPagamento").innerText = status;
        if (["Success"].includes(status)) {
          document.getElementById("CheckoutMandatoPagamento").className = "h4 fw-bold text-success mt-1";
          showSuccessModal("Compra com Mandato criado com sucesso");
        } else {
          document.getElementById("CheckoutMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
        }


      } catch (err) {
        console.error(err);
        document.getElementById("CheckoutMandatoPagamento").innerText = "ERRO";
        document.getElementById("CheckoutMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
      }

  } catch (err) {
    console.error(err);
    document.getElementById("CheckoutMandatoPagamento").innerText = "ERRO";
    document.getElementById("CheckoutMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
  }
}

function goToStep(stepNumber) {
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });

    document.getElementById('step-content-' + stepNumber).classList.add('active');

    document.querySelectorAll('.step-item').forEach((item, index) => {
        const idx = index + 1;
        if (idx === stepNumber) {
            item.classList.add('step-active');
            item.classList.remove('step-inactive');
            item.querySelector('.rounded-circle').classList.replace('bg-secondary', 'bg-primary');
        } else if (idx < stepNumber) {
            item.classList.remove('step-active');
            item.classList.add('step-inactive');
        } else {
            // Passos futuros
            item.classList.remove('step-active');
            item.classList.add('step-inactive');
            item.querySelector('.rounded-circle').classList.replace('bg-primary', 'bg-secondary');
        }
    });
}

function avancarParaCobranca() {
    goToStep(2);
}