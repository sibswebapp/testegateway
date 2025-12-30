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



 // AS TUAS FUNÇÕES ORIGINAIS
    async function getStatusPagamento() {
      const terminalId = document.getElementById("terminalId").value.trim();
      const clientId = document.getElementById("clientId").value.trim();
      const token = document.getElementById("bearerToken").value.trim();

      if (!terminalId || !clientId || !token) {
        showErrorModal("Preencha Terminal ID, Client ID e Bearer Token");
        return;
      }

      try {
        const response = await fetch("/api/get-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ terminalId, clientId, token })
        });
        const data = await response.json();
        document.getElementById("bodyCompletoStatus").textContent = JSON.stringify(data, null, 2);
        document.getElementById("statusPagamento").textContent = data.status || "OK";
        document.getElementById("statusCode").textContent = response.status;
      } catch (e) {
        alert("Erro ao consultar status: " + e.message);
      }
    }

    async function fazerMIT() {
      const terminalId = document.getElementById("terminalId").value.trim();
      const clientId = document.getElementById("clientId").value.trim();
      const token = document.getElementById("bearerToken").value.trim();
      const transactionId = document.getElementById("mitTransactionId").value.trim();
      const valor = document.getElementById("mitValor").value;
      const type = document.getElementById("mitType").value;

      try {
        const response = await fetch("/api/fazer-mit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ terminalId, clientId, token, transactionId, valor, type })
        });
        const data = await response.json();
        document.getElementById("bodyCompletoMIT").textContent = JSON.stringify(data, null, 2);
        document.getElementById("mitStatus").textContent = data.status || "-";
        document.getElementById("mitMsg").textContent = data.message || "-";
        document.getElementById("captureTransactionId").value = data.transactionID || transactionId;
      } catch (e) { alert("Erro MIT: " + e.message); }
    }

    async function fazerCIT() {
      const transactionId = document.getElementById("captureTransactionId").value.trim();
      const valor = document.getElementById("captureValor").value;
      try {
        const response = await fetch("/api/fazer-cit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId, valor })
        });
        const data = await response.json();
        document.getElementById("bodyCompletoCIT").textContent = JSON.stringify(data, null, 2);
        document.getElementById("captureStatus").textContent = data.status || "-";
        document.getElementById("captureMsg").textContent = data.message || "-";
      } catch (e) { alert("Erro CIT: " + e.message); }
    }

    function consultarPagamentosAutorizados() {
      document.getElementById("paResultado").innerText =
        "A chamar API...\nPhone: " + document.getElementById("paPhone").value;
    }

