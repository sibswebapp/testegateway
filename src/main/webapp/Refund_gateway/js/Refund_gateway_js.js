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


document.addEventListener("DOMContentLoaded", async function () {

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const useDefault = JSON.parse(localStorage.getItem("default"));
    const credential_default_variable = JSON.parse(localStorage.getItem('credential_default'));
    const credential_config_variable = JSON.parse(localStorage.getItem('credential_config'));

    if (useDefault == "0") {
        window.token = credential_config_variable.bearerToken;
        window.clientId = credential_config_variable.clientId;
        window.terminalId = credential_config_variable.terminalId;
        window.gatewayVersion = credential_config_variable.gatewayVersion;
    } else {
        window.token = credential_default_variable.bearerToken;
        window.clientId = credential_default_variable.clientId;
        window.terminalId = credential_default_variable.terminalId;
        window.gatewayVersion = credential_default_variable.gatewayVersion;
    }

    let refunds = JSON.parse(localStorage.getItem("refunds") || "[]");

    if (refunds.length > 0) {
        const lastRefundIndex = refunds.map(r => Number(r.redirect) === 1 ? 1 : 0).lastIndexOf(1);

        if (lastRefundIndex !== -1) {
            const lastRefund = refunds[lastRefundIndex];
            const transactionIDInput = document.getElementById("transactionID");
            const refundAmountInput = document.getElementById("refundAmount");

            if (transactionIDInput) transactionIDInput.value = lastRefund.paymentId || "";

            if (refundAmountInput) {
                let amount = parseFloat(lastRefund.amount);
                refundAmountInput.value = amount.toFixed(2); 
            }

            refunds = [lastRefund];
            refunds[0].redirect = 0; 
            localStorage.setItem("refunds", JSON.stringify(refunds));

        } else {
            localStorage.removeItem("refunds");
        }
    }

});


async function refund() {

    const refundAmount = document.getElementById("refundAmount").value;
    const refundDescription = document.getElementById("refundDescription").value;
    const paymentId = document.getElementById("transactionID").value;

    if (!refundDescription && !refundAmount && !paymentId) {
        showErrorModal("Por favor, preencha todos os campos");
        return;
    }

    if (!refundAmount || refundAmount <= 0) {
        showErrorModal("Por favor, indica um valor válido para o reembolso.");
        return;
    }

    if (!refundDescription) {
        showErrorModal("Por favor, indica uma descrição para o reembolso.");
        return;
    }

    if (!paymentId) {
        showErrorModal("Por favor, indica qual o ID da transação para efetuar o reembolso.");
        return;
    }

    const version = gatewayVersion === "1" ? "v1" : "v2";
    const apiUrl = `https://spg.qly.site1.sibs.pt/api/${version}/payments/${paymentId}/refund`;

    const headers = {
        Authorization: `Bearer ${token}`,
        "X-IBM-Client-Id": clientId,
        "Content-Type": "application/json",
        Accept: "application/json",
    };

    const body = {
        merchant: {
            terminalId: Number(terminalId),
            channel: "web",
            merchantTransactionId: refundDescription
        },
        transaction: {
            transactionTimestamp: new Date().toISOString(),
            description: refundDescription,
            amount: {
                value: Number(refundAmount),
                currency: "EUR"
            }
        }
    };

    const debugHeaders = document.getElementById("debug-headers");
    const debugBody = document.getElementById("debug-body");
    const debugSection = document.getElementById("debug-section");

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        });

        const data = await response.json();

        // Headers no debug
        let headerObj = {};
        for (let pair of response.headers.entries()) {
            headerObj[pair[0]] = pair[1];
        }
        debugHeaders.textContent = JSON.stringify(headerObj, null, 2);
        debugBody.textContent = JSON.stringify(data, null, 2);
        debugSection.classList.remove("d-none");

        const debugHeader = document.getElementById("debug-header");

        if (response.ok) {
            debugHeader.classList.remove("bg-danger");
            debugHeader.classList.add("bg-primary");
            showSuccessModal("✅ Reembolso efetuado com sucesso!");
        } else {
            debugHeader.classList.remove("bg-primary");
            debugHeader.classList.add("bg-danger");
            showErrorModal("❌ Erro ao efetuar o reembolso.");
        }

    } catch (error) {
        debugSection.classList.remove("d-none");
        debugBody.textContent = JSON.stringify({ error: error.message }, null, 2);
        showErrorModal("❌ Erro técnico ao efetuar o reembolso.");
    }
}
