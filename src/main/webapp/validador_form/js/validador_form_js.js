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


document.getElementById("carregarForm").addEventListener("click", function() {

    const transactionId = document.getElementById("transactionId").value.trim();
    const formContext = document.getElementById("formContext").value.trim();

    if (!transactionId || !formContext) {
      showErrorModal("Preencha ambos os campos!");
      return;
    }

    // Verificar se vem do validador
    const params = new URLSearchParams(window.location.search);
    const isValidador = params.get("validador") === "1";

    const redirectUrl = isValidador
    ? window.location.origin + "/validador_multifuncoes/validador_multifuncoes.html"
    : window.location.href;

    // Remove qualquer widget/form anterior
    document.getElementById("sibsFormContainer").innerHTML = "";

    // 1) chamar o form da SIBS
    const script = document.createElement("script");
    script.src = `https://spg.qly.site1.sibs.pt/assets/js/widget.js?id=${encodeURIComponent(transactionId)}`;
    document.getElementById("sibsFormContainer").appendChild(script);

    const form = document.createElement("form");
    form.className = "paymentSPG";
    form.setAttribute("spg-context", formContext);

    const formConfig = {
      paymentMethodList: [],
      amount: { value: 0, currency: "EUR" },
      language: "pt",
      redirectUrl: redirectUrl
    };
    form.setAttribute("spg-config", JSON.stringify(formConfig));

    const formstyle = {
      layout: "spg_form_tabs",
            theme: "default",
            color: {
                  "primary": "",
                  "border": "",
                  "surface": "",
                  "body": {
                      "text": "",
                  }
            },
            font: ""
    };
    form.setAttribute("spg-style", JSON.stringify(formstyle));

    document.getElementById("sibsFormContainer").appendChild(form);
  });


  //quando vem do validador_API preencher os campos automaticamente
  window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  if (params.get("validador") !== "1") return;

  const dados = JSON.parse(sessionStorage.getItem("credenciaisForm") || "[]");

  if (!dados.length) return;

  const transactionId = dados.find(d => d.id === "transactionID")?.value;
  const formContext = dados.find(d => d.id === "formContext")?.value;

  const transactionInput = document.getElementById("transactionId");
  const formContextInput = document.getElementById("formContext");

  if (transactionInput && transactionId) {
    transactionInput.value = transactionId;
  }

  if (formContextInput && formContext) {
    formContextInput.value = formContext;
  }
});
