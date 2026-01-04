document.addEventListener("DOMContentLoaded", () => {

  toggleCheckout();

  const raw = localStorage.getItem("credenciaisForm");
  if (!raw) return;

  let arr;
  try {
    arr = JSON.parse(raw);
  } catch {
    console.warn("credenciaisForm inválido no localStorage");
    return;
  }

  if (!Array.isArray(arr)) return;

  arr.forEach(item => {
    if (!item.id) return;

    const input = document.getElementById(item.id);
    if (input && typeof item.value === "string") {
      input.value = item.value;
    }
  });
});

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


function limparCredenciais() {
  ["terminalId", "clientId", "bearerToken"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}


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


function abrirPopupBodyAutorizado() {
  const modal = new bootstrap.Modal(
    document.getElementById("popupBodyAutorizado")
  );
  modal.show();
}

function abrirPopupBodyMIT() {
  const modal = new bootstrap.Modal(
    document.getElementById("popupBodyMIT")
  );
  modal.show();
}

function abrirPopupBodygenerico() {
  const modal = new bootstrap.Modal(
    document.getElementById("popupBodygenerico")
  );
  modal.show();
}

/* ===================== HELPERS ===================== */
const isoDateTimeRegex =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

// Seleciona os checkboxes
const chkMIT = document.getElementById("chkMIT");
const chkAuth = document.getElementById("chkAuth");

// Função para atualizar visibilidade
function atualizarOpcaoMutua() {
  if (chkMIT.checked) {
    // Se MIT estiver ativo, desativa/oculta Pagamentos Autorizados
    chkAuth.parentElement.style.display = "none";
  } else if (chkAuth.checked) {
    // Se Autorizados estiver ativo, desativa/oculta MIT
    chkMIT.parentElement.style.display = "none";
  } else {
    // Se nenhum estiver ativo, mostra ambos
    chkMIT.parentElement.style.display = "inline-flex";
    chkAuth.parentElement.style.display = "inline-flex";
  }
}

// Adiciona eventos onchange
chkMIT.addEventListener("change", atualizarOpcaoMutua);
chkAuth.addEventListener("change", atualizarOpcaoMutua);

// Inicializa visibilidade ao carregar a página
atualizarOpcaoMutua();

function get(obj, path) {
  return path.split('.').reduce((o, k) => o && o[k], obj);
}

function stringOk(v) {
  return typeof v === "string" && v.trim() !== "";
}

function limparJson() {
  const textarea = document.getElementById("jsonInput");
  textarea.value = "";
  textarea.focus();
}

function toggleMIT() {
  const isChecked = document.getElementById("chkMIT").checked;
}

function atualizarCamposVisiveis() {
  const chkCheckout = document.getElementById("chkGenerateCheckout").checked;
  const chkPaymentMethods = document.getElementById("chkPaymentMethods").checked;
  const div = document.getElementById("paymentMethodsInputs");
  const btnLimpar = document.getElementById("btnLimparCredenciais");

  // Mostrar se qualquer um dos dois checkboxes estiver ativo
  if (chkCheckout || chkPaymentMethods) {
    div.classList.remove("hidden");
  } else {
    div.classList.add("hidden");
  }

  if (btnLimpar) {
    btnLimpar.style.display = (chkCheckout || chkPaymentMethods) ? "inline-block" : "none";
  }

  // Verificar se os dois checkboxes estão ativos
  const credenciais = JSON.parse(localStorage.getItem("credenciaisForm") || "[]");
  let btnSync = document.getElementById("btnSyncCredenciais");

  if ((chkCheckout || chkPaymentMethods) && credenciais.length > 0) {
    if (!btnSync) {
      btnSync = document.createElement("button");
      btnSync.id = "btnSyncCredenciais";
      btnSync.className = "btn btn-primary";
      btnSync.style.marginLeft = "8px";
      btnSync.textContent = "Sincronizar dados";
      btnSync.onclick = () => sincronizarCredenciais();
      btnLimpar?.parentNode.insertBefore(btnSync, btnLimpar.nextSibling);
    }
    btnSync.style.display = "inline-block";
  } else if (btnSync) {
    btnSync.style.display = "none";
  }
}

// Função para sincronizar os dados do localStorage para os inputs
function sincronizarCredenciais() {
  const credenciais = JSON.parse(localStorage.getItem("credenciaisForm") || "[]");

  if (!credenciais.length) {
    showErrorModal("Não tem dados para sincronizar!");
    return;
  }

  credenciais.forEach(item => {
    const input = document.getElementById(item.id);
    if (input) input.value = item.value || "";
  });
}

function toggleCheckout() {
  const isChecked = document.getElementById("chkGenerateCheckout").checked;

  const colJson = document.getElementById("colJson");
  const colResultado = document.getElementById("colResultado");
  const colCheckout = document.getElementById("checkoutResultCol");

  if (isChecked) {
    // Mostrar checkout → 3 colunas iguais
    colCheckout.style.display = "block";

    colJson.className = "col-md-4";
    colResultado.className = "col-md-4";
    colCheckout.className = "col-md-4";
  } else {
    // Esconder checkout → 2 colunas largas
    colCheckout.style.display = "none";

    colJson.className = "col-md-6";
    colResultado.className = "col-md-6";
  }

  atualizarCamposVisiveis();
}


function togglePaymentMethods() {
  atualizarCamposVisiveis();
}


function validarAuthMandate(rows, body) {

  /* ===================== POSICIONAMENTO ===================== */

  // customerInfo não pode estar dentro de outros nós
  if (body.merchant?.customerInfo || body.merchant?.customer?.customerInfo) {
    rows.push({
      campo: "merchant.customerInfo",
      valor: JSON.stringify(body.merchant.customerInfo ?? body.merchant.customer?.customerInfo),
      status: "ERRO",
      msg: "customerInfo não pode estar dentro do merchant"
    });
  }

  if (body.transaction?.customerInfo || body.transaction?.customer?.customerInfo) {
    rows.push({
      campo: "transaction.customerInfo",
      valor: JSON.stringify(body.transaction.customerInfo ?? body.transaction.customer?.customerInfo),
      status: "ERRO",
      msg: "customerInfo não pode estar dentro do transaction"
    });
  }

  if (body.mandate?.customerInfo) {
    rows.push({
      campo: "mandate.customerInfo",
      valor: JSON.stringify(body.mandate.customerInfo),
      status: "ERRO",
      msg: "customerInfo não pode estar dentro do mandate"
    });
  }

  // mandate não pode estar dentro de outros nós
  if (body.merchant?.mandate) {
    rows.push({
      campo: "merchant.mandate",
      valor: JSON.stringify(body.merchant.mandate),
      status: "ERRO",
      msg: "mandate não pode estar dentro do merchant"
    });
  }

  if (body.transaction?.mandate) {
    rows.push({
      campo: "transaction.mandate",
      valor: JSON.stringify(body.transaction.mandate),
      status: "ERRO",
      msg: "mandate não pode estar dentro do transaction"
    });
  }

  if (body.customer?.mandate) {
    rows.push({
      campo: "customer.mandate",
      valor: JSON.stringify(body.customer.mandate),
      status: "ERRO",
      msg: "mandate não pode estar dentro do customer"
    });
  }

  /* ===================== MERCHANT ===================== */

  if (!body.merchant || typeof body.merchant !== "object") {
    rows.push({
      campo: "merchant",
      valor: "-",
      status: "ERRO",
      msg: "merchant é obrigatório"
    });
    return;
  }

  /* ===================== CUSTOMER ===================== */

  if (!body.customer || !body.customer.customerInfo) {
    rows.push({
      campo: "customer.customerInfo",
      valor: "-",
      status: "ERRO",
      msg: "customerInfo é obrigatório e deve estar fora do merchant/transaction/mandate"
    });
  } else {
    validarCampo(
      rows,
      "customer.customerInfo.customerName",
      body.customer.customerInfo.customerName,
      "string"
    );
  }

  /* ===================== TRANSACTION ===================== */

  if (!body.transaction || typeof body.transaction !== "object") {
    rows.push({
      campo: "transaction",
      valor: "-",
      status: "ERRO",
      msg: "transaction é obrigatório"
    });
    return;
  }

  const t = body.transaction;

  validarCampo(rows, "transaction.description", t.description, "string");

  /* ===================== PAYMENT METHOD ===================== */

  if (!Array.isArray(t.paymentMethod)) {
    rows.push({
      campo: "transaction.paymentMethod",
      valor: JSON.stringify(t.paymentMethod),
      status: "ERRO",
      msg: "paymentMethod tem de ser um array"
    });
  } else {
    const obrigatorios = ["MANDATE", "MBWAY"];
    const falta = obrigatorios.filter(m => !t.paymentMethod.includes(m));

    if (falta.length > 0) {
      rows.push({
        campo: "transaction.paymentMethod",
        valor: JSON.stringify(t.paymentMethod),
        status: "ERRO",
        msg: "paymentMethod deve conter obrigatoriamente MANDATE e MBWAY"
      });
    } else {
      rows.push({
        campo: "transaction.paymentMethod",
        valor: JSON.stringify(t.paymentMethod),
        status: "OK",
        msg: ""
      });
    }
  }

  /* ===================== MANDATE ===================== */

  if (!body.mandate || typeof body.mandate !== "object") {
    rows.push({
      campo: "mandate",
      valor: "-",
      status: "ERRO",
      msg: "mandate é obrigatório e deve estar fora do merchant/transaction/customer"
    });
  } else {
    validarCampo(rows, "mandate.mandateId", body.mandate.mandateId, "string");
  }
}

async function gerarCheckout() {
  const out = document.getElementById("checkoutResult");
  const colCheckout = document.getElementById("checkoutResultCol");
  out.innerHTML = "<p>A gerar checkout...</p>";

  const terminalId = document.getElementById("terminalId").value.trim();
  const clientId = document.getElementById("clientId").value.trim();
  const token = document.getElementById("bearerToken").value.trim();
  const jsonInput = document.getElementById("jsonInput").value.trim();

  if (!terminalId || !clientId || !token || !jsonInput) {
    out.innerHTML = "<p class='erro'>Preenche todos os campos e o JSON</p>";
    return;
  }

  let body;
  try {
    body = JSON.parse(jsonInput); // transforma texto em objeto
  } catch (err) {
    out.innerHTML = `<p class='erro'>JSON inválido: ${err.message}</p>`;
    return;
  }

  try {
    const response = await fetch("/api/validar-body_qly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, clientId, token })
    });

    const data = await response.json();

    // Guardar credenciais + dados do checkout
    const credenciaisForm = [
      { id: "terminalId", value: terminalId },
      { id: "clientId", value: clientId },
      { id: "bearerToken", value: token },
      { id: "formContext", value: data.formContext },
      { id: "transactionID", value: data.transactionID }
    ];

    sessionStorage.setItem("credenciaisForm", JSON.stringify(credenciaisForm));

    if (!response.ok) {
      out.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      return;
    }

    // Mostrar resultado do checkout
    out.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;

    // Tornar visível a coluna do checkout
    colCheckout.style.display = "block";

    // Adicionar botão "Gerar form com estas credenciais" logo abaixo de checkoutResult
    const card = colCheckout.querySelector(".card");
    const chkAuthAtivo = document.getElementById("chkAuth")?.checked;
    const btnExistente = document.getElementById("btnGerarForm");

      if (!chkAuthAtivo) {
        // Mostrar / criar botão
        if (!btnExistente) {
          const btnDiv = document.createElement("div");
          btnDiv.id = "btnGerarForm";
          btnDiv.classList.add("row", "mt-3");
          btnDiv.innerHTML = `
            <div>
              <button class="btn btn-success w-100" onclick="gerarForm()">
                Gerar form com estas credenciais
              </button>
            </div>
          `;
          const checkoutResultDiv = card.querySelector("#checkoutResult");
          checkoutResultDiv.insertAdjacentElement("afterend", btnDiv);
        } else {
          // Já existe → garantir que está visível
          btnExistente.style.display = "block";
        }
      } else {
        // chkAuthAtivo = true → esconder botão se existir
        if (btnExistente) {
          btnExistente.style.display = "none";
        }
      }


  } catch (e) {
    out.innerHTML = `<p class='erro'>Falha ao gerar checkout: ${e.message}</p>`;
  }
}


/* ===================== VALIDAÇÃO MIT ===================== */
function validarMIT(rows, body) {
  const chkMIT = document.getElementById("chkMIT").checked;

  // Se MIT existe mas checkbox não está marcado
  if (body.merchantInitiatedTransaction && !chkMIT) {
    rows.push({
      campo: "merchantInitiatedTransaction",
      valor: JSON.stringify(body.merchantInitiatedTransaction),
      status: "ERRO",
      msg: "merchantInitiatedTransaction só pode existir se MIT estiver ativo"
    });
    return; // não precisa validar nada se MIT não está ativo
  }

  if (!chkMIT) return; // se MIT não ativo e não existe no body, sai

  const mit = body.merchantInitiatedTransaction;

  // Verificar se MIT está dentro de merchant, transaction ou customer
  if (body.merchant?.merchantInitiatedTransaction) {
    rows.push({
      campo: "merchant.merchantInitiatedTransaction",
      valor: JSON.stringify(body.merchant.merchantInitiatedTransaction),
      status: "ERRO",
      msg: "merchantInitiatedTransaction não pode estar dentro do merchant"
    });
    return;
  }

  if (body.transaction?.merchantInitiatedTransaction) {
    rows.push({
      campo: "transaction.merchantInitiatedTransaction",
      valor: JSON.stringify(body.transaction.merchantInitiatedTransaction),
      status: "ERRO",
      msg: "merchantInitiatedTransaction não pode estar dentro do transaction"
    });
    return;
  }

  if (body.customer?.merchantInitiatedTransaction) {
    rows.push({
      campo: "customer.merchantInitiatedTransaction",
      valor: JSON.stringify(body.customer.merchantInitiatedTransaction),
      status: "ERRO",
      msg: "merchantInitiatedTransaction não pode estar dentro do customer"
    });
    return;
  }

  // Verificar se MIT existe no nível correto
  if (!mit) {
    rows.push({
      campo: "merchantInitiatedTransaction",
      valor: "-",
      status: "ERRO",
      msg: "merchantInitiatedTransaction obrigatório quando MIT ativo"
    });
    return;
  }

  // Campos obrigatórios do MIT
  validarCampo(rows, "merchantInitiatedTransaction.type", mit.type, "string");
  validarCampo(rows, "merchantInitiatedTransaction.amountQualifier", mit.amountQualifier, "string");

  // Campos obrigatórios do merchant
  if (!body.merchant || typeof body.merchant !== "object") {
    rows.push({ campo: "merchant", valor: "-", status: "ERRO", msg: "merchant obrigatório" });
  } else {
    validarCampo(rows, "merchant.terminalId", body.merchant.terminalId, "number");
    validarCampo(rows, "merchant.channel", body.merchant.channel, "string", v => v !== "web" ? 'merchant.channel deve ser "web"' : null);
    validarCampo(rows, "merchant.merchantTransactionId", body.merchant.merchantTransactionId, "string");
  }

  // Campos obrigatórios do transaction
  if (!body.transaction || typeof body.transaction !== "object") {
    rows.push({ campo: "transaction", valor: "-", status: "ERRO", msg: "transaction obrigatório" });
  } else {
    const t = body.transaction;
    validarCampo(rows, "transaction.transactionTimestamp", t.transactionTimestamp, "datetime");
    validarCampo(rows, "transaction.description", t.description, "string");
    validarCampo(rows, "transaction.moto", t.moto, "boolean");

    // Amount
    if (!t.amount || typeof t.amount !== "object") {
      rows.push({ campo: "transaction.amount", valor: "-", status: "ERRO", msg: "amount obrigatório" });
    } else {
      validarCampo(rows, "transaction.amount.value", t.amount.value, "number");
      validarCampo(rows, "transaction.amount.currency", t.amount.currency, "string", v => v !== "EUR" ? "currency deve ser EUR" : null);

      // Regras MIT
      if (mit.type === "UCOF" && t.amount.value !== 0) {
        rows.push({ campo: "transaction.amount.value", valor: t.amount.value, status: "ERRO", msg: "Para UCOF, amount.value deve ser 0" });
      }
      if (mit.type === "RCRR" && t.amount.value <= 0) {
        rows.push({ campo: "transaction.amount.value", valor: t.amount.value, status: "ERRO", msg: "Para RCRR, amount.value deve ser > 0" });
      }
    }

    // paymentMethod
    validarCampo(rows, "transaction.paymentMethod", t.paymentMethod, "array");
    if (mit.type === "UCOF" && (!Array.isArray(t.paymentMethod) || !t.paymentMethod.includes("CARD"))) {
      rows.push({ campo: "transaction.paymentMethod", valor: JSON.stringify(t.paymentMethod), status: "ERRO", msg: "Para UCOF, paymentMethod deve conter apenas CARD" });
    }

    // paymentType
    if (!t.paymentType || typeof t.paymentType !== "string" || t.paymentType.trim() === "") {
      rows.push({
        campo: "transaction.paymentType",
        valor: t.paymentType ?? "-",
        status: "ERRO",
        msg: "paymentType obrigatório e não pode estar vazio"
      });
    } else if (mit.type === "UCOF" && t.paymentType !== "AUTH") {
      rows.push({
        campo: "transaction.paymentType",
        valor: t.paymentType,
        status: "ERRO",
        msg: "Para UCOF, paymentType deve ser AUTH"
      });
    } else if (mit.type === "RCRR" && t.paymentType !== "PURS") {
      rows.push({
        campo: "transaction.paymentType",
        valor: t.paymentType,
        status: "ERRO",
        msg: "Para RCRR, paymentType deve ser PURS"
      });
    }

  }

  // Campos obrigatórios do customer
  if (!body.customer || !body.customer.customerInfo) {
    rows.push({ campo: "customer.customerInfo", valor: "-", status: "ERRO", msg: "customerInfo obrigatório" });
  } else {
    const ci = body.customer.customerInfo;
    validarCampo(rows, "customer.customerInfo.customerName", ci.customerName, "string");
    validarCampo(rows, "customer.customerInfo.customerEmail", ci.customerEmail, "string");
    validarEndereco(rows, "customer.customerInfo.billingAddress", ci.billingAddress, true);
    validarEndereco(rows, "customer.customerInfo.shippingAddress", ci.shippingAddress, false);
  }
}

/* ===================== VALIDAÇÃO GENÉRICA ===================== */
function validarCampo(rows, campo, valor, tipo, extra = null) {
  let ok = true;
  let msg = "";

  if (valor === undefined) {
    ok = false;
    msg = "Campo ausente";
  } else if (tipo === "string" && !stringOk(valor)) {
    ok = false;
    msg = "Campo obrigatório e não pode estar vazio ou é uma string";
  } else if (tipo === "array" && !Array.isArray(valor)) {
    ok = false;
    msg = "Deve ser array";
  } else if (tipo === "datetime" && !isoDateTimeRegex.test(valor)) {
    ok = false;
    msg = "Formato datetime inválido";
  } else if (tipo !== "array" && tipo !== "datetime" && typeof valor !== tipo) {
    ok = false;
    msg = `Deve ser ${tipo}`;
  }

  if (extra && ok) {
    const err = extra(valor);
    if (err) {
      ok = false;
      msg = err;
    }
  }

  rows.push({
    campo,
    valor: valor === undefined ? "-" : JSON.stringify(valor),
    status: ok ? "OK" : "ERRO",
    msg
  });
}

/* ===================== ENDEREÇOS ===================== */
function validarEndereco(rows, path, endereco, obrigatorio) {
  const campos = ["street1", "street2", "city", "postcode", "country"];

  if (!endereco) {
    if (obrigatorio) {
      rows.push({
        campo: path,
        valor: "-",
        status: "ERRO",
        msg: "Endereço obrigatório em pagamentos CARD",
        regra: true
      });
    }
    return;
  }

  const erros = campos.filter(c => {
    const valor = endereco[c];
    return valor === undefined || valor === null || typeof valor !== "string" || valor.trim() === "";
  });

  if (erros.length > 0) {
    erros.forEach(c => {
      rows.push({
        campo: `${path}.${c}`,
        valor: endereco[c] ?? "-",
        status: "ERRO",
        msg: "Campo obrigatório e tem de ser uma string não vazia"
      });
    });
  } else {
    rows.push({
      campo: path,
      valor: "[OK]",
      status: "OK",
      msg: ""
    });
  }
}


/* ===================== VALIDAÇÃO MÉTODOS DE PAGAMENTO ===================== */
async function validarAcordos(rows) {
  const terminalId = document.getElementById("terminalId").value.trim();
  const clientId = document.getElementById("clientId").value.trim();
  const token = document.getElementById("bearerToken").value.trim();

  if (!terminalId || !clientId || !token) return;

  const requestData = {
    nome: "teste",
    terminalID: terminalId,
    clientId: clientId,
    token: token
  };

  try {
    // Chamada ao proxy Node.js
    const response = await fetch('/api/validar-clientid_qly', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();

    if (!response.ok) {
      rows.push({
        campo: "Acordos deste terminal",
        valor: JSON.stringify(data),
        status: "ERRO",
        msg: `Erro do servidor: ${response.status}`
      });
      return;
    }

    rows.push({
      campo: "Acordos deste terminal",
      valor: JSON.stringify(data.paymentMethodList),
      status: "OK",
      msg: ""
    });

  } catch (e) {
    rows.push({
      campo: "Acordos deste terminal",
      valor: "-",
      status: "ERRO",
      msg: "Falha ao comunicar com o proxy: " + e.message
    });
  }
}



/* ===================== PAYMENT REFERENCE ===================== */
function validarPaymentReference(rows, pr) {
  const erros = [];

  const onlyDigits = /^\d+$/; // apenas números

  if (!isoDateTimeRegex.test(pr.initialDatetime)) erros.push("initialDatetime");
  if (!isoDateTimeRegex.test(pr.finalDatetime)) erros.push("finalDatetime");

  if (!stringOk(pr.entity)) {
    erros.push("entity");
  } else if (!onlyDigits.test(pr.entity)) {
    erros.push("entity");
    rows.push({
      campo: "transaction.paymentReference.entity",
      valor: pr.entity,
      status: "ERRO",
      msg: "entity deve conter apenas números"
    });
  }

  if (!pr.maxAmount || typeof pr.maxAmount.value !== "number" || pr.maxAmount.currency !== "EUR") erros.push("maxAmount");
  if (!pr.minAmount || typeof pr.minAmount.value !== "number" || pr.minAmount.currency !== "EUR") erros.push("minAmount");

  // Validar maxAmount
  if (!Number.isInteger(pr.maxAmount.value)) {
    erros.push("maxAmount");
    rows.push({
      campo: "transaction.paymentReference.maxAmount.value",
      valor: pr.maxAmount.value,
      status: "ERRO",
      msg: "maxAmount.value tem de ser um número inteiro"
    });
    return;
  }

  // Validar minAmount
  if (!Number.isInteger(pr.minAmount.value)) {
    erros.push("minAmount");
    rows.push({
      campo: "transaction.paymentReference.minAmount.value",
      valor: pr.minAmount.value,
      status: "ERRO",
      msg: "minAmount.value tem de ser um número inteiro"
    });
    return;
  }

  if (typeof pr.maxAmount?.value === "number" && typeof pr.minAmount?.value === "number" && pr.maxAmount.value < pr.minAmount.value) {
    rows.push({
      campo: "transaction.paymentReference.maxAmount.value",
      valor: pr.maxAmount.value,
      status: "ERRO",
      msg: "maxAmount.value tem de ser maior que minAmount.value",
      regra: true
    });
    return;
  }

  if (erros.length === 0) {
    rows.push({
      campo: "transaction.paymentReference",
      valor: "[OK]",
      status: "OK",
      msg: ""
    });
  } else {
    erros.forEach(e => {
      if (e !== "entity") { // já tratamos entity separadamente
        rows.push({
          campo: `transaction.paymentReference.${e}`,
          valor: "-",
          status: "ERRO",
          msg: "Campo obrigatório inválido ou vazio"
        });
      }
    });
  }
}

/* ===================== VALIDAÇÃO PRINCIPAL ===================== */
async function validar() {

  const PAYMENT_METHODS_VALIDOS = ["REFERENCE", "CARD", "MBWAY"];

  const SCHEMA = {
    merchant: {
      terminalId: "number",
      channel: "string",
      merchantTransactionId: "string"
    },
    transaction: {
      transactionTimestamp: "string",
      description: "string",
      moto: "boolean",
      paymentType: "string",
      amount: {
        value: "number",
        currency: "string"
      },
      paymentMethod: "array",
      paymentReference: {
        initialDatetime: "string",
        finalDatetime: "string",
        maxAmount: {
          value: "number",
          currency: "string"
        },
        minAmount: {
          value: "number",
          currency: "string"
        },
        entity: "string"
      }
    },
    customer: {
      customerInfo: {
        customerName: "string",
        customerEmail: "string",
        shippingAddress: {
          street1: "string",
          street2: "string",
          city: "string",
          postcode: "string",
          country: "string"
        },
        billingAddress: {
          street1: "string",
          street2: "string",
          city: "string",
          postcode: "string",
          country: "string"
        }
      }
    }
  };

  const chkAuthAtivo = document.getElementById("chkAuth")?.checked;
  const chkMITAtivo = document.getElementById("chkMIT")?.checked;
  const chkGenerateCheckout = document.getElementById("chkGenerateCheckout")?.checked;
  const chkPaymentMethods = document.getElementById("chkPaymentMethods")?.checked;

  const out = document.getElementById("resultado");
  out.innerHTML = "";

  const terminalId = document.getElementById("terminalId").value.trim();
  const clientId = document.getElementById("clientId").value.trim();
  const token = document.getElementById("bearerToken").value.trim();
  const jsonInput = document.getElementById("jsonInput").value.trim();

  // Guardar credenciais + dados do checkout
  const credenciaisForm = [
    { id: "terminalId", value: terminalId },
    { id: "clientId", value: clientId },
    { id: "bearerToken", value: token }
  ];

  localStorage.setItem("credenciaisForm", JSON.stringify(credenciaisForm));

  // Validação dos inputs obrigatórios
  if (!jsonInput) {
    showErrorModal("Por favor preencher o input com o body a validar");
    return;
  }

  if ((chkPaymentMethods || chkGenerateCheckout) && (!terminalId || !clientId || !token || !jsonInput)) {
    showErrorModal("Por favor preencher os inputs Terminal ID, Client ID e Bearer Token");
    return;
  }


  let body;
  try {
    body = JSON.parse(document.getElementById("jsonInput").value);

  } catch (e) {
    console.error(e);
    out.innerHTML = "<p class='erro'>❌ JSON inválido: " + e.message + "</p>";
    return;
  }


  const rows = [];

  /* ===================== VALIDAÇÃO MERCHANT ===================== */
if (!body.merchant || typeof body.merchant !== "object") {
  rows.push({
    campo: "merchant",
    valor: "-",
    status: "ERRO",
    msg: "merchant deve existir e ser um objeto"
  });
} else {
  validarCampo(rows,"merchant.terminalId", body.merchant.terminalId,"number");

  // Validar channel obrigatório "web"
  if (body.merchant.channel !== "web") {
    rows.push({
      campo: "merchant.channel",
      valor: JSON.stringify(body.merchant.channel),
      status: "ERRO",
      msg: 'merchant.channel deve ser sempre "web"'
    });
  } else {
    rows.push({
      campo: "merchant.channel",
      valor: JSON.stringify(body.merchant.channel),
      status: "OK",
      msg: ""
    });
  }

  validarCampo(rows,"merchant.merchantTransactionId", body.merchant.merchantTransactionId,"string");
}

/* ===================== VALIDAÇÃO TRANSACTION ===================== */
if (!body.transaction || typeof body.transaction !== "object") {
  rows.push({
    campo: "transaction",
    valor: "-",
    status: "ERRO",
    msg: "transaction deve existir e ser um objeto"
  });
} else {
    const t = body.transaction;

    // Campos obrigatórios
    validarCampo(rows,"transaction.transactionTimestamp", t.transactionTimestamp,"datetime");
    validarCampo(rows,"transaction.amount.value", t.amount?.value,"number");
    validarCampo(rows,"transaction.amount.currency", t.amount?.currency,"string",
      v => v !== "EUR" ? "Currency tem de ser EUR" : null);
    if(!chkAuthAtivo){
      validarCampo(rows,"transaction.paymentMethod", t.paymentMethod,"array");
    }
    validarCampo(rows,"transaction.moto", t.moto,"boolean");

    // paymentType fixo "PURS"
    // Só validar PURS se não for MIT
    const chkMIT = document.getElementById("chkMIT").checked;

    if (!chkMIT) {
      if (t.paymentType !== "PURS") { 
        rows.push({
          campo: "transaction.paymentType",
          valor: JSON.stringify(t.paymentType),
          status: "ERRO",
          msg: 'transaction.paymentType deve ser sempre "PURS"'
        });
      } else {
        rows.push({
          campo: "transaction.paymentType",
          valor: JSON.stringify(t.paymentType),
          status: "OK",
          msg: ""
        });
      }
    }


    // paymentReference só existe se tiver REFERENCE no paymentMethod
    if (Array.isArray(t.paymentMethod) && t.paymentMethod.includes("REFERENCE")) {
      const pr = t.paymentReference;
      if (!pr) {
        rows.push({
          campo: "transaction.paymentReference",
          valor: "-",
          status: "ERRO",
          msg: "paymentReference obrigatório quando o método REFERENCE está incluido no paymentMethod"
        });
      } else {
        validarPaymentReference(rows, pr);
      }
    }

    // Dentro da validação principal, depois de validar paymentMethod
    if (Array.isArray(t.paymentMethod) && t.paymentMethod.includes("CARD")) {
      // Verificar se customer existe fora do transaction
      if (!body.customer || !body.customer.customerInfo) {
        rows.push({
          campo: "customer.customerInfo",
          valor: "-",
          status: "ERRO",
          msg: "customerInfo obrigatório quando o método CARD está incluido no paymentMethod"
        });
      } else {
        const ci = body.customer.customerInfo;
        validarCampo(rows, "customer.customerInfo.customerName", ci.customerName, "string");
        validarCampo(rows, "customer.customerInfo.customerEmail", ci.customerEmail, "string");
        validarEndereco(rows, "customer.customerInfo.billingAddress", ci.billingAddress, true);
        validarEndereco(rows, "customer.customerInfo.shippingAddress", ci.shippingAddress, false);
      }
    }

    // Verificar se paymentReference está fora do transaction (erro)
    if (body.paymentReference) {
      rows.push({
        campo: "paymentReference",
        valor: JSON.stringify(body.paymentReference),
        status: "ERRO",
        msg: "paymentReference não pode estar fora do transaction"
      });
    }

    // Verificar se customerInfo está dentro do transaction (erro)
    if (t.customer?.customerInfo) {
      rows.push({
        campo: "transaction.customer.customerInfo",
        valor: JSON.stringify(t.customer.customerInfo),
        status: "ERRO",
        msg: "customerInfo não pode estar dentro do transaction"
      });
    }
  }


  /* ===================== VALIDAÇÃO CUSTOMER ===================== */
  if (body.customer) {
    const ci = body.customer.customerInfo;
    if (!ci) {
      rows.push({
        campo: "customer.customerInfo",
        valor: "-",
        status: "ERRO",
        msg: "customerInfo deve existir fora do transaction"
      });
    }
  }

  // Se checkbox métodos de pagamento ativo
  if (document.getElementById("chkPaymentMethods").checked) {
    await validarAcordos(rows);
  }

  const chkMIT = document.getElementById("chkMIT").checked;

  // Se existir MIT mas checkbox não está marcado
  if (body.merchantInitiatedTransaction && !chkMIT) {
    rows.push({
      campo: "merchantInitiatedTransaction",
      valor: JSON.stringify(body.merchantInitiatedTransaction),
      status: "ERRO",
      msg: "merchantInitiatedTransaction só pode existir se MIT estiver ativo"
    });
  }

  if (!chkAuthAtivo) {
    // Campos que só podem existir se pagamentos autorizados estiverem ativos
    if (Array.isArray(body.transaction?.paymentMethod) && body.transaction.paymentMethod.includes("MANDATE")) {
      rows.push({
        campo: "transaction.paymentMethod",
        valor: JSON.stringify(body.transaction.paymentMethod),
        status: "ERRO",
        msg: 'O método "MANDATE" é exclusivo para Pagamentos Autorizados'
      });
    }

    if (body.mandate) {
      rows.push({
        campo: "mandate",
        valor: JSON.stringify(body.mandate),
        status: "ERRO",
        msg: "Este campo é exclusivo para Pagamentos Autorizados"
      });
    }
  }

  // Se o checkbox de gerar checkout estiver ativo
  const chkCheckout = document.getElementById("chkGenerateCheckout").checked;
  if (chkCheckout) {
    gerarCheckout(body);
  }

  // ALERTA CAMPOS INAPROPRIADOS CONFORME CHECKBOX
  if (!chkMITAtivo) {
    // Campos que só podem existir se MIT estiver ativo
    if (body.merchantInitiatedTransaction) {
      rows.push({
        campo: "merchantInitiatedTransaction",
        valor: JSON.stringify(body.merchantInitiatedTransaction),
        status: "ERRO",
        msg: "Este campo é exclusivo para MITs (merchantInitiatedTransaction só pode existir se MIT estiver ativo)"
      });
    }
  }else{
    validarMIT(rows, body);
  }

  if (Array.isArray(body.transaction?.paymentMethod)) {
    body.transaction.paymentMethod.forEach((pm, index) => {
      if (!PAYMENT_METHODS_VALIDOS.includes(pm)) {
        rows.push({
          campo: `transaction.paymentMethod[${index}]`,
          valor: JSON.stringify(pm),
          status: "ERRO",
          msg: `Método inválido. Permitidos: ${PAYMENT_METHODS_VALIDOS.join(", ")}`
        });
      }
    });
  } else if (body.transaction?.paymentMethod !== undefined) {
    rows.push({
      campo: "transaction.paymentMethod",
      valor: JSON.stringify(body.transaction.paymentMethod),
      status: "ERRO",
      msg: "paymentMethod deve ser um array"
    });
  }

  if (chkAuthAtivo) {
    validarAuthMandate(rows, body);
  }

  validarCamposDesconhecidos(rows, body, SCHEMA);

  // Gerar tabela
  let html = `<table>
    <thead>
      <tr>
        <th>Campo</th>
        <th>Valor</th>
        <th>Status</th>
        <th>Mensagem</th>
      </tr>
    </thead>
    <tbody>`;

  rows.forEach(r => {
    html += `<tr>
      <td>${r.campo}${r.regra ? "<span class='badge'>Regras</span>" : ""}</td>
      <td>${r.valor}</td>
      <td class="${r.status === "OK" ? "ok" : "erro"}">${r.status === "OK" ? "Correto" : "Incorreto"}</td>
      <td>${r.msg}</td>
    </tr>`;
  });

  html += `</tbody></table>`;

  if (chkAuthAtivo) {
    html += `
      <div class="row mt-3 g-2">
        <div class="col-md-6">
          <button class="btn btn-warning w-100" onclick="abrirPopupBodyAutorizado()">
            Ver exemplo de body de pagamentos autorizados
          </button>
        </div>

        <div class="col-md-6">
          <a href="validador_multifuncoes/validador_multifuncoes.html" class="btn btn-secondary w-100">
            Fazer Mandato
          </a>
        </div>
      </div>
    `;
  }

  if (chkMITAtivo) {
    html += `
      <div class="row mt-3">
        <div>
          <button class="btn btn-warning w-100" onclick="abrirPopupBodyMIT()">
            Ver exemplo de body de CIT
          </button>
        </div>
      </div>
      `;
    }

    if (!chkMITAtivo && !chkAuthAtivo) {
      html += `
        <div class="row mt-3">
          <div>
            <button class="btn btn-warning w-100" onclick="abrirPopupBodygenerico()">
              Ver exemplo de body
            </button>
          </div>
        </div>
      `;
    }

  out.innerHTML = html;
}

function gerarForm() {
  // Redirecionar para a página do form
  window.location.href = '/validador_form/validador_form.html?validador=1';
}

function preencherExemplo() {
  // JSON de exemplo
  const exemploJSON = {
    "merchant": {
      "terminalId": 96167,
      "channel": "web",
      "merchantTransactionId": "SYN2965-57629"
    },
    "transaction": {
      "transactionTimestamp": "2026-12-23T15:03:56.971Z",
      "description": "teste",
      "moto": false,
      "paymentType": "PURS",
      "amount": {
        "value": 1,
        "currency": "EUR"
      },
      "paymentMethod": []
    }
  };

  // Preenche o textarea do JSON
  const jsonInput = document.getElementById("jsonInput");
  jsonInput.value = JSON.stringify(exemploJSON, null, 2);

  // Preenche os campos fixos de credenciais
  document.getElementById("terminalId").value = "96167";
  document.getElementById("clientId").value = "dd4348ea-e240-4356-bf06-6a4f294c1077";
  document.getElementById("bearerToken").value = "0267adfae94c224be1b374be2ce7b298f0.eyJlIjoiMjA3MDcwMDU2ODEyNSIsInJvbGVzIjoiTUFOQUdFUiIsInRva2VuQXBwRGF0YSI6IntcIm1jXCI6XCI1MDY5MzFcIixcInRjXCI6XCI5NjE2N1wifSIsImkiOiIxNzU1MTY3NzY4MTI1IiwiaXMiOiJodHRwczovL3FseS5zaXRlMS5zc28uc3lzLnNpYnMucHQvYXV0aC9yZWFsbXMvREVWLlNCTy1JTlQuUE9SVDEiLCJ0eXAiOiJCZWFyZXIiLCJpZCI6ImhtVmRVQ1lhU1NmOGIzMWRmY2JlMWQ0MDFlODc5OTdhZGY0ZTE1ZmM1MSJ9.71920d8b517e515a61b32b813872e5b967a06471fa63428ff66d32f83f4ce25e32548a4a8e9cf6545e2f5c6e47979b408a4f3bb2367329d71fafdec4d49af223";
}

function validarCamposDesconhecidos(rows, objeto, schema, path = "") {
  if (!objeto || typeof objeto !== "object") return;

  Object.keys(objeto).forEach(key => {
    const fullPath = path ? `${path}.${key}` : key;

    if (!schema[key]) {
      rows.push({
        campo: fullPath,
        valor: JSON.stringify(objeto[key]),
        status: "ERRO",
        msg: "Campo não reconhecido ou mal escrito"
      });
      return;
    }

    // Se for objeto aninhado, validar recursivamente
    if (
      typeof schema[key] === "object" &&
      typeof objeto[key] === "object" &&
      !Array.isArray(objeto[key])
    ) {
      validarCamposDesconhecidos(rows, objeto[key], schema[key], fullPath);
    }
  });
}


function verMandatos() {
  alert("Abrir listagem de mandatos (aqui podes ligar à API ou nova página)");
}
    