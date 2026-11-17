window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  const transactionId = params.get("id");

  // Preencher o campo TransactionIDCIT
  if (transactionId) {
      document.getElementById("TransactionIDCIT").value = transactionId;
  }


  const modalMITEstado = document.getElementById('modalMITEstado');

  modalMITEstado.addEventListener('hidden.bs.modal', function () {

    //Limpar os Inputs
    document.getElementById('TransactionIdCITorMIT').value = '';

    //Resetar o conteúdo da listagem para o estado inicial (mensagem de vazio)
    const listaResultados = document.getElementById('StatusResultados');
          listaResultados.innerHTML = `
          <div class="p-5 text-center text-muted bg-light bg-opacity-50">
            <i class="fa-solid fa-inbox d-block mb-2 fs-3 opacity-25"></i>
            <span class="small">Nenhum estado da MIT/CIT carregada na vista atual</span>
          </div>
          `;
  });

  const modalRefundTransaction = document.getElementById('modalRefundTransaction');

  modalRefundTransaction.addEventListener('hidden.bs.modal', function () {
    document.getElementById('TransactionIDRefund').value = '';
    document.getElementById('ValorRefund').value = '';

    const feedbackArea = document.getElementById('feedbackRefundMIT');
      if (feedbackArea) {
        feedbackArea.innerHTML = '';
      }
  });

  modalRefundTransaction.addEventListener('shown.bs.modal', function () {
    document.getElementById('TransactionIDRefund').focus();
  });

});

const credential_default = JSON.parse(localStorage.getItem('credential_default')) || {};
const credential_config = JSON.parse(localStorage.getItem('credential_config')) || {};
const default_Configs = localStorage.getItem('default');

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

//Fazer MIT
async function fazerMIT() {

  const MITTransactionId = document.getElementById("TransactionIDCIT")?.value?.trim();
  const montante = document.getElementById("ValorCIT")?.value?.trim();

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
  mitType = credential_config.VersionMITS;

  if(mitType == "1"){
    mitType = "UCOF";
  }else{
    mitType = "RCRR";
  }

  if (!MITTransactionId) {
    showErrorModal("TransactionID tem que estar preenchido");
    return;
  }

  if (!montante) {
    showErrorModal("Montante tem que estar preenchido");
    return;
  }

  document.getElementById("MITPagamento").innerText = "...";
  document.getElementById("statusCodeMIT").innerText = "CODE: -";
  document.getElementById("bodyCompletoMIT").innerText = "{}";

  const prefix = window.location.hostname === '127.0.0.1' ? '' : '/SimuladorSIBS';

  try {
    const params = new URLSearchParams({ mitType, MITTransactionId});
    const response = await fetch(`${prefix}/api/mit?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ montante, clientId, terminalId, bearerToken })
    });

    const data = await response.json();
    document.getElementById("bodyCompletoMIT").innerText = JSON.stringify(data, null, 2);
    document.getElementById("statusCodeMIT").innerText = `CODE: ${data.returnStatus.statusCode}`;

    const status = data?.status || data?.paymentStatus || data?.transactionStatus || data?.returnStatus.statusDescription || "-";
    document.getElementById("MITPagamento").innerText = status;

    if (status === "Success") {
      document.getElementById("MITPagamento").className = "h4 fw-bold text-success mt-1";
      showSuccessModal("MIT feita com sucesso");

      if(mitType == "1"){
        setTimeout(() => {
            goToStep(2);
        }, 800);
      }

    } else {
      document.getElementById("MITPagamento").className = "h4 fw-bold text-danger mt-1";
    }

    const MITId = document.getElementById("TransactionIDMIT");
    if (MITId && data?.transactionID) {
      MITId.value = data.transactionID;
    }

  } catch (err) {
    console.error(err);
    document.getElementById("MITPagamento").innerText = "ERRO";
    document.getElementById("MITPagamento").className = "h4 fw-bold text-danger mt-1";
  }
}


//Fazer Captura
async function fazerCaptura() {
  const captureTransactionId = document.getElementById("TransactionIDMIT")?.value?.trim();
  const montante = document.getElementById("ValorMIT")?.value?.trim();

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
  mitType = credential_config.VersionMITS;

  if(mitType == "1"){
    mitType = "UCOF";
  }else{
    mitType = "RCRR";
  }

  if (!captureTransactionId) {
    showErrorModal("TransactionID tem que estar preenchido");
    return;
  }

  if (!montante) {
    showErrorModal("Montante tem que estar preenchido");
    return;
  }

  document.getElementById("capturePagamento").innerText = "...";
  document.getElementById("statusCodecapture").innerText = "CODE: -";
  document.getElementById("bodyCompletocapture").innerText = "{}";

  const prefix = window.location.hostname === '127.0.0.1' ? '' : '/SimuladorSIBS';


  try {
    const params = new URLSearchParams({captureTransactionId});
    const response = await fetch(`${prefix}/api/capture?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ montante, clientId, terminalId, bearerToken })
    });

    const data = await response.json();
    document.getElementById("bodyCompletocapture").innerText = JSON.stringify(data, null, 2);
    document.getElementById("statusCodecapture").innerText = `CODE: ${data.returnStatus.statusCode}`;

    const status = data?.status || data?.paymentStatus || data?.transactionStatus || data?.returnStatus.statusDescription || "-";
    document.getElementById("capturePagamento").innerText = status;

    if (status === "Success") {
      document.getElementById("capturePagamento").className = "h4 fw-bold text-success mt-1";
    } else {
      document.getElementById("capturePagamento").className = "h4 fw-bold text-danger mt-1";
    }

  } catch (err) {
    console.error(err);
    document.getElementById("capturePagamento").innerText = "ERRO";
    document.getElementById("capturePagamento").className = "h4 fw-bold text-danger mt-1";
  }
}


/// GET STATUS
async function getStatusMIT() {

  let clientId;
  let bearerToken;
  let terminalId;
  const listaContainer = document.getElementById("StatusResultados");

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

  // 1ª Declaração (Input local)
  const transactionId = document.getElementById("TransactionIdCITorMIT")?.value?.trim();

  if (!transactionId) {
    showErrorModal("TransactionID tem que estar preenchido");
    return;
  }

  listaContainer.innerHTML = `
    <div class="p-5 text-center text-primary">
        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
        <span class="small fw-bold">A consultar SIBS...</span>
    </div>`;

  const prefix = window.location.hostname === '127.0.0.1' ? '' : '/SimuladorSIBS';

  try {
    const params = new URLSearchParams({
      terminalId,
      clientId,
      token: bearerToken,
      transactionId
    });

    const response = await fetch(`${prefix}/api/status?${params.toString()}`, {
      method: "GET"
    });

    const data = await response.json();

    if (document.getElementById("bodyCompletoStatus")) {
        document.getElementById("bodyCompletoStatus").innerText = JSON.stringify(data, null, 2);
    }
    if (document.getElementById("statusCode")) {
        document.getElementById("statusCode").innerText = `CODE: ${response.status}`;
    }

    let status = data.paymentReference?.status || data?.paymentStatus || data?.transactionStatus || "-";
    if (status == "CANC") {
      status = "Cancelado";
    }

    if (document.getElementById("bodyCompletoDetalheMandato")) {
        document.getElementById("bodyCompletoDetalheMandato").innerText = JSON.stringify(data, null, 2);
    }

    // CORREÇÃO: Mudado o nome para apiTransactionId para não colidir com a de cima
    const apiTransactionId = data.transactionID || transactionId || "-";
    const maskedPAN = data.token?.maskedPAN || "Cartão Não Vinculado";
    const expireDateRaw = data.token?.expireDate || "";
    const amountValue = data.amount?.value || "0.00";

    let formattedExpiry = "-";
    if (expireDateRaw) {
        const expDate = new Date(expireDateRaw);
        if (!isNaN(expDate.getTime())) {
            const month = String(expDate.getMonth() + 1).padStart(2, '0');
            const year = String(expDate.getFullYear()).slice(-2);
            formattedExpiry = `${month}/${year}`;
        }
    }

    // CORREÇÃO: Ajustado para usar a variável 'status' que definiste acima
    let statusClass = (status === "Success" || status === "Success") ? "bg-success text-success" : "bg-danger text-danger";
    
    listaContainer.innerHTML = `
      <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" style="font-size: 0.85rem;">
              <thead class="bg-light">
                  <tr>
                      <th class="border-0 px-4 py-3 text-muted small">DETALHES DO TOKEN / CARTÃO</th>
                      <th class="border-0 py-3 text-muted small">ESTADO</th>
                      <th class="border-0 py-3 text-end px-4 text-muted small">MONTANTE</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td class="px-4 py-3">
                          <div class="fw-bold text-dark mb-1"><i class="fa-solid fa-hashtag me-1 text-muted"></i>${apiTransactionId}</div>
                          <div class="text-secondary small d-flex align-items-center gap-2">
                              <span><i class="fa-solid fa-credit-card me-1"></i> ${maskedPAN}</span>
                              <span class="text-muted">|</span>
                              <span><i class="fa-solid fa-calendar-days me-1"></i> Validade: ${formattedExpiry}</span>
                          </div>
                      </td>
                      <td>
                          <span class="badge rounded-pill px-3 py-2 bg-opacity-10 ${statusClass}">
                              ${status.toUpperCase()}
                          </span>
                      </td>
                      <td class="text-end px-4 fw-bold text-dark" style="font-size: 0.9rem;">
                          ${parseFloat(amountValue).toFixed(2)} EUR
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>`;

  } catch (err) {
    console.error(err);
    const statusElem = document.getElementById("statusPagamento");
    if (statusElem) {
        statusElem.innerText = "ERRO";
        statusElem.className = "h4 fw-bold text-danger mt-1";
    }
  }
}

//REFUND
async function RefundPagamento() {

  let clientId;
  let bearerToken;
  let terminalId;

  const transactionId = document.getElementById("TransactionIDRefund")?.value?.trim();
  const montante = document.getElementById("ValorRefund")?.value?.trim();
  const feedbackArea = document.getElementById("feedbackRefundMIT");


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

  if (!transactionId) {
    showErrorModal("TransactionID tem que estar preenchido");
    return;
  }

  if (!montante) {
    showErrorModal("Montante tem que estar preenchido");
    return;
  }

  feedbackArea.innerHTML = `
    <div class="d-flex align-items-center justify-content-center p-3 text-muted">
      <div class="spinner-border spinner-border-sm me-2" role="status"></div>
      <span class="small fw-bold">A comunicar com api...</span>
    </div>`;

  const prefix = window.location.hostname === '127.0.0.1' ? '' : '/SimuladorSIBS';

  try {

    const params = new URLSearchParams({
      transactionId
    });

    const response = await fetch(`${prefix}/api/Refund?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ montante , clientId , terminalId, bearerToken  })
    });

    const data = await response.json();
    const statusMsg = data?.returnStatus?.statusMsg;

    if (statusMsg === "Success") {
      feedbackArea.innerHTML = `
          <div class="p-4 border-0 shadow-sm d-flex align-items-center" style="background: #f0fdf4; border-radius: 20px;">
            <div class="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 45px; height: 45px; flex-shrink: 0;">
              <i class="fa-solid fa-check fs-5"></i>
            </div>
            <div>
              <h6 class="fw-bold text-success mb-1">Reembolso efetuado!</h6>
              <p class="small text-success mb-0 opacity-75">Reembolso emitido com sucesso.</p>
            </div>
          </div>`;
        } else {
            feedbackArea.innerHTML = `
              <div class="p-4 border-0 shadow-sm d-flex align-items-center" style="background: #fef2f2; border-radius: 20px;">
                <div class="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 45px; height: 45px; flex-shrink: 0;">
                  <i class="fa-solid fa-xmark fs-5"></i>
                </div>
                <div>
                  <h6 class="fw-bold text-danger mb-1">Falha no Reembolso</h6>
                  <p class="small text-danger mb-0 opacity-75">${data?.returnStatus?.errorDescription || "Verifique os dados e tente novamente."}</p>
                </div>
              </div>`;
        }
    
  } catch (err) {
    console.error(err);
    document.getElementById("refundPagamento").innerText = "ERRO";
    document.getElementById("refundPagamento").className = "h4 fw-bold text-danger mt-1";
  }
}

//Cancelamento
/*async function CancelMIT() {

  let clientId;
  let bearerToken;
  let terminalId;

  const transactionId = document.getElementById("TransactionIDCancel")?.value?.trim();
  const montante = "0";
  const feedbackArea = document.getElementById("feedbackCancelarMIT");


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

  if (!transactionId) {
    showErrorModal("TransactionID tem que estar preenchido");
    return;
  }

  feedbackArea.innerHTML = `
    <div class="d-flex align-items-center justify-content-center p-3 text-muted">
      <div class="spinner-border spinner-border-sm me-2" role="status"></div>
      <span class="small fw-bold">A comunicar com api...</span>
    </div>`;

  const prefix = window.location.hostname === '127.0.0.1' ? '' : '/SimuladorSIBS';

  try {

    const params = new URLSearchParams({
      transactionId
    });


    const response = await fetch(`${prefix}/api/Cancel?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ montante , clientId , terminalId, bearerToken  })
    });

    const data = await response.json();
    const statusMsg = data?.returnStatus?.statusMsg;

    if (statusMsg === "Success") {
      feedbackArea.innerHTML = `
          <div class="p-4 border-0 shadow-sm d-flex align-items-center" style="background: #f0fdf4; border-radius: 20px;">
            <div class="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 45px; height: 45px; flex-shrink: 0;">
              <i class="fa-solid fa-check fs-5"></i>
            </div>
            <div>
              <h6 class="fw-bold text-success mb-1">Cancelamento efetuado!</h6>
              <p class="small text-success mb-0 opacity-75">Cancelamento emitido com sucesso.</p>
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
    console.error(err);
    document.getElementById("Cancelagamento").innerText = "ERRO";
    document.getElementById("CancelPagamento").className = "h4 fw-bold text-danger mt-1";
  }
}*/




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