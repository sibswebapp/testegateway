let resultadosExportacao = [];

document.getElementById("fileInput").addEventListener("change", async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    resultadosExportacao = [];
    document.getElementById("resultadoTabela").innerHTML = "";
    document.getElementById("exportarResultadosBtn").classList.add("d-none");

    await lerCSV(file);
});

// Ler CSV
async function lerCSV(file) {
    const reader = new FileReader();

    reader.onload = async function (e) {
        const linhas = e.target.result.split("\n");

        for (let i = 1; i < linhas.length; i++) {
            let linha = linhas[i].trim();
            if (!linha) continue;

            const colunas = linha.includes(';')
                ? linha.split(';').map(c => limpar(c))
                : linha.split(',').map(c => limpar(c));

            const nome = colunas[0] || "";
            const terminalID = colunas[1] || "";
            const clientId = colunas[2] || "";
            const token = colunas[3] || "";

            if (nome && terminalID && clientId && token) {
                await chamarAPI(nome, clientId, token, terminalID);
            }
        }
    };

    reader.readAsText(file, "UTF-8");
}

function limpar(valor) {
    if (!valor) return "";
    return String(valor).trim();
}

//Chamar API
async function chamarAPI(nome, clientId, token, terminalID) {
    let estado = "";
    let erro = "";

    try {
        const response = await fetch("/api/validar-clientid", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome,
                clientId,
                token,
                terminalID
            })
        });

        const data = await response.json();
        const status = data?.returnStatus;

        if (
            (status?.statusCode === "000" && status?.statusMsg === "Success") ||
            status?.statusCode === "T9999"
        ) {
            estado = "✔️ Sucesso";
        } else {
            estado = "❌ Erro";
            erro = status
                ? `${status.statusCode} - ${status.statusMsg}: ${status.statusDescription || ""}`
                : JSON.stringify(data);
        }

    } catch (e) {
        estado = "❌ Não Sucesso";
        erro = e.message || "Erro ao comunicar com o backend";
    }

    adicionarNaTabela(nome, estado, erro, terminalID);
}



// Adicionar tabela + guardar exportação
function adicionarNaTabela(nome, estado, erro, terminalID) {
    const tbody = document.getElementById("resultadoTabela");

    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${nome}</td>
        <td>${terminalID}</td>
        <td class="${estado.includes('Sucesso') ? 'text-success fw-bold' : 'text-danger fw-bold'}">${estado}</td>
        <td>${erro}</td>
    `;
    tbody.appendChild(tr);

    resultadosExportacao.push({
        Processo: nome,
        "Terminal ID": terminalID,
        Estado: estado,
        Erro: erro
    });

    document.getElementById("exportarResultadosBtn").classList.remove("d-none");
}

// Exportar resultados
document.getElementById("exportarResultadosBtn").addEventListener("click", function () {
    if (resultadosExportacao.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(resultadosExportacao, {
        header: ["Processo", "Terminal ID", "Estado", "Erro"]
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resultados");

    XLSX.writeFile(wb, "Resultados_ClientID.xlsx");
});

// Download template
document.getElementById('downloadTemplateBtn').addEventListener('click', function () {
    const ws = XLSX.utils.aoa_to_sheet([
        ["Processo", "Terminal ID", "Client ID", "Bearer Token"]
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    XLSX.writeFile(wb, "Template_validador.csv");
});
