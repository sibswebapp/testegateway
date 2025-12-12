document.getElementById("fileInput").addEventListener("change", async function(event) {
    const file = event.target.files[0];
    if (!file) return;
    await lerCSV(file);
});

// Lê o excel
async function lerCSV(file) {
    const reader = new FileReader();

    reader.onload = async function(e) {
        const linhas = e.target.result.split("\n");

        // Começar da linha 2 para ignorar cabeçalho
        for (let i = 1; i < linhas.length; i++) {
            let linha = linhas[i].trim();
            if (!linha) continue;

            // Detecta separador , ou ;
            const colunas = linha.includes(';') ? linha.split(';').map(c => limpar(c))
                                               : linha.split(',').map(c => limpar(c));

            const nome = colunas[0] || "";    
            const terminalID = colunas[1] || "";
            const clientId = colunas[2] || ""; 
            const token = colunas[3] || "";   

            /*if (!linhaValida(terminalID, clientId, token)) {
                adicionarNaTabela(nome, clientId, "❌ erro", "Todos os campos obrigatórios não estão preenchidos");
                continue;
            }*/

            if (terminalID, clientId, token, nome) {
                await chamarAPI(nome, clientId, token, terminalID);
            }
        }
    };

    reader.readAsText(file, "UTF-8");
}

// Validação dos campos obrigatórios
function linhaValida(terminalID, clientId, token) {
    return terminalID !== "" && clientId !== "" && token !== "";
}

// Limpeza de caracteres inválidos
function limpar(valor) {
    if (!valor) return "";
    const texto = String(valor).trim();
    if (/^[;,.]+$/.test(texto)) return "";
    return texto;
}


// Função da chama a API 
async function chamarAPI(nome, clientId, token, terminalID) {
    let estado = "";
    let erro = "";

    try {
        const response = await fetch("http://127.0.0.1:8002/pagar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, clientId, token, terminalID })
        });

        const data = await response.json();

        const status = data?.returnStatus;
        if ((status?.statusCode === "000" && status?.statusMsg === "Success") || status?.statusCode === "T9999") {
            estado = "✔️ Sucesso";
            erro = ""; 
        } else {
            estado = "❌ Erro";
            erro = status
                ? `${status.statusCode} - ${status.statusMsg}: ${status.statusDescription}`
                : JSON.stringify(data);
        }

    } catch (e) {
        estado = "❌ Não Sucesso";
        erro = e.message || "Erro ao chamar API";
    }

    // Adiciona o resultado na tabela
    adicionarNaTabela(nome, clientId, estado, erro, terminalID);
}


function adicionarNaTabela(nome, clientId, estado, erro, terminalID) {
    const tbody = document.getElementById("resultadoTabela");
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${nome}</td>
        <td>${terminalID}</td>
        <td class="${estado.includes('Sucesso') ? 'text-success fw-bold' : 'text-danger fw-bold'}">${estado}</td>
        <td>${erro}</td>
    `;

    tbody.appendChild(tr);
}


// Fazer o download do Excel
document.getElementById('downloadTemplateBtn').addEventListener('click', function() {
    const ws_data = [
        ["Processo", "Terminal ID", "Client ID", "Bearer Token"]
    ];

    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: 0 }; 
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if(!ws[cell_ref]) continue;
        ws[cell_ref].s = {
            fill: {
                patternType: "solid",
                fgColor: { rgb: "FFFF00" } // amarelo
            },
            font: {
                bold: true
            }
        };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

   
    XLSX.writeFile(wb, "Template_validador.csv");
});
