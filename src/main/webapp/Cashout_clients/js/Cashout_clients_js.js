function limparCredenciais() {
  ["terminalId", "clientId", "bearerToken"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
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


//Cashout
async function getCashout() {

  const credential_default = JSON.parse(localStorage.getItem('credential_default')) || {};
  const credential_config = JSON.parse(localStorage.getItem('credential_config')) || {};
  const default_Configs = localStorage.getItem('default'); // Normalmente é string "0" ou "1"

  let validadeinput  = document.getElementById("validadeinput")?.value?.trim();
  let cartaoinput    = document.getElementById("cartaoinput")?.value?.trim();

  let clientId;
  let bearerToken;
  let terminalId;

  let finalData = {};

  if (default_Configs === "0" && credential_config.useDefaultConfig === "true") {
    finalData = {
      clientId: credential_default.clientId,
      token: credential_default.bearerToken,
      terminalId: credential_default.terminalId
    };
  } else {
    finalData = {
      clientId: credential_config.clientId || inputClientId?.value,
      token: credential_config.bearerToken || inputBearerToken?.value,
      terminalId: credential_config.terminalId || inputTerminalId?.value
    };
  }

  clientId = finalData.clientId;
  bearerToken = finalData.token;
  terminalId = finalData.terminalId;

  let montanteinput = document.getElementById("montanteinput")?.value?.trim();
  let aliasinput    = document.getElementById("aliasinput")?.value?.trim();

  if (validadeinput && validadeinput.length === 5) {
      const partes = validadeinput.split('/');
      const mes = partes[0].padStart(2, '0');
      const ano = "20" + partes[1];

      validadeinput = `${ano}-${mes}-10T00:00:00.000Z`;
  } else {
      validadeinput = "2028-03-31T00:00:00.000Z";
  }


  if (/\D/.test(aliasinput.replace("351#", ""))) {
      showErrorModal("O número de telefone não pode conter letras ou caracteres especiais.");
      return;
  }

  if (aliasinput !== "") {
      aliasinput = "351#" + aliasinput.replace("351#", "");
  }

  if (!cartaoinput) {
    showErrorModal("O cartão tem que estar preenchido.");
    return;
  }

  if (!validadeinput) {
    showErrorModal("A validade tem que estar preenchida.");
    return;
  }

  if (!montanteinput) {
    showErrorModal("O montante tem que estar preenchido.");
    return;
  }

  if (!aliasinput) {
    showErrorModal("O número de telefone tem que estar preenchido.");
    return;
  }

  if (!terminalId || !clientId || !bearerToken || !aliasinput || !montanteinput || !cartaoinput || !validadeinput) {
    showErrorModal("Todos os campos têm de estar preenchidos.");
    return;
  }


  document.getElementById("CashoutPagamento").innerText = "...";
  document.getElementById("CashoutCode").innerText = "CODE: -";
  document.getElementById("bodyCompletoCashout").innerText = "{}";

  const prefix = window.location.hostname === '127.0.0.1' ? '' : '/SimuladorSIBS';


  try {

    const params = new URLSearchParams({clientId, bearerToken});
    const response = await fetch(`${prefix}/api/Cashout_clients?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terminalId, montanteinput, aliasinput, validadeinput, cartaoinput })
    });

    const data = await response.json();
    
    document.getElementById("bodyCompletoCashout").innerText = JSON.stringify(data, null, 2);

    const codigoMostrar = data?.returnStatus?.statusCode ?? data?.statusCode ?? data?.status ?? "N/A";
    document.getElementById("CashoutCode").innerText = `CODE: ${codigoMostrar}`;

    const status = data?.returnStatus?.statusMsg ?? data?.statusMsg ?? data?.message ?? "-";
    document.getElementById("CashoutPagamento").innerText = status;

    if (status === "Success") {
      document.getElementById("CashoutPagamento").className = "h4 fw-bold text-success mt-1";
    } else {
      document.getElementById("CashoutPagamento").className = "h4 fw-bold text-danger mt-1";
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
    document.getElementById("CashoutPagamento").innerText = "ERRO";
    document.getElementById("CashoutPagamento").className = "h4 fw-bold text-danger mt-1";
    document.getElementById("bodyCompletoCashout").innerText = JSON.stringify({ error: err.message }, null, 2);
  }
}

document.getElementById('validadeinput').addEventListener('input', function (e) {
  var v = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,2})/);
  e.target.value = !v[2] ? v[1] : v[1] + '/' + v[2];
});


let panReal = ""; // Aqui guardamos os números verdadeiros

document.getElementById('cartaoinput').addEventListener('input', function(e) {
    let input = e.target;
    let valorAtual = input.value;

    // 1. Se o utilizador apagou (backspace), limpamos a nossa memória
    if (valorAtual.length < panReal.length) {
        panReal = panReal.substring(0, valorAtual.length);
    } 
    else {
        // 2. Pegamos apenas o último caractere digitado
        let ultimoChar = valorAtual.slice(-1);

        // 3. Se for um número e não exceder 16 dígitos, guardamos
        if (/\d/.test(ultimoChar) && panReal.length < 16) {
            panReal += ultimoChar;
        }
    }

    // 4. Gerar a máscara para mostrar no input
    let mascara = "";
    for (let i = 0; i < panReal.length; i++) {
        if (i >= 6 && i <= 11) {
            mascara += "*"; // Mascarar do índice 6 ao 11 (6 dígitos centrais)
        } else {
            mascara += panReal[i]; // Mostrar número real no início e no fim
        }
    }

    input.value = mascara;
});