window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  // verificar flag de sucesso
  if (params.get("CITSucesso") === "1" && params.get("POPUPNOT") !== "1") {
    if (typeof showSuccessModal === "function") {
      showSuccessModal("CIT configurada com sucesso");
    }

    // Atualiza a URL para impedir que o modal reapareça no refresh
    params.set("POPUPNOT", "1");
    const newUrl =
      window.location.pathname + "?" + params.toString() + window.location.hash;
    window.history.replaceState({}, "", newUrl);
  }

  // preencher automaticamente o MIT Transaction ID
  const mitId = params.get("id");
  if (mitId) {
    const mitInput = document.getElementById("MITTransactionId");
    if (mitInput) {
      mitInput.value = mitId;
      mitInput.dispatchEvent(new Event("input"));
    }
  }

  // verifica CitType
  const citType = params.get("CitType");
  if (citType === "RCRR") {
    // esconder tab e conteúdo
    const tab = document.getElementById("sub-mit-captura-tab");
    const content = document.getElementById("sub-mit-captura");
    if (tab) tab.classList.add("d-none");
    if (content) content.classList.add("d-none");

    // atualizar mitType
    const mitTypeInput = document.getElementById("mitType");
    if (mitTypeInput) {
      mitTypeInput.value = "RCRR";
      mitTypeInput.dispatchEvent(new Event("input"));
    }
    // atualizar mitType
    const citTypeInput = document.getElementById("CitType");
    if (citTypeInput) {
      citTypeInput.value = "RCRR";
      citTypeInput.dispatchEvent(new Event("input"));
    }
  }

  // preencher terminalId, clientId e bearerToken do localStorage
  const citRaw = localStorage.getItem("CredenciaisConfigurada");
  if (citRaw) {
    const citData = JSON.parse(citRaw);
    const cit = Array.isArray(citData) ? citData[0] : citData;

    if (cit?.terminalId) {
      const tInput = document.getElementById("terminalId");
      if (tInput) tInput.value = cit.terminalId;
    }
    if (cit?.clientId) {
      const cInput = document.getElementById("clientId");
      if (cInput) cInput.value = cit.clientId;
    }
    if (cit?.bearerToken) {
      const bInput = document.getElementById("bearerToken");
      if (bInput) bInput.value = cit.bearerToken;
    }
  }

  preencherCompraMandato()
  preenchercheckoutMandato()
  preencherCaptureTransactionId()
  preenchercredenciais_form();
});

function preenchercredenciais_form() {
  const params = new URLSearchParams(window.location.search);

  if (params.get("TransacaoSucesso") === "1" &&
      params.get("validador_credenciais") === "1") {
    showSuccessModal("Transação com sucesso");
  }

  const citRaw = localStorage.getItem("credenciaisForm");

  let terminalId, clientId, bearerToken;

  if (params.get("TransacaoSucesso") === "1") {
    const citData = JSON.parse(citRaw);

    terminalId  = citData[0]?.value;
    clientId    = citData[1]?.value;
    bearerToken = citData[2]?.value;

    if (terminalId) {
      const tInput = document.getElementById("terminalId");
      if (tInput) tInput.value = terminalId;
    }

    if (clientId) {
      const cInput = document.getElementById("clientId");
      if (cInput) cInput.value = clientId;
    }

    if (bearerToken) {
      const bInput = document.getElementById("bearerToken");
      if (bInput) bInput.value = bearerToken;
    }
  }

  params.set("validador_credenciais", "0");
  window.history.replaceState({}, "", `${window.location.pathname}?${params}`);

  params.set("TransacaoSucesso", "0");
  window.history.replaceState({}, "", `${window.location.pathname}?${params}`);

  localStorage.removeItem("CredenciaisConfigurada");

  if (terminalId || clientId || bearerToken) {
    localStorage.setItem(
      "CredenciaisConfigurada",
      JSON.stringify([{ terminalId, clientId, bearerToken }])
    );
  }
}


function preencherCaptureTransactionId() {
  const captureInput = document.getElementById("captureTransactionId");
  if (!captureInput) return;

  const mitStorage = localStorage.getItem("MITsConfigurada");
  if (!mitStorage) return;

  try {
    const mitArray = JSON.parse(mitStorage);
    const transactionID = mitArray?.[0]?.transactionID;

    if (transactionID) {
      captureInput.value = transactionID;
    }
  } catch (e) {
    console.error("MITsConfigurada inválido", e);
  }
}

function preenchercheckoutMandato() {
  const mandato = localStorage.getItem("MandatoConfigurada");

  if (mandato) {
    try {

      const dadosMandatoArray = JSON.parse(mandato);
      const dadosMandato = Array.isArray(dadosMandatoArray) ? dadosMandatoArray[0] : dadosMandatoArray;

      const checkoutMandateId = document.getElementById("checkoutMandateMandateId");
      const checkoutMerchantID = document.getElementById("checkoutMandatoMerchantID");
      const checkoutCustomerName = document.getElementById("checkoutMandatoCustomerName");

      if (checkoutMandateId && dadosMandato.mandateId) {
        checkoutMandateId.value = dadosMandato.mandateId;
      }

      if (checkoutMerchantID && dadosMandato.CriarMandatoMerchantID) {
        checkoutMerchantID.value = dadosMandato.CriarMandatoMerchantID;
      }

      if (checkoutCustomerName && dadosMandato.CriarMandatoCustomerName) {
        checkoutCustomerName.value = dadosMandato.CriarMandatoCustomerName;
      }
    } catch (error) {
      console.error("Erro ao ler MandatoConfigurada:", error);
    }
  }

}

function preencherCompraMandato() {

  const CheckoutMandato = localStorage.getItem("CheckoutMandatoConfigurado");

  if (CheckoutMandato) {
    try {

      const dadosCheckoutMandatoArray = JSON.parse(CheckoutMandato);
      const dadosMandato = Array.isArray(dadosCheckoutMandatoArray) ? dadosCheckoutMandatoArray[0] : dadosCheckoutMandatoArray;

      const CompraMandateId = document.getElementById("CheckoutMandateTransactionId");

      if (CompraMandateId && dadosMandato.checkoutmandateId) {
        CompraMandateId.value = dadosMandato.checkoutmandateId;
      }

    } catch (error) {
      console.error("Erro ao ler CheckoutMandatoConfigurado:", error);
    }
  }

}


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


const togglePassword = document.querySelector('#togglePassword');
const passwordInput = document.querySelector('#bearerToken');
const eyeIcon = document.querySelector('#eyeIcon');

togglePassword.addEventListener('click', function () {
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;

  // Alterna entre olho aberto e fechado
  eyeIcon.classList.toggle('fa-eye');
  eyeIcon.classList.toggle('fa-eye-slash');
});

togglecit()

function toggleSubMitCaptura() {
  const mitType = document.getElementById("mitType")?.value;

  const tabButton = document.getElementById("sub-mit-captura-tab");
  const tabContent = document.getElementById("sub-mit-captura");

  if (!tabButton || !tabContent) return;

  const capturaAtiva = tabContent.classList.contains("active");

  if (mitType === "RCRR") {
    tabButton.classList.add("d-none");
    tabContent.classList.remove("active", "show");

    if (capturaAtiva) {
      const firstVisibleTab = document.querySelector('.nav-link:not(.d-none)');
      if (firstVisibleTab) {
        new bootstrap.Tab(firstVisibleTab).show();
      }
    }
  } else {
    tabButton.classList.remove("d-none");
  }
}

function togglecit() {
  const tabButton = document.getElementById("sub-mit-captura-tab");
  const tabContent = document.getElementById("sub-mit-captura");
  const mitType = document.getElementById("CitType")?.value;

  const CITValorContainer = document.getElementById("CITValorContainer");

  if (!tabButton || !tabContent || !CITValorContainer) return;
  const capturaAtiva = tabContent.classList.contains("active");

  if (mitType === "UCOF") {
    CITValorContainer.classList.add("d-none");
    tabButton.classList.remove("d-none");

  } else {
    CITValorContainer.classList.remove("d-none");
    tabButton.classList.add("d-none");
    tabContent.classList.remove("active", "show");

    if (capturaAtiva) {
      const firstVisibleTab = document.querySelector('.nav-link:not(.d-none)');
      if (firstVisibleTab) {
        new bootstrap.Tab(firstVisibleTab).show();
      }
    }
  }
}



//GET STATUS
async function getStatusPagamento() {

  const terminalId = document.getElementById("terminalId")?.value?.trim();
  const clientId = document.getElementById("clientId")?.value?.trim();
  const bearerToken = document.getElementById("bearerToken")?.value?.trim();
  const transactionId = document.getElementById("statusTransactionId")?.value?.trim();

  if (!terminalId || !clientId || !bearerToken ) {
    showErrorModal("Todos os campos têm de estar preenchidos.");
    return;
  }

  if (!transactionId) {
    showErrorModal("TransactionID tem que estar preenchido");
    return;
  }

  document.getElementById("statusPagamento").innerText = "...";
  document.getElementById("statusCode").innerText = "CODE: -";
  document.getElementById("bodyCompletoStatus").innerText = "{}";

  try {

    const params = new URLSearchParams({
      terminalId,
      clientId,
      token: bearerToken,
      transactionId
    });

    const response = await fetch(`/api/status?${params.toString()}`, {
      method: "GET"
    });

    const data = await response.json();

    document.getElementById("bodyCompletoStatus").innerText = JSON.stringify(data, null, 2);
    document.getElementById("statusCode").innerText = `CODE: ${response.status}`;

    let status = data.paymentReference?.status || data?.paymentStatus || data?.transactionStatus || "-";
    if(status == "CANC"){
      status = "Cancelado"
    }

    document.getElementById("statusPagamento").innerText = status;

    if (["Success"].includes(status)) {
      document.getElementById("statusPagamento").className = "h4 fw-bold text-success mt-1";
    } else {
      document.getElementById("statusPagamento").className = "h4 fw-bold text-danger mt-1";
    }

    // ===================== LOCALSTORAGE =====================
    localStorage.removeItem("CredenciaisConfigurada");

    const credenciaisArray = [
      {
        terminalId,
        clientId,
        bearerToken
      }
    ];

    localStorage.setItem("CredenciaisConfigurada", JSON.stringify(credenciaisArray));

  } catch (err) {
    console.error(err);
    document.getElementById("statusPagamento").innerText = "ERRO";
    document.getElementById("statusPagamento").className = "h4 fw-bold text-danger mt-1";
    document.getElementById("bodyCompletoStatus").innerText = JSON.stringify({ error: err.message }, null, 2);
  }
}

//REFUND
async function RefundPagamento() {

  const terminalId = document.getElementById("terminalId")?.value?.trim();
  const clientId = document.getElementById("clientId")?.value?.trim();
  const bearerToken = document.getElementById("bearerToken")?.value?.trim();
  const transactionId = document.getElementById("RefundTransactionId")?.value?.trim();
  const montante = document.getElementById("RefundMontante")?.value?.trim();

  if (!terminalId || !clientId || !bearerToken ) {
    showErrorModal("Todos os campos têm de estar preenchidos.");
    return;
  }

  if (!transactionId) {
    showErrorModal("TransactionID tem que estar preenchido");
    return;
  }

  if (!montante) {
    showErrorModal("Montante tem que estar preenchido");
    return;
  }

  document.getElementById("refundPagamento").innerText = "...";
  document.getElementById("statusCodeRefund").innerText = "CODE: -";
  document.getElementById("bodyCompletoRefund").innerText = "{}";

  try {

    const params = new URLSearchParams({
      transactionId
    });


    const response = await fetch(`/api/Refund?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ montante , clientId , terminalId, bearerToken  })
    });

    const data = await response.json();

    document.getElementById("bodyCompletoRefund").innerText = JSON.stringify(data, null, 2);
    document.getElementById("statusCodeRefund").innerText = `CODE: ${data.returnStatus.statusCode}`;

    const status = data?.paymentStatus || data?.status || data?.transactionStatus || "-";
    document.getElementById("refundPagamento").innerText = status;

    if (["Success"].includes(status)) {
      document.getElementById("refundPagamento").className = "h4 fw-bold text-success mt-1";
    } else {
      document.getElementById("refundPagamento").className = "h4 fw-bold text-danger mt-1";
    }

    // ===================== LOCALSTORAGE =====================
    localStorage.removeItem("CredenciaisConfigurada");

    const credenciaisArray = [
      {
        terminalId,
        clientId,
        bearerToken
      }
    ];

    localStorage.setItem("CredenciaisConfigurada", JSON.stringify(credenciaisArray));

  } catch (err) {
    console.error(err);
    document.getElementById("refundPagamento").innerText = "ERRO";
    document.getElementById("refundPagamento").className = "h4 fw-bold text-danger mt-1";
    document.getElementById("bodyCompletoRefund").innerText = JSON.stringify({ error: err.message }, null, 2);
  }
}

//Cancelamento
async function CancelPagamento() {

  const terminalId = document.getElementById("terminalId")?.value?.trim();
  const clientId = document.getElementById("clientId")?.value?.trim();
  const bearerToken = document.getElementById("bearerToken")?.value?.trim();
  const transactionId = document.getElementById("CancelTransactionId")?.value?.trim();
  const montante = document.getElementById("CancelMontante")?.value?.trim();

  if (!terminalId || !clientId || !bearerToken ) {
    showErrorModal("Todos os campos têm de estar preenchidos.");
    return;
  }

  if (!transactionId) {
    showErrorModal("TransactionID tem que estar preenchido");
    return;
  }

  if (!montante) {
    showErrorModal("Montante tem que estar preenchido");
    return;
  }

  document.getElementById("CancelPagamento").innerText = "...";
  document.getElementById("statusCodeCancel").innerText = "CODE: -";
  document.getElementById("bodyCompletoCancel").innerText = "{}";

  try {

    const params = new URLSearchParams({
      transactionId
    });


    const response = await fetch(`/api/Cancel?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ montante , clientId , terminalId, bearerToken  })
    });

    const data = await response.json();

    document.getElementById("bodyCompletoCancel").innerText = JSON.stringify(data, null, 2);
    document.getElementById("statusCodeCancel").innerText = `CODE: ${data.returnStatus.statusCode}`;

    const status = data?.status || data?.paymentStatus || data?.transactionStatus || "-";
    document.getElementById("CancelPagamento").innerText = status;

    if (["Success"].includes(status)) {
      document.getElementById("CancelPagamento").className = "h4 fw-bold text-success mt-1";
    } else {
      document.getElementById("CancelPagamento").className = "h4 fw-bold text-danger mt-1";
    }

    // ===================== LOCALSTORAGE =====================
    localStorage.removeItem("CredenciaisConfigurada");

    const credenciaisArray = [
      {
        terminalId,
        clientId,
        bearerToken
      }
    ];

    localStorage.setItem("CredenciaisConfigurada", JSON.stringify(credenciaisArray));

  } catch (err) {
    console.error(err);
    document.getElementById("Cancelagamento").innerText = "ERRO";
    document.getElementById("CancelPagamento").className = "h4 fw-bold text-danger mt-1";
    document.getElementById("bodyCompletoCancel").innerText = JSON.stringify({ error: err.message }, null, 2);
  }
}

//Fazer CIT
async function fazerCIT() {
  const terminalId = document.getElementById("terminalId")?.value?.trim();
  const clientId = document.getElementById("clientId")?.value?.trim();
  const bearerToken = document.getElementById("bearerToken")?.value?.trim();
  let montante = document.getElementById("CITValor")?.value?.trim();
  const CitType = document.getElementById("CitType")?.value?.trim();

  if (!terminalId || !clientId || !bearerToken) {
    showErrorModal("Todos os campos têm de estar preenchidos.");
    return;
  }

  if (!montante && CitType === "RCRR") {
    showErrorModal("Montante tem que estar preenchido");
    return;
  } else if (!montante) {
    montante = "0";
  }

  document.getElementById("CITPagamento").innerText = "...";
  document.getElementById("bodyCompletoCIT").innerText = "{}";

  try {
    const params = new URLSearchParams({ CitType });
    const response = await fetch(`/api/cit?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ montante, clientId, terminalId, bearerToken })
    });

    const data = await response.json();
    document.getElementById("bodyCompletoCIT").innerText = JSON.stringify(data, null, 2);

    const status = data?.status || data?.paymentStatus || data?.transactionStatus || data?.returnStatus.statusDescription || "-";
    document.getElementById("CITPagamento").innerText = status;

    const btnIrForm = document.getElementById("btnIrForm");

    if (status === "Success") {
      document.getElementById("CITPagamento").className = "h4 fw-bold text-success mt-1";
      btnIrForm.style.display = "block";
    } else {
      document.getElementById("CITPagamento").className = "h4 fw-bold text-danger mt-1";
      btnIrForm.style.display = "none";
    }

    // ===================== LOCALSTORAGE =====================
    localStorage.removeItem("CITsConfigurada");
    localStorage.removeItem("CredenciaisConfigurada");

    const citArray = [
      {
        formContext: data?.formContext,
        transactionID: data?.transactionID,
        CitType,
        redirect_multifuncoes: 1
      }
    ];

    const credenciaisArray = [
      {
        terminalId,
        clientId,
        bearerToken
      }
    ];

    localStorage.setItem("CITsConfigurada", JSON.stringify(citArray));
    localStorage.setItem("CredenciaisConfigurada", JSON.stringify(credenciaisArray));

  } catch (err) {
    console.error(err);
    document.getElementById("CITPagamento").innerText = "ERRO";
    document.getElementById("CITPagamento").className = "h4 fw-bold text-danger mt-1";
    document.getElementById("bodyCompletoCIT").innerText = JSON.stringify({ error: err.message }, null, 2);

    document.getElementById("btnIrForm").style.display = "none"; 
  }
}


//Fazer MIT
async function fazerMIT() {
  const terminalId = document.getElementById("terminalId")?.value?.trim();
  const clientId = document.getElementById("clientId")?.value?.trim();
  const bearerToken = document.getElementById("bearerToken")?.value?.trim();
  let montante = document.getElementById("MITValor")?.value?.trim();
  const mitType = document.getElementById("mitType")?.value?.trim();
  const MITTransactionId = document.getElementById("MITTransactionId")?.value?.trim();

  if (!terminalId || !clientId || !bearerToken) {
    showErrorModal("Todos os campos têm de estar preenchidos.");
    return;
  }

  if (!montante) {
    showErrorModal("Montante tem que estar preenchido");
    return;
  }

  if (!MITTransactionId) {
    showErrorModal("TransactionID tem que estar preenchido");
    return;
  }


  document.getElementById("MITPagamento").innerText = "...";
  document.getElementById("statusCodeMIT").innerText = "CODE: -";
  document.getElementById("bodyCompletoMIT").innerText = "{}";


  try {
    const params = new URLSearchParams({ mitType, MITTransactionId});
    const response = await fetch(`/api/mit?${params.toString()}`, {
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
    } else {
      document.getElementById("MITPagamento").className = "h4 fw-bold text-danger mt-1";
    }

    // ===================== LOCALSTORAGE =====================
    localStorage.removeItem("MITsConfigurada");
    localStorage.removeItem("CredenciaisConfigurada");

    const mitArray = [
      {
        transactionID: data?.transactionID,
        CitType
      }
    ];

    const credenciaisArray = [
      {
        terminalId,
        clientId,
        bearerToken
      }
    ];

    localStorage.setItem("MITsConfigurada", JSON.stringify(mitArray));
    localStorage.setItem("CredenciaisConfigurada", JSON.stringify(credenciaisArray));

    const captureInput = document.getElementById("captureTransactionId");
    if (captureInput && data?.transactionID) {
      captureInput.value = data.transactionID;
    }

  } catch (err) {
    console.error(err);
    document.getElementById("MITPagamento").innerText = "ERRO";
    document.getElementById("MITPagamento").className = "h4 fw-bold text-danger mt-1";
    document.getElementById("bodyCompletoMIT").innerText = JSON.stringify({ error: err.message }, null, 2);
  }
}


//Fazer Captura
async function fazerCaptura() {
  const terminalId = document.getElementById("terminalId")?.value?.trim();
  const clientId = document.getElementById("clientId")?.value?.trim();
  const bearerToken = document.getElementById("bearerToken")?.value?.trim();
  let montante = document.getElementById("captureValor")?.value?.trim();
  const captureTransactionId = document.getElementById("captureTransactionId")?.value?.trim();

  if (!terminalId || !clientId || !bearerToken) {
    showErrorModal("Todos os campos têm de estar preenchidos.");
    return;
  }

  if (!montante) {
    showErrorModal("Montante tem que estar preenchido");
    return;
  }

  if (!captureTransactionId) {
    showErrorModal("TransactionID tem que estar preenchido");
    return;
  }


  document.getElementById("capturePagamento").innerText = "...";
  document.getElementById("statusCodecapture").innerText = "CODE: -";
  document.getElementById("bodyCompletocapture").innerText = "{}";


  try {
    const params = new URLSearchParams({captureTransactionId});
    const response = await fetch(`/api/capture?${params.toString()}`, {
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

    // ===================== LOCALSTORAGE =====================
    localStorage.removeItem("CredenciaisConfigurada");

    const credenciaisArray = [
      {
        terminalId,
        clientId,
        bearerToken
      }
    ];

    localStorage.setItem("CredenciaisConfigurada", JSON.stringify(credenciaisArray));

  } catch (err) {
    console.error(err);
    document.getElementById("capturePagamento").innerText = "ERRO";
    document.getElementById("capturePagamento").className = "h4 fw-bold text-danger mt-1";
    document.getElementById("bodyCompletocapture").innerText = JSON.stringify({ error: err.message }, null, 2);
  }
}


//Listar Mandato
async function ListarMandato() {
  const clientId = document.getElementById("clientId")?.value?.trim();
  const bearerToken = document.getElementById("bearerToken")?.value?.trim();
  const terminalId = document.getElementById("terminalId")?.value?.trim();

  if (!terminalId || !clientId || !bearerToken) {
    showErrorModal("Todos os campos têm de estar preenchidos.");
    return;
  }

  document.getElementById("ListarMandatoPagamento").innerText = "...";
  document.getElementById("ListarMandatoCode").innerText = "CODE: -";
  document.getElementById("bodyCompletoListarMandato").innerText = "{}";


  try {

    const params = new URLSearchParams({clientId, bearerToken});
    const response = await fetch(`/api/ListarMandato?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();
    document.getElementById("bodyCompletoListarMandato").innerText = JSON.stringify(data, null, 2);
    document.getElementById("ListarMandatoCode").innerText = `CODE: ${data.returnStatus.statusCode}`;

    const status = data?.returnStatus.statusMsg || "-";
    document.getElementById("ListarMandatoPagamento").innerText = status;

    if (status === "Success") {
      document.getElementById("ListarMandatoPagamento").className = "h4 fw-bold text-success mt-1";
    } else {
      document.getElementById("ListarMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
    }

    // ===================== LOCALSTORAGE =====================
    localStorage.removeItem("CredenciaisConfigurada");

    const credenciaisArray = [
      {
        terminalId,
        clientId,
        bearerToken
      }
    ];

    localStorage.setItem("CredenciaisConfigurada", JSON.stringify(credenciaisArray));

  } catch (err) {
    console.error(err);
    document.getElementById("ListarMandatoPagamento").innerText = "ERRO";
    document.getElementById("ListarMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
    document.getElementById("bodyCompletoListarMandato").innerText = JSON.stringify({ error: err.message }, null, 2);
  }
}

//Cancelar Mandato
async function CancelarMandato() {

  const terminalId = document.getElementById("terminalId")?.value?.trim();
  const clientId = document.getElementById("clientId")?.value?.trim();
  const bearerToken = document.getElementById("bearerToken")?.value?.trim();
  const CancelMandatoMerchantID = document.getElementById("CancelMandatoMerchantID")?.value?.trim();
  const CancelMandatoTransactionId = document.getElementById("CancelMandatoTransactionId")?.value?.trim();
  const CancelMandatoPhone = decodeURIComponent(document.getElementById("CancelMandatoPhone")?.value?.trim());

  if (!terminalId || !clientId || !bearerToken) {
    showErrorModal("Todos os campos têm de estar preenchidos.");
    return;
  }

  if (!CancelMandatoMerchantID) {
    showErrorModal("Merchant ID tem que estar preenchido");
    return;
  }

  if (!CancelMandatoTransactionId) {
    showErrorModal("TransactionID tem que estar preenchido");
    return;
  }

  if (!CancelMandatoPhone) {
    showErrorModal("Telefone tem que estar preenchido");
    return;
  }


  document.getElementById("CancelMandatoPagamento").innerText = "...";
  document.getElementById("statusCodeCancelMandato").innerText = "CODE: -";
  document.getElementById("bodyCompletoCancelMandato").innerText = "{}";


  try {
    const params = new URLSearchParams({CancelMandatoTransactionId, bearerToken, clientId, CancelMandatoPhone});
    const response = await fetch(`/api/CancelarMandato?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terminalId,CancelMandatoMerchantID })
    });

    const data = await response.json();
    document.getElementById("bodyCompletoCancelMandato").innerText = JSON.stringify(data, null, 2);
    document.getElementById("statusCodeCancelMandato").innerText = `CODE: ${data.returnStatus.statusCode}`;

    const status = data?.returnStatus.statusMsg || "-";
    document.getElementById("CancelMandatoPagamento").innerText = status;

    if (status === "Success") {
      document.getElementById("CancelMandatoPagamento").className = "h4 fw-bold text-success mt-1";
    } else {
      document.getElementById("CancelMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
    }

    // ===================== LOCALSTORAGE =====================
    localStorage.removeItem("CredenciaisConfigurada");

    const credenciaisArray = [
      {
        terminalId,
        clientId,
        bearerToken
      }
    ];

    localStorage.setItem("CredenciaisConfigurada", JSON.stringify(credenciaisArray));

  } catch (err) {
    console.error(err);
    document.getElementById("CancelMandatoPagamento").innerText = "ERRO";
    document.getElementById("CancelMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
    document.getElementById("bodyCompletoCancelMandato").innerText = JSON.stringify({ error: err.message }, null, 2);
  }
}


//Detalhe Mandato
async function DetalheMandato() {

  const terminalId = document.getElementById("terminalId")?.value?.trim();
  const clientId = document.getElementById("clientId")?.value?.trim();
  const bearerToken = document.getElementById("bearerToken")?.value?.trim();
  const DetalheMandatoTransactionId = document.getElementById("DetalheMandatoTransactionId")?.value?.trim();
  const DetalheMandatoPhone = document.getElementById("DetalheMandatoPhone")?.value?.trim();

  if (!terminalId || !clientId || !bearerToken) {
    showErrorModal("Todos os campos têm de estar preenchidos.");
    return;
  }

  if (!DetalheMandatoTransactionId) {
    showErrorModal("TransactionID tem que estar preenchido");
    return;
  }

  if (!DetalheMandatoPhone) {
    showErrorModal("Telefone tem que estar preenchido");
    return;
  }


  document.getElementById("DetalheMandatoPagamento").innerText = "...";
  document.getElementById("statusCodeDetalheMandato").innerText = "Montante disponível: -";
  document.getElementById("bodyCompletoDetalheMandato").innerText = "{}";


  try {
    const params = new URLSearchParams({DetalheMandatoTransactionId, bearerToken, clientId, DetalheMandatoPhone});
    const response = await fetch(`/api/DetalheMandato?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();
    document.getElementById("bodyCompletoDetalheMandato").innerText = JSON.stringify(data, null, 2);
    document.getElementById("statusCodeDetalheMandato").innerText = `Montante disponível: ${data.mandate.amountAvailable.value}`;

    const status = data?.returnStatus.statusMsg || "-";
    document.getElementById("DetalheMandatoPagamento").innerText = status;

    if (status === "Success") {
      document.getElementById("DetalheMandatoPagamento").className = "h4 fw-bold text-success mt-1";
    } else {
      document.getElementById("DetalheMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
    }

    // ===================== LOCALSTORAGE =====================
    localStorage.removeItem("CredenciaisConfigurada");

    const credenciaisArray = [
      {
        terminalId,
        clientId,
        bearerToken
      }
    ];

    localStorage.setItem("CredenciaisConfigurada", JSON.stringify(credenciaisArray));


  } catch (err) {
    console.error(err);
    document.getElementById("DetalheMandatoPagamento").innerText = "ERRO";
    document.getElementById("DetalheMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
    document.getElementById("bodyCompletoDetalheMandato").innerText = JSON.stringify({ error: err.message }, null, 2);
  }
}


//Criar Mandato
async function CriarMandato() {

  const terminalId = document.getElementById("terminalId")?.value?.trim();
  const clientId = document.getElementById("clientId")?.value?.trim();
  const bearerToken = document.getElementById("bearerToken")?.value?.trim();
  const CriarMandatoMerchantID = document.getElementById("CriarMandatoMerchantID")?.value?.trim();
  const CriarMandatoCustomerName = document.getElementById("CriarMandatoCustomerName")?.value?.trim();
  const CriarMandatoPhone = document.getElementById("CriarMandatoPhone")?.value?.trim();

  if (!terminalId || !clientId || !bearerToken) {
    showErrorModal("Todos os campos têm de estar preenchidos.");
    return;
  }

  if (!CriarMandatoMerchantID) {
    showErrorModal("Merchant ID tem que estar preenchido");
    return;
  }

  if (!CriarMandatoCustomerName) {
    showErrorModal("Customer Name tem que estar preenchido");
    return;
  }

  if (!CriarMandatoPhone) {
    showErrorModal("Telefone tem que estar preenchido");
    return;
  }


  document.getElementById("CriarMandatoPagamento").innerText = "...";
  document.getElementById("statusCodeCriarMandato").innerText = "CODE: -";
  document.getElementById("bodyCompletoCriarMandato").innerText = "{}";


  try {
    const params = new URLSearchParams({bearerToken, clientId});
    const response = await fetch(`/api/CriarMandato?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terminalId, CriarMandatoCustomerName, CriarMandatoPhone, CriarMandatoMerchantID })
    });

    const data = await response.json();
    document.getElementById("bodyCompletoCriarMandato").innerText = JSON.stringify(data, null, 2);
    document.getElementById("statusCodeCriarMandato").innerText = `CODE: ${data.returnStatus.statusCode}`;

    const status = data?.returnStatus.statusMsg || "-";
    document.getElementById("CriarMandatoPagamento").innerText = status;

    if (status === "Success") {
      document.getElementById("CriarMandatoPagamento").className = "h4 fw-bold text-success mt-1";
      showSuccessModal("Mandato criado com sucesso");

    } else {
      document.getElementById("CriarMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
    }

    // ===================== LOCALSTORAGE =====================
    localStorage.removeItem("MandatoConfigurada");
    localStorage.removeItem("CredenciaisConfigurada");

    const mitArray = [
      {
        mandateId: data?.mandate.mandateId,
        CriarMandatoMerchantID,
        CriarMandatoCustomerName
      }
    ];

    const credenciaisArray = [
      {
        terminalId,
        clientId,
        bearerToken
      }
    ];

    localStorage.setItem("MandatoConfigurada", JSON.stringify(mitArray));
    localStorage.setItem("CredenciaisConfigurada", JSON.stringify(credenciaisArray));


    const checkoutMandateId = document.getElementById("checkoutMandateMandateId");
    if (checkoutMandateId && data?.mandate.mandateId) {
      checkoutMandateId.value = data.mandate.mandateId;
    }

    const checkoutMerchantID = document.getElementById("checkoutMandatoMerchantID");
    if (checkoutMerchantID && CriarMandatoMerchantID) {
      checkoutMerchantID.value = CriarMandatoMerchantID;
    }

    const checkoutCustomerName = document.getElementById("checkoutMandatoCustomerName");
    if (checkoutCustomerName && CriarMandatoCustomerName) {
      checkoutCustomerName.value = CriarMandatoCustomerName;
    }

  } catch (err) {
    console.error(err);
    document.getElementById("CriarMandatoPagamento").innerText = "ERRO";
    document.getElementById("CriarMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
    document.getElementById("bodyCompletoCriarMandato").innerText = JSON.stringify({ error: err.message }, null, 2);
  }
}

//REFUND Mandato
async function RefundMandatoPagamento() {

  const terminalId = document.getElementById("terminalId")?.value?.trim();
  const clientId = document.getElementById("clientId")?.value?.trim();
  const bearerToken = document.getElementById("bearerToken")?.value?.trim();
  const transactionId = document.getElementById("RefundMandatoTransactionId")?.value?.trim();
  const montante = document.getElementById("MontanteRefundMandato")?.value?.trim();

  if (!terminalId || !clientId || !bearerToken ) {
    showErrorModal("Todos os campos têm de estar preenchidos.");
    return;
  }

  if (!transactionId) {
    showErrorModal("TransactionID tem que estar preenchido");
    return;
  }

  if (!montante) {
    showErrorModal("Montante tem que estar preenchido");
    return;
  }

  document.getElementById("refundMandatoPagamento").innerText = "...";
  document.getElementById("statusCodeRefundMandato").innerText = "CODE: -";
  document.getElementById("bodyCompletoRefundMandato").innerText = "{}";

  try {

    const params = new URLSearchParams({
      transactionId
    });


    const response = await fetch(`/api/RefundMandato?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ montante , clientId , terminalId, bearerToken  })
    });

    const data = await response.json();

    document.getElementById("bodyCompletoRefundMandato").innerText = JSON.stringify(data, null, 2);
    document.getElementById("statusCodeRefundMandato").innerText = `CODE: ${data.returnStatus.statusCode}`;

    const status = data?.paymentStatus || data?.status || data?.transactionStatus || "-";
    document.getElementById("refundMandatoPagamento").innerText = status;
    if (["Success"].includes(status)) {
      document.getElementById("refundMandatoPagamento").className = "h4 fw-bold text-success mt-1";
    } else {
      document.getElementById("refundMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
    }

    // ===================== LOCALSTORAGE =====================
    localStorage.removeItem("CredenciaisConfigurada");

    const credenciaisArray = [
      {
        terminalId,
        clientId,
        bearerToken
      }
    ];

    localStorage.setItem("CredenciaisConfigurada", JSON.stringify(credenciaisArray));

  } catch (err) {
    console.error(err);
    document.getElementById("refundMandatoPagamento").innerText = "ERRO";
    document.getElementById("refundMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
    document.getElementById("bodyCompletoRefundMandato").innerText = JSON.stringify({ error: err.message }, null, 2);
  }
}

//Checkout Mandato
async function CheckoutMandatoPagamento() {

  const terminalId = document.getElementById("terminalId")?.value?.trim();
  const clientId = document.getElementById("clientId")?.value?.trim();
  const bearerToken = document.getElementById("bearerToken")?.value?.trim();
  const montante = document.getElementById("checkoutMandatoAmount")?.value?.trim();
  const checkoutMandateId = document.getElementById("checkoutMandateMandateId")?.value?.trim();
  const checkoutMerchantID = document.getElementById("checkoutMandatoMerchantID")?.value?.trim();
  const checkoutCustomerName = document.getElementById("checkoutMandatoCustomerName")?.value?.trim();

  if (!terminalId || !clientId || !bearerToken ) {
    showErrorModal("Todos os campos têm de estar preenchidos.");
    return;
  }

  if (!checkoutMandateId) {
    showErrorModal("Mandate ID tem que estar preenchido");
    return;
  }

  if (!checkoutMerchantID) {
    showErrorModal("Merchant ID tem que estar preenchido");
    return;
  }

  if (!checkoutCustomerName) {
    showErrorModal("Customer Name tem que estar preenchido");
    return;
  }

  if (!montante) {
    showErrorModal("Montante tem que estar preenchido");
    return;
  }

  document.getElementById("CheckoutMandatoPagamento").innerText = "...";
  document.getElementById("statusCodeCheckoutMandato").innerText = "CODE: -";
  document.getElementById("bodyCompletoCheckoutMandato").innerText = "{}";

  try {

    const params = new URLSearchParams({
      clientId, bearerToken
    });


    const response = await fetch(`/api/CheckoutMandato?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terminalId , montante , checkoutMandateId, checkoutMerchantID, checkoutCustomerName  })
    });

    const data = await response.json();

    document.getElementById("bodyCompletoCheckoutMandato").innerText = JSON.stringify(data, null, 2);
    document.getElementById("statusCodeCheckoutMandato").innerText = `CODE: ${data.returnStatus.statusCode}`;

    const status = data?.returnStatus?.statusMsg || "-";
    document.getElementById("CheckoutMandatoPagamento").innerText = status;
    if (["Success"].includes(status)) {
      document.getElementById("CheckoutMandatoPagamento").className = "h4 fw-bold text-success mt-1";
      showSuccessModal("Checkout com Mandato criado com sucesso");
    } else {
      document.getElementById("CheckoutMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
    }

    // ===================== LOCALSTORAGE =====================
    localStorage.removeItem("CredenciaisConfigurada");
    localStorage.removeItem("CheckoutMandatoConfigurado");

    const credenciaisArray = [
      {
        terminalId,
        clientId,
        bearerToken
      }
    ];

    const CheckoutMandatoArray = [
      {
        checkoutmandateId: data?.transactionID,
        MandateTransactionSignature: data?.transactionSignature
      }
    ];

    localStorage.setItem("CredenciaisConfigurada", JSON.stringify(credenciaisArray));
    localStorage.setItem("CheckoutMandatoConfigurado", JSON.stringify(CheckoutMandatoArray));

    const checkoutmandateId = document.getElementById("CheckoutMandateTransactionId");
    if (checkoutmandateId && data?.transactionID) {
      checkoutmandateId.value = data?.transactionID;
    }

  } catch (err) {
    console.error(err);
    document.getElementById("CheckoutMandatoPagamento").innerText = "ERRO";
    document.getElementById("CheckoutMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
    document.getElementById("bodyCompletoCheckoutMandato").innerText = JSON.stringify({ error: err.message }, null, 2);
  }
}

//Compra Mandato
async function CompraMandatoPagamento() {

  const terminalId = document.getElementById("terminalId")?.value?.trim();
  const clientId = document.getElementById("clientId")?.value?.trim();
  const bearerToken = document.getElementById("bearerToken")?.value?.trim();
  const transactionID = document.getElementById("CheckoutMandateTransactionId")?.value?.trim();

  const raw = localStorage.getItem("CheckoutMandatoConfigurado");
  const arrayMandato = raw ? JSON.parse(raw) : [];
  const mandateTransactionSignature = Array.isArray(arrayMandato) ? arrayMandato?.[0]?.MandateTransactionSignature || "" : "";


  if (!terminalId || !clientId || !bearerToken ) {
    showErrorModal("Todos os campos têm de estar preenchidos.");
    return;
  }

  if (!transactionID) {
    showErrorModal("Transaction ID tem que estar preenchido");
    return;
  }

  document.getElementById("CompraMandatoPagamento").innerText = "...";
  document.getElementById("statusCodeCompraMandato").innerText = "CODE: -";
  document.getElementById("bodyCompletoCompraMandato").innerText = "{}";

  try {

    const params = new URLSearchParams({
      bearerToken, mandateTransactionSignature
    });


    const response = await fetch(`/api/CompraMandato?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        transactionID
      })
    });

    const data = await response.json();

    document.getElementById("bodyCompletoCompraMandato").innerText = JSON.stringify(data, null, 2);
    document.getElementById("statusCodeCompraMandato").innerText = `CODE: ${data.returnStatus.statusCode}`;

    const status = data?.returnStatus?.statusMsg || "-";
    document.getElementById("CompraMandatoPagamento").innerText = status;
    if (["Success"].includes(status)) {
      document.getElementById("CompraMandatoPagamento").className = "h4 fw-bold text-success mt-1";
      showSuccessModal("Compra com Mandato criado com sucesso");
    } else {
      document.getElementById("CompraMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
    }

    // ===================== LOCALSTORAGE =====================
    localStorage.removeItem("CredenciaisConfigurada");

    const credenciaisArray = [
      {
        terminalId,
        clientId,
        bearerToken
      }
    ];

    localStorage.setItem("CredenciaisConfigurada", JSON.stringify(credenciaisArray));

  } catch (err) {
    console.error(err);
    document.getElementById("CompraMandatoPagamento").innerText = "ERRO";
    document.getElementById("CompraMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
    document.getElementById("bodyCompletoCompraMandato").innerText = JSON.stringify({ error: err.message }, null, 2);
  }
}