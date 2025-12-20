/* ===================== HELPERS ===================== */
const isoDateTimeRegex =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function get(obj, path) {
  return path.split('.').reduce((o, k) => o && o[k], obj);
}

function stringOk(v) {
  return typeof v === "string" && v.trim() !== "";
}

function toggleMIT() {
  const isChecked = document.getElementById("chkMIT").checked;
  console.log("MIT:", isChecked);
}

function atualizarCamposVisiveis() {
  const chkCheckout = document.getElementById("chkGenerateCheckout").checked;
  const chkPaymentMethods = document.getElementById("chkPaymentMethods").checked;
  const div = document.getElementById("paymentMethodsInputs");

  // Mostrar se qualquer um dos dois checkboxes estiver ativo
  if (chkCheckout || chkPaymentMethods) {
    div.classList.remove("hidden");
  } else {
    div.classList.add("hidden");
  }
}

function toggleCheckout() {
  const isChecked = document.getElementById("chkGenerateCheckout").checked;
  document.getElementById("checkoutResultCol").style.display = isChecked ? "block" : "none";
  atualizarCamposVisiveis();
}

function togglePaymentMethods() {
  atualizarCamposVisiveis();
}



async function gerarCheckout(body) {
  const out = document.getElementById("checkoutResult");
  out.innerHTML = "<p>A gerar checkout...</p>";

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
    const response = await fetch("/api/validar-clientid_qly", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();

    if (!response.ok) {
      out.innerHTML = `<p class='erro'>Erro ao gerar checkout: ${response.status}</p>`;
      return;
    }

    // Mostrar resultado completo da API na coluna
    out.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
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
  const out = document.getElementById("resultado");
  out.innerHTML = "";

  let body;
  try {
    body = JSON.parse(document.getElementById("jsonInput").value);
  } catch {
    out.innerHTML = "<p class='erro'>❌ JSON inválido</p>";
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
    validarCampo(rows,"transaction.paymentMethod", t.paymentMethod,"array");
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
    /*else {
      validarCampo(rows,"customer.customerInfo.customerName",ci.customerName,"string");
      validarCampo(rows,"customer.customerInfo.customerEmail",ci.customerEmail,"string");
      validarEndereco(rows,"customer.customerInfo.billingAddress",ci.billingAddress,true);
      validarEndereco(rows,"customer.customerInfo.shippingAddress",ci.shippingAddress,false);
    } */
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
  
  // Se o checkbox de gerar checkout estiver ativo
  const chkCheckout = document.getElementById("chkGenerateCheckout").checked;
  if (chkCheckout) {
    gerarCheckout(body);
  }

  validarMIT(rows, body);

  // Gerar tabela
  let html = `<table>
      <tr>
        <th>Campo</th>
        <th>Valor</th>
        <th>Status</th>
        <th>Mensagem</th>
      </tr>`;
  rows.forEach(r => {
    html += `<tr>
      <td>${r.campo}${r.regra ? "<span class='badge'>Regras</span>" : ""}</td>
      <td>${r.valor}</td>
      <td class="${r.status === "OK" ? "ok" : "erro"}">${r.status}</td>
      <td>${r.msg}</td>
    </tr>`;
  });
  html += "</table>";
  out.innerHTML = html;
}




