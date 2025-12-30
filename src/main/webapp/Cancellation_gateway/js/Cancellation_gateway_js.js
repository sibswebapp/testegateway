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

   let cancels = JSON.parse(localStorage.getItem("cancels") || "[]");

    if (cancels.length > 0) {
        const lastCancelIndex = cancels.map(c => Number(c.redirect) === 1 ? 1 : 0).lastIndexOf(1);

        if (lastCancelIndex !== -1) {
            const lastCancel = cancels[lastCancelIndex];
            const transactionIDInput = document.getElementById("transactionID"); 
            const cancelAmountInput = document.getElementById("CancelAmount");   

            if (transactionIDInput) transactionIDInput.value = lastCancel.paymentId || "";

            if (cancelAmountInput) {
                let amount = parseFloat(lastCancel.amount);
                cancelAmountInput.value = amount.toFixed(2); 
            }

            cancels = [lastCancel];
            cancels[0].redirect = 0; 
            localStorage.setItem("cancels", JSON.stringify(cancels));

        } else {
            localStorage.removeItem("cancels");
        }
    }

});


async function Cancel() {

    const cancelAmount = document.getElementById("CancelAmount").value;
    const cancelDescription = document.getElementById("CancelDescription").value;
    const paymentId = document.getElementById("transactionID").value;

    if (!cancelDescription && !cancelAmount && !paymentId) {
        showErrorModal("Por favor, preencha todos os campos");
        return;
    }

    if (!cancelAmount || cancelAmount <= 0) {
        showErrorModal("Por favor, indica um valor válido para o reembolso.");
        return;
    }

    if (!cancelDescription) {
        showErrorModal("Por favor, indica uma descrição para o reembolso.");
        return;
    }

    if (!paymentId) {
        showErrorModal("Por favor, indica qual o ID da transação para efetuar o reembolso.");
        return;
    }

    const version = gatewayVersion === "1" ? "v1" : "v2";
    const apiUrl = `https://spg.qly.site1.sibs.pt/api/${version}/payments/${paymentId}/cancellation`;

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
            merchantTransactionId: cancelDescription
        },
        transaction: {
            transactionTimestamp: new Date().toISOString(),
            description: cancelDescription,
            amount: {
                value: Number(cancelAmount),
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
            showSuccessModal("✅ Cancelamento efetuado com sucesso!");
        } else {
            debugHeader.classList.remove("bg-primary");
            debugHeader.classList.add("bg-danger");
            showErrorModal("❌ Erro ao efetuar o cancelamento.");
        }

    } catch (error) {
        debugSection.classList.remove("d-none");
        debugBody.textContent = JSON.stringify({ error: error.message }, null, 2);
        showErrorModal("❌ Erro técnico ao efetuar o cancelamento.");
    }
}
