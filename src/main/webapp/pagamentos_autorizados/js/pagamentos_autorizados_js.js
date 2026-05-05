window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  preencherCompraMandato()
  preenchercheckoutMandato()

});

const credential_default = JSON.parse(localStorage.getItem('credential_default')) || {};
const credential_config = JSON.parse(localStorage.getItem('credential_config')) || {};
const default_Configs = localStorage.getItem('default'); // Normalmente é string "0" ou "1"~

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

  const prefix = window.location.hostname === '127.0.0.1' ? '' : '/SimuladorSIBS';


  try {

    const params = new URLSearchParams({clientId, bearerToken});
    const response = await fetch(`${prefix}/api/ListarMandato?${params.toString()}`, {
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
    //document.getElementById("bodyCompletoListarMandato").innerText = JSON.stringify({ error: err.message }, null, 2);
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

  const prefix = window.location.hostname === '127.0.0.1' ? '' : '/SimuladorSIBS';


  try {
    const params = new URLSearchParams({CancelMandatoTransactionId, bearerToken, clientId, CancelMandatoPhone});
    const response = await fetch(`${prefix}/api/CancelarMandato?${params.toString()}`, {
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
    //document.getElementById("bodyCompletoCancelMandato").innerText = JSON.stringify({ error: err.message }, null, 2);
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

  const prefix = window.location.hostname === '127.0.0.1' ? '' : '/SimuladorSIBS';


  try {
    const params = new URLSearchParams({DetalheMandatoTransactionId, bearerToken, clientId, DetalheMandatoPhone});
    const response = await fetch(`${prefix}/api/DetalheMandato?${params.toString()}`, {
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
    //document.getElementById("bodyCompletoDetalheMandato").innerText = JSON.stringify({ error: err.message }, null, 2);
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

    } else {
      document.getElementById("CriarMandatoPagamento").className = "h4 fw-bold text-danger mt-1";
    }

    // ===================== LOCALSTORAGE =====================
    localStorage.removeItem("MandatoConfigurada");

    const MandatoArray = [
      {
        mandateId: data?.mandate.mandateId,
        CriarMandatoCustomerName
      }
    ];

    localStorage.setItem("MandatoConfigurada", JSON.stringify(MandatoArray));

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
    //document.getElementById("bodyCompletoCriarMandato").innerText = JSON.stringify({ error: err.message }, null, 2);
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

  const prefix = window.location.hostname === '127.0.0.1' ? '' : '/SimuladorSIBS';

  try {

    const params = new URLSearchParams({
      transactionId
    });


    const response = await fetch(`${prefix}/api/RefundMandato?${params.toString()}`, {
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
    //document.getElementById("bodyCompletoRefundMandato").innerText = JSON.stringify({ error: err.message }, null, 2);
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
    //document.getElementById("bodyCompletoCheckoutMandato").innerText = JSON.stringify({ error: err.message }, null, 2);
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

  const prefix = window.location.hostname === '127.0.0.1' ? '' : '/SimuladorSIBS';


  try {

    const params = new URLSearchParams({
      bearerToken, mandateTransactionSignature
    });


    const response = await fetch(`${prefix}/api/CompraMandato?${params.toString()}`, {
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
    //document.getElementById("bodyCompletoCompraMandato").innerText = JSON.stringify({ error: err.message }, null, 2);
  }
}